import Layout from '@/components/layout/Layout';
import { MermaidEditor } from '@/components/tools/mermaid-editor/MermaidEditor';

export default function MermaidEditorPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mermaidエディタ</h1>
        <MermaidEditor />
      </div>
    </Layout>
  );
}
