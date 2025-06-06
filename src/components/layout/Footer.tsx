import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#161b22] border-t border-gray-800 mt-auto">
      <div className="w-full px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-sm">
            © {currentYear} techbeans. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <Link 
              href="https://techbeans.co.jp/company/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              運営会社
            </Link>
            <Link 
              href="https://github.com/techbeansjp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;