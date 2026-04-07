import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sparkles, Library, Search, User } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

export default function BottomNav() {
  const { user } = useUser();

  const navItems = [
    { path: '/', icon: Home },
    { path: '/discover', icon: Sparkles },
    { path: '/shelves', icon: Library },
    { path: '/search', icon: Search },
    { path: '/profile', icon: User, isAvatar: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t-[3px] border-black z-50 flex justify-around items-center h-20 px-2 rounded-t-[15px_225px_15px_5px/25px_15px_5px_15px] shadow-[0px_-4px_0px_0px_rgba(236,72,153,1)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `p-3 m-1 transition-all duration-200 flex flex-col items-center justify-center ${isActive ? 'text-black bg-pink-500 rounded-[15px_225px_15px_255px/255px_15px_225px_15px] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-2' : 'text-black hover:text-pink-500 hover:bg-pink-50 rounded-[255px_15px_225px_15px/15px_225px_15px_255px]'
            }`
          }
        >
          {item.isAvatar && user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="Profile"
              className="w-8 h-8 rounded-[15px_225px_15px_255px/255px_15px_225px_15px] border-[3px] border-current object-cover grayscale-[10%]"
            />
          ) : (
            <item.icon size={26} strokeWidth={3} />
          )}
        </NavLink>
      ))}
    </nav>
  );
}