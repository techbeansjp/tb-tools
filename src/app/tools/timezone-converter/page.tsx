import Layout from '@/components/layout/Layout';
import { TimezoneConverter } from '@/components/tools/timezone-converter/TimezoneConverter';

export default function TimezoneConverterPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">タイムゾーン変換</h1>
        <TimezoneConverter />
      </div>
    </Layout>
  );
}