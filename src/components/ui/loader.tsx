'use client';

import React from 'react';

interface LoaderProps {
  isVisible: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 transition-opacity duration-200">
      <div className="bg-[#161b22] border border-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
        {/* スピナー */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        
        {/* ローディングテキスト */}
        <div className="text-center">
          <p className="text-white font-medium">読み込み中...</p>
          <p className="text-gray-400 text-sm mt-1">しばらくお待ちください</p>
        </div>
        
        {/* プログレスバー */}
        <div className="w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;