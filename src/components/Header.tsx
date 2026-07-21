import { Link } from 'react-router-dom';
import ccpLogo from '../assets/img/ccplogo.png';

/**
 * Transparent header overlaying the hero section with logo and nav.
 */
export default function Header() {
  const navLinks = ['Home'];

  return (
    <header className="w-full min-h-[60px] py-6 bg-transparent absolute top-0 left-0 z-50">
      <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row items-center lg:justify-between gap-y-6 lg:gap-y-0 h-full">
        <Link to="/" className="block w-[160px] shrink-0" aria-label="Home">
          <img
            src={ccpLogo}
            alt="CCP Logo"
            className="w-[160px] h-auto block"
          />
        </Link>
        <nav className="text-white flex gap-x-4 lg:gap-x-8 font-tertiary tracking-[3px] text-[15px] items-center uppercase">
          {navLinks.map((link) => (
            <Link to="/" className="transition hover:text-accent" key={link}>
              {link}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
