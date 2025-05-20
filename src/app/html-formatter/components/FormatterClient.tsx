'use client';

import { useState, useRef } from 'react';
import html from 'js-beautify/js/lib/beautify-html';

export default function FormatterClient() {
  const [inputHtml, setInputHtml] = useState('');
  const [outputHtml, setOutputHtml] = useState('');
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const formatHtml = () => {
    try {
      const formatted = html.html_beautify(inputHtml, {
        indent_size: 2,
        wrap_line_length: 0,
        preserve_newlines: true,
        max_preserve_newlines: 2,
        end_with_newline: true,
      });
      setOutputHtml(formatted);
    } catch (error) {
      console.error('HTML formatting error:', error);
      setOutputHtml('エラー: HTMLの整形に失敗しました。');
    }
  };

  const copyToClipboard = () => {
    if (outputRef.current) {
      outputRef.current.select();
      document.execCommand('copy');
      alert('クリップボードにコピーしました！');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">入力</h2>
          <textarea 
            value={inputHtml}
            onChange={(e) => setInputHtml(e.target.value)}
            className="w-full h-96 p-4 font-[family-name:var(--font-geist-mono)] border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm"
            placeholder="ここにHTMLを貼り付けてください..."
          ></textarea>
        </div>
        
        <div className="flex flex-col justify-center items-center py-4">
          <button 
            onClick={formatHtml}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            整形する →
          </button>
        </div>
        
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">結果</h2>
          <textarea 
            ref={outputRef}
            value={outputHtml}
            className="w-full h-96 p-4 font-[family-name:var(--font-geist-mono)] border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm"
            placeholder="整形されたHTMLが表示されます..."
            readOnly
          ></textarea>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={copyToClipboard}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          結果をコピー
        </button>
      </div>
    </div>
  );
}
