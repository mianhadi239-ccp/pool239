import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import images from '../assets';
import { ccpLogo } from '../assets';
import { generateJWT, verifyJWT, getAdminJWT, setAdminJWT, removeAdminJWT } from '../lib/jwt';

interface AdminPasswordGateProps {
  children: React.ReactNode;
}

export default function AdminPasswordGate({ children }: AdminPasswordGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  // Admin portal access password
  const ADMIN_PASSWORD = 'admin239$';

  useEffect(() => {
    const checkToken = async () => {
      const token = getAdminJWT();
      if (token) {
        const payload = await verifyJWT(token);
        if (payload && payload.role === 'admin') {
          setIsAuthenticated(true);
        } else {
          removeAdminJWT();
        }
      }
    };
    checkToken();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === ADMIN_PASSWORD.trim()) {
      // Generate a signed JWT token valid for 24 hours
      const jwtToken = await generateJWT('admin_user', 'admin', 24);
      setAdminJWT(jwtToken);
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect admin password. Access denied.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    removeAdminJWT();
    setIsAuthenticated(false);
    setPassword('');
  };

  if (isAuthenticated) {
    return (
      <>
        {/* Pass logout capability or render children */}
        {React.cloneElement(children as React.ReactElement, { onLogout: handleLogout })}
      </>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center font-secondary relative px-4 py-12"
      style={{ backgroundImage: `url(${images.Slider1})` }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
        <div className="flex flex-col items-center text-center">
          
          <img src={ccpLogo} alt="CCP Logo" className="w-[170px] h-auto mb-6" />

          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-tertiary tracking-widest uppercase px-3.5 py-1.5 rounded-full font-bold mb-4">
            <span>🔒</span> Restricted Admin Access
          </div>

          <h2 className="font-primary text-2xl uppercase tracking-[1.5px] text-primary mb-2">
            Administrator Authentication
          </h2>
          <p className="text-sm text-gray-600 mb-6 font-medium">
            Please enter your secret administrator password to manage pool booking requests.
          </p>

          <form onSubmit={handleLogin} className="w-full">
            <div className="mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-gray-300 outline-none text-base text-gray-900 bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-accent transition focus:outline-none"
                title={showPassword ? "Hide Password" : "Show Password"}
                aria-label={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.018 10.018 0 013.682-.763c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg animate-pulse">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-primary hover:bg-accent text-white font-tertiary text-base uppercase tracking-[2px] rounded-xl font-semibold shadow-lg hover:shadow-accent/30 transition transform active:scale-98"
            >
              Unlock Admin Panel
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 w-full">
            <Link
              to="/"
              className="text-xs text-gray-500 hover:text-accent font-tertiary tracking-widest uppercase transition inline-flex items-center gap-1"
            >
              ← Back to Main Site
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
