'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

async function md5(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  
  const toHexString = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };
  
  const rotateLeft = (x: number, n: number): number => {
    return (x << n) | (x >>> (32 - n));
  };
  
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];
  
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2**32);
  }
  
  let messageLen = msgBuffer.length;
  let padLen = (messageLen % 64 < 56) ? (56 - messageLen % 64) : (120 - messageLen % 64);
  
  const paddedMsg = new Uint8Array(messageLen + padLen + 8);
  paddedMsg.set(msgBuffer);
  paddedMsg[messageLen] = 0x80;  // パディングの最初のビットは1
  
  const messageLenBits = BigInt(messageLen * 8);
  const dataView = new DataView(paddedMsg.buffer);
  dataView.setBigUint64(messageLen + padLen, messageLenBits, true);
  
  let h0 = 0x67452301;
  let h1 = 0xEFCDAB89;
  let h2 = 0x98BADCFE;
  let h3 = 0x10325476;
  
  for (let i = 0; i < paddedMsg.length; i += 64) {
    const chunk = paddedMsg.slice(i, i + 64);
    const M = new Uint32Array(16);
    
    for (let j = 0; j < 16; j++) {
      M[j] = chunk[j*4] | (chunk[j*4+1] << 8) | (chunk[j*4+2] << 16) | (chunk[j*4+3] << 24);
    }
    
    let A = h0;
    let B = h1;
    let C = h2;
    let D = h3;
    
    for (let j = 0; j < 64; j++) {
      let F, g;
      
      if (j < 16) {
        F = (B & C) | ((~B) & D);
        g = j;
      } else if (j < 32) {
        F = (D & B) | ((~D) & C);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        F = B ^ C ^ D;
        g = (3 * j + 5) % 16;
      } else {
        F = C ^ (B | (~D));
        g = (7 * j) % 16;
      }
      
      const temp = D;
      D = C;
      C = B;
      B = B + rotateLeft((A + F + K[j] + M[g]) & 0xFFFFFFFF, s[j]);
      B = B & 0xFFFFFFFF;
      A = temp;
    }
    
    h0 = (h0 + A) & 0xFFFFFFFF;
    h1 = (h1 + B) & 0xFFFFFFFF;
    h2 = (h2 + C) & 0xFFFFFFFF;
    h3 = (h3 + D) & 0xFFFFFFFF;
  }
  
  const result = new Uint8Array(16);
  new DataView(result.buffer).setUint32(0, h0, true);
  new DataView(result.buffer).setUint32(4, h1, true);
  new DataView(result.buffer).setUint32(8, h2, true);
  new DataView(result.buffer).setUint32(12, h3, true);
  
  return toHexString(result.buffer);
}

async function calculateHash(text: string, algorithm: string): Promise<string> {
  if (algorithm === 'md5') {
    return md5(text);
  }
  
  const cryptoAlgorithm = algorithm.replace('-', '').toLowerCase();
  
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  const hashBuffer = await crypto.subtle.digest(cryptoAlgorithm, data);
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

type HashAlgorithm = 'md5' | 'sha-1' | 'sha-256' | 'sha-512';

interface HashOption {
  id: HashAlgorithm;
  name: string;
}

export const HashGenerator: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('sha-256');
  const [error, setError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState<string>('コピー');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const hashOptions: HashOption[] = [
    { id: 'md5', name: 'MD5' },
    { id: 'sha-1', name: 'SHA-1' },
    { id: 'sha-256', name: 'SHA-256' },
    { id: 'sha-512', name: 'SHA-512' }
  ];

  const handleProcess = async () => {
    if (!inputText) {
      setOutputText('');
      setError(null);
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      const result = await calculateHash(inputText, algorithm);
      setOutputText(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('ハッシュ計算中にエラーが発生しました');
      }
      setOutputText('');
    } finally {
      setIsProcessing(false);
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

  useEffect(() => {
    handleProcess();
  }, [inputText, algorithm]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="p-6 bg-[#1c2128] border-gray-700">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/2">
              <Label className="text-gray-300 mb-2 block">ハッシュアルゴリズム</Label>
              <Select
                value={algorithm}
                onValueChange={(value: string) => setAlgorithm(value as HashAlgorithm)}
                disabled={isProcessing}
              >
                <SelectTrigger className="w-full bg-[#21262d] border-gray-600 text-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#21262d] border-gray-600">
                  {hashOptions.map(option => (
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
                placeholder="ハッシュを生成するテキストを入力してください"
                disabled={isProcessing}
              />
            </div>
            <div>
              <div className="flex justify-between items-center h-10">
                <Label className="text-gray-300">ハッシュ出力</Label>
                <Button
                  onClick={handleCopy}
                  disabled={!outputText || isProcessing}
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
