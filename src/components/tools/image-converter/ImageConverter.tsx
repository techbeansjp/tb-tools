'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const ImageConverter: React.FC = () => {
  // 状態管理
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [base64Output, setBase64Output] = useState<string>('');
  const [base64Input, setBase64Input] = useState<string>('');
  const [base64Preview, setBase64Preview] = useState<string>('');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [copyButtonText, setCopyButtonText] = useState<string>('コピー');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'imageToBase64' | 'base64ToImage'>('imageToBase64');

  // ファイル選択ハンドラー
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルタイプの検証
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください。');
      return;
    }

    // ファイルサイズの検証 (5MB制限)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('ファイルサイズが5MBを超えています。より小さなファイルを選択してください。');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // プレビュー用のURL作成
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }, []);

  // 画像をbase64に変換
  const convertImageToBase64 = useCallback(() => {
    if (!selectedFile) {
      setError('画像ファイルを選択してください。');
      return;
    }

    setIsConverting(true);
    setError(null);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        setBase64Output(result);
        setIsConverting(false);
      } catch (err) {
        setError('画像の変換中にエラーが発生しました。');
        setIsConverting(false);
        console.error('変換エラー:', err);
      }
    };

    reader.onerror = () => {
      setError('ファイルの読み込み中にエラーが発生しました。');
      setIsConverting(false);
    };

    reader.readAsDataURL(selectedFile);
  }, [selectedFile]);

  // base64を画像に変換
  const convertBase64ToImage = useCallback(() => {
    if (!base64Input.trim()) {
      setError('base64データを入力してください。');
      return;
    }

    setError(null);
    
    try {
      // base64データの検証
      let base64Data = base64Input.trim();
      
      // data:image/... 形式でない場合は、プレフィックスを追加
      if (!base64Data.startsWith('data:image/')) {
        // 最初の部分がbase64データか確認
        const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Pattern.test(base64Data.replace(/\s/g, ''))) {
          setError('有効なbase64データを入力してください。');
          return;
        }
        base64Data = `data:image/png;base64,${base64Data}`;
      }

      // 画像の作成とテスト
      const img = new Image();
      img.onload = () => {
        setBase64Preview(base64Data);
      };
      img.onerror = () => {
        setError('無効なbase64画像データです。正しいbase64データを入力してください。');
      };
      img.src = base64Data;
      
    } catch (err) {
      setError('base64データの変換中にエラーが発生しました。');
      console.error('base64変換エラー:', err);
    }
  }, [base64Input]);

  // クリップボードへのコピー
  const handleCopyToClipboard = useCallback(() => {
    if (!base64Output) {
      setError('コピーするbase64データがありません。');
      return;
    }

    if (!navigator.clipboard) {
      setError('このブラウザはクリップボードAPIをサポートしていません。');
      return;
    }

    navigator.clipboard.writeText(base64Output)
      .then(() => {
        setCopyButtonText('コピーしました！');
        setTimeout(() => {
          setCopyButtonText('コピー');
        }, 2000);
      })
      .catch(err => {
        console.error('クリップボードへのコピーに失敗しました:', err);
        setError('クリップボードへのコピーに失敗しました。');
      });
  }, [base64Output]);

  // 画像のダウンロード
  const handleDownloadImage = useCallback(() => {
    if (!base64Preview) {
      setError('ダウンロードする画像がありません。');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = base64Preview;
      link.download = `converted-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('画像のダウンロードに失敗しました。');
      console.error('ダウンロードエラー:', err);
    }
  }, [base64Preview]);

  // ファイル入力のリセット
  const resetImageInput = () => {
    setSelectedFile(null);
    setImagePreview('');
    setBase64Output('');
    setError(null);
    
    // ファイル入力をリセット
    const fileInput = document.getElementById('image-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // base64入力のリセット
  const resetBase64Input = () => {
    setBase64Input('');
    setBase64Preview('');
    setError(null);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* タブ選択 */}
      <div className="flex space-x-1 bg-[#0d1117] border border-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('imageToBase64')}
          className={cn(
            "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === 'imageToBase64'
              ? "bg-[#21262d] text-white"
              : "text-gray-400 hover:text-white"
          )}
        >
          画像 → base64
        </button>
        <button
          onClick={() => setActiveTab('base64ToImage')}
          className={cn(
            "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === 'base64ToImage'
              ? "bg-[#21262d] text-white"
              : "text-gray-400 hover:text-white"
          )}
        >
          base64 → 画像
        </button>
      </div>

      {/* 画像→base64タブ */}
      {activeTab === 'imageToBase64' && (
        <Card className="p-6 bg-[#1c2128] border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-gray-200">画像をbase64に変換</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ファイル選択 */}
            <div className="space-y-2">
              <Label className="text-gray-300">画像ファイルを選択</Label>
              <div className="flex items-center space-x-4">
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#21262d] file:text-white hover:file:bg-[#30363d] file:cursor-pointer"
                />
                {selectedFile && (
                  <Button
                    onClick={resetImageInput}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-[#30363d]"
                  >
                    リセット
                  </Button>
                )}
              </div>
              {selectedFile && (
                <div className="text-sm text-gray-400">
                  選択されたファイル: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            {/* 画像プレビュー */}
            {imagePreview && (
              <div className="space-y-2">
                <Label className="text-gray-300">プレビュー</Label>
                <div className="border border-gray-700 rounded-lg p-4 bg-[#0d1117] flex justify-center">
                  <img
                    src={imagePreview}
                    alt="選択された画像"
                    className="max-w-full max-h-64 object-contain"
                  />
                </div>
              </div>
            )}

            {/* 変換ボタン */}
            <div className="flex justify-center">
              <Button
                onClick={convertImageToBase64}
                disabled={!selectedFile || isConverting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                {isConverting ? '変換中...' : 'base64に変換'}
              </Button>
            </div>

            {/* base64出力 */}
            {base64Output && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">base64データ</Label>
                  <Button
                    onClick={handleCopyToClipboard}
                    className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
                      "border border-gray-600 text-white bg-[#21262d] hover:bg-[#30363d] min-w-[120px] h-9 px-4 py-2"
                    )}
                  >
                    {copyButtonText}
                  </Button>
                </div>
                <textarea
                  value={base64Output}
                  readOnly
                  className="w-full h-32 p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200 text-xs font-mono resize-none"
                  placeholder="変換されたbase64データがここに表示されます"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* base64→画像タブ */}
      {activeTab === 'base64ToImage' && (
        <Card className="p-6 bg-[#1c2128] border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-gray-200">base64を画像に変換</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* base64入力 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-gray-300">base64データ</Label>
                {base64Input && (
                  <Button
                    onClick={resetBase64Input}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-[#30363d]"
                  >
                    リセット
                  </Button>
                )}
              </div>
              <textarea
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                className="w-full h-32 p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200 text-xs font-mono resize-none"
                placeholder="base64データを入力してください（data:image/...で始まる形式、または base64データのみ）"
              />
            </div>

            {/* 変換ボタン */}
            <div className="flex justify-center">
              <Button
                onClick={convertBase64ToImage}
                disabled={!base64Input.trim()}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              >
                画像に変換
              </Button>
            </div>

            {/* 画像プレビュー */}
            {base64Preview && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">変換結果</Label>
                  <Button
                    onClick={handleDownloadImage}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2"
                  >
                    ダウンロード
                  </Button>
                </div>
                <div className="border border-gray-700 rounded-lg p-4 bg-[#0d1117] flex justify-center">
                  <img
                    src={base64Preview}
                    alt="変換された画像"
                    className="max-w-full max-h-64 object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <div className="text-red-400">{error}</div>
        </div>
      )}
    </div>
  );
};

export default ImageConverter;