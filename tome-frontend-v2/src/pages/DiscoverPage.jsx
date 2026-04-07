import React, { useEffect, useState } from 'react';
import { Loader2, ArrowUpRight, Flame, Star, BookOpen, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DiscoverPage() {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [mostDevoured, setMostDevoured] = useState([]);
  const [epicTomes, setEpicTomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHardcoverData = async () => {
      const trendingQuery = `query { books(order_by: {users_count: desc}, limit: 16) { id title description users_count image { url } contributions(limit: 1) { author { name } } } }`;
      const ratedQuery = `query { books(where: {users_count: {_gt: 1000}}, order_by: {rating: desc}, limit: 15) { id title image { url } contributions(limit: 1) { author { name } } } }`;
      const devouredQuery = `query { books(order_by: {users_read_count: desc}, limit: 15) { id title image { url } contributions(limit: 1) { author { name } } } }`;
      const epicQuery = `query { books(where: {pages: {_gt: 800}}, order_by: {users_count: desc}, limit: 15) { id title image { url } contributions(limit: 1) { author { name } } } }`;

      try {
        const [trendRes, rateRes, devourRes, epicRes] = await Promise.all([
          axios.post('https://tome-backend.vercel.app/api/hardcover', { query: trendingQuery }),
          axios.post('https://tome-backend.vercel.app/api/hardcover', { query: ratedQuery }),
          axios.post('https://tome-backend.vercel.app/api/hardcover', { query: devouredQuery }),
          axios.post('https://tome-backend.vercel.app/api/hardcover', { query: epicQuery })
        ]);

        // FIXED: Removed the extra .data typo here!
        setTrending(trendRes.data.books || []);
        setTopRated(rateRes.data.books || []);
        setMostDevoured(devourRes.data.books || []);
        setEpicTomes(epicRes.data.books || []);
      } catch (err) {
        console.error("Hardcover fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHardcoverData();
  }, []);

  const heroBook = trending.length > 0 ? trending[0] : null;
  const remainingTrending = trending.slice(1);

  const BookRow = ({ title, subtitle, icon: Icon, books }) => (
    <div className="flex flex-col mb-20">
      <div className="flex items-start gap-3 mb-8 px-6 md:px-10">
        <Icon size={36} className="text-pink-500 mt-2" strokeWidth={2.5} />
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-black leading-none">{title}</h2>
          <p className="text-2xl font-bold text-pink-500 mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-8 px-6 md:px-10 gap-6 custom-scrollbar snap-x">
        {books.map(book => (
          <div
            key={book.id}
            onClick={() => navigate(`/book/${book.id}`)}
            className="flex flex-col w-36 md:w-44 shrink-0 group cursor-pointer snap-start"
          >
            <div className="w-full aspect-[2/3] mb-4 border-[3px] border-black bg-white overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(236,72,153,1)] group-hover:-translate-y-1 transition-all rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
              {book.image?.url ? (
                <img src={book.image.url} alt={book.title} className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center text-black font-bold text-2xl p-4 text-center bg-white">No Cover</div>
              )}
            </div>
            <h3 className="font-bold text-2xl leading-tight mb-1 line-clamp-2 text-black group-hover:text-pink-500 transition-colors">{book.title}</h3>
            <p className="text-xl font-bold text-pink-500 line-clamp-1">
              {book.contributions?.[0]?.author?.name || 'Unknown'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) return <div className="flex justify-center items-center h-screen text-pink-500 bg-white"><Loader2 size={64} className="animate-spin" /></div>;

  return (
    <div className="max-w-[100vw] py-12 overflow-x-hidden bg-white min-h-screen font-['Caveat',_cursive]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`}</style>

      <div className="px-6 md:px-10 mb-12 flex justify-between items-end border-b-[3px] border-black pb-8 rounded-b-[255px_15px_225px_15px/15px_225px_15px_255px]">
        <div>
          <h1 className="text-6xl md:text-8xl font-bold text-black leading-none mb-2">Discover</h1>
          <p className="text-3xl font-bold text-pink-500">Hardcover Architecture</p>
        </div>
      </div>

      {heroBook && (
        <div className="px-6 md:px-10 mb-20 cursor-pointer group" onClick={() => navigate(`/book/${heroBook.id}`)}>
          <div className="border-[3px] border-black flex flex-col md:flex-row bg-white shadow-[8px_8px_0px_0px_rgba(236,72,153,1)] group-hover:shadow-[12px_12px_0px_0px_rgba(236,72,153,1)] transition-shadow duration-300 rounded-[255px_15px_225px_15px/15px_225px_15px_255px]">
            <div className="w-full md:w-1/3 aspect-[3/4] md:aspect-auto md:h-[450px] border-b-[3px] md:border-b-0 md:border-r-[3px] border-black overflow-hidden relative bg-white shrink-0 rounded-[255px_15px_225px_15px/15px_225px_15px_255px]">
              {heroBook.image?.url ? <img src={heroBook.image.url} alt={heroBook.title} className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" /> : null}
              <div className="absolute top-4 left-4 bg-pink-500 text-black text-xl font-bold px-4 py-2 border-[3px] border-black rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">#1 Trending</div>
            </div>
            <div className="flex flex-col p-8 md:p-12 justify-center flex-1 bg-white">
              <p className="text-3xl font-bold text-pink-500 mb-3">{heroBook.contributions?.[0]?.author?.name || 'Unknown Author'}</p>
              <h2 className="text-5xl md:text-6xl font-bold text-black leading-tight mb-6 group-hover:text-pink-500 transition-colors">{heroBook.title}</h2>
              <p className="text-2xl font-bold text-black leading-relaxed mb-8 line-clamp-4 max-w-xl">{heroBook.description || "No archival description available for this volume."}</p>
              <div className="flex items-center gap-6 mt-auto">
                <button className="bg-black text-white px-8 py-4 text-2xl font-bold border-[3px] border-black rounded-[15px_225px_15px_255px/255px_15px_225px_15px] group-hover:bg-pink-500 group-hover:text-black transition-colors flex items-center gap-2">
                  View Volume <ArrowUpRight size={24} strokeWidth={3} />
                </button>
                <div className="flex flex-col">
                  <span className="text-4xl font-bold text-black">{heroBook.users_count?.toLocaleString()}</span>
                  <span className="text-xl font-bold text-pink-500">Readers Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <BookRow title="The Global Zeitgeist" subtitle="Most tracked right now" icon={Flame} books={remainingTrending} />
      <BookRow title="Critically Acclaimed" subtitle="Highest community ratings" icon={Star} books={topRated} />
      <BookRow title="Most Devoured" subtitle="Most finished by the community" icon={BookOpen} books={mostDevoured} />
      <BookRow title="Epic Tomes" subtitle="Massive reads over 800 pages" icon={Shield} books={epicTomes} />
    </div>
  );
}