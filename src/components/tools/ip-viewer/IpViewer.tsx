
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IpInfo {
  ip: string;
  country?: string;
  city?: string;
}

export const IpViewer: React.FC = () => {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIpInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // S3静的ホスティング対応: 外部APIを直接呼び出す
      const response = await fetch('https://api.ipify.org?format=json');
      if (!response.ok) {
        throw new Error('IP情報の取得に失敗しました');
      }
      const { ip } = await response.json();
      
      // 位置情報は別のAPIから取得（CORSに対応したサービスを使用）
      try {
        const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          setIpInfo({
            ip,
            country: geoData.country_name || 'N/A',
            city: geoData.city || 'N/A'
          });
        } else {
          // 位置情報の取得に失敗した場合はIPのみ表示
          setIpInfo({ ip, country: 'N/A', city: 'N/A' });
        }
      } catch {
        // 位置情報の取得に失敗した場合はIPのみ表示
        setIpInfo({ ip, country: 'N/A', city: 'N/A' });
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('不明なエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIpInfo();
  }, []);

  const handleCopy = () => {
    if (ipInfo?.ip) {
      navigator.clipboard.writeText(ipInfo.ip);
      alert('IPアドレスをコピーしました');
    }
  };

  return (
    <Card className="p-6 bg-[#1c2128] border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl text-gray-200">あなたのIP情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="text-center text-gray-400">読み込み中...</div>
        ) : error ? (
          <div className="text-center text-red-400">{error}</div>
        ) : ipInfo ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#0d1117] p-4 rounded-lg">
              <span className="text-2xl font-mono text-green-400 break-all">{ipInfo.ip}</span>
              <Button onClick={handleCopy} className="ml-4">コピー</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <div className="bg-[#0d1117] p-3 rounded-lg">
                <span className="font-semibold">国:</span> {ipInfo.country || 'N/A'}
              </div>
              <div className="bg-[#0d1117] p-3 rounded-lg">
                <span className="font-semibold">都市:</span> {ipInfo.city || 'N/A'}
              </div>
            </div>
          </div>
        ) : null}
        <div className="flex justify-center">
          <Button onClick={fetchIpInfo} disabled={isLoading}>
            {isLoading ? '更新中...' : 'IP情報を更新'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
