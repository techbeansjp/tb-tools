import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">TechBeans Tools</h1>
        <p className="text-gray-400">便利な開発ツールを集約したWebアプリケーション</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">プロジェクト進捗状況</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/tools/color-picker" className="block">
            <Card className="bg-[#161b22] border-gray-800 hover:bg-[#1c232d] transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-white">カラーピッカー</CardTitle>
                <CardDescription className="text-gray-400">実装完了</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>カラーホイール、カラースクエア、スライダーによる直感的な色選択</li>
                  <li>RGB、HSL、HEXなど複数の形式での色情報表示</li>
                  <li>カラーパレットによる色の保存と管理</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tools/json-formatter" className="block">
            <Card className="bg-[#161b22] border-gray-800 hover:bg-[#1c232d] transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-white">JSON整形・検証</CardTitle>
                <CardDescription className="text-gray-400">実装完了</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>JSONデータの整形と検証機能</li>
                  <li>インデントサイズの調整（2/4/8スペース）</li>
                  <li>整形されたJSONのコピー機能とフィードバック表示</li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card className="bg-[#161b22] border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white">実装予定のツール</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#21262d] rounded-lg">
                <p className="font-medium text-gray-200">エンコード/デコード</p>
              </div>
              <div className="p-4 bg-[#21262d] rounded-lg">
                <p className="font-medium text-gray-200">HTML整形</p>
              </div>
              <div className="p-4 bg-[#21262d] rounded-lg">
                <p className="font-medium text-gray-200">テキスト変換</p>
              </div>
              <div className="p-4 bg-[#21262d] rounded-lg">
                <p className="font-medium text-gray-200">正規表現テスト</p>
              </div>
              <div className="p-4 bg-[#21262d] rounded-lg">
                <p className="font-medium text-gray-200">文字数カウント</p>
              </div>
              <div className="p-4 bg-[#21262d] rounded-lg">
                <p className="font-medium text-gray-200">画像変換</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl text-white">今後の予定</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>既存ツールの機能拡張（カラーパレットの保存機能、JSONスキーマ検証機能など）</li>
              <li>開発環境の整備（Prettier等）</li>
              <li>テスト環境の構築</li>
              <li>CI/CDの設定</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
