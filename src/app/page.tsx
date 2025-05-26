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
        <h2 className="text-2xl font-semibold mb-6">実装完了ツール</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/tools/color-picker" className="block">
            <Card className="bg-[#161b22] border-gray-800 hover:bg-[#1c232d] transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-white">カラーピッカー</CardTitle>
                <CardDescription className="text-green-400">実装完了</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
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
                <CardDescription className="text-green-400">実装完了</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                  <li>JSONデータの整形と検証機能</li>
                  <li>インデントサイズの調整（2/4/8スペース）</li>
                  <li>整形されたJSONのコピー機能とフィードバック表示</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tools/html-formatter" className="block">
            <Card className="bg-[#161b22] border-gray-800 hover:bg-[#1c232d] transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-white">HTML整形</CardTitle>
                <CardDescription className="text-green-400">実装完了</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                  <li>HTMLソースの整形機能</li>
                  <li>インデントの自動調整</li>
                  <li>整形されたHTMLのコピー機能</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tools/encoder-decoder" className="block">
            <Card className="bg-[#161b22] border-gray-800 hover:bg-[#1c232d] transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-white">エンコード/デコード</CardTitle>
                <CardDescription className="text-green-400">実装完了</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                  <li>Base64、URL、HTMLエンティティ、JSON形式に対応</li>
                  <li>エンコード・デコード双方向変換</li>
                  <li>エラーハンドリングとコピー機能</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tools/hash-generator" className="block">
            <Card className="bg-[#161b22] border-gray-800 hover:bg-[#1c232d] transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-white">ハッシュ生成</CardTitle>
                <CardDescription className="text-green-400">実装完了</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                  <li>MD5、SHA-1、SHA-256、SHA-512ハッシュ生成</li>
                  <li>リアルタイム計算とコピー機能</li>
                  <li>セキュアなハッシュアルゴリズム実装</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tools/password-generator" className="block">
            <Card className="bg-[#161b22] border-gray-800 hover:bg-[#1c232d] transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-white">パスワード生成</CardTitle>
                <CardDescription className="text-green-400">実装完了</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                  <li>カスタマイズ可能な文字種と長さ設定</li>
                  <li>パスワード強度の自動評価</li>
                  <li>セキュアな乱数生成とコピー機能</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tools/image-converter" className="block">
            <Card className="bg-[#161b22] border-gray-800 hover:bg-[#1c232d] transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-white">画像変換</CardTitle>
                <CardDescription className="text-green-400">実装完了</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                  <li>画像ファイルとBase64の相互変換</li>
                  <li>ドラッグ&ドロップ対応とプレビュー機能</li>
                  <li>ファイルサイズ制限とエラーハンドリング</li>
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
                <p className="font-medium text-gray-200">テキスト変換</p>
                <p className="text-sm text-gray-400 mt-1">大文字/小文字変換、文字数カウント</p>
              </div>
              <div className="p-4 bg-[#21262d] rounded-lg">
                <p className="font-medium text-gray-200">正規表現テスト</p>
                <p className="text-sm text-gray-400 mt-1">パターンマッチングとテスト機能</p>
              </div>
              <div className="p-4 bg-[#21262d] rounded-lg">
                <p className="font-medium text-gray-200">QRコード生成</p>
                <p className="text-sm text-gray-400 mt-1">テキストからQRコード生成</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl text-white">プロジェクト統計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">7</div>
                <div className="text-sm text-gray-400">実装完了ツール</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">3</div>
                <div className="text-sm text-gray-400">実装予定ツール</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">70%</div>
                <div className="text-sm text-gray-400">完成度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">Next.js</div>
                <div className="text-sm text-gray-400">フレームワーク</div>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-lg font-medium text-white mb-3">今後の予定</h4>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>残りツールの実装（テキスト変換、正規表現テスト、QRコード生成）</li>
                <li>既存ツールの機能拡張（カラーパレットの永続化、JSONスキーマ検証など）</li>
                <li>レスポンシブデザインの最適化</li>
                <li>テスト環境の構築とCI/CD設定</li>
                <li>パフォーマンス最適化とSEO対応</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
