
import Layout from '@/components/layout/Layout';
import { IpViewer } from '@/components/tools/ip-viewer/IpViewer';

export const metadata = {
  title: 'IPアドレス確認ツール | techbeans Tools',
  description: '現在のIPアドレスと関連情報を確認できるツールです。',
};

export default function IpViewerPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">IPアドレス確認ツール</h1>
        <IpViewer />
      </div>
    </Layout>
  );
}
