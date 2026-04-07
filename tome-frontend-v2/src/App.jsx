import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import DiscoverPage from './pages/DiscoverPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookDetailPage from './pages/BookDetailPage';
import ProfilePage from './pages/ProfilePage';
import ShelvesPage from './pages/ShelvesPage';
import Footer from './components/Footer';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-white font-sans text-black relative">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        
        {/* Main Content Area - Handles the scrolling natively */}
        <main className="flex-1 overflow-y-auto bg-white pb-16 md:pb-0 flex flex-col">
          {/* Routes Wrapper - Expands to fill space, pushing footer down naturally */}
          <div className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/book/:id" element={<BookDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/shelves" element={<ShelvesPage />} />
            </Routes>
          </div>
          
          <Footer />
        </main>
        
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}