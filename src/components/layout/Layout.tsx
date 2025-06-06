import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 flex flex-col">
      <Header />
      <div className="flex flex-1 relative">
        <div className="sticky top-0 h-[calc(100vh-64px)]">
          <Sidebar />
        </div>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;  