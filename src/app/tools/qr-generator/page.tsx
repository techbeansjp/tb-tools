import Layout from '@/components/layout/Layout';
import { QrGenerator } from '@/components/tools/qr-generator/QrGenerator';

export const metadata = {
  title: 'QRコード生成ツール | TechBeans Tools',
  description: 'URLやテキストからQRコードを生成し、PNG形式でダウンロードできるツールです。複数のサイズに対応しています。',
};

export default function QrGeneratorPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">QRコード生成ツール</h1>
        <QrGenerator />
      </div>
    </Layout>
  );
}