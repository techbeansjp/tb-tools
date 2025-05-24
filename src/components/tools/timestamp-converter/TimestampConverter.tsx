'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type ConversionMode = 'datetime-to-timestamp' | 'timestamp-to-datetime';

export const TimestampConverter: React.FC = () => {
  const [mode, setMode] = useState<ConversionMode>('datetime-to-timestamp');
  const [datetimeInput, setDatetimeInput] = useState<string>('');
  const [timestampInput, setTimestampInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [copyButtonText, setCopyButtonText] = useState<string>('コピー');
  const [error, setError] = useState<string>('');

  // JST (UTC+9) timezone offset in milliseconds
  const JST_OFFSET = 9 * 60 * 60 * 1000;

  const convertDatetimeToTimestamp = () => {
    try {
      setError('');
      if (!datetimeInput) {
        setError('日時を入力してください');
        return;
      }

      // Parse the datetime input and treat it as JST
      const date = new Date(datetimeInput);
      if (isNaN(date.getTime())) {
        setError('有効な日時形式で入力してください（例: 2025-05-24 16:15:00）');
        return;
      }

      // Convert JST to UTC by subtracting the JST offset
      const utcTime = date.getTime() - JST_OFFSET;
      const timestamp = Math.floor(utcTime / 1000);
      
      setResult(timestamp.toString());
    } catch (error) {
      setError('変換中にエラーが発生しました');
    }
  };

  const convertTimestampToDatetime = () => {
    try {
      setError('');
      if (!timestampInput) {
        setError('タイムスタンプを入力してください');
        return;
      }

      const timestamp = parseInt(timestampInput);
      if (isNaN(timestamp)) {
        setError('有効な数値を入力してください');
        return;
      }

      // Convert Unix timestamp to Date and add JST offset
      const utcDate = new Date(timestamp * 1000);
      const jstDate = new Date(utcDate.getTime() + JST_OFFSET);
      
      // Format as YYYY-MM-DD HH:MM:SS
      const formatted = jstDate.toISOString().slice(0, 19).replace('T', ' ');
      setResult(formatted);
    } catch (error) {
      setError('変換中にエラーが発生しました');
    }
  };

  const handleConvert = () => {
    if (mode === 'datetime-to-timestamp') {
      convertDatetimeToTimestamp();
    } else {
      convertTimestampToDatetime();
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopyButtonText('コピーしました！');
      setTimeout(() => {
        setCopyButtonText('コピー');
      }, 2000);
    }
  };

  const handleModeChange = (newMode: ConversionMode) => {
    setMode(newMode);
    setResult('');
    setError('');
    setDatetimeInput('');
    setTimestampInput('');
  };

  // Set current time as example
  const setCurrentTime = () => {
    const now = new Date();
    if (mode === 'datetime-to-timestamp') {
      // Add JST offset and format
      const jstNow = new Date(now.getTime() + JST_OFFSET);
      const formatted = jstNow.toISOString().slice(0, 19).replace('T', ' ');
      setDatetimeInput(formatted);
    } else {
      const timestamp = Math.floor(now.getTime() / 1000);
      setTimestampInput(timestamp.toString());
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="p-6 bg-[#1c2128] border-gray-700">
        {/* Conversion Mode Selector */}
        <div className="mb-6">
          <Label className="text-gray-200 text-base font-medium mb-3 block">変換モード</Label>
          <Select
            value={mode}
            onValueChange={(value: ConversionMode) => handleModeChange(value)}
          >
            <SelectTrigger className="w-[300px] bg-[#21262d] border-gray-600 text-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#21262d] border-gray-600">
              <SelectItem value="datetime-to-timestamp" className="text-gray-200 hover:bg-[#30363d]">
                日時 → タイムスタンプ
              </SelectItem>
              <SelectItem value="timestamp-to-datetime" className="text-gray-200 hover:bg-[#30363d]">
                タイムスタンプ → 日時
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Input Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-200">入力</h2>
              <Button
                onClick={setCurrentTime}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 bg-[#21262d] hover:bg-[#30363d] text-xs"
              >
                現在時刻
              </Button>
            </div>
            
            {mode === 'datetime-to-timestamp' ? (
              <div className="space-y-2">
                <Label className="text-gray-300">日時 (JST)</Label>
                <input
                  type="datetime-local"
                  value={datetimeInput}
                  onChange={(e) => setDatetimeInput(e.target.value)}
                  className="w-full p-3 bg-[#21262d] border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <p className="text-xs text-gray-400">
                  または手動入力: YYYY-MM-DD HH:MM:SS
                </p>
                <input
                  type="text"
                  placeholder="2025-05-24 16:15:00"
                  value={datetimeInput}
                  onChange={(e) => setDatetimeInput(e.target.value)}
                  className="w-full p-3 bg-[#21262d] border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-gray-300">タイムスタンプ (Unix時間)</Label>
                <input
                  type="number"
                  placeholder="1716524100"
                  value={timestampInput}
                  onChange={(e) => setTimestampInput(e.target.value)}
                  className="w-full p-3 bg-[#21262d] border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <p className="text-xs text-gray-400">
                  1970年1月1日00:00:00 UTCからの経過秒数
                </p>
              </div>
            )}
          </div>

          {/* Convert Button */}
          <div className="flex justify-center items-center">
            <Button
              onClick={handleConvert}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
              size="lg"
            >
              変換 →
            </Button>
          </div>

          {/* Output Area */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-200">変換結果</h2>
            <div className="space-y-2">
              <Label className="text-gray-300">
                {mode === 'datetime-to-timestamp' ? 'タイムスタンプ' : '日時 (JST)'}
              </Label>
              <div className="relative">
                <input
                  type="text"
                  value={result}
                  readOnly
                  className="w-full p-3 bg-[#1e1e1e] border border-gray-700 rounded-lg text-gray-200 font-mono"
                  placeholder="変換結果がここに表示されます"
                />
                {result && (
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    className="absolute right-2 top-2 bg-[#21262d] hover:bg-[#30363d] border border-gray-600 text-gray-300 min-w-[80px]"
                  >
                    {copyButtonText}
                  </Button>
                )}
              </div>
              {mode === 'datetime-to-timestamp' && result && (
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Unix時間（秒単位）</p>
                  <p>• UTC基準の値</p>
                </div>
              )}
              {mode === 'timestamp-to-datetime' && result && (
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• 日本標準時（JST）</p>
                  <p>• UTC+9時間</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-900/20 border border-red-800 rounded-lg p-4">
            <div className="text-red-400 text-sm">{error}</div>
          </div>
        )}

        {/* Information Panel */}
        <div className="mt-8 bg-[#161b22] p-4 rounded-lg border border-gray-700">
          <h3 className="text-base font-medium text-gray-200 mb-3">タイムスタンプについて</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Unix時間とは</h4>
              <ul className="space-y-1">
                <li>• 1970年1月1日00:00:00 UTCからの経過秒数</li>
                <li>• コンピューターシステムで広く使用される時刻表現</li>
                <li>• タイムゾーンに依存しない絶対時刻</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">日本時間（JST）</h4>
              <ul className="space-y-1">
                <li>• 協定世界時（UTC）より9時間進んでいる</li>
                <li>• このツールはJSTで日時を表示・入力</li>
                <li>• 例: UTC 00:00 = JST 09:00</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};