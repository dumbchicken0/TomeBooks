import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Compass, Library } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react';

// Reordered to match Trakt's flow: Search, Home, Discover, Library
const NAV = [
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/', icon: Home, label: 'Home' },
  { to: '/discover', icon: Compass, label: 'Discover' },
  { to: '/shelves', icon: Library, label: 'Library' },
];

function NavLink({ to, icon: Icon, label }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      title={label}
      className={`p-4 transition-all m-2 ${active
        ? 'text-black bg-pink-500 rounded-[15px_225px_15px_255px/255px_15px_225px_15px] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1'
        : 'text-black hover:text-pink-500 hover:bg-pink-50 rounded-[255px_15px_225px_15px/15px_225px_15px_255px]'
        }`}
    >
      <Icon size={24} strokeWidth={active ? 3 : 2.5} />
    </Link>
  );
}

export default function Sidebar() {
  const { user } = useUser();
  return (
    <aside className="w-fit px-4 shrink-0 flex flex-col h-screen bg-white items-center py-8 justify-between z-10 font-['Caveat',_cursive]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`}</style>

      {/* TOP: Favicon */}
      <Link to="/" className="hover:-translate-y-1 transition-transform">
        <img src="/favicon.svg" alt="Tome" className="w-16 h-16 object-contain" />
      </Link>

      {/* MIDDLE: Sharp Floating Nav Group */}
      <nav className="flex flex-col items-center bg-white border-[3px] border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] py-2">
        {NAV.map(link => <NavLink key={link.to} {...link} />)}
      </nav>

      {/* BOTTOM: Profile Avatar */}
      <div className="flex flex-col items-center">
        <SignedIn>
          <Link to="/profile" className="w-14 h-14 overflow-hidden border-[3px] border-black rounded-[15px_225px_15px_255px/255px_15px_225px_15px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] hover:-translate-y-1 transition-all">
            <img src={user?.imageUrl} alt="Profile" className="w-full h-full object-cover grayscale-[10%]" />
          </Link>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="w-12 h-12 bg-white text-black flex items-center justify-center font-bold text-2xl uppercase border-[3px] border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-pink-500 hover:-translate-y-1 transition-all"
              title="Sign In"
            >
              In
            </button>
          </SignInButton>
        </SignedOut>
      </div>

    </aside>
  );
}