import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BookCard({ id, title, author, coverUrl, year }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/book/${id}`)}
      className="flex flex-col group cursor-pointer w-full font-['Caveat',_cursive]"
    >
      {/* The pt-[150%] trick locks the aspect ratio to exactly 2:3, making it impossible for images to explode */}
      <div className="relative w-full pt-[150%] mb-4 border-[3px] border-black bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[8px_8px_0px_0px_rgba(236,72,153,1)] group-hover:-translate-y-1 transition-all rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
            className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
          />
        ) : null}
        <div style={{ display: coverUrl ? 'none' : 'flex' }} className="absolute inset-0 w-full h-full items-center justify-center text-black font-bold text-2xl p-4 text-center bg-white">
          No Cover
        </div>
      </div>

      <h3 className="font-bold text-2xl leading-tight mb-1 line-clamp-2 text-black group-hover:text-pink-500 transition-colors">
        {title}
      </h3>
      <p className="text-xl font-bold text-pink-500 line-clamp-1">
        {author} {year && `• ${year}`}
      </p>
    </div>
  );
}