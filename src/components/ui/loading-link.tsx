'use client';

import React from 'react';
import Link from 'next/link';
import { useLoading } from '@/contexts/LoadingContext';

interface LoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const LoadingLink: React.FC<LoadingLinkProps> = ({ 
  href, 
  children, 
  className,
  onClick 
}) => {
  const { setIsLoading } = useLoading();

  const handleClick = (e: React.MouseEvent) => {
    // 外部リンクや無効なリンクの場合はローディングを表示しない
    if (href === '#' || href.startsWith('http')) {
      if (onClick) onClick();
      return;
    }

    // 現在のパスと同じ場合はローディングを表示しない
    if (typeof window !== 'undefined' && window.location.pathname === href) {
      e.preventDefault();
      if (onClick) onClick();
      return;
    }

    // ローディング開始
    setIsLoading(true);
    
    // カスタムonClickがある場合は実行
    if (onClick) onClick();
  };

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

export default LoadingLink;