import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Library, Folder, BookOpen, Plus, X, Trash2 } from 'lucide-react';
import axios from 'axios';
import BookCard from '../components/BookCard';

export default function ShelvesPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  const [shelves, setShelves] = useState([]);
  const [activeShelf, setActiveShelf] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inline Creation State
  const [isCreatingMode, setIsCreatingMode] = useState(false);
  const [newShelfName, setNewShelfName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      if (isLoaded && !isSignedIn) navigate('/');
      return;
    }

    const fetchShelves = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/shelves/${user.id}`);
        setShelves(res.data);
        if (res.data.length > 0) setActiveShelf(res.data[0]);
      } catch (err) {
        console.error("Failed to fetch shelves:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShelves();
  }, [user, isLoaded, isSignedIn, navigate]);

  // Auto-focus the input when entering creation mode
  useEffect(() => {
    if (isCreatingMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreatingMode]);

  const handleCreateShelf = async () => {
    if (!newShelfName.trim()) {
      setIsCreatingMode(false);
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/shelves', {
        userId: user.id,
        name: newShelfName
      });
      const updatedShelves = [...shelves, res.data];
      setShelves(updatedShelves);
      setNewShelfName('');
      setIsCreatingMode(false);
      setActiveShelf(res.data); // Immediately select the newly created shelf
    } catch (err) {
      console.error("Failed to create shelf", err);
    }
  };

  const handleDeleteShelf = async () => {
    // A native browser confirmation so they don't accidentally delete their favorite shelf
    if (!window.confirm(`Are you sure you want to delete the "${activeShelf.name}" archive? This cannot be undone.`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/shelves/${activeShelf._id}`);

      // Update the UI immediately without reloading
      const updatedShelves = shelves.filter(s => s._id !== activeShelf._id);
      setShelves(updatedShelves);
      setActiveShelf(updatedShelves.length > 0 ? updatedShelves[0] : null);
    } catch (err) {
      console.error("Failed to delete shelf", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreateShelf();
    if (e.key === 'Escape') {
      setIsCreatingMode(false);
      setNewShelfName('');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen text-pink-500 bg-white"><Loader2 size={64} className="animate-spin" /></div>;

  return (
    <div className="max-w-[100vw] py-12 overflow-x-hidden bg-white min-h-screen flex flex-col font-['Caveat',_cursive]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`}</style>
      
      {/* Header with Tagline */}
      <div className="px-6 md:px-10 mb-12 flex justify-between items-end border-b-[3px] border-black pb-8 rounded-b-[255px_15px_225px_15px/15px_225px_15px_255px]">
        <div>
          <h1 className="text-6xl md:text-8xl font-bold text-black leading-none mb-2">Shelves</h1>
          <p className="text-3xl font-bold text-pink-500">
            Your archives. Your rules. Curate and organize volumes your way.
          </p>
        </div>
      </div>

      <div className="px-6 md:px-10 flex flex-col md:flex-row gap-12 items-start flex-1">

        {/* Left Column: Shelf List & Inline Creation */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4 sticky top-12">

          <h3 className="text-2xl font-bold text-pink-500 border-b-[3px] border-black pb-2 rounded-[15px_255px_15px_255px/255px_15px_225px_15px]">Your Collections</h3>

          {/* 1. The Rendered Shelves */}
          {shelves.length === 0 && !isCreatingMode ? (
            <p className="text-2xl font-bold text-black italic mb-2">No shelves created yet.</p>
          ) : (
            shelves.map(shelf => (
              <button
                key={shelf._id}
                onClick={() => setActiveShelf(shelf)}
                className={`flex items-center justify-between p-5 border-[3px] transition-all text-left group hover:-translate-y-1 rounded-[15px_225px_15px_255px/255px_15px_225px_15px] ${activeShelf?._id === shelf._id
                    ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] translate-x-2 z-10'
                    : 'border-transparent hover:border-black bg-white text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Folder size={24} className={activeShelf?._id === shelf._id ? 'text-pink-500' : 'text-black group-hover:text-pink-500'} strokeWidth={2.5} />
                  <span className="font-bold text-2xl line-clamp-1">{shelf.name}</span>
                </div>
                <span className={`text-xl font-bold ${activeShelf?._id === shelf._id ? 'text-pink-500' : 'text-pink-500'}`}>
                  {shelf.books?.length || 0}
                </span>
              </button>
            ))
          )}

          {/* 2. The Transformative Creation UI */}
          {isCreatingMode ? (
            <div className="flex flex-col border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] animate-in fade-in slide-in-from-top-2 duration-200 rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
              <input
                ref={inputRef}
                type="text"
                placeholder="NAME YOUR SHELF..."
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent px-5 py-4 text-2xl font-bold outline-none text-black placeholder:text-pink-300 border-b-[3px] border-black rounded-t-[15px_225px_15px_255px/255px_15px]"
              />
              <div className="flex">
                <button onClick={() => { setIsCreatingMode(false); setNewShelfName(''); }} className="flex-1 py-3 text-2xl font-bold text-pink-500 hover:bg-pink-100 transition-colors flex items-center justify-center gap-2 rounded-bl-[15px_225px]">
                  <X size={20} strokeWidth={3} /> Cancel
                </button>
                <button onClick={handleCreateShelf} className="flex-1 py-3 bg-white text-black border-l-[3px] border-black text-2xl font-bold hover:bg-pink-500 transition-colors rounded-br-[15px_255px]">
                  Save
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreatingMode(true)}
              className="flex items-center justify-center gap-3 p-5 border-[3px] border-dashed border-black text-black hover:border-pink-500 hover:text-black hover:bg-pink-100 transition-colors mt-2 rounded-[15px_225px_15px_255px/255px_15px_225px_15px]"
            >
              <Plus size={24} strokeWidth={3} />
              <span className="font-bold text-2xl">Create New Shelf</span>
            </button>
          )}

        </div>

        {/* Right Column: Book Grid for Active Shelf */}
        <div className="flex-1 w-full min-h-[600px] border-[3px] border-black p-8 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-[255px_15px_225px_15px/15px_225px_15px_255px]">
          {!activeShelf ? (
            <div className="py-20 text-center flex flex-col items-center justify-center h-full opacity-50">
              <Library size={64} className="text-black mb-4" strokeWidth={1.5} />
              <p className="text-4xl font-bold text-black">No Archive Selected</p>
              <p className="text-2xl font-bold text-pink-500 mt-2">Create or select a shelf to view contents.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-10 border-b-[3px] border-black pb-6 rounded-b-[255px_15px/15px_225px]">
                <h2 className="text-5xl font-bold text-black leading-none">{activeShelf.name}</h2>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-black bg-white border-[3px] border-black px-4 py-2 rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
                    {activeShelf.books?.length || 0} Volumes
                  </span>
                  <button
                    onClick={handleDeleteShelf}
                    className="flex items-center gap-2 px-4 py-2 text-xl font-bold text-red-500 border-[3px] border-transparent hover:border-black hover:bg-red-100 transition-colors rounded-[15px_225px_15px_255px/255px_15px_225px_15px]"
                    title="Delete Archive"
                  >
                    <Trash2 size={20} strokeWidth={3} /> Delete
                  </button>
                </div>
              </div>

              {!activeShelf.books || activeShelf.books.length === 0 ? (
                <div className="py-32 text-center flex flex-col items-center">
                  <div className="w-24 h-24 border-[3px] border-dashed border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px] flex items-center justify-center mb-6 bg-white shadow-[4px_4px_0px_0px_rgba(236,72,153,1)]">
                    <BookOpen size={48} className="text-pink-500" strokeWidth={2} />
                  </div>
                  <p className="text-4xl font-bold text-black mb-2">Shelf is Empty</p>
                  <p className="text-2xl font-bold text-pink-500 max-w-sm">
                    Navigate to any volume's detail page and use the dropdown to add it to this collection.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {activeShelf.books.map(book => (
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
            </>
          )}
        </div>

      </div>
    </div>
  );
}