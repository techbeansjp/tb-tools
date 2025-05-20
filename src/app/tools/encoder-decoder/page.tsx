import Layout from '@/components/layout/Layout';
import { EncoderDecoder } from '@/components/tools/encoder-decoder/EncoderDecoder';

export default function EncoderDecoderPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">エンコード/デコード</h1>
        <EncoderDecoder />
      </div>
    </Layout>
  );
}