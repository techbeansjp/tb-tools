import Layout from '@/components/layout/Layout';
import { HashGenerator } from '@/components/tools/hash-generator/HashGenerator';

export default function HashGeneratorPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ハッシュ生成</h1>
        <HashGenerator />
      </div>
    </Layout>
  );
}
