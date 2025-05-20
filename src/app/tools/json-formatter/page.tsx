import Layout from '@/components/layout/Layout';
import { JsonFormatter } from '@/components/tools/json-formatter/JsonFormatter';

export default function JsonFormatterPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">JSON整形・検証</h1>
        <JsonFormatter />
      </div>
    </Layout>
  );
} 