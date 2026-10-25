import React, { useState, useId } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';
import styles from '../../styles/modules/ui/CodeBlock.module.scss';

// ─── Simple syntax tokenizer for common languages ─────────────────────────────
function highlightTokens(text, language = '') {
  if (!text || typeof text !== 'string') return text;

  const lang = (language || '').toLowerCase();

  // Split line into tokens using regex
  // Match comments, strings, keywords, numbers, booleans, functions
  const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|function|return|import|export|from|default|class|extends|new|if|else|switch|case|break|try|catch|finally|async|await|typeof|void|delete|in|of|instanceof|def|elif|while|for|yield|lambda|None|pass|package|func|select|type|struct|chan|go|interface|curl|npm|pnpm|yarn|bun|npx)\b)|(\b(?:true|false|null|undefined)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())/g;

  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    const [full, comment, str, keyword, bool, num, fn] = match;

    if (comment) {
      elements.push(
        <span key={match.index} className={styles.tokComment}>
          {comment}
        </span>
      );
    } else if (str) {
      elements.push(
        <span key={match.index} className={styles.tokString}>
          {str}
        </span>
      );
    } else if (keyword) {
      elements.push(
        <span key={match.index} className={styles.tokKeyword}>
          {keyword}
        </span>
      );
    } else if (bool) {
      elements.push(
        <span key={match.index} className={styles.tokBoolean}>
          {bool}
        </span>
      );
    } else if (num) {
      elements.push(
        <span key={match.index} className={styles.tokNumber}>
          {num}
        </span>
      );
    } else if (fn) {
      elements.push(
        <span key={match.index} className={styles.tokFn}>
          {fn}
        </span>
      );
    } else {
      elements.push(full);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : text;
}

// ─── 1. CodeBlock (Root) ───────────────────────────────────────────────────────
export function CodeBlock({
  children,
  code,
  title,
  language = 'javascript',
  variant = 'default',
  size = 'default',
  lineNumbers = false,
  wrap = false,
  startLine = 1,
  dots = true,
  actions,
  footer,
  className = '',
  style = {},
  ...props
}) {
  const rootClasses = [
    styles.codeBlock,
    variant === 'destructive' ? styles.variantDestructive : '',
    size === 'sm' ? styles.sizeSm : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // If `code` prop shorthand is used, render full standard shadcn structure
  if (code !== undefined) {
    const isMultiLine = typeof code === 'string' && code.trim().includes('\n');
    const showLineNumbers = lineNumbers === true || (lineNumbers !== false && isMultiLine);

    return (
      <div
        data-slot="code-block"
        data-variant={variant}
        data-size={size}
        className={rootClasses}
        style={style}
        {...props}
      >
        {(title || dots || actions || language) && (
          <CodeBlockHeader>
            <div className={styles.headerLeft}>
              {dots && (
                <div className={styles.codeDots} aria-hidden="true">
                  <span className={styles.dotClose} />
                  <span className={styles.dotMin} />
                  <span className={styles.dotMax} />
                </div>
              )}
              {title ? (
                <CodeBlockTitle>
                  <FileCode size={13} />
                  <span>{title}</span>
                </CodeBlockTitle>
              ) : language ? (
                <CodeBlockTitle>
                  <FileCode size={13} />
                  <span>{language}</span>
                </CodeBlockTitle>
              ) : null}
            </div>
            <CodeBlockActions>
              {actions}
              {language && <span className={styles.codeLangBadge}>{language}</span>}
              <CodeBlockCopyButton value={code} />
            </CodeBlockActions>
          </CodeBlockHeader>
        )}
        <CodeBlockContent
          lineNumbers={showLineNumbers}
          wrap={wrap}
          startLine={startLine}
          language={language}
        >
          {code}
        </CodeBlockContent>
        {footer && <CodeBlockFooter>{footer}</CodeBlockFooter>}
      </div>
    );
  }

  // Compound component mode
  return (
    <div
      data-slot="code-block"
      data-variant={variant}
      data-size={size}
      className={rootClasses}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── 2. CodeBlockHeader ───────────────────────────────────────────────────────
export function CodeBlockHeader({ children, className = '', style = {}, ...props }) {
  return (
    <div
      data-slot="code-block-header"
      className={`${styles.codeHeader} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── 3. CodeBlockTitle ─────────────────────────────────────────────────────────
export function CodeBlockTitle({ children, className = '', style = {}, ...props }) {
  return (
    <div
      data-slot="code-block-title"
      className={`${styles.codeTitle} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── 4. CodeBlockActions ──────────────────────────────────────────────────────
export function CodeBlockActions({
  children,
  floating = false,
  className = '',
  style = {},
  ...props
}) {
  const actionClasses = [styles.codeActions, floating ? styles.floating : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div data-slot="code-block-actions" className={actionClasses} style={style} {...props}>
      {children}
    </div>
  );
}

// ─── 5. CodeBlockCopyButton ───────────────────────────────────────────────────
export function CodeBlockCopyButton({
  value = '',
  label = 'Copy',
  copiedText = 'Copied!',
  iconOnly = false,
  className = '',
  style = {},
  onCopy,
  ...props
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e?.stopPropagation?.();
    if (!value) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for older environments
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard', err);
    }
  };

  const btnClasses = [
    styles.copyButton,
    copied ? styles.copied : '',
    iconOnly ? styles.iconOnly : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      data-slot="code-block-copy-button"
      className={btnClasses}
      onClick={handleCopy}
      aria-label={copied ? copiedText : label}
      title={copied ? copiedText : label}
      style={style}
      {...props}
    >
      {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
      {!iconOnly && <span>{copied ? copiedText : label}</span>}
    </button>
  );
}

// ─── 6. CodeBlockLine ─────────────────────────────────────────────────────────
export function CodeBlockLine({
  lineNumber,
  variant = 'default',
  children,
  className = '',
  style = {},
  ...props
}) {
  const lineClasses = [
    styles.codeLine,
    variant === 'highlighted' ? styles.lineHighlighted : '',
    variant === 'added' ? styles.lineAdded : '',
    variant === 'removed' ? styles.lineRemoved : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span data-slot="code-block-line" data-variant={variant} className={lineClasses} style={style} {...props}>
      {lineNumber !== undefined && (
        <span className={styles.codeLineGutter} aria-hidden="true">
          {lineNumber}
        </span>
      )}
      <span className={styles.codeLineContent}>{children}</span>
    </span>
  );
}

// ─── 7. CodeBlockContent ──────────────────────────────────────────────────────
export function CodeBlockContent({
  children,
  lineNumbers = false,
  startLine = 1,
  wrap = false,
  tabIndex = 0,
  language = '',
  highlightLines = [],
  className = '',
  style = {},
  ...props
}) {
  const contentId = useId();

  const contentClasses = [
    styles.codeContent,
    lineNumbers ? styles.hasLineNumbers : '',
    wrap ? styles.wrap : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // String children handling
  if (typeof children === 'string') {
    const cleanStr = children.replace(/\r\n/g, '\n').replace(/\n$/, '');

    if (lineNumbers) {
      const lines = cleanStr.split('\n');
      return (
        <pre
          id={contentId}
          data-slot="code-block-content"
          dir="ltr"
          tabIndex={tabIndex}
          className={contentClasses}
          style={style}
          {...props}
        >
          <code className={styles.codeInner}>
            {lines.map((line, idx) => {
              const currentNum = startLine + idx;
              const isHighlighted = highlightLines.includes(currentNum);
              return (
                <CodeBlockLine
                  key={idx}
                  lineNumber={currentNum}
                  variant={isHighlighted ? 'highlighted' : 'default'}
                >
                  {highlightTokens(line, language) || ' '}
                </CodeBlockLine>
              );
            })}
          </code>
        </pre>
      );
    }

    return (
      <pre
        id={contentId}
        data-slot="code-block-content"
        dir="ltr"
        tabIndex={tabIndex}
        className={contentClasses}
        style={style}
        {...props}
      >
        <code className={styles.codeInner}>
          {highlightTokens(cleanStr, language)}
        </code>
      </pre>
    );
  }

  // Element / pre-composed children
  return (
    <pre
      id={contentId}
      data-slot="code-block-content"
      dir="ltr"
      tabIndex={tabIndex}
      className={contentClasses}
      style={style}
      {...props}
    >
      <code className={styles.codeInner}>{children}</code>
    </pre>
  );
}

// ─── 8. CodeBlockFooter ───────────────────────────────────────────────────────
export function CodeBlockFooter({ children, className = '', style = {}, ...props }) {
  return (
    <div
      data-slot="code-block-footer"
      className={`${styles.codeFooter} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export default CodeBlock;
