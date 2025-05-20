import Layout from '@/components/layout/Layout';
import { PasswordGenerator } from '@/components/tools/password-generator/PasswordGenerator';

export const metadata = {
  title: 'パスワード生成ツール | TechBeans Tools',
  description: '安全なパスワードを簡単に生成できるツールです。文字数や使用する文字種を設定できます。',
};

export default function PasswordGeneratorPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">パスワード生成ツール</h1>
        <PasswordGenerator />
      </div>
    </Layout>
  );
}