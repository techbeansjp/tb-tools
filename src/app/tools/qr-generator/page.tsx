import Layout from '@/components/layout/Layout';
import { QrGenerator } from '@/components/tools/qr-generator/QrGenerator';

export default function QrGeneratorPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">QRコード生成</h1>
        <QrGenerator />
      </div>
    </Layout>
  );
}