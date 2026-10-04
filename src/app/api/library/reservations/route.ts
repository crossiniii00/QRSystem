import { NextResponse } from 'next/server';
import { bookStore, reservationStore, type BookReservation } from '../books/route';

// GET all reservations
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: reservationStore,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'Failed to fetch reservations' } }, { status: 500 });
  }
}

// POST create a new reservation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const book = bookStore.find((b) => b.id === body.bookId);
    if (!book) {
      return NextResponse.json({ success: false, error: { message: 'Book not found' } }, { status: 404 });
    }
    if (book.status !== 'AVAILABLE') {
      return NextResponse.json({ success: false, error: { message: 'Book is not available for reservation' } }, { status: 400 });
    }

    const newReservation: BookReservation = {
      id: 'r' + Date.now(),
      bookId: body.bookId,
      bookTitle: book.title,
      reserverName: body.reserverName,
      reserverEmail: body.reserverEmail || null,
      reservedAt: new Date().toISOString(),
      validUntil: body.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PENDING',
    };
    reservationStore.push(newReservation);
    book.status = 'RESERVED';
    book.updatedAt = new Date().toISOString();

    return NextResponse.json({ success: true, data: newReservation });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'Failed to create reservation' } }, { status: 500 });
  }
}
