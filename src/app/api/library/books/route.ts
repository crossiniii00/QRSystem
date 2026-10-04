import { NextResponse } from 'next/server';

// In-memory book store (will be replaced with Prisma/Supabase later)
export const bookStore: Book[] = [
  {
    id: 'b1',
    isbn: '978-0-7432-7356-5',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    publisher: 'Scribner',
    publicationYear: 1925,
    category: 'Fiction',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop',
    status: 'AVAILABLE',
    addedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'b2',
    isbn: '978-0-451-52493-5',
    title: '1984',
    author: 'George Orwell',
    publisher: 'Signet Classics',
    publicationYear: 1949,
    category: 'Dystopian',
    coverUrl: 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?q=80&w=400&auto=format&fit=crop',
    status: 'RESERVED',
    addedAt: '2026-09-05T00:00:00Z',
    updatedAt: '2026-09-05T00:00:00Z',
  },
  {
    id: 'b3',
    isbn: '978-0-06-112008-4',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    publisher: 'Harper Perennial',
    publicationYear: 1960,
    category: 'Classic',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop',
    status: 'BORROWED',
    addedAt: '2026-09-10T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z',
  },
  {
    id: 'b4',
    isbn: '978-0-14-028329-7',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    publisher: 'Little, Brown',
    publicationYear: 1951,
    category: 'Fiction',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop',
    status: 'AVAILABLE',
    addedAt: '2026-09-12T00:00:00Z',
    updatedAt: '2026-09-12T00:00:00Z',
  },
  {
    id: 'b5',
    isbn: '978-0-06-093546-7',
    title: 'To Kill a Mockingbird: 50th Anniversary Edition',
    author: 'Harper Lee',
    publisher: 'Harper',
    publicationYear: 2010,
    category: 'Classic',
    coverUrl: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?q=80&w=400&auto=format&fit=crop',
    status: 'AVAILABLE',
    addedAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-09-15T00:00:00Z',
  },
  {
    id: 'b6',
    isbn: '978-0-393-97283-6',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    publisher: 'W.W. Norton',
    publicationYear: 1818,
    category: 'Horror',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop',
    status: 'MAINTENANCE',
    addedAt: '2026-09-18T00:00:00Z',
    updatedAt: '2026-09-18T00:00:00Z',
  },
];

export interface Book {
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  publicationYear: number | null;
  category: string | null;
  coverUrl: string | null;
  status: 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'LOST' | 'MAINTENANCE';
  addedAt: string;
  updatedAt: string;
}

export interface BookReservation {
  id: string;
  bookId: string;
  bookTitle: string;
  reserverName: string;
  reserverEmail: string | null;
  reservedAt: string;
  validUntil: string;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
}

export const reservationStore: BookReservation[] = [
  {
    id: 'r1',
    bookId: 'b2',
    bookTitle: '1984',
    reserverName: 'Juan Dela Cruz',
    reserverEmail: 'juan@student.stfrancis.edu',
    reservedAt: '2026-10-01T00:00:00Z',
    validUntil: '2026-10-08T00:00:00Z',
    status: 'PENDING',
  },
  {
    id: 'r2',
    bookId: 'b3',
    bookTitle: 'To Kill a Mockingbird',
    reserverName: 'Maria Santos',
    reserverEmail: 'maria@student.stfrancis.edu',
    reservedAt: '2026-09-28T00:00:00Z',
    validUntil: '2026-10-05T00:00:00Z',
    status: 'FULFILLED',
  },
];

// GET all books
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: bookStore,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'Failed to fetch books' } }, { status: 500 });
  }
}

// POST create a new book
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBook: Book = {
      id: 'b' + Date.now(),
      isbn: body.isbn || null,
      title: body.title,
      author: body.author,
      publisher: body.publisher || null,
      publicationYear: body.publicationYear || null,
      category: body.category || null,
      coverUrl: body.coverUrl || null,
      status: 'AVAILABLE',
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    bookStore.push(newBook);
    return NextResponse.json({ success: true, data: newBook });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'Failed to create book' } }, { status: 500 });
  }
}
