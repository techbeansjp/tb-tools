'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface ImageConverterProps {}

export const ImageConverter: React.FC<ImageConverterProps> = () => {
  const [activeTab, setActiveTab] = useState<'imageToBase64' | 'base64ToImage'>('imageToBase64');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Output, setBase64Output] = useState<string>('');
  const [base64Input, setBase64Input] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState<string>('コピー');
  const [downloadButtonText, setDownloadButtonText] = useState<string>('ダウンロード');

  // 画像 → Base64変換
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルタイプの検証
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください。');
      return;
    }

    // ファイルサイズの制限（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください。');
      return;
    }

    setError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setBase64Output(result);
      setImagePreview(result);
    };
    reader.onerror = () => {
      setError('ファイルの読み込みに失敗しました。');
    };
    reader.readAsDataURL(file);
  }, []);

  // Base64 → 画像変換
  const handleBase64Input = useCallback((value: string) => {
    setBase64Input(value);
    setError(null);

    if (!value.trim()) {
      setImagePreview('');
      return;
    }

    try {
      // base64データの検証とフォーマット
      let base64Data = value.trim();
      
      // data:image/...;base64, プレフィックスがない場合は追加
      if (!base64Data.startsWith('data:image/')) {
        // 基本的なbase64文字列かどうかチェック
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
          setError('有効なBase64データを入力してください。');
          setImagePreview('');
          return;
        }
        base64Data = `data:image/png;base64,${base64Data}`;
      }

      // 画像として表示できるかテスト
      const img = new Image();
      img.onload = () => {
        setImagePreview(base64Data);
        setError(null);
      };
      img.onerror = () => {
        setError('有効な画像のBase64データではありません。');
        setImagePreview('');
      };
      img.src = base64Data;
    } catch (e) {
      setError('Base64データの処理中にエラーが発生しました。');
      setImagePreview('');
    }
  }, []);

  // クリップボードコピー
  const handleCopy = () => {
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
  };

  // 画像ダウンロード
  const handleDownload = () => {
    if (!imagePreview) return;

    try {
      const link = document.createElement('a');
      link.href = imagePreview;
      link.download = `converted-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadButtonText('ダウンロード済み！');
      setTimeout(() => {
        setDownloadButtonText('ダウンロード');
      }, 2000);
    } catch (e) {
      setError('画像のダウンロードに失敗しました。');
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="p-6 bg-[#1c2128] border-gray-700">
        {/* タブナビゲーション */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('imageToBase64')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'imageToBase64'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            画像 → Base64
          </button>
          <button
            onClick={() => setActiveTab('base64ToImage')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'base64ToImage'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Base64 → 画像
          </button>
        </div>

        {/* 画像 → Base64 タブ */}
        {activeTab === 'imageToBase64' && (
          <div className="space-y-6">
            <div>
              <Label className="text-gray-300 mb-4 block">画像ファイルを選択</Label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-gray-300">クリックして画像ファイルを選択</span>
                  <span className="text-gray-500 text-sm">PNG, JPEG, GIF, WebP等対応（最大5MB）</span>
                </label>
              </div>
              {selectedFile && (
                <div className="mt-4 text-gray-300">
                  選択されたファイル: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            {imagePreview && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-300 mb-2 block">プレビュー</Label>
                  <div className="bg-[#0d1117] border border-gray-700 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="プレビュー"
                      className="max-w-full max-h-[300px] object-contain"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-gray-300">Base64データ</Label>
                    <Button
                      onClick={handleCopy}
                      disabled={!base64Output}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-gray-600 text-white bg-[#21262d] hover:bg-[#30363d] min-w-[120px] h-9 px-4 py-2"
                    >
                      {copyButtonText}
                    </Button>
                  </div>
                  <textarea
                    className="w-full h-64 p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200 text-sm"
                    value={base64Output}
                    readOnly
                    placeholder="Base64データがここに表示されます"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Base64 → 画像 タブ */}
        {activeTab === 'base64ToImage' && (
          <div className="space-y-6">
            <div>
              <Label className="text-gray-300 mb-2 block">Base64データを入力</Label>
              <textarea
                className="w-full h-32 p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={base64Input}
                onChange={(e) => handleBase64Input(e.target.value)}
                placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA... または生のBase64データを入力してください"
              />
            </div>

            {imagePreview && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-300 mb-2 block">変換された画像</Label>
                  <div className="bg-[#0d1117] border border-gray-700 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="変換された画像"
                      className="max-w-full max-h-[300px] object-contain"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center space-y-4">
                  <Button
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 py-2"
                  >
                    {downloadButtonText}
                  </Button>
                  <p className="text-gray-400 text-sm text-center">
                    画像をPNGファイルとしてダウンロードできます
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mt-6">
            <div className="text-red-400">{error}</div>
          </div>
        )}
      </Card>
    </div>
  );
};