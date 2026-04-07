import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

export default function Header() {
  return (
    <header className="w-full h-24 shrink-0 flex items-center justify-center px-12 relative z-20 bg-white">
      <img 
        src="/logo.svg" 
        alt="TomeBooks Logo" 
        className="h-20 object-contain" 
      />
      <div className="absolute right-12">
        
        {/* What users see when they are NOT logged in */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors border border-black">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        {/* What users see when they ARE logged in */}
        <SignedIn>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Welcome back</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>

      </div>
    </header>
  );
}