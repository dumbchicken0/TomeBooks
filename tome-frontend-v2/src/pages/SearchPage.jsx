import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Loader2, X } from 'lucide-react';
import BookCard from '../components/BookCard';

// Wide editorial banners ready for background images later
const GENRES = [
  { name: 'Romance', color: 'bg-pink-500', textColor: 'text-black', label: 'ROMANTASY & LOVE' },
  { name: 'Fantasy', color: 'bg-white', textColor: 'text-black', label: 'DRAGONS & MAGIC' },
  { name: 'Mystery', color: 'bg-black', textColor: 'text-white', label: 'THRILLERS & CRIME' },
  { name: 'Sci-Fi', color: 'bg-pink-500', textColor: 'text-white', label: 'SPACE & FUTURE' },
  { name: 'Classics', color: 'bg-white', textColor: 'text-pink-500', label: 'TIMELESS LITERATURE' },
  { name: 'Non-Fiction', color: 'bg-black', textColor: 'text-pink-500', label: 'HISTORY & BIOGRAPHY' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeGenre, setActiveGenre] = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) executeSearch(q, false);
  }, []);

  const executeSearch = async (searchTerm, isGenre = false) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    if (!isGenre) setActiveGenre('');

    setSearchParams({ q: searchTerm });

    try {
      const url = isGenre
        ? `https://openlibrary.org/search.json?subject=${encodeURIComponent(searchTerm.toLowerCase())}&limit=20`
        : `https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}&limit=20`;

      const res = await fetch(url);
      const data = await res.json();

      const formattedBooks = (data.docs || []).map(item => {
        const coverUrl = item.cover_i
          ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg?default=false` : '';
        const workId = item.key ? item.key.replace('/works/', '') : '';

        return {
          id: workId,
          title: item.title,
          author: item.author_name ? item.author_name.join(', ') : 'Unknown Author',
          coverUrl: coverUrl,
          year: item.first_publish_year ? item.first_publish_year.toString() : ''
        };
      });

      setResults(formattedBooks.filter(b => b.id));
    } catch (err) {
      console.error("Open Library Search Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSearch = (e) => {
    e.preventDefault();
    executeSearch(query, false);
  };

  const handleGenreClick = (genreName) => {
    setQuery(genreName);
    setActiveGenre(genreName);
    executeSearch(genreName, true);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setActiveGenre('');
    setSearchParams({});
  };

  return (
    <div className="max-w-[100vw] py-12 overflow-x-hidden bg-white min-h-screen font-['Caveat',_cursive]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`}</style>
      
      <div className="px-6 md:px-10 mb-16">
        <h1 className="text-6xl md:text-8xl font-bold text-black leading-none mb-8">Search</h1>

        <form
          onSubmit={handleTextSearch}
          className="w-full flex items-center border-[3px] border-black bg-white focus-within:shadow-[8px_8px_0px_0px_rgba(236,72,153,1)] transition-all rounded-[255px_15px_225px_15px/15px_225px_15px_255px]"
        >
          <div className="px-6 text-black">
            <SearchIcon size={32} strokeWidth={3} />
          </div>
          <input
            type="text"
            placeholder="Search volumes, authors..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent py-4 md:py-6 text-2xl md:text-4xl font-bold text-black focus:outline-none placeholder:text-pink-300"
          />
          {query && (
            <button type="button" onClick={clearSearch} className="px-6 text-pink-500 hover:text-black transition-colors">
              <X size={32} strokeWidth={3} />
            </button>
          )}
        </form>
      </div>

      {/* State 1: Wide Genre Banners */}
      {!hasSearched && !isLoading && (
        <div className="px-6 md:px-10">
          <h3 className="text-2xl font-bold text-pink-500 mb-6 border-b-[3px] border-black pb-2">Browse the Archives</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GENRES.map((genre) => (
              <button
                key={genre.name}
                onClick={() => handleGenreClick(genre.name)}
                className={`w-full h-32 md:h-40 flex flex-col justify-center px-8 text-left border-[3px] border-black ${genre.color} hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group relative overflow-hidden rounded-[15px_225px_15px_255px/255px_15px_225px_15px]`}
              >
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-black to-transparent pointer-events-none"></div>
                <span className={`text-xl font-bold mb-1 relative z-10 ${genre.textColor === 'text-white' ? 'text-pink-300' : 'text-pink-800'}`}>{genre.label}</span>
                <h2 className={`text-5xl md:text-6xl font-bold ${genre.textColor} leading-none relative z-10 group-hover:translate-x-2 transition-transform`}>
                  {genre.name}
                </h2>
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-32 text-pink-500">
          <Loader2 size={64} className="animate-spin mb-4" />
          <p className="text-3xl font-bold text-black">Searching the global index...</p>
        </div>
      )}

      {/* State 3: Search Results using the new BookCard */}
      {!isLoading && hasSearched && results.length > 0 && (
        <div className="px-6 md:px-10">
          <div className="flex items-end justify-between border-b-[3px] border-black pb-4 mb-8">
            <h3 className="text-4xl md:text-5xl font-bold text-black leading-none">
              {activeGenre ? `${activeGenre} Archives` : 'Results'}
            </h3>
            <span className="text-2xl font-bold text-pink-500">{results.length} Volumes</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {results.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                coverUrl={book.coverUrl}
                year={book.year}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && hasSearched && results.length === 0 && (
        <div className="py-32 text-center px-10">
          <p className="font-bold text-5xl text-black mb-4">No volumes found.</p>
          <p className="text-2xl font-bold text-pink-500">Try adjusting your search query.</p>
        </div>
      )}

    </div>
  );
}