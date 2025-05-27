'use client';

import LoadingLink from '@/components/ui/loading-link';

const Header = () => {
  return (
    <header className="bg-[#161b22] border-b border-gray-800">
      <div className="w-full px-4 py-4">
        <LoadingLink href="/" className="text-xl font-bold text-gray-200">
          TechBeans Tools
        </LoadingLink>
      </div>
    </header>
  );
};

export default Header;