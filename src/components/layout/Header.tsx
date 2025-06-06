'use client';

import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="bg-[#161b22] border-b border-gray-800">
      <div className="w-full px-4 py-4">
        <Link href="/">
          <Image 
            src="/logo.png" 
            alt="techbeans Logo" 
            width={150} 
            height={40}
            className="object-contain"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header; 