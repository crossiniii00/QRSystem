import { NextResponse } from 'next/server';
import { bookStore } from '../route';

// PUT update a book
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const idx = bookStore.findIndex((b) => b.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: { message: 'Book not found' } }, { status: 404 });
    }
    bookStore[idx] = {
      ...bookStore[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, data: bookStore[idx] });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'Failed to update book' } }, { status: 500 });
  }
}

// DELETE a book
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idx = bookStore.findIndex((b) => b.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: { message: 'Book not found' } }, { status: 404 });
    }
    const removed = bookStore.splice(idx, 1);
    return NextResponse.json({ success: true, data: removed[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'Failed to delete book' } }, { status: 500 });
  }
}
