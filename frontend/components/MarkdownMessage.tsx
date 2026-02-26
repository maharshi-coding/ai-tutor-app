'use client'

import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const proseClasses = {
  root:
    'markdown-message text-sm text-slate-100 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:border-0 [&_pre_code]:text-slate-200',
  p: 'mb-2 last:mb-0',
  strong: 'font-semibold text-slate-50',
  em: 'italic text-slate-200',
  code: 'rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-cyan-200 border border-slate-700',
  pre: 'rounded-xl bg-slate-900/90 border border-slate-700 p-3 my-2 overflow-x-auto',
  ul: 'list-disc list-inside mb-2 space-y-0.5 text-slate-200',
  ol: 'list-decimal list-inside mb-2 space-y-0.5 text-slate-200',
  li: 'leading-relaxed',
  h1: 'text-lg font-bold text-slate-50 mt-3 mb-2 first:mt-0',
  h2: 'text-base font-bold text-slate-50 mt-3 mb-2 first:mt-0',
  h3: 'text-sm font-semibold text-slate-50 mt-2 mb-1 first:mt-0',
  blockquote: 'border-l-2 border-sky-500/60 pl-3 my-2 text-slate-300 italic',
  a: 'text-sky-400 hover:text-sky-300 underline',
}

interface MarkdownMessageProps {
  content: string
  className?: string
}

const MarkdownMessage = memo(function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  return (
    <div className={`${proseClasses.root} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className={proseClasses.p}>{children}</p>,
          strong: ({ children }) => <strong className={proseClasses.strong}>{children}</strong>,
          em: ({ children }) => <em className={proseClasses.em}>{children}</em>,
          code: ({ className: _, ...props }) => (
            <code className={proseClasses.code} {...props} />
          ),
          pre: ({ children }) => <pre className={proseClasses.pre}>{children}</pre>,
          ul: ({ children }) => <ul className={proseClasses.ul}>{children}</ul>,
          ol: ({ children }) => <ol className={proseClasses.ol}>{children}</ol>,
          li: ({ children }) => <li className={proseClasses.li}>{children}</li>,
          h1: ({ children }) => <h1 className={proseClasses.h1}>{children}</h1>,
          h2: ({ children }) => <h2 className={proseClasses.h2}>{children}</h2>,
          h3: ({ children }) => <h3 className={proseClasses.h3}>{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className={proseClasses.blockquote}>{children}</blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className={proseClasses.a}>
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})

export default MarkdownMessage
