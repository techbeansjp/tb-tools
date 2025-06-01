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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const fullscreenContentRef = useRef<HTMLDivElement>(null);
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

  const handleFullscreen = () => {
    if (!fullscreenRef.current) return;

    if (!isFullscreen) {
      fullscreenRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error('フルスクリーン表示に失敗しました:', err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error('フルスクリーン終了に失敗しました:', err));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      if (!isNowFullscreen) {
        setZoomLevel(1);
        setScrollPosition({ x: 0, y: 0 });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setScrollPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFullscreen) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - scrollPosition.x, y: e.clientY - scrollPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isFullscreen) return;
    setScrollPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isFullscreen) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(0.25, Math.min(3, prev + delta)));
  };

  return (
    <>
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
                <div className="flex items-center gap-2">
                  {isLoading && (
                    <span className="text-sm text-gray-400">レンダリング中...</span>
                  )}
                  <Button
                    onClick={handleFullscreen}
                    className="h-8 px-3 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
                  >
                    {isFullscreen ? '縮小' : '拡大'}
                  </Button>
                </div>
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

      {/* Fullscreen Modal */}
      <div
        ref={fullscreenRef}
        className={`fixed inset-0 bg-[#0d1117] z-50 ${isFullscreen ? 'block' : 'hidden'}`}
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-gray-300">Mermaidプレビュー</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-800 rounded-md p-1">
                <Button
                  onClick={handleZoomOut}
                  className="h-6 w-6 p-0 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
                >
                  -
                </Button>
                <span className="text-xs text-gray-300 px-2 min-w-[50px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  onClick={handleZoomIn}
                  className="h-6 w-6 p-0 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
                >
                  +
                </Button>
                <Button
                  onClick={handleZoomReset}
                  className="h-6 px-2 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
                >
                  リセット
                </Button>
              </div>
              <Button
                onClick={handleFullscreen}
                className="h-8 px-3 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
              >
                閉じる
              </Button>
            </div>
          </div>
          <div 
            className="flex-1 overflow-hidden relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div 
              ref={fullscreenContentRef}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `translate(${scrollPosition.x}px, ${scrollPosition.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
            >
              <div 
                ref={(el) => {
                  if (el && previewRef.current && isFullscreen) {
                    el.innerHTML = previewRef.current.innerHTML;
                  }
                }}
                className="flex items-center justify-center"
              >
                {!previewRef.current?.innerHTML && (
                  <span className="text-gray-500">プレビューがありません</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
