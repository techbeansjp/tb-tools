'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TimezoneSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
}> = ({ value, onChange, label }) => (
  <div>
    <Label className="text-gray-300 mb-2 block">{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-[#0d1117] border-gray-700 text-gray-200">
        <SelectValue placeholder="タイムゾーンを選択" />
      </SelectTrigger>
      <SelectContent className="bg-[#0d1117] border-gray-700">
        {TIMEZONES.map((timezone) => (
          <SelectItem 
            key={timezone.value} 
            value={timezone.value}
            className="text-gray-200 hover:bg-[#21262d]"
          >
            {timezone.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const TIMEZONES = [
  { value: 'Asia/Tokyo', label: '日本時間 (JST)', offset: '+09:00' },
  { value: 'UTC', label: '協定世界時 (UTC)', offset: '+00:00' },
  { value: 'America/New_York', label: 'ニューヨーク (EST/EDT)', offset: '-05:00/-04:00' },
  { value: 'America/Los_Angeles', label: 'ロサンゼルス (PST/PDT)', offset: '-08:00/-07:00' },
  { value: 'Europe/London', label: 'ロンドン (GMT/BST)', offset: '+00:00/+01:00' },
  { value: 'Europe/Paris', label: 'パリ (CET/CEST)', offset: '+01:00/+02:00' },
  { value: 'Asia/Shanghai', label: '上海 (CST)', offset: '+08:00' },
  { value: 'Asia/Seoul', label: 'ソウル (KST)', offset: '+09:00' },
  { value: 'Asia/Hong_Kong', label: '香港 (HKT)', offset: '+08:00' },
  { value: 'Asia/Singapore', label: 'シンガポール (SGT)', offset: '+08:00' },
  { value: 'Australia/Sydney', label: 'シドニー (AEST/AEDT)', offset: '+10:00/+11:00' },
  { value: 'America/Chicago', label: 'シカゴ (CST/CDT)', offset: '-06:00/-05:00' },
  { value: 'America/Denver', label: 'デンバー (MST/MDT)', offset: '-07:00/-06:00' },
  { value: 'Europe/Berlin', label: 'ベルリン (CET/CEST)', offset: '+01:00/+02:00' },
  { value: 'Asia/Dubai', label: 'ドバイ (GST)', offset: '+04:00' },
];

export const TimezoneConverter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'custom'>('current');
  const [sourceTimezone, setSourceTimezone] = useState<string>('Asia/Tokyo');
  const [targetTimezone, setTargetTimezone] = useState<string>('UTC');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [customDateTime, setCustomDateTime] = useState<string>('');
  const [customDate, setCustomDate] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');

  // リアルタイム時刻更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // カスタム日時の初期化
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    
    const localDate = `${year}-${month}-${day}`;
    const localTime = `${hour}:${minute}`;
    setCustomDate(localDate);
    setCustomTime(localTime);
    setCustomDateTime(`${localDate}T${localTime}`);
  }, []);

  // カスタム日時の更新
  const handleCustomDateTimeChange = useCallback((date: string, time: string) => {
    setCustomDate(date);
    setCustomTime(time);
    setCustomDateTime(`${date}T${time}`);
  }, []);

  // 時刻フォーマット関数
  const formatDateTime = useCallback((date: Date, timezone: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      
      const formatter = new Intl.DateTimeFormat('ja-JP', options);
      const parts = formatter.formatToParts(date);
      
      const year = parts.find(p => p.type === 'year')?.value;
      const month = parts.find(p => p.type === 'month')?.value;
      const day = parts.find(p => p.type === 'day')?.value;
      const hour = parts.find(p => p.type === 'hour')?.value;
      const minute = parts.find(p => p.type === 'minute')?.value;
      const second = parts.find(p => p.type === 'second')?.value;
      
      return `${year}年${month}月${day}日 ${hour}:${minute}:${second}`;
    } catch {
      return '無効なタイムゾーン';
    }
  }, []);

  // カスタム日時から変換時刻を計算
  const getConvertedCustomTime = useCallback(() => {
    if (!customDateTime) return '';
    
    try {
      const [date, time] = customDateTime.split('T');
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      
      // ソースタイムゾーンでの時刻として明示的に作成
      const tempDate = new Date(year, month - 1, day, hour, minute, 0);
      const sourceTime = new Date(
        tempDate.toLocaleString('en-US', { timeZone: sourceTimezone })
      );
      const offset = tempDate.getTime() - sourceTime.getTime();
      const utcEquivalent = new Date(tempDate.getTime() + offset);
      
      return formatDateTime(utcEquivalent, targetTimezone);
    } catch {
      return '無効な日時';
    }
  }, [customDateTime, sourceTimezone, targetTimezone, formatDateTime]);

  // タイムゾーンラベル取得
  const getTimezoneLabel = useCallback((value: string) => {
    return TIMEZONES.find(tz => tz.value === value)?.label || value;
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="p-6 bg-[#1c2128] border-gray-700">
        {/* タブナビゲーション */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'current'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            現在時刻変換
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            日時指定変換
          </button>
        </div>

        {/* 現在時刻変換タブ */}
        {activeTab === 'current' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ソースタイムゾーン */}
              <div className="space-y-4">
                <TimezoneSelect 
                  value={sourceTimezone} 
                  onChange={setSourceTimezone}
                  label="基準タイムゾーン"
                />
                
                <div className="bg-[#0d1117] border border-gray-700 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-gray-400 text-sm mb-2">
                      {getTimezoneLabel(sourceTimezone)}
                    </div>
                    <div className="text-2xl font-mono text-white">
                      {formatDateTime(currentTime, sourceTimezone)}
                    </div>
                  </div>
                </div>
              </div>

              {/* ターゲットタイムゾーン */}
              <div className="space-y-4">
                <TimezoneSelect 
                  value={targetTimezone} 
                  onChange={setTargetTimezone}
                  label="変換先タイムゾーン"
                />
                
                <div className="bg-[#0d1117] border border-blue-500 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-gray-400 text-sm mb-2">
                      {getTimezoneLabel(targetTimezone)}
                    </div>
                    <div className="text-2xl font-mono text-blue-400">
                      {formatDateTime(currentTime, targetTimezone)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 日時指定変換タブ */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ソースタイムゾーンと日時入力 */}
              <div className="space-y-4">
                <TimezoneSelect 
                  value={sourceTimezone} 
                  onChange={setSourceTimezone}
                  label="基準タイムゾーン"
                />

                <div>
                  <Label className="text-gray-300 mb-2 block">日付</Label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => handleCustomDateTimeChange(e.target.value, customTime)}
                    className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">時刻</Label>
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => handleCustomDateTimeChange(customDate, e.target.value)}
                    className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-[#0d1117] border border-gray-700 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-gray-400 text-sm mb-2">
                      {getTimezoneLabel(sourceTimezone)}
                    </div>
                    <div className="text-lg font-mono text-white">
                      {customDate && customTime ? 
                        (() => {
                          const [year, month, day] = customDate.split('-').map(Number);
                          const [hour, minute] = customTime.split(':').map(Number);
                          return `${year}年${String(month).padStart(2, '0')}月${String(day).padStart(2, '0')}日 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
                        })()
                        : '日時を選択してください'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* ターゲットタイムゾーンと変換結果 */}
              <div className="space-y-4">
                <TimezoneSelect 
                  value={targetTimezone} 
                  onChange={setTargetTimezone}
                  label="変換先タイムゾーン"
                />

                <div className="mt-20">
                  <div className="bg-[#0d1117] border border-blue-500 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-gray-400 text-sm mb-2">
                        {getTimezoneLabel(targetTimezone)}
                      </div>
                      <div className="text-lg font-mono text-blue-400">
                        {customDateTime ? getConvertedCustomTime() : '日時を選択してください'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
