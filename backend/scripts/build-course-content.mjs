import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_DIR = path.resolve(__dirname, "..");
const COURSE_CONTENT_DIR = path.join(BACKEND_DIR, "course_content");
const MANIFEST_PATH = path.join(COURSE_CONTENT_DIR, "source_manifest.json");
const TEMP_CLONE_DIR = path.join(BACKEND_DIR, ".course-build-tmp");
const USER_AGENT = "AI-Tutor-Course-Builder/1.0 (+local knowledge base refresh)";
const DEFAULT_MAX_EXCERPTS_PER_TOPIC = 10;
const MIN_DOCUMENT_LENGTH = 180;
const ADMIN_PATH_FRAGMENTS = [
  "/.github/",
  "/binder/",
  "/etc/",
  "/translations/",
  "/translated_images/",
  "/node_modules/",
  "/__pycache__/",
];
const ADMIN_FILE_PATTERNS = [
  /(^|\/)(agents|security|support|contributing|code_of_conduct|code-of-conduct)\.md$/i,
  /(^|\/)requirements\.txt$/i,
];
const NOISE_LINE_PATTERNS = [
  /^(table of contents|contents|search|home|next|previous|up|edit on github|view page source|open in colab|launch binder)$/i,
  /^(navigation|index|modules?|theme)$/i,
  /^[-|]+$/i,
  /^python .*documentation.*$/i,
  /^the python tutorial.*$/i,
  /^(comment|article tags:?|explore)$/i,
];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf-8"));
  const selectedCourses = manifest.courses.filter((course) =>
    args.courseFilter.size === 0 ? true : args.courseFilter.has(course.slug),
  );

  if (selectedCourses.length === 0) {
    throw new Error("No matching courses found in the source manifest.");
  }

  for (const course of selectedCourses) {
    await buildCourseCorpus(course, args);
  }
}

function parseArgs(argv) {
  const courseFilter = new Set();
  let refresh = false;

  for (const arg of argv) {
    if (arg === "--refresh") {
      refresh = true;
      continue;
    }
    if (arg.startsWith("--courses=")) {
      for (const value of arg.replace("--courses=", "").split(",")) {
        const slug = value.trim();
        if (slug) {
          courseFilter.add(slug);
        }
      }
      continue;
    }
    if (arg.startsWith("--course=")) {
      const slug = arg.replace("--course=", "").trim();
      if (slug) {
        courseFilter.add(slug);
      }
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { courseFilter, refresh };
}

async function buildCourseCorpus(course, args) {
  const courseDir = path.join(COURSE_CONTENT_DIR, course.slug);
  if (args.refresh) {
    await fs.rm(courseDir, { recursive: true, force: true });
  }

  const rawDir = path.join(courseDir, "raw");
  const extractedDir = path.join(courseDir, "extracted");
  const topicsDir = path.join(courseDir, "topics");
  await fs.mkdir(rawDir, { recursive: true });
  await fs.mkdir(extractedDir, { recursive: true });
  await fs.mkdir(topicsDir, { recursive: true });

  const documents = [];
  const sourceSummaries = [];

  console.log(`\n=== Building corpus for ${course.title} (${course.slug}) ===`);

  for (const source of course.sources) {
    const sourceRawDir = path.join(rawDir, source.id);
    const sourceExtractedDir = path.join(extractedDir, source.id);
    await fs.mkdir(sourceRawDir, { recursive: true });
    await fs.mkdir(sourceExtractedDir, { recursive: true });

    console.log(`Collecting ${source.title}...`);
    let sourceDocuments = [];
    if (source.type === "git") {
      sourceDocuments = await snapshotGitSource(course, source, sourceRawDir, sourceExtractedDir);
    } else if (source.type === "web") {
      sourceDocuments = await crawlWebSource(course, source, sourceRawDir, sourceExtractedDir);
    } else {
      throw new Error(`Unsupported source type: ${source.type}`);
    }

    documents.push(...sourceDocuments);
    sourceSummaries.push({
      id: source.id,
      title: source.title,
      type: source.type,
      license: source.license,
      description: source.description,
      documentCount: sourceDocuments.length,
    });

    await fs.writeFile(
      path.join(sourceRawDir, "source.json"),
      JSON.stringify({ ...source, documentCount: sourceDocuments.length }, null, 2),
      "utf-8",
    );
  }

  const topicAssignments = assignDocumentsToTopics(course, documents);
  await writeTopicFiles(course, topicsDir, topicAssignments);
  await writeOverview(course, courseDir, sourceSummaries, topicAssignments);
  await writeCatalog(course, courseDir, sourceSummaries, documents, topicAssignments);

  console.log(
    `Finished ${course.slug}: ${documents.length} extracted documents across ${sourceSummaries.length} sources.`,
  );
}

async function snapshotGitSource(course, source, sourceRawDir, sourceExtractedDir) {
  await fs.mkdir(TEMP_CLONE_DIR, { recursive: true });
  const cloneDir = path.join(TEMP_CLONE_DIR, `${source.id}-${Date.now()}`);
  const selectedRawDir = path.join(sourceRawDir, "selected");
  await fs.mkdir(selectedRawDir, { recursive: true });

  runGitClone(source.repoUrl, cloneDir);
  await fs.rm(path.join(cloneDir, ".git"), { recursive: true, force: true });

  const files = await collectRepoFiles(cloneDir, source);
  const documents = [];
  try {
    for (const filePath of files) {
      try {
        const rawText = await extractTextFromFile(filePath);
        const cleaned = cleanText(rawText);
        const relativePath = path.relative(cloneDir, filePath).split(path.sep).join("/");
        const title = extractTitle(cleaned, path.basename(filePath, path.extname(filePath)));
        if (!isUsefulDocument(cleaned, title, relativePath)) {
          continue;
        }
        const urlBase = source.repoUrl.replace(/\.git$/i, "");
        const sourceUrl = `${urlBase}/blob/HEAD/${relativePath}`;
        await copySelectedRawFile(selectedRawDir, filePath, relativePath);
        const document = await writeExtractedDocument({
          course,
          source,
          sourceExtractedDir,
          cleaned,
          title,
          sourceUrl,
          sourceRelativePath: relativePath,
        });
        documents.push(document);
      } catch (error) {
        console.warn(`Skipping ${filePath}: ${error.message}`);
      }
    }
  } finally {
    await fs.rm(cloneDir, { recursive: true, force: true });
  }

  return documents;
}

async function crawlWebSource(course, source, sourceRawDir, sourceExtractedDir) {
  const rawPagesDir = path.join(sourceRawDir, "pages");
  await fs.mkdir(rawPagesDir, { recursive: true });

  const queue = [...source.seedUrls];
  const visited = new Set();
  const documents = [];

  while (queue.length > 0 && documents.length < source.maxPages) {
    const nextUrl = normalizeUrl(queue.shift());
    if (!nextUrl || visited.has(nextUrl) || !isAllowedUrl(nextUrl, source.allowPrefixes)) {
      continue;
    }

    visited.add(nextUrl);
    let response;
    try {
      response = await fetch(nextUrl, {
        headers: { "user-agent": USER_AGENT },
      });
    } catch (error) {
      console.warn(`Fetch failed for ${nextUrl}: ${error.message}`);
      continue;
    }

    if (!response.ok) {
      console.warn(`Skipping ${nextUrl}: HTTP ${response.status}`);
      continue;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      continue;
    }

    const rawHtml = await response.text();
    const cleaned = cleanText(htmlToText(rawHtml));
    const pageSlug = slugFromUrl(nextUrl);
    await fs.writeFile(path.join(rawPagesDir, `${pageSlug}.html`), rawHtml, "utf-8");

    const title = extractHtmlTitle(rawHtml) || extractTitle(cleaned, pageSlug);
    if (!isUsefulDocument(cleaned, title, nextUrl)) {
      continue;
    }
    const document = await writeExtractedDocument({
      course,
      source,
      sourceExtractedDir,
      cleaned,
      title,
      sourceUrl: nextUrl,
      sourceRelativePath: nextUrl,
    });
    documents.push(document);

    for (const link of extractLinks(rawHtml, nextUrl)) {
      const normalizedLink = normalizeUrl(link);
      if (
        normalizedLink &&
        !visited.has(normalizedLink) &&
        isAllowedUrl(normalizedLink, source.allowPrefixes)
      ) {
        queue.push(normalizedLink);
      }
    }
  }

  return documents;
}

function runGitClone(repoUrl, targetDir) {
  const cloneArgs = [
    "-c",
    "core.longpaths=true",
    "clone",
    "--depth",
    "1",
    "--single-branch",
    repoUrl,
    targetDir,
  ];
  const result = spawnSync("git", cloneArgs, {
    cwd: BACKEND_DIR,
    encoding: "utf-8",
    stdio: "pipe",
  });

  if (result.status !== 0) {
    throw new Error(
      `git clone failed for ${repoUrl}\n${result.stdout || ""}\n${result.stderr || ""}`.trim(),
    );
  }
}

async function copySelectedRawFile(selectedRawDir, filePath, relativePath) {
  const extension = path.extname(filePath).toLowerCase();
  const baseName = path.basename(filePath, extension);
  const digest = createHash("sha256").update(relativePath).digest("hex").slice(0, 12);
  const snapshotName = `${digest}-${slugify(baseName).slice(0, 48) || "source"}${extension}`;
  await fs.copyFile(filePath, path.join(selectedRawDir, snapshotName));
}

async function collectRepoFiles(repoDir, source) {
  const includeExtensions = new Set((source.includeExtensions || []).map((value) => value.toLowerCase()));
  const excludePathPatterns = (source.excludePathPatterns || []).map((value) => value.toLowerCase());
  const rootPaths = (source.rootPaths || ["."]).map((value) => path.join(repoDir, value));
  const files = [];

  for (const rootPath of rootPaths) {
    if (!(await pathExists(rootPath))) {
      continue;
    }
    await walkFiles(rootPath, async (filePath) => {
      const extension = path.extname(filePath).toLowerCase();
      if (!includeExtensions.has(extension)) {
        return;
      }
      const relativePath = path.relative(repoDir, filePath).split(path.sep).join("/").toLowerCase();
      if (excludePathPatterns.some((fragment) => relativePath.includes(fragment))) {
        return;
      }
      files.push(filePath);
    });
  }

  files.sort();
  return files.slice(0, source.maxFiles || files.length);
}

async function walkFiles(rootPath, onFile) {
  const stat = await fs.stat(rootPath);
  if (stat.isFile()) {
    await onFile(rootPath);
    return;
  }

  const entries = await fs.readdir(rootPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".") {
      continue;
    }
    if ([".git", "node_modules", "__pycache__", "data", "datasets", "images", "img", "media"].includes(entry.name)) {
      continue;
    }
    const nextPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(nextPath, onFile);
    } else if (entry.isFile()) {
      await onFile(nextPath);
    }
  }
}

async function extractTextFromFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const rawText = await fs.readFile(filePath, "utf-8");

  if ([".md", ".markdown", ".mdx", ".txt", ".rst"].includes(extension)) {
    return stripFrontMatter(rawText);
  }
  if ([".html", ".htm"].includes(extension)) {
    return htmlToText(rawText);
  }
  if (extension === ".ipynb") {
    return notebookToText(rawText);
  }

  throw new Error(`Unsupported extension: ${extension}`);
}

function stripFrontMatter(text) {
  return text
    .replace(/^---\n[\s\S]*?\n---\n?/u, "")
    .replace(/^<!--[\s\S]*?-->\n?/u, "")
    .replace(/^\([a-z0-9_-]+\)=\n?/gimu, "");
}

function notebookToText(rawNotebook) {
  const notebook = JSON.parse(rawNotebook);
  const parts = [];

  for (const cell of notebook.cells || []) {
    const source = Array.isArray(cell.source) ? cell.source.join("") : String(cell.source || "");
    const trimmed = source.trim();
    if (!trimmed) {
      continue;
    }

    if (cell.cell_type === "markdown") {
      parts.push(trimmed);
      continue;
    }

    if (cell.cell_type === "code") {
      parts.push(`\`\`\`python\n${trimmed}\n\`\`\``);
      const outputText = renderNotebookOutputs(cell.outputs || []);
      if (outputText) {
        parts.push(`Output:\n\`\`\`text\n${outputText}\n\`\`\``);
      }
    }
  }

  return parts.join("\n\n");
}

function renderNotebookOutputs(outputs) {
  const rendered = [];
  for (const output of outputs) {
    let text = "";
    if (Array.isArray(output.text)) {
      text = output.text.join("").trim();
    } else if (typeof output.text === "string") {
      text = output.text.trim();
    } else if (output.data && output.data["text/plain"]) {
      text = Array.isArray(output.data["text/plain"])
        ? output.data["text/plain"].join("").trim()
        : String(output.data["text/plain"]).trim();
    }
    if (text) {
      rendered.push(text.slice(0, 1600));
    }
  }
  return rendered.slice(0, 3).join("\n\n");
}

function htmlToText(rawHtml) {
  let content = selectMainHtml(rawHtml);
  content = content
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|svg|noscript|header|footer|nav|aside)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<(h[1-6]|p|div|section|article|main|pre|code|blockquote|tr)\b[^>]*>/gi, "\n")
    .replace(/<\/(h[1-6]|p|div|section|article|main|pre|code|blockquote|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  return decodeEntities(content);
}

function selectMainHtml(rawHtml) {
  const patterns = [
    /<main\b[^>]*>([\s\S]*?)<\/main>/i,
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<body\b[^>]*>([\s\S]*?)<\/body>/i,
  ];
  for (const pattern of patterns) {
    const match = rawHtml.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return rawHtml;
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, codePoint) => String.fromCodePoint(Number(codePoint)));
}

function cleanText(text) {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/Â¶/g, "")
    .replace(/Â»/g, ">")
    .split("\n");

  const cleanedLines = [];
  let previous = "";
  for (const line of lines) {
    const value = line.replace(/[ \t]+/g, " ").trim();
    if (!value) {
      if (cleanedLines[cleanedLines.length - 1] !== "") {
        cleanedLines.push("");
      }
      continue;
    }
    if (
      NOISE_LINE_PATTERNS.some((pattern) => pattern.test(value)) ||
      value.toLowerCase().includes("documentation »")
    ) {
      continue;
    }
    if (/^(comment|article tags:?|explore)$/i.test(value)) {
      break;
    }
    if (value === previous) {
      continue;
    }
    cleanedLines.push(value);
    previous = value;
  }

  return cleanedLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractHtmlTitle(rawHtml) {
  const h1Match = rawHtml.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    return normalizeTitle(cleanText(decodeEntities(h1Match[1].replace(/<[^>]+>/g, " "))).split("\n")[0]);
  }

  const titleMatch = rawHtml.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    return normalizeTitle(cleanText(decodeEntities(titleMatch[1].replace(/<[^>]+>/g, " "))).split("\n")[0]);
  }

  return "";
}

function extractTitle(text, fallback) {
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    if (
      line === "---" ||
      line.startsWith("<!--") ||
      line.startsWith("[![") ||
      line.startsWith("(") ||
      /^([a-z0-9_.-]+)==/i.test(line)
    ) {
      continue;
    }
    if (line.startsWith("#")) {
      const heading = normalizeTitle(line.replace(/^#+\s*/, "").trim());
      if (heading) {
        return heading;
      }
      continue;
    }
    if (/^(Source|Original URL|Original Path):/i.test(line)) {
      continue;
    }
    const normalized = normalizeTitle(line);
    if (normalized && normalized.length <= 120) {
      return normalized;
    }
  }
  return normalizeTitle(fallback) || fallback;
}

async function writeExtractedDocument({
  course,
  source,
  sourceExtractedDir,
  cleaned,
  title,
  sourceUrl,
  sourceRelativePath,
}) {
  const digest = createHash("sha256")
    .update(`${source.id}:${sourceRelativePath}`)
    .digest("hex")
    .slice(0, 16);
  const fileName = `${digest}-${slugify(title).slice(0, 48) || "document"}.md`;
  const relativePath = path.join(source.id, fileName).split(path.sep).join("/");
  const absolutePath = path.join(sourceExtractedDir, fileName);
  const refinedBody = refineDocumentBody(cleaned, title);
  const fileContent = [
    `# ${title}`,
    "",
    `Source: ${source.title}`,
    `Original URL: ${sourceUrl}`,
    `Original Path: ${sourceRelativePath}`,
    `Course: ${course.title}`,
    "",
    refinedBody,
    "",
  ].join("\n");

  await fs.writeFile(absolutePath, fileContent, "utf-8");

  return {
    id: digest,
    title,
    sourceId: source.id,
    sourceTitle: source.title,
    sourceUrl,
    extractPath: path.join("extracted", relativePath).split(path.sep).join("/"),
    relativePath,
    text: fileContent.trim(),
  };
}

function assignDocumentsToTopics(course, documents) {
  const assignments = new Map();
  const topicCounts = new Map(course.topicBuckets.map((bucket) => [bucket.id, 0]));

  for (const document of documents) {
    const haystack = `${document.title}\n${document.text.slice(0, 4000)}`.toLowerCase();
    let bestBucket = null;
    let bestScore = -1;
    for (const bucket of course.topicBuckets) {
      let score = 0;
      for (const keyword of bucket.keywords) {
        if (haystack.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestBucket = bucket;
      }
    }

    if (!bestBucket) {
      bestBucket = course.topicBuckets[0];
    } else if (bestScore === 0) {
      bestBucket = course.topicBuckets.reduce((currentBest, candidate) => {
        const currentCount = topicCounts.get(currentBest.id) || 0;
        const candidateCount = topicCounts.get(candidate.id) || 0;
        return candidateCount < currentCount ? candidate : currentBest;
      }, course.topicBuckets[0]);
    }

    topicCounts.set(bestBucket.id, (topicCounts.get(bestBucket.id) || 0) + 1);
    assignments.set(document.id, bestBucket.id);
  }

  const grouped = new Map();
  for (const bucket of course.topicBuckets) {
    grouped.set(bucket.id, []);
  }
  for (const document of documents) {
    grouped.get(assignments.get(document.id)).push(document);
  }

  return {
    assignments,
    grouped,
  };
}

async function writeTopicFiles(course, topicsDir, topicAssignments) {
  let index = 1;
  for (const bucket of course.topicBuckets) {
    const documents = topicAssignments.grouped.get(bucket.id) || [];
    const prefix = String(index).padStart(2, "0");
    const fileName = `${prefix}-${bucket.id}.md`;
    const lines = [
      `# ${bucket.title}`,
      "",
      `This topic bundle groups the collected ${course.title} material most relevant to ${bucket.title.toLowerCase()}.`,
      "",
      `Keywords: ${bucket.keywords.join(", ")}`,
      "",
      `Documents in bundle: ${documents.length}`,
      "",
      "## Document Index",
      "",
    ];

    for (const document of documents) {
      lines.push(`- ${document.title} (${document.sourceTitle})`);
      lines.push(`  Extracted file: ${document.extractPath}`);
      lines.push(`  Original URL: ${document.sourceUrl}`);
    }

    lines.push("", "## Representative Excerpts", "");
    for (const document of documents.slice(0, DEFAULT_MAX_EXCERPTS_PER_TOPIC)) {
      lines.push(`### ${document.title}`);
      lines.push(`Source: ${document.sourceTitle}`);
      lines.push(`Original URL: ${document.sourceUrl}`);
      lines.push("");
      lines.push(trimExcerpt(document.text, 900));
      lines.push("");
    }

    await fs.writeFile(path.join(topicsDir, fileName), lines.join("\n"), "utf-8");
    index += 1;
  }
}

async function writeOverview(course, courseDir, sourceSummaries, topicAssignments) {
  const lines = [
    `# ${course.title} Knowledge Base`,
    "",
    `Generated from ${sourceSummaries.length} curated sources.`,
    "",
    "## Sources",
    "",
  ];

  for (const source of sourceSummaries) {
    lines.push(`- ${source.title} (${source.type}) - ${source.documentCount} documents`);
    lines.push(`  License: ${source.license}`);
    lines.push(`  ${source.description}`);
  }

  lines.push("", "## Topics", "");
  for (const bucket of course.topicBuckets) {
    const count = (topicAssignments.grouped.get(bucket.id) || []).length;
    lines.push(`- ${bucket.title} - ${count} documents`);
  }

  await fs.writeFile(path.join(courseDir, "overview.md"), lines.join("\n"), "utf-8");
}

async function writeCatalog(course, courseDir, sourceSummaries, documents, topicAssignments) {
  const catalog = {
    course: course.title,
    slug: course.slug,
    generatedAt: new Date().toISOString(),
    sourceCount: sourceSummaries.length,
    documentCount: documents.length,
    topicCount: course.topicBuckets.length,
    sources: sourceSummaries,
    topics: course.topicBuckets.map((bucket) => ({
      id: bucket.id,
      title: bucket.title,
      documentCount: (topicAssignments.grouped.get(bucket.id) || []).length,
    })),
    documents: documents.map((document) => ({
      id: document.id,
      title: document.title,
      sourceId: document.sourceId,
      sourceTitle: document.sourceTitle,
      sourceUrl: document.sourceUrl,
      extractPath: document.extractPath,
      topicId: topicAssignments.assignments.get(document.id),
    })),
  };

  await fs.writeFile(path.join(courseDir, "catalog.json"), JSON.stringify(catalog, null, 2), "utf-8");
}

function extractLinks(rawHtml, baseUrl) {
  const links = [];
  const regex = /href\s*=\s*"([^"]+)"|href\s*=\s*'([^']+)'/gi;
  let match;
  while ((match = regex.exec(rawHtml)) !== null) {
    const href = match[1] || match[2];
    if (!href || href.startsWith("mailto:") || href.startsWith("javascript:")) {
      continue;
    }
    try {
      const absolute = new URL(href, baseUrl).toString();
      links.push(absolute);
    } catch {
      continue;
    }
  }
  return links;
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    if (url.searchParams.has("hl") || url.searchParams.has("lang")) {
      return "";
    }
    url.search = "";
    return url.toString();
  } catch {
    return "";
  }
}

function isAllowedUrl(url, allowPrefixes) {
  return allowPrefixes.some((prefix) => url.startsWith(prefix));
}

function slugFromUrl(url) {
  const parsed = new URL(url);
  const pathname = parsed.pathname.replace(/\/+/g, "/").replace(/\/$/, "") || "/index";
  return slugify(`${parsed.hostname}${pathname}${parsed.search}`);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function trimExcerpt(text, maxChars) {
  return text.length <= maxChars ? text : `${text.slice(0, maxChars).trim()}...`;
}

function normalizeTitle(value) {
  return value
    .replace(/Â¶/g, "")
    .replace(/\s+/g, " ")
    .replace(/^[-*#\s]+/, "")
    .replace(/[-*#\s]+$/, "")
    .trim();
}

function refineDocumentBody(text, title) {
  const rawLines = text.split("\n");
  const lines = rawLines.map((line) => line.trim());
  const normalizedTitle = normalizeTitle(title).toLowerCase();
  if (!normalizedTitle) {
    return text;
  }

  let repeatedTitleIndex = -1;
  let shortLinesBefore = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (normalizeTitle(line).toLowerCase() === normalizedTitle && index > 5) {
      repeatedTitleIndex = index;
      break;
    }
    if (line && line.length <= 28) {
      shortLinesBefore += 1;
    }
  }

  if (repeatedTitleIndex >= 0 && shortLinesBefore >= 4) {
    return rawLines.slice(repeatedTitleIndex).join("\n").trim();
  }

  return text;
}

function isUsefulDocument(text, title, sourceReference) {
  if (text.length < MIN_DOCUMENT_LENGTH) {
    return false;
  }

  const reference = String(sourceReference || "").replace(/\\/g, "/").toLowerCase();
  if (ADMIN_PATH_FRAGMENTS.some((fragment) => reference.includes(fragment))) {
    return false;
  }
  if (ADMIN_FILE_PATTERNS.some((pattern) => pattern.test(reference))) {
    return false;
  }

  const normalizedTitle = normalizeTitle(title);
  if (
    !normalizedTitle ||
    normalizedTitle === "---" ||
    normalizedTitle.startsWith("<!--") ||
    normalizedTitle.startsWith("[![")
  ) {
    return false;
  }

  const alphaCharacters = (text.match(/[a-z]/gi) || []).length;
  if (alphaCharacters < 140) {
    return false;
  }

  const alphaWords = (text.match(/[a-z]{3,}/gi) || []).map((word) => word.toLowerCase());
  const uniqueAlphaWords = new Set(alphaWords);
  return uniqueAlphaWords.size >= 24;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
