'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type * as monacoEditor from 'monaco-editor';

interface FormatOptions {
  indentSize: number;
  useTabs: boolean;
  sortKeys: boolean;
  compact: boolean;
}

interface JsonError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export const JsonFormatter: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [formattedJson, setFormattedJson] = useState<string>('');
  const [errors, setErrors] = useState<JsonError[]>([]);
  const [copyButtonText, setCopyButtonText] = useState<string>('コピー');
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    indentSize: 4,
    useTabs: false,
    sortKeys: false,
    compact: false,
  });

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      const sortedData = formatOptions.sortKeys 
        ? sortObjectKeys(parsed) 
        : parsed;

      let indentValue: string | number;
      if (formatOptions.compact) {
        indentValue = 0;
      } else if (formatOptions.useTabs) {
        indentValue = '\t';
      } else {
        indentValue = formatOptions.indentSize;
      }
      
      const formatted = JSON.stringify(
        sortedData,
        null,
        indentValue
      );
      
      setFormattedJson(formatted);
      setErrors([]);
    } catch (error) {
      if (error instanceof Error) {
        setErrors([{
          line: 0,
          column: 0,
          message: error.message,
          severity: 'error'
        }]);
      }
    }
  };
  
  const sortObjectKeys = (obj: unknown): unknown => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    }
    
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
        return result;
      }, {});
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopyButtonText('コピーしました！');
    setTimeout(() => {
      setCopyButtonText('コピー');
    }, 2000);
  };

  // Monaco EditorのonMountでテーマを再適用
  const handleEditorMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
    if (monaco) {
      monaco.editor.setTheme('vs-dark');
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="p-6 bg-[#1c2128] border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-200">入力</h2>
            <div className="border border-gray-700 rounded-lg overflow-hidden bg-[#1e1e1e]">
              <Editor
                height="400px"
                defaultLanguage="json"
                value={jsonInput}
                onChange={(value: string | undefined) => setJsonInput(value || '')}
                onMount={handleEditorMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  theme: 'vs-dark',
                  fixedOverflowWidgets: true,
                }}
              />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-200">出力</h2>
            <div className="border border-gray-700 rounded-lg overflow-hidden bg-[#1e1e1e]">
              <Editor
                height="400px"
                defaultLanguage="json"
                value={formattedJson}
                onMount={handleEditorMount}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  theme: 'vs-dark',
                  fixedOverflowWidgets: true,
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div className="bg-[#161b22] p-4 rounded-lg border border-gray-700">
            <h3 className="text-base font-medium text-gray-200 mb-4">フォーマットオプション</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <Label className="text-gray-300">インデントサイズ</Label>
                <Select
                  value={formatOptions.indentSize.toString()}
                  onValueChange={(value: string) => setFormatOptions(prev => ({ ...prev, indentSize: parseInt(value) }))}
                >
                  <SelectTrigger className="w-[120px] bg-[#21262d] border-gray-600 text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#21262d] border-gray-600">
                    <SelectItem value="4" className="text-gray-200 hover:bg-[#30363d]">4スペース</SelectItem>
                    <SelectItem value="2" className="text-gray-200 hover:bg-[#30363d]">2スペース</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Label className="text-gray-300 font-semibold">タブ使用</Label>
                <Switch
                  checked={formatOptions.useTabs}
                  onCheckedChange={(checked: boolean) => setFormatOptions(prev => ({ ...prev, useTabs: checked }))}
                  className="w-10 h-6 border border-gray-400 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-400 transition-colors duration-200"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Label className="text-gray-300 font-semibold">キーをソート</Label>
                <Switch
                  checked={formatOptions.sortKeys}
                  onCheckedChange={(checked: boolean) => setFormatOptions(prev => ({ ...prev, sortKeys: checked }))}
                  className="w-10 h-6 border border-gray-400 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-400 transition-colors duration-200"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Label className="text-gray-300 font-semibold">圧縮形式</Label>
                <Switch
                  checked={formatOptions.compact}
                  onCheckedChange={(checked: boolean) => setFormatOptions(prev => ({ ...prev, compact: checked }))}
                  className="w-10 h-6 border border-gray-400 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-400 transition-colors duration-200"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={formatJson}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              整形
            </Button>
            <Button 
              onClick={handleCopy}
              className="border-gray-600 text-white bg-[#21262d] hover:bg-[#30363d] min-w-[120px]"
            >
              {copyButtonText}
            </Button>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="text-red-400">
                {errors.map((error, index) => (
                  <div key={index}>{error.message}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};                                                                                    