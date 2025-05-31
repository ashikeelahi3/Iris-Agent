'use client';

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 via-indigo-600 to-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">Iris Analyze</span>
          </div>

          {/* Center Content */}
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🌸</span>
              <h1 className="text-2xl font-semibold text-white">Data Analysis Assistant</h1>
            </div>
            <div className="text-sm text-white/80 mt-0.5 font-medium">
              Local Analysis Mode • 150 Iris samples loaded
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-white hover:text-white/80 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-15 h-15"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}