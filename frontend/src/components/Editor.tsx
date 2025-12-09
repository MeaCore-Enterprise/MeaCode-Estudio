
import React, { useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

export default function MonacoEditor() {
    const monaco = useMonaco();

    useEffect(() => {
        if (monaco) {
            monaco.editor.defineTheme("crimson-slate", {
                base: "vs-dark",
                inherit: true,
                rules: [
                    { token: 'comment', foreground: '6A9955' },
                    { token: 'keyword', foreground: 'C586C0' },
                    { token: 'identifier', foreground: '9CDCFE' },
                    { token: 'string', foreground: 'CE9178' },
                ],
                colors: {
                    "editor.background": "#1E1E1E",
                    "editor.foreground": "#D4D4D4",
                    "editorCursor.foreground": "#DC143C",
                    "editor.lineHighlightBackground": "#252526",
                    "editor.selectionBackground": "#DC143C40",
                    "editor.inactiveSelectionBackground": "#DC143C20",
                },
            });
            monaco.editor.setTheme("crimson-slate");
        }
    }, [monaco]);

    return (
        <div className="h-full w-full">
            <Editor
                height="100vh"
                defaultLanguage="typescript"
                defaultValue="// MeaCode Hyper IDE v0.1"
                theme="crimson-slate"
                options={{
                    fontFamily: "'Source Code Pro', monospace",
                    fontSize: 14,
                    minimap: { enabled: true },
                    automaticLayout: true,
                }}
            />
        </div>
    );
}
