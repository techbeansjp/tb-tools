'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { ComingSoonModal } from '@/components/ui/coming-soon-modal';

const Sidebar = () => {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>('');

  const menuItems = useMemo(() => ({
    '開発支援ツール': [
      { name: 'カラーピッカー', href: '/tools/color-picker' },
      { name: 'JSON整形・検証', href: '/tools/json-formatter' },
      { name: 'エンコード/デコード', href: '/tools/encoder-decoder' },
      { name: 'HTML整形', href: '/tools/html-formatter' },
      { name: 'Mermaidエディタ', href: '/tools/mermaid-editor' }
    ],
    'テキスト処理ツール': [
      { name: 'テキスト変換', href: '#' },
      { name: '正規表現テスト', href: '#' },
      { name: '文字数カウント', href: '#' }
    ],
    '画像処理ツール': [
      { name: '画像変換', href: '/tools/image-converter' },
      { name: 'QRコード生成', href: '/tools/qr-generator' }
    ],
    '時間・日付ツール': [
      { name: 'タイムゾーン変換', href: '/tools/timezone-converter' },
      { name: 'タイムスタンプ変換', href: '/tools/timestamp-converter' }
    ],
    'セキュリティツール': [
      { name: 'パスワード生成', href: '/tools/password-generator' },
      { name: 'ハッシュ生成', href: '/tools/hash-generator' }
    ],
    'ネットワークツール': [
      { name: 'IP確認', href: '/tools/ip-viewer' },
      { name: 'クエリパラメータ解析', href: '#' }
    ]
  }), []);

  // 現在のパスに基づいて対応するカテゴリを自動的に開く
  useEffect(() => {
    if (pathname) {
      for (const [category, items] of Object.entries(menuItems)) {
        if (items.some(item => item.href === pathname)) {
          setActiveMenu(category);
          break;
        }
      }
    }
  }, [pathname, menuItems]);

  const handleItemClick = (e: React.MouseEvent, item: { name: string; href: string }) => {
    if (item.href === '#') {
      e.preventDefault();
      setSelectedFeature(item.name);
      setShowComingSoon(true);
    }
  };

  return (
    <>
      <aside className="w-64 bg-[#161b22] border-r border-gray-800 h-full overflow-y-auto">
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="block px-4 py-2 text-gray-300 hover:bg-[#21262d] hover:text-white rounded-md"
              >
                ダッシュボード
              </Link>
            </li>
            {Object.entries(menuItems).map(([category, items]) => (
              <li key={category}>
                <button
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#21262d] hover:text-white rounded-md flex items-center justify-between"
                  onClick={() => setActiveMenu(activeMenu === category ? null : category)}
                  aria-expanded={activeMenu === category}
                  aria-controls={`menu-${category}`}
                >
                  <span>{category}</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      activeMenu === category ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {activeMenu === category && (
                  <ul id={`menu-${category}`} className="mt-2 ml-4 space-y-1">
                    {items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            onClick={(e) => handleItemClick(e, item)}
                            className={`block px-4 py-2 text-sm rounded-md ${
                              isActive
                                ? 'bg-[#2d333b] text-white font-medium'
                                : 'text-gray-400 hover:bg-[#21262d] hover:text-white'
                            }`}
                          >
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        featureName={selectedFeature}
      />
    </>
  );
};

export default Sidebar;                                                                                                                                                                                                                                                                                                                                                                                                