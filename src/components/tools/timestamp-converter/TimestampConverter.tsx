'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type ConversionMode = 'datetimeToTimestamp' | 'timestampToDatetime';

export const TimestampConverter: React.FC = () => {
  // 変換モードの状態管理
  const [conversionMode, setConversionMode] = useState<ConversionMode>('datetimeToTimestamp');
  
  // 入力値の状態管理
  const [datetimeInput, setDatetimeInput] = useState<string>('');
  const [timestampInput, setTimestampInput] = useState<string>('');
  
  // 変換結果の状態管理
  const [result, setResult] = useState<string>('');
  const [copyButtonText, setCopyButtonText] = useState<string>('コピー');
  const [error, setError] = useState<string | null>(null);

  // 日時からタイムスタンプに変換する関数
  const convertDatetimeToTimestamp = (datetimeString: string): number => {
    if (!datetimeString) {
      throw new Error('日時を入力してください');
    }

    // datetime-local形式をサポート（YYYY-MM-DDTHH:MM）
    let date: Date;
    
    if (datetimeString.includes('T')) {
      // datetime-local形式の場合、JSTとして扱う
      const [datePart, timePart] = datetimeString.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      
      date = new Date(Date.UTC(year, month - 1, day, hour - 9, minute || 0));
      
      if (isNaN(date.getTime())) {
        throw new Error('有効な日時形式で入力してください（例: 2025-05-24T16:15）');
      }
    } else {
      // その他の形式の場合
      date = new Date(datetimeString);
      if (isNaN(date.getTime())) {
        throw new Error('有効な日時形式で入力してください');
      }
    }

    return Math.floor(date.getTime() / 1000);
  };

  // タイムスタンプから日時に変換する関数
  const convertTimestampToDatetime = (timestamp: string): string => {
    if (!timestamp) {
      throw new Error('タイムスタンプを入力してください');
    }

    const timestampNumber = parseInt(timestamp);
    if (isNaN(timestampNumber)) {
      throw new Error('有効な数値を入力してください');
    }

    // タイムスタンプが秒単位かミリ秒単位かを判定
    let date: Date;
    if (timestampNumber.toString().length === 10) {
      // 秒単位のタイムスタンプ
      date = new Date(timestampNumber * 1000);
    } else if (timestampNumber.toString().length === 13) {
      // ミリ秒単位のタイムスタンプ
      date = new Date(timestampNumber);
    } else {
      throw new Error('タイムスタンプは10桁（秒）または13桁（ミリ秒）で入力してください');
    }

    if (isNaN(date.getTime())) {
      throw new Error('有効なタイムスタンプを入力してください');
    }

    // JSTに変換（UTC+9時間）
    const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    
    // YYYY-MM-DD HH:MM:SS形式でフォーマット
    return jstDate.toISOString().slice(0, 19).replace('T', ' ');
  };

  // 変換実行のハンドラー
  const handleConvert = () => {
    setError(null);
    
    try {
      let convertedResult: string;
      
      if (conversionMode === 'datetimeToTimestamp') {
        const timestamp = convertDatetimeToTimestamp(datetimeInput);
        convertedResult = timestamp.toString();
      } else {
        const datetime = convertTimestampToDatetime(timestampInput);
        convertedResult = datetime;
      }
      
      setResult(convertedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '変換中にエラーが発生しました');
      setResult('');
    }
  };

  // 現在時刻を設定するハンドラー
  const handleSetCurrentTime = () => {
    const now = new Date();
    
    if (conversionMode === 'datetimeToTimestamp') {
      // JSTでの現在時刻をdatetime-local形式で設定
      const jstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      const year = jstNow.getUTCFullYear();
      const month = String(jstNow.getUTCMonth() + 1).padStart(2, '0');
      const day = String(jstNow.getUTCDate()).padStart(2, '0');
      const hour = String(jstNow.getUTCHours()).padStart(2, '0');
      const minute = String(jstNow.getUTCMinutes()).padStart(2, '0');
      const datetimeLocal = `${year}-${month}-${day}T${hour}:${minute}`;
      setDatetimeInput(datetimeLocal);
    } else {
      // 現在のタイムスタンプを設定
      const currentTimestamp = Math.floor(now.getTime() / 1000);
      setTimestampInput(currentTimestamp.toString());
    }
  };

  // コピーボタンのハンドラー
  const handleCopy = () => {
    if (!navigator.clipboard) {
      setError('このブラウザはクリップボードAPIをサポートしていません。');
      return;
    }
    
    if (!result) {
      setError('コピーする結果がありません。まず変換を実行してください。');
      return;
    }
    
    navigator.clipboard.writeText(result)
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

  // 変換モード切り替えのハンドラー
  const handleModeChange = (checked: boolean) => {
    setConversionMode(checked ? 'timestampToDatetime' : 'datetimeToTimestamp');
    setResult('');
    setError(null);
    setDatetimeInput('');
    setTimestampInput('');
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="p-6 bg-[#1c2128] border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-gray-200">タイムスタンプ変換ツール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 変換モード切り替え */}
          <div className="flex items-center justify-center space-x-4">
            <Label className={cn(
              "text-sm font-medium",
              !conversionMode.includes('timestamp') ? "text-blue-400" : "text-gray-400"
            )}>
              日時 → タイムスタンプ
            </Label>
            <Switch
              checked={conversionMode === 'timestampToDatetime'}
              onCheckedChange={handleModeChange}
            />
            <Label className={cn(
              "text-sm font-medium",
              conversionMode.includes('timestamp') ? "text-blue-400" : "text-gray-400"
            )}>
              タイムスタンプ → 日時
            </Label>
          </div>

          {/* メインレイアウト：左側入力、中央ボタン、右側出力 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* 左側：入力エリア */}
            <div className="space-y-4">
              <Label className="text-gray-300 text-lg font-medium">
                {conversionMode === 'datetimeToTimestamp' ? '日時入力' : 'タイムスタンプ入力'}
              </Label>
              
              {conversionMode === 'datetimeToTimestamp' ? (
                <div className="space-y-3">
                  <input
                    type="datetime-local"
                    value={datetimeInput}
                    onChange={(e) => setDatetimeInput(e.target.value)}
                    className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200"
                    placeholder="日時を選択してください"
                  />
                  <div className="text-sm text-gray-400">
                    または手動入力（例: 2025-05-24T16:15）
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={timestampInput}
                    onChange={(e) => setTimestampInput(e.target.value)}
                    className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200"
                    placeholder="タイムスタンプを入力（例: 1747042500）"
                  />
                  <div className="text-sm text-gray-400">
                    10桁（秒）または13桁（ミリ秒）で入力
                  </div>
                </div>
              )}
              
              <Button
                onClick={handleSetCurrentTime}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white"
              >
                現在時刻を設定
              </Button>
            </div>

            {/* 中央：変換ボタン */}
            <div className="flex justify-center">
              <Button
                onClick={handleConvert}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                disabled={conversionMode === 'datetimeToTimestamp' ? !datetimeInput : !timestampInput}
              >
                変換
                <span className="mx-2">→</span>
              </Button>
            </div>

            {/* 右側：出力エリア */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-gray-300 text-lg font-medium">変換結果</Label>
                <Button
                  onClick={handleCopy}
                  disabled={!result}
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
                    "border border-gray-600 text-white bg-[#21262d] hover:bg-[#30363d] min-w-[120px] h-9 px-4 py-2"
                  )}
                >
                  {copyButtonText}
                </Button>
              </div>
              
              <div className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200 min-h-[80px] flex items-center break-all">
                {result || '変換結果がここに表示されます'}
              </div>
              
              {result && (
                <div className="text-sm text-gray-400">
                  {conversionMode === 'datetimeToTimestamp' 
                    ? 'Unix時間（UTC基準）' 
                    : 'JST（日本標準時）'
                  }
                </div>
              )}
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="text-red-400">{error}</div>
            </div>
          )}

          {/* 説明パネル */}
          <Card className="bg-[#161b22] border-gray-700">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-gray-200 mb-3">タイムスタンプ変換について</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• <strong>Unix時間</strong>: 1970年1月1日 00:00:00 UTC からの経過秒数</p>
                <p>• <strong>JST（日本標準時）</strong>: UTC+9時間のタイムゾーン</p>
                <p>• 日時入力はJSTとして扱われ、タイムスタンプはUTC基準で計算されます</p>
                <p>• タイムスタンプは10桁（秒単位）または13桁（ミリ秒単位）に対応</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimestampConverter;
