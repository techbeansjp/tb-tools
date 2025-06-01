'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export const MermaidEditor: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>(`graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]`);
  const [error, setError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState<string>('エラーをコピー');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<typeof import('mermaid').default | null>(null);

  useEffect(() => {
    const loadMermaid = async () => {
      try {
        const mermaid = await import('mermaid');
        mermaid.default.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#e5e7eb',
            primaryBorderColor: '#374151',
            lineColor: '#6b7280',
            secondaryColor: '#1f2937',
            tertiaryColor: '#111827'
          }
        });
        mermaidRef.current = mermaid.default;
        renderDiagram();
      } catch (err) {
        console.error('Failed to load Mermaid:', err);
        setError('Mermaidライブラリの読み込みに失敗しました。');
      }
    };

    loadMermaid();
  }, []);

  const renderDiagram = useCallback(async () => {
    if (!mermaidRef.current || !previewRef.current || !inputCode.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parseResult = await mermaidRef.current.parse(inputCode);
      if (parseResult) {
        const { svg } = await mermaidRef.current.render('mermaid-preview', inputCode);
        if (previewRef.current) {
          previewRef.current.innerHTML = svg;
        }
      }
    } catch (err: unknown) {
      console.error('Mermaid render error:', err);
      setError(err instanceof Error ? err.message : 'Mermaid構文エラーが発生しました。');
      if (previewRef.current) {
        previewRef.current.innerHTML = '';
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputCode, mermaidRef]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      renderDiagram();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputCode]);

  const handleCopyError = () => {
    if (!navigator.clipboard || !error) {
      return;
    }
    
    navigator.clipboard.writeText(error)
      .then(() => {
        setCopyButtonText('コピーしました！');
        setTimeout(() => {
          setCopyButtonText('エラーをコピー');
        }, 2000);
      })
      .catch(err => {
        console.error('クリップボードへのコピーに失敗しました:', err);
      });
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="p-6 bg-[#1c2128] border-gray-700">
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center h-10">
                <Label className="text-gray-300">Mermaidコード</Label>
              </div>
              <div className="mt-2 border border-gray-700 rounded-lg overflow-hidden">
                <Editor
                  height="400px"
                  defaultLanguage="mermaid"
                  value={inputCode}
                  onChange={(value) => setInputCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on',
                    tabSize: 2,
                    insertSpaces: true
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center h-10">
                <Label className="text-gray-300">プレビュー</Label>
                {isLoading && (
                  <span className="text-sm text-gray-400">レンダリング中...</span>
                )}
              </div>
              <div 
                ref={previewRef}
                className="w-full h-[400px] mt-2 p-4 bg-[#0d1117] border border-gray-700 rounded-lg overflow-auto flex items-center justify-center"
              >
                {!inputCode.trim() && (
                  <span className="text-gray-500">Mermaidコードを入力してください</span>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="text-red-400 flex-1">{error}</div>
                <Button
                  onClick={handleCopyError}
                  className="ml-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-red-600 text-red-400 bg-red-900/20 hover:bg-red-900/30 min-w-[120px] h-9 px-4 py-2"
                >
                  {copyButtonText}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
