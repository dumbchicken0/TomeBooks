import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. MONGODB SCHEMAS & MODELS
// ==========================================
const bookSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookId: { type: String, required: true }, // String to handle both 'OL123W' and '12345'
  title: String,
  author: String,
  coverUrl: String,
  status: { type: String, enum: ['want_to_read', 'currently_reading', 'read'], default: 'want_to_read' },
  addedAt: { type: Date, default: Date.now }
});

const reviewSchema = new mongoose.Schema({
  bookId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: String,
  rating: { type: Number, min: 0, max: 5 },
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const shelfSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
});

const Book = mongoose.model('Book', bookSchema);
const Review = mongoose.model('Review', reviewSchema);
const Shelf = mongoose.model('Shelf', shelfSchema);

// ==========================================
// 2. HARDCOVER GRAPHQL PROXY
// ==========================================
app.post('/api/hardcover', async (req, res) => {
  try {
    const response = await axios.post('https://api.hardcover.app/v1/graphql', req.body, {
      headers: {
        'Authorization': `Bearer ${process.env.HARDCOVER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data.data);
  } catch (error) {
    console.error("Hardcover Proxy Error:", error.response?.data || error.message);
    res.status(500).json({ error: 'Hardcover API request failed.' });
  }
});

// ==========================================
// 3. BOOK LIBRARY ROUTES
// ==========================================
app.post('/api/books', async (req, res) => {
  try {
    const existingBook = await Book.findOne({ userId: req.body.userId, bookId: req.body.bookId });
    if (existingBook) return res.json(existingBook);
    const book = new Book(req.body);
    await book.save();
    res.json(book);
  } catch (err) { res.status(500).json(err); }
});

app.get('/api/books/:userId', async (req, res) => {
  try {
    const books = await Book.find({ userId: req.params.userId }).sort({ addedAt: -1 });
    res.json(books);
  } catch (err) { res.status(500).json(err); }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { status: req.body.status }, { returnDocument: 'after' });
    res.json(book);
  } catch (err) { res.status(500).json(err); }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json(err); }
});

// ==========================================
// 4. REVIEW ROUTES
// ==========================================
app.get('/api/reviews/:bookId', async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json(err); }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.json(review);
  } catch (err) { res.status(500).json(err); }
});

app.put('/api/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { text: req.body.text, rating: req.body.rating }, { returnDocument: 'after' });
    res.json(review);
  } catch (err) { res.status(500).json(err); }
});

// ==========================================
// 5. SHELF ROUTES
// ==========================================
app.get('/api/shelves/:userId', async (req, res) => {
  try {
    const shelves = await Shelf.find({ userId: req.params.userId }).populate('books');
    res.json(shelves);
  } catch (err) { res.status(500).json(err); }
});

app.post('/api/shelves', async (req, res) => {
  try {
    const shelf = new Shelf(req.body);
    await shelf.save();
    res.json(shelf);
  } catch (err) { res.status(500).json(err); }
});

app.post('/api/shelves/:id/add', async (req, res) => {
  try {
    const shelf = await Shelf.findByIdAndUpdate(req.params.id, { $addToSet: { books: req.body.bookDbId } }, { returnDocument: 'after' }).populate('books');
    res.json(shelf);
  } catch (err) { res.status(500).json(err); }
});

app.post('/api/shelves/:id/remove', async (req, res) => {
  try {
    const shelf = await Shelf.findByIdAndUpdate(req.params.id, { $pull: { books: req.body.bookDbId } }, { returnDocument: 'after' }).populate('books');
    res.json(shelf);
  } catch (err) { res.status(500).json(err); }
});

app.delete('/api/shelves/:id', async (req, res) => {
  try {
    await Shelf.findByIdAndDelete(req.params.id);
    res.json({ message: 'Shelf Deleted' });
  } catch (err) { res.status(500).json(err); }
});

// ==========================================
// SERVER START & VERCEL EXPORT
// ==========================================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to TomeBooks MongoDB'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;

// Only run app.listen if we are testing locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Tome v2 Backend Running on port ${PORT}`));
}

// Export the app for Vercel Serverless Functions
export default app;