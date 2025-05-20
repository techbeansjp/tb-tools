'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type EncodingType = 'base64' | 'url' | 'html' | 'json';

interface EncodingOption {
  id: EncodingType;
  name: string;
  encode: (text: string) => string;
  decode: (text: string) => string;
}

export const EncoderDecoder: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [encodingType, setEncodingType] = useState<EncodingType>('base64');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState<string>('コピー');

  const encodingOptions: EncodingOption[] = [
    {
      id: 'base64',
      name: 'Base64',
      encode: (text) => {
        try {
          return btoa(unescape(encodeURIComponent(text)));
        } catch {
          throw new Error('Base64エンコードに失敗しました');
        }
      },
      decode: (text) => {
        try {
          return decodeURIComponent(escape(atob(text)));
        } catch {
          throw new Error('Base64デコードに失敗しました');
        }
      }
    },
    {
      id: 'url',
      name: 'URL',
      encode: (text) => {
        try {
          return encodeURIComponent(text);
        } catch {
          throw new Error('URLエンコードに失敗しました');
        }
      },
      decode: (text) => {
        try {
          return decodeURIComponent(text);
        } catch {
          throw new Error('URLデコードに失敗しました');
        }
      }
    },
    {
      id: 'html',
      name: 'HTMLエンティティ',
      encode: (text) => {
        try {
          return text.replace(/[&<>"']/g, (match) => {
            const entities: Record<string, string> = {
              '&': '&amp;',
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              "'": '&#39;'
            };
            return entities[match];
          });
        } catch {
          throw new Error('HTMLエンティティエンコードに失敗しました');
        }
      },
      decode: (text) => {
        try {
          return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
        } catch {
          throw new Error('HTMLエンティティデコードに失敗しました');
        }
      }
    },
    {
      id: 'json',
      name: 'JSON',
      encode: (text) => {
        try {
          return JSON.stringify(text).slice(1, -1);
        } catch {
          throw new Error('JSONエスケープに失敗しました');
        }
      },
      decode: (text) => {
        try {
          const jsonStr = `"${text.replace(/"/g, '\\"')}"`.replace(/\\\\"/g, '\\"');
          return JSON.parse(jsonStr);
        } catch {
          throw new Error('JSONアンエスケープに失敗しました');
        }
      }
    }
  ];

  const handleProcess = () => {
    try {
      setError(null);
      const option = encodingOptions.find(opt => opt.id === encodingType);
      if (!option) return;

      const result = mode === 'encode' 
        ? option.encode(inputText)
        : option.decode(inputText);
      
      setOutputText(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('処理中にエラーが発生しました');
      }
      setOutputText('');
    }
  };

  const handleCopy = () => {
    if (!navigator.clipboard) {
      setError('このブラウザはクリップボードAPIをサポートしていません。');
      return;
    }
    
    navigator.clipboard.writeText(outputText)
      .then(() => {
        setCopyButtonText('コピーしました！');
        setTimeout(() => {
          setCopyButtonText('コピー');
        }, 2000);
      })
      .catch(err => {
        console.error('クリップボードへのコピーに失敗しました:', err);
        setError('クリップボードへのコピーに失敗しました。ブラウザの設定を確認してください。');
      });
  };

  const handleSwap = () => {
    setInputText(outputText);
    setOutputText(inputText);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  // 入力が変更されたら自動的に処理を実行
  useEffect(() => {
    if (inputText) {
      handleProcess();
    } else {
      setOutputText('');
      setError(null);
    }
  }, [inputText, encodingType, mode]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="p-6 bg-[#1c2128] border-gray-700">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/3">
              <Label className="text-gray-300 mb-2 block">エンコード方式</Label>
              <Select
                value={encodingType}
                onValueChange={(value: string) => setEncodingType(value as EncodingType)}
              >
                <SelectTrigger className="w-full bg-[#21262d] border-gray-600 text-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#21262d] border-gray-600">
                  {encodingOptions.map(option => (
                    <SelectItem 
                      key={option.id} 
                      value={option.id}
                      className="text-gray-200 hover:bg-[#30363d]"
                    >
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/3 flex justify-center">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setMode('encode')}
                  className={mode === 'encode' 
                    ? 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 py-2' 
                    : 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-gray-600 text-gray-300 hover:bg-[#30363d] h-9 px-4 py-2'}
                >
                  エンコード
                </Button>
                <Button
                  onClick={() => setMode('decode')}
                  className={mode === 'decode' 
                    ? 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 py-2' 
                    : 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-gray-600 text-gray-300 hover:bg-[#30363d] h-9 px-4 py-2'}
                >
                  デコード
                </Button>
              </div>
            </div>

            <div className="w-full md:w-1/3 flex justify-end">
              <Button
                onClick={handleSwap}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-gray-600 text-gray-300 hover:bg-[#30363d] h-9 px-4 py-2"
              >
                入力と出力を入れ替え
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center h-10">
                <Label className="text-gray-300">入力テキスト</Label>
              </div>
              <textarea
                className="w-full h-64 p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mt-2"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={mode === 'encode' ? '変換するテキストを入力してください' : 'デコードするテキストを入力してください'}
              />
            </div>
            <div>
              <div className="flex justify-between items-center h-10">
                <Label className="text-gray-300">出力テキスト</Label>
                <Button
                  onClick={handleCopy}
                  disabled={!outputText}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-gray-600 text-white bg-[#21262d] hover:bg-[#30363d] min-w-[120px] h-9 px-4 py-2"
                >
                  {copyButtonText}
                </Button>
              </div>
              <textarea
                className="w-full h-64 p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200 mt-2"
                value={outputText}
                readOnly
                placeholder="結果がここに表示されます"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="text-red-400">{error}</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
