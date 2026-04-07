import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t-[3px] border-black py-10 px-6 md:px-10 bg-white flex flex-col md:flex-row items-center justify-between gap-8 mt-auto z-10 font-['Caveat',_cursive]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`}</style>

      {/* Left: Clean SVG Logo */}
      <div className="flex items-center">
        <img
          src="/logo.svg"
          alt="TomeBooks"
          className="h-16 md:h-25 object-contain"
        />
      </div>

      {/* Middle: Links */}
      <div className="flex gap-8 text-2xl font-bold text-black border-[3px] border-black px-6 py-2 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <span className="hover:text-pink-500 cursor-pointer transition-colors">Forums</span>
        <span className="hover:text-pink-500 cursor-pointer transition-colors">About</span>
        <span className="hover:text-pink-500 cursor-pointer transition-colors">Privacy</span>
      </div>

      {/* Right: Credits */}
      <div className="text-2xl font-bold text-pink-500 text-center md:text-right bg-white px-4 py-2 border-[3px] border-transparent hover:border-black rounded-[15px_225px_15px_255px/255px_15px_225px_15px] transition-all">
        Powered by <span className="text-black">Hardcover</span> & <span className="text-black">Open Library</span><br />
        Built for the modern reader.
      </div>

    </footer>
  );
}