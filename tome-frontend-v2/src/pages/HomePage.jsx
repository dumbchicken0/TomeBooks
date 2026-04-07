import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, BookmarkCheck, Loader2, ArrowRight, Play, Library, Layers, Archive } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import BookCard from '../components/BookCard';

export default function HomePage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) { 
      setIsLoading(false); 
      return; 
    }
    
    axios.get(`http://localhost:5000/api/books/${user.id}`)
      .then(r => setBooks(r.data))
      .catch(() => console.error("Failed to load library"))
      .finally(() => setIsLoading(false));
  }, [user, isSignedIn, isLoaded]);

  const currentlyReading = books.filter(b => b.status === 'currently_reading');
  const wantToRead       = books.filter(b => b.status === 'want_to_read');
  const recentlyFinished = books.filter(b => b.status === 'read').slice(0, 10); 

  if (isLoading) return <div className="flex justify-center items-center h-screen text-pink-500 bg-white"><Loader2 size={64} className="animate-spin" /></div>;

  // ----------------------------------------
  // STATE 1: LOGGED OUT (Landing Experience)
  // ----------------------------------------
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 md:px-10 text-center font-['Caveat',_cursive]">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`}</style>
        <img 
          src="/logo.svg" 
          alt="TomeBooks" 
          className="h-32 md:h-48 object-contain mb-8 drop-shadow-[8px_8px_0px_rgba(236,72,153,1)] hover:-translate-y-2 transition-transform duration-300" 
        />
        <p className="text-3xl font-bold text-black border-[3px] border-black bg-white p-6 max-w-md leading-relaxed rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          The architectural archive for your literary journey. Sign in to access your dashboard.
        </p>
      </div>
    );
  }

  // ----------------------------------------
  // STATE 2: EMPTY LIBRARY (Onboarding)
  // ----------------------------------------
  if (books.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 flex flex-col items-center justify-center min-h-[70vh] font-['Caveat',_cursive]">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`}</style>
        <div className="border-[3px] border-black p-12 md:p-20 text-center bg-white flex flex-col items-center justify-center shadow-[12px_12px_0px_0px_rgba(236,72,153,1)] max-w-2xl w-full rounded-[255px_15px_225px_15px/15px_225px_15px_255px]">
          <Library size={64} strokeWidth={2} className="mb-6 text-pink-500" />
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-4 leading-tight">Your Archive is Empty</h2>
          <p className="text-3xl font-semibold text-black mb-10 max-w-md leading-relaxed">
            You haven't tracked any volumes yet. Head over to the Discover page to explore the global zeitgeist and start building your library.
          </p>
          <button 
            onClick={() => navigate('/discover')}
            className="bg-black text-white px-8 py-4 text-3xl font-bold border-[3px] border-black rounded-[15px_225px_15px_255px/255px_15px_225px_15px] hover:bg-pink-500 hover:text-black transition-colors flex items-center gap-3 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            Explore Books <ArrowRight size={28} strokeWidth={3} />
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // STATE 3: THE DASHBOARD
  // ----------------------------------------
  const activeBook = currentlyReading.length > 0 ? currentlyReading[0] : null;
  const alsoReading = currentlyReading.slice(1);

  // A reusable component mapped exactly to the Discover page style
  const SectionHeader = ({ title, subtitle, icon: Icon }) => (
    <div className="flex items-start gap-3 mb-8 px-6 md:px-10">
      <Icon size={36} className="text-pink-500 mt-2" strokeWidth={2.5} />
      <div>
        <h2 className="text-4xl md:text-5xl font-bold text-black leading-none">{title}</h2>
        {subtitle && (
          <p className="text-2xl font-bold text-pink-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-[100vw] py-12 overflow-x-hidden bg-white min-h-screen font-['Caveat',_cursive]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`}</style>
      
      {/* Page Header */}
      <div className="px-6 md:px-10 mb-12 flex justify-between items-end border-b-[3px] border-black pb-8 rounded-b-[255px_15px_225px_15px/15px_225px_15px_255px]">
        <div>
          <h1 className="text-6xl md:text-8xl font-bold text-black leading-none mb-2">Dashboard</h1>
          <p className="text-3xl font-bold text-pink-500">Welcome back, {user.firstName || 'Reader'}</p>
        </div>
      </div>

      {/* Trakt.tv Style Hero Card (Active Book) */}
      {activeBook && (
        <div className="px-6 md:px-10 mb-12">
          <SectionHeader title="Active Focus" icon={Play} subtitle="Continue Reading" />
          
          <div className="border-[3px] border-black flex flex-col md:flex-row bg-white shadow-[8px_8px_0px_0px_rgba(236,72,153,1)] hover:shadow-[12px_12px_0px_0px_rgba(236,72,153,1)] transition-shadow duration-300 cursor-pointer group rounded-[255px_15px_225px_15px/15px_225px_15px_255px]"
               onClick={() => navigate(`/book/${activeBook.bookId}`)}>
            
            <div className="w-full md:w-48 aspect-[2/3] md:aspect-auto md:h-64 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black overflow-hidden relative bg-white shrink-0 rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
              {activeBook.coverUrl ? (
                <img src={activeBook.coverUrl} alt={activeBook.title} className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
              ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-black font-bold text-3xl">No Cover</div>
              )}
            </div>

            <div className="flex flex-col p-6 md:p-8 justify-center flex-1 bg-white">
              <p className="text-2xl font-bold text-pink-500 mb-2">{activeBook.author || 'Unknown Author'}</p>
              <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight mb-6 line-clamp-2 group-hover:text-pink-500 transition-colors">{activeBook.title}</h2>
              <div className="mt-auto flex items-center gap-4">
                <button className="bg-black text-white px-6 py-3 text-2xl font-bold border-[3px] border-black rounded-[15px_225px_15px_255px/255px_15px_225px_15px] group-hover:bg-pink-500 group-hover:text-black transition-colors flex items-center gap-2">
                  <BookOpen size={24} strokeWidth={3} /> Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concurrent Streams (Also Reading) */}
      {alsoReading.length > 0 && (
        <div className="px-6 md:px-10 mb-20">
          <SectionHeader title="Concurrent Streams" icon={Layers} count={alsoReading.length} subtitle="Also Reading" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {alsoReading.map(book => (
              <BookCard key={book._id} id={book.bookId} title={book.title} author={book.author} coverUrl={book.coverUrl} />
            ))}
          </div>
        </div>
      )}

      {/* Up Next Queue */}
      {wantToRead.length > 0 && (
        <div className="px-6 md:px-10 mb-20">
          <SectionHeader title="Up Next" icon={BookmarkCheck} count={wantToRead.length} subtitle={ `${wantToRead.length} Volumes in Queue` } />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {wantToRead.map(book => (
              <BookCard key={book._id} id={book.bookId} title={book.title} author={book.author} coverUrl={book.coverUrl} />
            ))}
          </div>
        </div>
      )}

      {/* Finished Section */}
      {recentlyFinished.length > 0 && (
        <div className="px-6 md:px-10 mb-20">
          <SectionHeader title="Logged Volumes" icon={Archive} count={recentlyFinished.length} subtitle="Completed Volumes" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {recentlyFinished.map(book => (
              <BookCard key={book._id} id={book.bookId} title={book.title} author={book.author} coverUrl={book.coverUrl} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}