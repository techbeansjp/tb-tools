'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export const PasswordGenerator: React.FC = () => {
  // パスワード設定の状態管理
  const [passwordLength, setPasswordLength] = useState<number>(12);
  const [includeSpecialChars, setIncludeSpecialChars] = useState<boolean>(true);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  
  // 生成されたパスワードの状態管理
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [copyButtonText, setCopyButtonText] = useState<string>('コピー');
  const [error, setError] = useState<string | null>(null);

  // パスワードの強度を評価する関数
  const [passwordStrength, setPasswordStrength] = useState<string>('');
  const [strengthColor, setStrengthColor] = useState<string>('bg-gray-500');

  // パスワードの強度を評価する関数
  const evaluatePasswordStrength = (password: string): void => {
    if (!password || password === '生成されたパスワードがここに表示されます') {
      setPasswordStrength('');
      setStrengthColor('bg-gray-500');
      return;
    }

    let score = 0;
    
    // 長さによるスコア
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // 文字種類によるスコア
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // 文字の多様性によるスコア
    const uniqueChars = new Set(password.split('')).size;
    const uniqueRatio = uniqueChars / password.length;
    if (uniqueRatio > 0.7) score += 1;
    
    // 強度の判定
    let strength = '';
    let color = '';
    
    if (score < 3) {
      strength = '弱い';
      color = 'bg-red-500';
    } else if (score < 5) {
      strength = '普通';
      color = 'bg-yellow-500';
    } else if (score < 7) {
      strength = '強い';
      color = 'bg-green-500';
    } else {
      strength = '非常に強い';
      color = 'bg-blue-500';
    }
    
    setPasswordStrength(strength);
    setStrengthColor(color);
  };

  // パスワード生成ボタンのハンドラー
  const handleGeneratePassword = () => {
    setError(null);
    
    // 少なくとも1つのオプションが選択されているか確認
    if (!includeSpecialChars && !includeUppercase && !includeLowercase && !includeNumbers) {
      setError('少なくとも1つの文字タイプを選択してください');
      return;
    }
    
    try {
      const password = generateSecurePassword(
        passwordLength,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSpecialChars
      );
      
      setGeneratedPassword(password);
      evaluatePasswordStrength(password);
    } catch (err) {
      setError('パスワードの生成中にエラーが発生しました');
      console.error('パスワード生成エラー:', err);
    }
  };

  // セキュアなパスワードを生成する関数
  const generateSecurePassword = (
    length: number,
    useUppercase: boolean,
    useLowercase: boolean,
    useNumbers: boolean,
    useSpecial: boolean
  ): string => {
    // 使用する文字セットを定義
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    // 選択された文字タイプに基づいて文字セットを構築
    let charset = '';
    const mustInclude = [];
    
    if (useUppercase) {
      charset += uppercaseChars;
      mustInclude.push(getRandomChar(uppercaseChars));
    }
    
    if (useLowercase) {
      charset += lowercaseChars;
      mustInclude.push(getRandomChar(lowercaseChars));
    }
    
    if (useNumbers) {
      charset += numberChars;
      mustInclude.push(getRandomChar(numberChars));
    }
    
    if (useSpecial) {
      charset += specialChars;
      mustInclude.push(getRandomChar(specialChars));
    }
    
    if (charset === '') {
      throw new Error('少なくとも1つの文字タイプを選択してください');
    }
    
    // 必須文字が長さを超える場合はエラー
    if (mustInclude.length > length) {
      throw new Error(`パスワードの長さは少なくとも${mustInclude.length}文字必要です`);
    }
    
    // 残りの文字を生成
    let password = '';
    const remainingLength = length - mustInclude.length;
    
    for (let i = 0; i < remainingLength; i++) {
      password += getRandomChar(charset);
    }
    
    // 必須文字をランダムな位置に挿入
    password = insertRandomly(password, mustInclude);
    
    return password;
  };
  
  // 文字列からランダムな文字を取得する関数
  const getRandomChar = (charset: string): string => {
    const randomIndex = getSecureRandomInt(0, charset.length);
    return charset[randomIndex];
  };
  
  // 暗号学的に安全な乱数を生成する関数
  const getSecureRandomInt = (min: number, max: number): number => {
    const range = max - min;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const maxValid = Math.pow(256, bytesNeeded);
    const maxAllowed = maxValid - (maxValid % range);
    
    let randomValue;
    do {
      const randomBytes = new Uint8Array(bytesNeeded);
      window.crypto.getRandomValues(randomBytes);
      
      randomValue = 0;
      for (let i = 0; i < bytesNeeded; i++) {
        randomValue = (randomValue << 8) + randomBytes[i];
      }
    } while (randomValue >= maxAllowed);
    
    return min + (randomValue % range);
  };
  
  // 文字列に別の文字列の各文字をランダムな位置に挿入する関数
  const insertRandomly = (str: string, chars: string[]): string => {
    const result = str.split('');
    
    for (const char of chars) {
      const position = getSecureRandomInt(0, result.length + 1);
      result.splice(position, 0, char);
    }
    
    return result.join('');
  };
  
  // パスワードが変更されたときに強度を評価
  useEffect(() => {
    evaluatePasswordStrength(generatedPassword);
  }, [generatedPassword]);

  // コピーボタンのハンドラー
  const handleCopy = () => {
    if (!navigator.clipboard) {
      setError('このブラウザはクリップボードAPIをサポートしていません。');
      return;
    }
    
    if (!generatedPassword || generatedPassword === '生成されたパスワードがここに表示されます') {
      setError('コピーするパスワードがありません。まずパスワードを生成してください。');
      return;
    }
    
    navigator.clipboard.writeText(generatedPassword)
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

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="p-6 bg-[#1c2128] border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-gray-200">パスワード生成ツール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* パスワード長さの設定 */}
          <div className="space-y-2">
            <Label className="text-gray-300">パスワードの長さ: {passwordLength}</Label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="8"
                max="64"
                value={passwordLength}
                onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="8"
                max="64"
                value={passwordLength}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 8 && value <= 64) {
                    setPasswordLength(value);
                  }
                }}
                className="w-16 p-2 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200 text-center"
              />
            </div>
          </div>

          {/* 文字タイプの設定 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300" htmlFor="special-chars">特殊文字 (!@#$%^&*)</Label>
              <Switch
                id="special-chars"
                checked={includeSpecialChars}
                onCheckedChange={setIncludeSpecialChars}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300" htmlFor="uppercase">大文字 (A-Z)</Label>
              <Switch
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={setIncludeUppercase}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300" htmlFor="lowercase">小文字 (a-z)</Label>
              <Switch
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={setIncludeLowercase}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300" htmlFor="numbers">数字 (0-9)</Label>
              <Switch
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={setIncludeNumbers}
              />
            </div>
          </div>

          {/* パスワード生成ボタン */}
          <div className="flex justify-center">
            <Button
              onClick={handleGeneratePassword}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              パスワードを生成
            </Button>
          </div>

          {/* 生成されたパスワードの表示 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-gray-300">生成されたパスワード</Label>
              <Button
                onClick={handleCopy}
                disabled={!generatedPassword || generatedPassword === '生成されたパスワードがここに表示されます'}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
                  "border border-gray-600 text-white bg-[#21262d] hover:bg-[#30363d] min-w-[120px] h-9 px-4 py-2"
                )}
              >
                {copyButtonText}
              </Button>
            </div>
            <div className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200 min-h-[50px] flex items-center break-all">
              {generatedPassword || '生成されたパスワードがここに表示されます'}
            </div>
            
            {/* パスワード強度の表示 */}
            {passwordStrength && (
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-300">強度:</div>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${strengthColor}`} style={{ width: '100%' }}></div>
                </div>
                <div className="text-sm font-medium text-gray-300">{passwordStrength}</div>
              </div>
            )}
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="text-red-400">{error}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordGenerator;
