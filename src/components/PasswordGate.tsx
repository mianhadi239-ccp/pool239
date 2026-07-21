import React, { useState, useEffect } from 'react';
import images from '../assets';
import ccpLogo from '../assets/img/ccplogo.png';

interface PasswordGateProps {
  children: React.ReactNode;
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  // The password needed to access the website
  const CORRECT_PASSWORD = 'ccp2026';

  useEffect(() => {
    // Check if user is already authenticated in this session
    const authState = sessionStorage.getItem('ccp_auth');
    if (authState === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem('ccp_auth', 'true');
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
            <div className="mb-4">
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none text-base text-gray-800 bg-white focus:border-accent transition"
                required
              />
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
