import { NextResponse } from 'next/server';
import { bookStore, reservationStore } from '../../books/route';

// PUT update a reservation (fulfill / cancel)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const idx = reservationStore.findIndex((r) => r.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: { message: 'Reservation not found' } }, { status: 404 });
    }

    const reservation = reservationStore[idx];
    const newStatus = body.status as 'FULFILLED' | 'CANCELLED' | 'EXPIRED';

    if (newStatus === 'FULFILLED') {
      // Mark book as BORROWED
      const book = bookStore.find((b) => b.id === reservation.bookId);
      if (book) {
        book.status = 'BORROWED';
        book.updatedAt = new Date().toISOString();
      }
    } else if (newStatus === 'CANCELLED' || newStatus === 'EXPIRED') {
      // Return book to AVAILABLE
      const book = bookStore.find((b) => b.id === reservation.bookId);
      if (book && book.status === 'RESERVED') {
        book.status = 'AVAILABLE';
        book.updatedAt = new Date().toISOString();
      }
    }

    reservationStore[idx] = { ...reservation, status: newStatus };
    return NextResponse.json({ success: true, data: reservationStore[idx] });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'Failed to update reservation' } }, { status: 500 });
  }
}
