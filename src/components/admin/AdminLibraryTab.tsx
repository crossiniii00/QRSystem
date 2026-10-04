import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Search, Edit2, Trash2, Calendar, User, Clock, X, Save, AlertTriangle, BookMarked, Wrench } from 'lucide-react';

interface Book {
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

interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  reserverName: string;
  reserverEmail: string | null;
  reservedAt: string;
  validUntil: string;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
}

const emptyBookForm = {
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  publicationYear: '',
  category: '',
  coverUrl: '',
};

export const AdminLibraryTab = ({ adminToken, adminRole }: { adminToken: string; adminRole: string }) => {
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'reservations'>('catalog');
  const [books, setBooks] = useState<Book[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState(emptyBookForm);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/library/books');
      const json = await res.json();
      if (json.success) setBooks(json.data);
    } catch (err) {
      console.error('Failed to load books', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    try {
      const res = await fetch('/api/library/reservations');
      const json = await res.json();
      if (json.success) setReservations(json.data);
    } catch (err) {
      console.error('Failed to load reservations', err);
    }
  };

  useEffect(() => {
    loadBooks();
    loadReservations();
  }, []);

  const handleSave = async () => {
    const payload = {
      ...form,
      publicationYear: form.publicationYear ? parseInt(form.publicationYear) : null,
    };

    if (editingBook) {
      await fetch(`/api/library/books/${editingBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/library/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setShowModal(false);
    setEditingBook(null);
    setForm(emptyBookForm);
    await loadBooks();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/library/books/${id}`, { method: 'DELETE' });
    setDeleting(null);
    await loadBooks();
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      publicationYear: book.publicationYear?.toString() || '',
      category: book.category || '',
      coverUrl: book.coverUrl || '',
    });
    setShowModal(true);
  };

  const handleReservationAction = async (id: string, status: 'FULFILLED' | 'CANCELLED') => {
    await fetch(`/api/library/reservations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await loadReservations();
    await loadBooks();
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.isbn && b.isbn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const statusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <BookOpen className="w-3 h-3" />;
      case 'BORROWED': return <BookMarked className="w-3 h-3" />;
      case 'RESERVED': return <Clock className="w-3 h-3" />;
      case 'MAINTENANCE': return <Wrench className="w-3 h-3" />;
      case 'LOST': return <AlertTriangle className="w-3 h-3" />;
      default: return null;
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-[#059669]/90 text-white';
      case 'BORROWED': return 'bg-[#DC2626]/90 text-white';
      case 'RESERVED': return 'bg-[#D97706]/90 text-white';
      case 'MAINTENANCE': return 'bg-[#6B7280]/90 text-white';
      case 'LOST': return 'bg-[#7C3AED]/90 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const reservationStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20';
      case 'FULFILLED': return 'bg-[#ECFDF5] text-[#059669] border border-[#059669]/20';
      case 'CANCELLED': return 'bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20';
      case 'EXPIRED': return 'bg-[#F3F4F6] text-[#6B7280] border border-[#6B7280]/20';
      default: return '';
    }
  };

  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.status === 'AVAILABLE').length;
  const borrowedBooks = books.filter(b => b.status === 'BORROWED').length;
  const reservedBooks = books.filter(b => b.status === 'RESERVED').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#D8CEBE]">
        <div>
          <h3 className="text-base font-black text-[#261F18] uppercase tracking-wide">
            Library Management System
          </h3>
          <p className="text-xs text-[#7A6A59]">
            Manage book inventory, borrowing records, and resource reservations.
          </p>
        </div>
        <button
          onClick={() => { setEditingBook(null); setForm(emptyBookForm); setShowModal(true); }}
          className="px-4 py-2 bg-[#2C150B] text-[#FFFDF7] text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#D97706] transition-colors rounded-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#EBE3D5] p-3 border border-[#D8CEBE] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7968]">Total Books</span>
          <div className="text-xl font-black text-[#261F18] font-mono mt-0.5">{totalBooks}</div>
        </div>
        <div className="bg-[#EBE3D5] p-3 border border-[#D8CEBE] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669]">Available</span>
          <div className="text-xl font-black text-[#059669] font-mono mt-0.5">{availableBooks}</div>
        </div>
        <div className="bg-[#EBE3D5] p-3 border border-[#D8CEBE] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626]">Borrowed</span>
          <div className="text-xl font-black text-[#DC2626] font-mono mt-0.5">{borrowedBooks}</div>
        </div>
        <div className="bg-[#EBE3D5] p-3 border border-[#D8CEBE] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706]">Reserved</span>
          <div className="text-xl font-black text-[#D97706] font-mono mt-0.5">{reservedBooks}</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-[#D8CEBE]">
        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'catalog'
              ? 'border-[#D97706] text-[#261F18]'
              : 'border-transparent text-[#8A7968] hover:text-[#261F18]'
          }`}
        >
          Book Catalog ({filteredBooks.length})
        </button>
        <button
          onClick={() => setActiveSubTab('reservations')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'reservations'
              ? 'border-[#D97706] text-[#261F18]'
              : 'border-transparent text-[#8A7968] hover:text-[#261F18]'
          }`}
        >
          Reservations ({reservations.filter(r => r.status === 'PENDING').length} active)
        </button>
      </div>

      {/* CATALOG TAB */}
      {activeSubTab === 'catalog' && (
        <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] shadow-xs">
          {/* Search */}
          <div className="p-3 border-b border-[#D8CEBE] bg-[#FAF6EE]">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-[#A89885] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, ISBN, or category..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#FFFDF7] border border-[#D8CEBE] text-xs font-mono focus:outline-none focus:border-[#D97706]"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="p-4 bg-[#FAF6EE]">
            {loading ? (
              <div className="py-16 text-center text-[#8A7968]">
                <BookOpen className="w-8 h-8 mx-auto mb-3 text-[#D8CEBE] animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider">Loading catalog...</p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="py-16 text-center text-[#8A7968]">
                <BookOpen className="w-8 h-8 mx-auto mb-3 text-[#D8CEBE]" />
                <p className="text-xs font-bold uppercase tracking-wider">No books found</p>
                <p className="text-[10px] mt-1">Try adjusting your search or add a new book.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="bg-[#FFFDF7] border border-[#D8CEBE] rounded flex flex-col hover:border-[#D97706] hover:shadow-md transition-all group overflow-hidden">
                    <div className="aspect-[2/3] relative overflow-hidden bg-[#EBE3D5] border-b border-[#D8CEBE]">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-[#D8CEBE]" />
                        </div>
                      )}
                      <div className="absolute top-1.5 right-1.5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest shadow-sm rounded-sm backdrop-blur-md ${statusStyle(book.status)}`}>
                          {statusIcon(book.status)}
                          {book.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 flex-1 flex flex-col">
                      <h4 className="font-bold text-[#261F18] text-[11px] leading-tight mb-0.5 line-clamp-2" title={book.title}>{book.title}</h4>
                      <p className="text-[9px] font-medium text-[#8A7968] truncate" title={book.author}>{book.author}</p>
                      {book.category && (
                        <span className="mt-1 inline-block text-[8px] font-bold uppercase tracking-wider text-[#A89885] bg-[#FAF6EE] px-1.5 py-0.5 rounded-sm w-fit">
                          {book.category}
                        </span>
                      )}

                      <div className="mt-auto pt-2 flex items-center justify-between border-t border-[#EBE3D5]">
                        <span className="text-[8px] font-mono font-medium text-[#A89885]">
                          {new Date(book.addedAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => handleEdit(book)}
                            className="p-1 text-[#A89885] hover:text-[#D97706] transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(book.id)}
                            disabled={deleting === book.id}
                            className="p-1 text-[#A89885] hover:text-[#DC2626] transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESERVATIONS TAB */}
      {activeSubTab === 'reservations' && (
        <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF6EE] text-[10px] uppercase tracking-widest text-[#8A7968] border-b border-[#D8CEBE]">
                  <th className="px-4 py-3 font-bold">Book Title</th>
                  <th className="px-4 py-3 font-bold">Reserved By</th>
                  <th className="px-4 py-3 font-bold">Reserved Date</th>
                  <th className="px-4 py-3 font-bold">Valid Until</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs bg-[#FFFDF7]">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#8A7968]">
                      No reservations recorded yet.
                    </td>
                  </tr>
                ) : (
                  reservations.map((res) => (
                    <tr key={res.id} className="border-b border-[#EBE3D5] hover:bg-[#FAF6EE]">
                      <td className="px-4 py-3 font-bold text-[#261F18]">{res.bookTitle}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-[#665646]">
                          <User className="w-3.5 h-3.5 text-[#A89885]" />
                          <div>
                            <div className="font-bold">{res.reserverName}</div>
                            {res.reserverEmail && (
                              <div className="text-[10px] text-[#8A7968] font-mono">{res.reserverEmail}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[#7A6A59]">
                        {new Date(res.reservedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#7A6A59]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-[#A89885]" />
                          {new Date(res.validUntil).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm ${reservationStatusStyle(res.status)}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {res.status === 'PENDING' ? (
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => handleReservationAction(res.id, 'FULFILLED')}
                              className="px-2 py-1 bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] border border-[#10B981]/20 font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer rounded-sm"
                            >
                              Fulfill
                            </button>
                            <button
                              onClick={() => handleReservationAction(res.id, 'CANCELLED')}
                              className="px-2 py-1 bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] border border-[#EF4444]/20 font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer rounded-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#A89885]">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT BOOK MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FAF6EE] border-2 border-[#D8CEBE] shadow-xl w-full max-w-lg mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CEBE] bg-[#EBE3D5]">
              <h3 className="text-sm font-black text-[#261F18] uppercase tracking-wider">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h3>
              <button
                onClick={() => { setShowModal(false); setEditingBook(null); setForm(emptyBookForm); }}
                className="p-1 text-[#8A7968] hover:text-[#DC2626] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#665646] mb-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#D97706]"
                    placeholder="Book title"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#665646] mb-1">Author *</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#D97706]"
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#665646] mb-1">ISBN</label>
                  <input
                    type="text"
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#D97706]"
                    placeholder="978-0-000-00000-0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#665646] mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#D97706]"
                    placeholder="e.g. Fiction, Science"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#665646] mb-1">Publisher</label>
                  <input
                    type="text"
                    value={form.publisher}
                    onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#D97706]"
                    placeholder="Publisher name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#665646] mb-1">Year</label>
                  <input
                    type="number"
                    value={form.publicationYear}
                    onChange={(e) => setForm({ ...form, publicationYear: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#D97706]"
                    placeholder="2026"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#665646] mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={form.coverUrl}
                    onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#D97706]"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#D8CEBE] bg-[#EBE3D5]">
              <button
                onClick={() => { setShowModal(false); setEditingBook(null); setForm(emptyBookForm); }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#665646] hover:text-[#261F18] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title || !form.author}
                className="px-4 py-2 bg-[#2C150B] text-[#FFFDF7] text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#D97706] transition-colors disabled:opacity-50 cursor-pointer rounded-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingBook ? 'Update Book' : 'Add Book'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
