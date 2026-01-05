use std::collections::HashMap;
use std::path::{Path, PathBuf};
use tokio::fs;
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
pub struct IndexedFile {
    pub path: PathBuf,
    pub content: String,
    pub language: String,
    pub symbols: Vec<Symbol>,
}

#[derive(Debug, Clone)]
pub struct Symbol {
    pub name: String,
    pub kind: SymbolKind,
    pub line: u32,
    pub column: u32,
}

#[derive(Debug, Clone)]
pub enum SymbolKind {
    Function,
    Class,
    Variable,
    Constant,
    Module,
}

pub struct ProjectIndexer {
    files: RwLock<HashMap<PathBuf, IndexedFile>>,
    workspace_path: PathBuf,
}

impl ProjectIndexer {
    pub fn new(workspace_path: PathBuf) -> Self {
        Self {
            files: RwLock::new(HashMap::new()),
            workspace_path,
        }
    }

    pub async fn index_file(&self, path: PathBuf) -> anyhow::Result<()> {
        let content = fs::read_to_string(&path).await?;
        let language = self.detect_language(&path);
        let symbols = self.extract_symbols(&content, &language);

        let indexed = IndexedFile {
            path: path.clone(),
            content,
            language,
            symbols,
        };

        let mut files = self.files.write().await;
        files.insert(path, indexed);

        Ok(())
    }

    pub async fn index_directory(&self, dir: &Path) -> anyhow::Result<()> {
        self.index_directory_recursive(dir).await
    }

    fn index_directory_recursive<'a>(
        &'a self,
        dir: &'a Path,
    ) -> std::pin::Pin<Box<dyn std::future::Future<Output = anyhow::Result<()>> + Send + 'a>> {
        Box::pin(async move {
            let mut entries = fs::read_dir(dir).await?;
            let mut subdirs = Vec::new();

            // First pass: collect files and subdirectories
            while let Some(entry) = entries.next_entry().await? {
                let path = entry.path();

                // Skip hidden files and common ignore patterns
                if path.file_name()
                    .and_then(|n| n.to_str())
                    .map(|s| s.starts_with('.'))
                    .unwrap_or(false)
                {
                    continue;
                }

                if path.is_dir() {
                    // Skip common directories
                    let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
                    if matches!(name, "node_modules" | "target" | ".git" | "dist" | "build") {
                        continue;
                    }

                    subdirs.push(path);
                } else if path.is_file() {
                    let path_clone = path.clone();
                    if let Err(e) = self.index_file(path).await {
                        eprintln!("Error indexing file {:?}: {}", path_clone, e);
                    }
                }
            }

            // Second pass: recursively index subdirectories
            for subdir in subdirs {
                if let Err(e) = self.index_directory_recursive(&subdir).await {
                    eprintln!("Error indexing directory {:?}: {}", subdir, e);
                }
            }

            Ok(())
        })
    }

    pub async fn search(&self, query: &str) -> Vec<IndexedFile> {
        let files = self.files.read().await;
        let query_lower = query.to_lowercase();

        files
            .values()
            .filter(|file| {
                file.path
                    .to_string_lossy()
                    .to_lowercase()
                    .contains(&query_lower)
                    || file.content.to_lowercase().contains(&query_lower)
            })
            .cloned()
            .collect()
    }

    pub async fn find_symbols(&self, name: &str) -> Vec<(IndexedFile, Symbol)> {
        let files = self.files.read().await;
        let mut results = Vec::new();
        let name_lower = name.to_lowercase();

        for file in files.values() {
            for symbol in &file.symbols {
                if symbol.name.to_lowercase().contains(&name_lower) {
                    results.push((file.clone(), symbol.clone()));
                }
            }
        }

        results
    }

    fn detect_language(&self, path: &Path) -> String {
        let ext = path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();

        match ext.as_str() {
            "ts" | "tsx" => "typescript",
            "js" | "jsx" => "javascript",
            "rs" => "rust",
            "py" => "python",
            "java" => "java",
            "go" => "go",
            "cpp" | "cc" | "cxx" => "cpp",
            "c" => "c",
            _ => "plaintext",
        }
        .to_string()
    }

    fn extract_symbols(&self, content: &str, language: &str) -> Vec<Symbol> {
        let mut symbols = Vec::new();

        for (line_idx, line) in content.lines().enumerate() {
            let line_num = (line_idx + 1) as u32;

            match language {
                "typescript" | "javascript" => {
                    // Extract functions
                    if let Some(pos) = line.find("function ") {
                        if let Some(name_start) = line[pos + 9..].find(|c: char| c.is_alphanumeric() || c == '_') {
                            let name = line[pos + 9 + name_start..]
                                .split(|c: char| !c.is_alphanumeric() && c != '_')
                                .next()
                                .unwrap_or("");
                            if !name.is_empty() {
                                symbols.push(Symbol {
                                    name: name.to_string(),
                                    kind: SymbolKind::Function,
                                    line: line_num,
                                    column: (pos + 9 + name_start) as u32,
                                });
                            }
                        }
                    }

                    // Extract classes
                    if let Some(pos) = line.find("class ") {
                        if let Some(name_start) = line[pos + 6..].find(|c: char| c.is_alphanumeric() || c == '_') {
                            let name = line[pos + 6 + name_start..]
                                .split(|c: char| !c.is_alphanumeric() && c != '_')
                                .next()
                                .unwrap_or("");
                            if !name.is_empty() {
                                symbols.push(Symbol {
                                    name: name.to_string(),
                                    kind: SymbolKind::Class,
                                    line: line_num,
                                    column: (pos + 6 + name_start) as u32,
                                });
                            }
                        }
                    }

                    // Extract const/let/var
                    for keyword in &["const ", "let ", "var "] {
                        if let Some(pos) = line.find(keyword) {
                            if let Some(name_start) = line[pos + keyword.len()..].find(|c: char| c.is_alphanumeric() || c == '_') {
                                let name = line[pos + keyword.len() + name_start..]
                                    .split(|c: char| !c.is_alphanumeric() && c != '_')
                                    .next()
                                    .unwrap_or("");
                                if !name.is_empty() {
                                    symbols.push(Symbol {
                                        name: name.to_string(),
                                        kind: if keyword == &"const " {
                                            SymbolKind::Constant
                                        } else {
                                            SymbolKind::Variable
                                        },
                                        line: line_num,
                                        column: (pos + keyword.len() + name_start) as u32,
                                    });
                                }
                            }
                        }
                    }
                }
                "rust" => {
                    // Extract functions
                    if let Some(pos) = line.find("fn ") {
                        if let Some(name_start) = line[pos + 3..].find(|c: char| c.is_alphanumeric() || c == '_') {
                            let name = line[pos + 3 + name_start..]
                                .split(|c: char| !c.is_alphanumeric() && c != '_')
                                .next()
                                .unwrap_or("");
                            if !name.is_empty() {
                                symbols.push(Symbol {
                                    name: name.to_string(),
                                    kind: SymbolKind::Function,
                                    line: line_num,
                                    column: (pos + 3 + name_start) as u32,
                                });
                            }
                        }
                    }

                    // Extract structs
                    if let Some(pos) = line.find("struct ") {
                        if let Some(name_start) = line[pos + 7..].find(|c: char| c.is_alphanumeric() || c == '_') {
                            let name = line[pos + 7 + name_start..]
                                .split(|c: char| !c.is_alphanumeric() && c != '_')
                                .next()
                                .unwrap_or("");
                            if !name.is_empty() {
                                symbols.push(Symbol {
                                    name: name.to_string(),
                                    kind: SymbolKind::Class,
                                    line: line_num,
                                    column: (pos + 7 + name_start) as u32,
                                });
                            }
                        }
                    }
                }
                _ => {}
            }
        }

        symbols
    }
}

