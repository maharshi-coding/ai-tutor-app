import React, {Fragment, memo, ReactNode} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

type MarkdownBlock =
  | {type: 'heading'; level: 1 | 2 | 3; content: string}
  | {type: 'paragraph'; content: string}
  | {type: 'unordered-list'; items: string[]}
  | {type: 'ordered-list'; items: string[]}
  | {type: 'blockquote'; content: string}
  | {type: 'code'; language?: string; content: string};

const UNORDERED_LIST_PATTERN = /^\s*[-*+]\s+/;
const ORDERED_LIST_PATTERN = /^\s*\d+\.\s+/;
const HEADING_PATTERN = /^(#{1,3})\s+(.*)$/;

function isStructuralLine(line: string): boolean {
  return (
    !line.trim() ||
    line.startsWith('```') ||
    HEADING_PATTERN.test(line) ||
    UNORDERED_LIST_PATTERN.test(line) ||
    ORDERED_LIST_PATTERN.test(line) ||
    /^\s*>\s?/.test(line)
  );
}

function collectListItems(
  lines: string[],
  startIndex: number,
  pattern: RegExp,
): {items: string[]; nextIndex: number} {
  const items: string[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];

    if (!pattern.test(line)) {
      break;
    }

    let item = line.replace(pattern, '').trim();
    index += 1;

    while (index < lines.length) {
      const continuation = lines[index];

      if (!continuation.trim()) {
        index += 1;
        break;
      }

      if (isStructuralLine(continuation)) {
        break;
      }

      item = `${item}\n${continuation.trim()}`;
      index += 1;
    }

    items.push(item);
  }

  return {items, nextIndex: index};
}

function parseMarkdown(content: string): MarkdownBlock[] {
  const normalized = content.replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const language = line.slice(3).trim() || undefined;
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length && lines[index].startsWith('```')) {
        index += 1;
      }

      blocks.push({
        type: 'code',
        language,
        content: codeLines.join('\n'),
      });
      continue;
    }

    const headingMatch = line.match(HEADING_PATTERN);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length as 1 | 2 | 3,
        content: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    if (UNORDERED_LIST_PATTERN.test(line)) {
      const {items, nextIndex} = collectListItems(
        lines,
        index,
        UNORDERED_LIST_PATTERN,
      );
      blocks.push({type: 'unordered-list', items});
      index = nextIndex;
      continue;
    }

    if (ORDERED_LIST_PATTERN.test(line)) {
      const {items, nextIndex} = collectListItems(
        lines,
        index,
        ORDERED_LIST_PATTERN,
      );
      blocks.push({type: 'ordered-list', items});
      index = nextIndex;
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quoteLines: string[] = [];

      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s*>\s?/, ''));
        index += 1;
      }

      blocks.push({
        type: 'blockquote',
        content: quoteLines.join('\n').trim(),
      });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && !isStructuralLine(lines[index])) {
      paragraphLines.push(lines[index]);
      index += 1;
    }

    blocks.push({
      type: 'paragraph',
      content: paragraphLines.join('\n').trim(),
    });
  }

  return blocks;
}

function renderInline(content: string, keyPrefix: string): ReactNode[] {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
  const segments: ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;

  let match = pattern.exec(content);
  while (match) {
    const matchText = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      segments.push(content.slice(lastIndex, start));
    }

    const sharedKey = `${keyPrefix}-${matchIndex}`;

    if (matchText.startsWith('`')) {
      segments.push(
        <Text key={sharedKey} style={styles.inlineCode}>
          {matchText.slice(1, -1)}
        </Text>,
      );
    } else if (
      matchText.startsWith('**') ||
      matchText.startsWith('__')
    ) {
      segments.push(
        <Text key={sharedKey} style={styles.strong}>
          {matchText.slice(2, -2)}
        </Text>,
      );
    } else {
      segments.push(
        <Text key={sharedKey} style={styles.emphasis}>
          {matchText.slice(1, -1)}
        </Text>,
      );
    }

    lastIndex = start + matchText.length;
    matchIndex += 1;

    match = pattern.exec(content);
  }

  if (lastIndex < content.length) {
    segments.push(content.slice(lastIndex));
  }

  return segments;
}

function headingStyle(level: 1 | 2 | 3) {
  if (level === 1) {
    return styles.headingOne;
  }

  if (level === 2) {
    return styles.headingTwo;
  }

  return styles.headingThree;
}

function MarkdownMessage({content}: {content: string}) {
  const blocks = parseMarkdown(content);

  return (
    <View style={styles.container}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === 'heading') {
          return (
            <Text key={key} style={[styles.blockSpacing, headingStyle(block.level)]}>
              {renderInline(block.content, key)}
            </Text>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <Text key={key} style={[styles.blockSpacing, styles.paragraph]}>
              {renderInline(block.content, key)}
            </Text>
          );
        }

        if (block.type === 'blockquote') {
          return (
            <View key={key} style={[styles.blockSpacing, styles.blockquote]}>
              <Text style={styles.blockquoteText}>
                {renderInline(block.content, key)}
              </Text>
            </View>
          );
        }

        if (block.type === 'code') {
          return (
            <View key={key} style={[styles.blockSpacing, styles.codeWrapper]}>
              {block.language ? (
                <Text style={styles.codeLanguage}>{block.language}</Text>
              ) : null}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.codeBlock}>{block.content}</Text>
              </ScrollView>
            </View>
          );
        }

        if (block.type === 'unordered-list' || block.type === 'ordered-list') {
          return (
            <View key={key} style={styles.blockSpacing}>
              {block.items.map((item, itemIndex) => (
                <View key={`${key}-item-${itemIndex}`} style={styles.listRow}>
                  <Text style={styles.listBullet}>
                    {block.type === 'ordered-list' ? `${itemIndex + 1}.` : '\u2022'}
                  </Text>
                  <Text style={styles.listText}>
                    {renderInline(item, `${key}-item-${itemIndex}`)}
                  </Text>
                </View>
              ))}
            </View>
          );
        }

        return <Fragment key={key} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  blockSpacing: {
    marginBottom: 10,
  },
  paragraph: {
    color: '#E5E7EB',
    fontSize: 15,
    lineHeight: 23,
  },
  headingOne: {
    color: '#F8FAFC',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
  },
  headingTwo: {
    color: '#F8FAFC',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
  },
  headingThree: {
    color: '#F8FAFC',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  strong: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  emphasis: {
    color: '#E2E8F0',
    fontStyle: 'italic',
  },
  inlineCode: {
    color: '#C4B5FD',
    backgroundColor: '#1E1B4B',
    fontFamily: 'monospace',
  },
  codeWrapper: {
    backgroundColor: '#0B1020',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    padding: 12,
  },
  codeLanguage: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  codeBlock: {
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingRight: 4,
  },
  listBullet: {
    width: 24,
    color: '#A5B4FC',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '700',
  },
  listText: {
    flex: 1,
    color: '#E5E7EB',
    fontSize: 15,
    lineHeight: 22,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#60A5FA',
    paddingLeft: 12,
  },
  blockquoteText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default memo(MarkdownMessage);
