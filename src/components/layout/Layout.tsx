'use client';

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { LoadingProvider, useLoading } from '@/contexts/LoadingContext';
import Loader from '@/components/ui/loader';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutContent = ({ children }: LayoutProps) => {
  const { isLoading } = useLoading();

  return (
    <>
      <div className="min-h-screen bg-[#0d1117] text-gray-200">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
      <Loader isVisible={isLoading} />
    </>
  );
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <LoadingProvider>
      <LayoutContent>{children}</LayoutContent>
    </LoadingProvider>
  );
};

export default Layout;