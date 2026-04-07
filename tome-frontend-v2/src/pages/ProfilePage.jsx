import React, { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2, BookOpen, Shield, Bookmark, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import BookCard from '../components/BookCard';

export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      if (isLoaded && !isSignedIn) navigate('/');
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/books/${user.id}`);
        setBooks(res.data || []);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, isLoaded, isSignedIn, navigate]);

  const handleSignOut = () => {
    signOut(() => navigate('/'));
  };

  // Filter books based on our database statuses
  const finishedBooks = books.filter(b => b.status === 'read');
  const readingBooks = books.filter(b => b.status === 'currently_reading');
  const toBeReadBooks = books.filter(b => b.status === 'want_to_read');

  // Determine which list to show based on the active tab
  const displayBooks =
    activeTab === 'finished' ? finishedBooks :
      activeTab === 'reading' ? readingBooks :
        activeTab === 'toBeRead' ? toBeReadBooks :
          books;

  // Toggle Logic: If clicking the already-active tab, switch to 'all'
  const handleTabClick = (tabName) => {
    if (activeTab === tabName) {
      setActiveTab('all');
    } else {
      setActiveTab(tabName);
    }
  };

  if (!isLoaded || isLoading) return <div className="flex justify-center items-center h-screen text-pink-500 bg-white"><Loader2 size={64} className="animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 bg-white min-h-screen font-['Caveat',_cursive]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`}</style>
      
      {/* Centered Profile Header */}
      <div className="flex flex-col items-center mb-16 text-center border-b-[3px] border-black pb-16">
        <div className="w-40 h-40 border-[3px] border-black bg-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(236,72,153,1)] mb-8 rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
          {user.imageUrl ? (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover grayscale-[10%]" />
          ) : (
            <UserIcon size={64} className="w-full h-full p-4 text-black" />
          )}
        </div>

        <h1 className="text-6xl md:text-8xl font-bold text-black leading-none mb-4">
          {user.firstName || 'Reader'}
        </h1>
        <p className="text-3xl font-bold text-pink-500 mb-8">
          {user.primaryEmailAddress?.emailAddress}
        </p>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-8 py-4 border-[3px] border-black bg-white text-black text-2xl font-bold hover:bg-pink-500 hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none rounded-[255px_15px_225px_15px/15px_225px_15px_255px]"
        >
          <LogOut size={24} strokeWidth={3} /> Sign Out
        </button>
      </div>

      {/* Brutalist Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-16">
        <button
          onClick={() => handleTabClick('finished')}
          className={`flex items-center gap-2 px-6 py-4 border-[3px] text-2xl font-bold transition-all rounded-[15px_225px_15px_255px/255px_15px_225px_15px] ${activeTab === 'finished'
              ? 'border-black bg-black text-white shadow-[6px_6px_0px_0px_rgba(236,72,153,1)] -translate-y-1'
              : 'border-black bg-white text-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
            }`}
        >
          <Shield size={24} strokeWidth={3} /> Finished ({finishedBooks.length})
        </button>

        <button
          onClick={() => handleTabClick('reading')}
          className={`flex items-center gap-2 px-6 py-4 border-[3px] text-2xl font-bold transition-all rounded-[255px_15px_225px_15px/15px_225px_15px_255px] ${activeTab === 'reading'
              ? 'border-black bg-black text-white shadow-[6px_6px_0px_0px_rgba(236,72,153,1)] -translate-y-1'
              : 'border-black bg-white text-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
            }`}
        >
          <BookOpen size={24} strokeWidth={3} /> Reading ({readingBooks.length})
        </button>

        <button
          onClick={() => handleTabClick('toBeRead')}
          className={`flex items-center gap-2 px-6 py-4 border-[3px] text-2xl font-bold transition-all rounded-[15px_255px_15px_225px/225px_15px_255px_15px] ${activeTab === 'toBeRead'
              ? 'border-black bg-black text-white shadow-[6px_6px_0px_0px_rgba(236,72,153,1)] -translate-y-1'
              : 'border-black bg-white text-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
            }`}
        >
          <Bookmark size={24} strokeWidth={3} /> To Be Read ({toBeReadBooks.length})
        </button>
      </div>

      {/* The Library Grid (Using BookCard to share sketchy aesthetic) */}
      {displayBooks.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center gap-4 w-full border-[3px] border-dashed border-black bg-white p-12 rounded-[255px_15px_225px_15px/15px_225px_15px_255px]">
          <BookOpen size={64} className="text-pink-500" strokeWidth={2} />
          <p className="font-bold text-4xl text-black">Archive Empty</p>
          <p className="text-2xl font-bold text-pink-500">No volumes found in this view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {displayBooks.map(book => (
            <BookCard
              key={book._id}
              id={book.bookId}
              title={book.title}
              author={book.author}
              coverUrl={book.coverUrl}
            />
          ))}
        </div>
      )}

    </div>
  );
}