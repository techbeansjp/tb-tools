import Layout from '@/components/layout/Layout';
import { ImageConverter } from '@/components/tools/image-converter/ImageConverter';

export default function ImageConverterPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">画像変換</h1>
        <ImageConverter />
      </div>
    </Layout>
  );
}