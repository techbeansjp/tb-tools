'use client';

import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-[#161b22] border-b border-gray-800">
      <div className="w-full px-4 py-4">
        <Link href="/" className="text-xl font-bold text-gray-200">
          TechBeans Tools
        </Link>
      </div>
    </header>
  );
};

export default Header; 