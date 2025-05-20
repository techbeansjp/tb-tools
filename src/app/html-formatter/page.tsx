import Link from 'next/link';
import FormatterClient from './components/FormatterClient';

export default function HtmlFormatter() {
  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">HTML整形ツール</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">HTMLソースを貼り付けて整形ボタンをクリックすると、インデントをきれいに整形します。</p>
        <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          ← ホームに戻る
        </Link>
      </header>

      <FormatterClient />
    </div>
  );
}
