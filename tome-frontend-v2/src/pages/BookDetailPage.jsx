import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Loader2, BookOpen, Star, Edit3, Edit2, ArrowLeft, BookmarkCheck, Plus, ChevronDown, Check, ListPlus } from 'lucide-react';
import axios from 'axios';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();

  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Library State
  const [dbBookId, setDbBookId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');

  // Review State
  const [tomeReviews, setTomeReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingUserReview, setExistingUserReview] = useState(null);

  // Shelf State
  const [isShelfModalOpen, setIsShelfModalOpen] = useState(false);
  const [userShelves, setUserShelves] = useState([]);
  const [newShelfName, setNewShelfName] = useState('');

  // Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getStatusText = () => {
    if (currentStatus === 'read') return 'Finished';
    if (currentStatus === 'currently_reading') return 'Reading';
    if (currentStatus === 'want_to_read') return 'Want to Read';
    return 'Add to Library';
  };

  const handleUpdateStatus = (status) => {
    handleStatusChange(status);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // 1. ALWAYS CHECK MONGO DB FIRST (To catch Ghost Volumes)
      if (isSignedIn && user) {
        try {
          const dbRes = await axios.get(`https://tome-backend.vercel.app/api/books/${user.id}`);
          const existingBook = dbRes.data.find(b => b.bookId === id);
          if (existingBook) {
            setDbBookId(existingBook._id);
            setCurrentStatus(existingBook.status);
          }
        } catch (e) { console.error("DB Check Failed"); }
      }

      // 2. FETCH EXTERNAL BOOK DATA
      try {
        const isOpenLibrary = id.startsWith('OL');
        let parsedBook = null;

        if (isOpenLibrary) {
          const workRes = await fetch(`https://openlibrary.org/works/${id}.json`);
          if (!workRes.ok) throw new Error("Open Library fetch failed");
          const work = await workRes.json();

          let authorName = "Unknown Author";
          if (work.authors && work.authors.length > 0 && work.authors[0].author?.key) {
            try {
              const authRes = await fetch(`https://openlibrary.org${work.authors[0].author.key}.json`);
              const auth = await authRes.json();
              authorName = auth.name;
            } catch (e) { }
          }

          // Fetch Open Library Global Rating
          let globalRating = 0;
          try {
            const ratingRes = await fetch(`https://openlibrary.org/works/${id}/ratings.json`);
            const ratingData = await ratingRes.json();
            globalRating = ratingData?.summary?.average || 0;
          } catch (e) { }

          parsedBook = {
            id: id,
            title: work.title,
            author: authorName,
            description: typeof work.description === 'string' ? work.description : (work.description?.value || "No archival description available."),
            coverUrl: work.covers && work.covers.length > 0 ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg` : '',
            globalRating: globalRating
          };
        } else {
          // Fetch from Hardcover (Bypassing the variables object by injecting ID directly)
          const hcQuery = `
            query {
              books(where: {id: {_eq: ${id}}}) {
                id title description rating
                image { url }
                contributions(limit: 1) { author { name } }
              }
            }
          `;
          const hcRes = await axios.post('https://tome-backend.vercel.app/api/hardcover', {
            query: hcQuery
            // Removed the variables object so the backend proxy doesn't drop it
          });

          const hcBook = hcRes.data?.books?.[0];
          if (hcBook) {
            parsedBook = {
              id: hcBook.id.toString(),
              title: hcBook.title,
              author: hcBook.contributions?.[0]?.author?.name || 'Unknown Author',
              description: hcBook.description || "No archival description available.",
              coverUrl: hcBook.image?.url || '',
              globalRating: hcBook.rating || 0
            };
          }
        }

        setBook(parsedBook);

        // 3. FETCH REVIEWS
        const reviewsRes = await axios.get(`https://tome-backend.vercel.app/api/reviews/${id}`);
        setTomeReviews(reviewsRes.data || []);

        if (isSignedIn && user) {
          const myReview = reviewsRes.data.find(r => r.userId === user.id);
          if (myReview) {
            setExistingUserReview(myReview);
            setReviewText(myReview.text);
            setUserRating(myReview.rating);
          }
        }

      } catch (error) {
        console.error("Volume not found in external API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isSignedIn, user]);

  useEffect(() => {
    if (isShelfModalOpen && user) {
      axios.get(`https://tome-backend.vercel.app/api/shelves/${user.id}`)
        .then(res => setUserShelves(res.data))
        .catch(err => console.error(err));
    }
  }, [isShelfModalOpen, user]);

  const handleStatusChange = async (newStatus) => {
    if (!isSignedIn) return;
    try {
      if (dbBookId) {
        await axios.put(`https://tome-backend.vercel.app/api/books/${dbBookId}`, { status: newStatus });
      } else {
        const res = await axios.post('https://tome-backend.vercel.app/api/books', {
          userId: user.id,
          bookId: id,
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
          status: newStatus
        });
        setDbBookId(res.data._id);
      }
      setCurrentStatus(newStatus);
    } catch (err) { console.error("Status update failed:", err); }
  };

  const handleRemoveFromLibrary = async () => {
    try {
      await axios.delete(`https://tome-backend.vercel.app/api/books/${dbBookId}`);
      setDbBookId(null);
      setCurrentStatus('');
      // If it's a ghost book, booting them back to profile
      if (!book) navigate('/profile');
    } catch (err) { console.error("Failed to remove book:", err); }
  };

  const submitReview = async () => {
    setIsSubmittingReview(true);
    try {
      if (isEditing && existingUserReview) {
        const res = await axios.put(`https://tome-backend.vercel.app/api/reviews/${existingUserReview._id}`, {
          text: reviewText, rating: userRating
        });
        setExistingUserReview(res.data);
        setTomeReviews(tomeReviews.map(r => r._id === res.data._id ? res.data : r));
      } else {
        const res = await axios.post('https://tome-backend.vercel.app/api/reviews', {
          bookId: id,
          userId: user.id,
          userName: user.firstName || user.username || 'Reader',
          rating: userRating,
          text: reviewText
        });
        setExistingUserReview(res.data);
        setTomeReviews([res.data, ...tomeReviews]);
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Review submission failed", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const startEdit = () => setIsEditing(true);
  const cancelEdit = () => {
    setIsEditing(false);
    setReviewText(existingUserReview?.text || '');
    setUserRating(existingUserReview?.rating || 0);
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen text-pink-500 bg-white"><Loader2 size={64} className="animate-spin" /></div>;

  // ----------------------------------------
  // THE GHOST VOLUME PURGE SCREEN
  // ----------------------------------------
  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-10 text-center font-['Caveat',_cursive]">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`}</style>
        <h1 className="text-5xl md:text-6xl font-bold text-black mb-4">Volume Not Found.</h1>
        <p className="text-2xl text-black mb-12 max-w-md">This record may have been moved, deleted, or its schema was updated in the global index.</p>

        {dbBookId ? (
          <div className="border-[3px] border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center rounded-[255px_15px_225px_15px/15px_225px_15px_255px]">
            <p className="text-2xl font-bold text-pink-500 mb-4">Ghost Volume Detected in your Archive</p>
            <button
              onClick={handleRemoveFromLibrary}
              className="bg-black text-white px-8 py-4 text-2xl font-bold border-[3px] border-black hover:bg-pink-500 hover:text-black transition-colors rounded-[15px_225px_15px_255px/255px_15px_225px_15px]"
            >
              Purge from Database
            </button>
          </div>
        ) : (
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-2xl font-bold text-pink-500 hover:text-black transition-colors border-[3px] border-transparent hover:border-black px-4 py-2 rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
            <ArrowLeft size={24} strokeWidth={3} /> Return to previous sector
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[100vw] py-12 overflow-x-hidden bg-white min-h-screen font-['Caveat',_cursive]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`}</style>
      <div className="max-w-6xl mx-auto px-6 md:px-10">

        {/* Top Action Bar */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-2xl font-bold text-pink-500 hover:text-black transition-colors mb-8 border-[3px] border-transparent hover:border-black px-4 py-2 rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
          <ArrowLeft size={24} strokeWidth={3} /> Back
        </button>

        {/* Hero Section */}
        <div className="border-[3px] border-black flex flex-col md:flex-row bg-white shadow-[12px_12px_0px_0px_rgba(236,72,153,1)] mb-16 rounded-[255px_15px_225px_15px/15px_225px_15px_255px]">

          {/* Left Column: Just the Cover */}
          <div className="w-full md:w-1/3 aspect-[2/3] border-b-[3px] md:border-b-0 md:border-r-[3px] border-black overflow-hidden relative bg-white shrink-0 rounded-[255px_15px_225px_15px/15px_225px_15px_255px]">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover grayscale-[10%]" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-black font-bold text-3xl p-4 text-center">No Cover Data</div>
            )}
            <div className="absolute top-4 left-4 bg-white border-[3px] border-black text-black text-xl font-bold px-3 py-1 rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
              {id.startsWith('OL') ? 'Open Library' : 'Hardcover'}
            </div>
          </div>

          {/* Right Column: Info & Action Buttons Enclosed */}
          <div className="flex flex-col p-8 md:p-12 justify-center flex-1 bg-white">
            <p className="text-2xl font-bold text-pink-500 mb-2">{book.author}</p>
            <h1 className="text-5xl md:text-7xl font-bold text-black leading-tight mb-4">{book.title}</h1>

            {/* Global Rating Block */}
            {book.globalRating > 0 && (
              <div className="flex items-center gap-3 mb-8 border-[3px] border-black p-3 w-fit bg-white rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
                <span className="text-3xl font-bold text-black leading-none">{book.globalRating.toFixed(1)}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={24} className={book.globalRating >= i ? "text-pink-500 fill-pink-500" : "text-black"} strokeWidth={2} />
                  ))}
                </div>
                <span className="text-xl font-bold text-pink-500 ml-2">Global Avg</span>
              </div>
            )}

            <div className="w-12 h-1 bg-pink-500 mb-6 rounded-full"></div>
            <p className="text-2xl text-black leading-relaxed mb-10 whitespace-pre-wrap">{book.description}</p>

            {/* ENCLOSED ACTION BUTTONS */}
            <div className="mt-auto pt-6 border-t-[3px] border-black">
              {isSignedIn ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

                  {/* The Custom Dropdown */}
                  <div className="relative w-full sm:w-80" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`w-full flex items-center justify-between px-6 py-4 text-2xl font-bold border-[3px] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[15px_225px_15px_255px/255px_15px_225px_15px] ${dbBookId ? 'bg-pink-500 text-black border-black' : 'bg-white text-black border-black hover:bg-pink-500'}`}>
                      <div className="flex items-center gap-3">
                        {dbBookId ? <BookmarkCheck size={24} strokeWidth={3} /> : <Plus size={24} strokeWidth={3} />}
                        {getStatusText()}
                      </div>
                      <ChevronDown size={24} strokeWidth={3} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 flex flex-col rounded-[255px_15px_225px_15px/15px_225px_15px_255px] overflow-hidden">
                        <button onClick={() => handleUpdateStatus('read')} className="flex items-center gap-3 px-6 py-4 text-2xl font-bold text-left hover:bg-pink-500 hover:text-black transition-colors border-b-[3px] border-black"><Check size={24} strokeWidth={3} /> Finished</button>
                        <button onClick={() => handleUpdateStatus('currently_reading')} className="flex items-center gap-3 px-6 py-4 text-2xl font-bold text-left hover:bg-pink-500 hover:text-black transition-colors border-b-[3px] border-black"><BookOpen size={24} strokeWidth={3} /> Reading</button>
                        <button onClick={() => handleUpdateStatus('want_to_read')} className="flex items-center gap-3 px-6 py-4 text-2xl font-bold text-left hover:bg-pink-500 hover:text-black transition-colors border-b-[3px] border-black"><BookmarkCheck size={24} strokeWidth={3} /> Want to Read</button>
                        <button onClick={() => { setIsDropdownOpen(false); setIsShelfModalOpen(true); }} className="flex items-center gap-3 px-6 py-4 text-2xl font-bold text-left text-pink-500 hover:text-black hover:bg-pink-100 transition-colors"><ListPlus size={24} strokeWidth={3} /> Add to Shelf...</button>
                      </div>
                    )}
                  </div>

                  {/* The Remove Button */}
                  {dbBookId && (
                    <button onClick={handleRemoveFromLibrary} className="text-xl font-bold border-[3px] border-transparent hover:border-black hover:bg-red-100 text-black px-4 py-2 rounded-[15px_225px_15px_255px/255px_15px_225px_15px] transition-colors">
                      Remove Archive
                    </button>
                  )}

                </div>
              ) : (
                <p className="text-2xl font-bold text-pink-500 border-[3px] border-black bg-white p-4 text-center rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
                  Sign in to add to your archive.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* COMMUNITY REVIEW SYSTEM */}
        <div className="mb-12">
          <div className="flex items-center gap-3 border-b-[3px] border-black pb-4 mb-8">
            <Edit3 size={32} className="text-pink-500" strokeWidth={3} />
            <h3 className="text-4xl font-bold text-black leading-none mt-1">Community Reviews</h3>
          </div>

          {/* The Interactive Review Editor */}
          {isSignedIn ? (
            <div className="mb-12 bg-white border-[3px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[255px_15px_225px_15px/15px_225px_15px_255px]">
              <div className="flex items-center justify-between mb-6 border-b-[3px] border-black pb-4">
                <span className="font-bold text-3xl text-black">
                  {existingUserReview && !isEditing ? 'Your Logged Review' : 'Log a Review'}
                </span>
                {existingUserReview && !isEditing && (
                  <button onClick={startEdit} className="text-pink-500 hover:text-black transition-colors flex items-center gap-2 text-xl font-bold border-[3px] border-transparent hover:border-black px-4 py-2 rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
                    <Edit2 size={20} strokeWidth={3} /> Edit
                  </button>
                )}
              </div>

              {existingUserReview && !isEditing ? (
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(existingUserReview.rating)].map((_, i) => <Star key={i} size={24} className="text-pink-500 fill-pink-500" strokeWidth={3} />)}
                  </div>
                  <p className="text-black text-2xl leading-relaxed whitespace-pre-wrap">{existingUserReview.text}</p>
                </div>
              ) : (
                <>
                  <textarea
                    value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your thoughts..."
                    className="w-full bg-white border-[3px] border-black outline-none resize-none h-32 text-black text-2xl placeholder:text-pink-300 mb-6 p-4 rounded-[15px_225px_15px_255px/255px_15px_225px_15px]"
                  />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-xl font-bold text-pink-500">Select Rating</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={32}
                            onClick={() => setUserRating(star)}
                            className={`cursor-pointer transition-all hover:scale-110 ${userRating >= star ? 'text-pink-500 fill-pink-500' : 'text-black hover:text-pink-500'}`}
                            strokeWidth={2}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                      {isEditing && (
                        <button onClick={cancelEdit} className="px-6 py-4 border-[3px] border-black text-2xl font-bold text-black hover:bg-pink-100 transition-colors rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">Cancel</button>
                      )}
                      <button onClick={submitReview} disabled={isSubmittingReview || !reviewText.trim() || userRating === 0} className="bg-white border-[3px] border-black text-black px-8 py-4 text-2xl font-bold hover:bg-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(236,72,153,1)] rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
                        {isSubmittingReview ? 'Saving...' : (isEditing ? 'Update' : 'Post Review')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="mb-12 p-8 border-[3px] border-black text-center text-3xl font-bold text-black bg-white rounded-[255px_15px_225px_15px/15px_225px_15px_255px]">
              Please sign in to write a review.
            </div>
          )}

          {/* Feed */}
          <div className="flex flex-col gap-8">
            {tomeReviews.filter(rev => rev.userId !== user?.id).map((rev) => (
              <div key={rev._id} className="flex flex-col border-[3px] border-black p-6 bg-white rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xl font-bold px-3 py-1 border-[3px] border-black text-black rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
                    {rev.userName}
                  </span>
                  {rev.rating > 0 && (
                    <div className="flex gap-1">
                      {[...Array(rev.rating)].map((_, i) => <Star key={i} size={20} className="text-pink-500 fill-pink-500" strokeWidth={3} />)}
                    </div>
                  )}
                </div>
                <p className="text-black text-2xl leading-relaxed whitespace-pre-wrap">{rev.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* THE BRUTALIST SHELF MODAL */}
      {isShelfModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6">
          <div className="bg-white border-[3px] border-black p-8 w-full max-w-md shadow-[12px_12px_0px_0px_rgba(236,72,153,1)] flex flex-col rounded-[255px_15px_225px_15px/15px_225px_15px_255px]">
            <h2 className="text-4xl font-bold text-black mb-6">Manage Shelves</h2>

            <div className="flex flex-col gap-4 mb-8 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {userShelves.length === 0 ? (
                <p className="text-xl font-bold text-pink-500 italic">No shelves found.</p>
              ) : (
                userShelves.map(shelf => {
                  const hasBook = shelf.books.some(b => typeof b === 'object' ? b.bookId === id : b === dbBookId);
                  return (
                    <button
                      key={shelf._id}
                      onClick={async () => {
                        if (!dbBookId) {
                          alert("Please add the book to your library first!");
                          return;
                        }
                        const endpoint = hasBook ? 'remove' : 'add';
                        await axios.post(`https://tome-backend.vercel.app/api/shelves/${shelf._id}/${endpoint}`, { bookDbId: dbBookId });
                        // Refresh shelves
                        const res = await axios.get(`https://tome-backend.vercel.app/api/shelves/${user.id}`);
                        setUserShelves(res.data);
                      }}
                      className={`flex items-center justify-between px-4 py-3 border-[3px] text-xl font-bold transition-colors rounded-[15px_225px_15px_255px/255px_15px_225px_15px] ${hasBook ? 'border-black bg-pink-500 text-white' : 'border-black hover:border-black hover:bg-pink-100 text-black'}`}
                    >
                      <span>{shelf.name}</span>
                      {hasBook ? <Check size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
                    </button>
                  )
                })
              )}
            </div>

            <div className="flex gap-2 border-t-[3px] border-black pt-6">
              <input
                type="text" placeholder="New Shelf Name"
                value={newShelfName} onChange={(e) => setNewShelfName(e.target.value)}
                className="flex-1 bg-white border-[3px] border-black px-4 py-3 text-xl font-bold outline-none rounded-[15px_225px_15px_255px/255px_15px_225px_15px]"
              />
              <button
                onClick={async () => {
                  if (!newShelfName.trim()) return;
                  await axios.post('https://tome-backend.vercel.app/api/shelves', { userId: user.id, name: newShelfName });
                  setNewShelfName('');
                  const res = await axios.get(`https://tome-backend.vercel.app/api/shelves/${user.id}`);
                  setUserShelves(res.data);
                }}
                className="bg-white border-[3px] border-black text-black px-6 py-2 text-2xl font-bold hover:bg-pink-500 transition-colors rounded-[15px_225px_15px_255px/255px_15px_225px_15px]"
              >
                Create
              </button>
            </div>

            <button onClick={() => setIsShelfModalOpen(false)} className="mt-6 text-xl font-bold text-pink-500 hover:text-black transition-colors self-center border-[3px] border-transparent hover:border-black px-4 py-2 rounded-[15px_225px_15px_255px/255px_15px_225px_15px]">
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}