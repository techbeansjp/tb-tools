import Layout from '@/components/layout/Layout';
import ColorPicker from '@/components/tools/color-picker/ColorPicker';

export default function ColorPickerPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">カラーピッカー</h1>
        <ColorPicker />
      </div>
    </Layout>
  );
} 