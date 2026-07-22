import { Link } from 'react-router-dom';
import ccpLogo from '../assets/img/ccplogo.png';

/**
 * Site footer: dark background (bg-primary), logo link to home, dynamic year in copyright.
 * Layout: stacked on small screens, row with space-between on sm+.
 */
export default function Footer() {
  return (
    <footer className="bg-primary py-12">
      <div className="container mx-auto max-w-7xl text-white flex items-center gap-5 sm:justify-between flex-col sm:flex-row px-4">
        <Link to="/">
          <img src={ccpLogo} alt="CCP Logo" className="h-10 w-auto" />
        </Link>
        <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()}. All Rights Reserved.</p>
          <span className="hidden sm:inline text-gray-600">•</span>
          <Link
            to="/admin"
            className="text-xs text-gray-500 hover:text-amber-400 transition flex items-center gap-1 font-tertiary tracking-widest uppercase"
          >
            <span>🔒</span> Admin Access
          </Link>
        </div>
      </div>
    </footer>
  );
}
