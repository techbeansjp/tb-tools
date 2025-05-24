import Layout from '@/components/layout/Layout';
import { ImageConverter } from '@/components/tools/image-converter/ImageConverter';

/**
 * Renders the image converter page with a layout, heading, and the image conversion interface.
 *
 * Displays a centered container with a heading labeled "画像変換" (Image Conversion) and the {@link ImageConverter} component for performing image conversion tasks.
 */
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