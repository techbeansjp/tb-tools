import Layout from '@/components/layout/Layout';
import { TimestampConverter } from '@/components/tools/timestamp-converter/TimestampConverter';

export default function TimestampConverterPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">タイムスタンプ変換</h1>
        <TimestampConverter />
      </div>
    </Layout>
  );
}