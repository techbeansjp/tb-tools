import Layout from '@/components/layout/Layout';
import { ImageConverter } from '@/components/tools/image-converter/ImageConverter';

export const metadata = {
  title: '画像変換ツール | TechBeans Tools',
  description: '画像とbase64を相互変換できるツールです。画像をbase64に変換したり、base64から画像を復元できます。',
};

export default function ImageConverterPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">画像変換ツール</h1>
        <ImageConverter />
      </div>
    </Layout>
  );
}