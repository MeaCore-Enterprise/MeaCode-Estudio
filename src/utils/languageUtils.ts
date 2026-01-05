export function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || ''
  
  const languageMap: Record<string, string> = {
    // TypeScript/JavaScript
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'mjs': 'javascript',
    'cjs': 'javascript',
    
    // Rust
    'rs': 'rust',
    
    // Python
    'py': 'python',
    'pyw': 'python',
    'pyi': 'python',
    
    // HTML/CSS
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    
    // JSON/YAML
    'json': 'json',
    'jsonc': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    
    // Markdown
    'md': 'markdown',
    'markdown': 'markdown',
    
    // Shell
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    'fish': 'shell',
    'ps1': 'powershell',
    
    // C/C++
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    
    // Java
    'java': 'java',
    
    // Go
    'go': 'go',
    
    // PHP
    'php': 'php',
    
    // Ruby
    'rb': 'ruby',
    
    // SQL
    'sql': 'sql',
    
    // XML
    'xml': 'xml',
    'xsd': 'xml',
    'xsl': 'xml',
    
    // Config files
    'toml': 'toml',
    'ini': 'ini',
    'conf': 'ini',
    'config': 'ini',
    'properties': 'properties',
    
    // Other
    'dockerfile': 'dockerfile',
    'makefile': 'makefile',
    'mk': 'makefile',
  }
  
  // Special cases for files without extension
  const fileName = filePath.split(/[/\\]/).pop()?.toLowerCase() || ''
  if (fileName === 'dockerfile') return 'dockerfile'
  if (fileName.startsWith('makefile')) return 'makefile'
  
  return languageMap[ext] || 'plaintext'
}

export function getLanguageIcon(language: string): string {
  const iconMap: Record<string, string> = {
    typescript: '📘',
    javascript: '📜',
    rust: '🦀',
    python: '🐍',
    html: '🌐',
    css: '🎨',
    json: '📋',
    yaml: '⚙️',
    markdown: '📝',
    shell: '💻',
    c: '⚙️',
    cpp: '⚙️',
    java: '☕',
    go: '🐹',
    php: '🐘',
    ruby: '💎',
    sql: '🗄️',
    xml: '📄',
  }
  
  return iconMap[language] || '📄'
}

