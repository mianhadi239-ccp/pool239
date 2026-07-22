import React, { useState, useEffect } from 'react';
import images from '../assets';
import ccpLogo from '../assets/img/ccplogo.png';
import { generateJWT, verifyJWT, getUserJWT, setUserJWT } from '../lib/jwt';

interface PasswordGateProps {
  children: React.ReactNode;
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  // The password needed to access the website
  const CORRECT_PASSWORD = 'ccp2026';

  useEffect(() => {
    // Check if valid signed JWT token exists in session
    const checkToken = async () => {
      const token = getUserJWT();
      if (token) {
        const payload = await verifyJWT(token);
        if (payload && payload.role === 'user') {
          setIsAuthenticated(true);
        }
      }
    };
    checkToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === CORRECT_PASSWORD.trim()) {
      // Generate a signed JWT token valid for 24 hours
      const jwtToken = await generateJWT('user', 'user', 24);
      setUserJWT(jwtToken);
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-cover bg-center font-secondary"
      style={{ backgroundImage: `url(${images.Slider1})` }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 mx-4">
        <div className="flex flex-col items-center text-center">
          <img src={ccpLogo} alt="Logo" className="w-[180px] h-auto mb-6" />
          <h2 className="font-primary text-2xl uppercase tracking-[1px] text-primary mb-2">
            Private Portal Access
          </h2>
          <p className="text-sm text-gray-500 mb-6 font-medium">
            Please enter your access password to view the booking system.
          </p>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-200 outline-none text-base text-gray-800 bg-white focus:border-accent transition"
                required
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
              <p className="text-red-600 text-sm font-semibold mb-4 animate-pulse">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-primary text-white font-tertiary text-lg uppercase tracking-[2px] rounded-lg font-semibold hover:bg-accent transition"
            >
              Access Portal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
