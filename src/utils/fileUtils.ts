export function getFileIcon(fileName: string, isDir: boolean): string {
  if (isDir) {
    return '📁'
  }
  
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  
  const iconMap: Record<string, string> = {
    // Code files
    'ts': '📘',
    'tsx': '📘',
    'js': '📜',
    'jsx': '📜',
    'rs': '🦀',
    'py': '🐍',
    'java': '☕',
    'go': '🐹',
    'php': '🐘',
    'rb': '💎',
    'cpp': '⚙️',
    'c': '⚙️',
    'h': '⚙️',
    'hpp': '⚙️',
    
    // Web
    'html': '🌐',
    'htm': '🌐',
    'css': '🎨',
    'scss': '🎨',
    'sass': '🎨',
    'less': '🎨',
    
    // Data
    'json': '📋',
    'yaml': '⚙️',
    'yml': '⚙️',
    'xml': '📄',
    'toml': '⚙️',
    'ini': '⚙️',
    'conf': '⚙️',
    
    // Docs
    'md': '📝',
    'markdown': '📝',
    'txt': '📄',
    'readme': '📖',
    
    // Config
    'gitignore': '🚫',
    'dockerfile': '🐳',
    'makefile': '⚙️',
    'mk': '⚙️',
    
    // Images
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'svg': '🖼️',
    'webp': '🖼️',
    
    // Archives
    'zip': '📦',
    'tar': '📦',
    'gz': '📦',
    'rar': '📦',
    '7z': '📦',
  }
  
  return iconMap[ext] || '📄'
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

