import Layout from '@/components/layout/Layout';
import { TimestampConverter } from '@/components/tools/timestamp-converter/TimestampConverter';

export const metadata = {
  title: 'タイムスタンプ変換ツール | techbeans Tools',
  description: 'タイムスタンプと日時の相互変換ができるツールです。JST（日本標準時）に対応しています。',
};

export default function TimestampConverterPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">タイムスタンプ変換ツール</h1>
        <TimestampConverter />
      </div>
    </Layout>
  );
}