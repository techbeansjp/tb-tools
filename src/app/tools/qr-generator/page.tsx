import QrGenerator from '@/components/tools/qr-generator/QrGenerator';

export const metadata = {
  title: 'QRコード生成 | TB Tools',
  description: 'URLやテキストからQRコードを生成し、PNG形式でダウンロードできるツールです。',
};

export default function QrGeneratorPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="pt-8 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">QRコード生成</h1>
            <p className="text-gray-400">URLやテキストからQRコードを生成し、PNG形式でダウンロードできます</p>
          </div>
          <QrGenerator />
        </div>
      </div>
    </div>
  );
}