"use client";

import { Book, PlayCircle, Search, Video, FileText, CheckCircle2, XCircle, ChevronRight, Library, ArrowRight } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

// Reusable Scroll Reveal Component for smooth animations
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right' | 'scale' }> = ({ children, delay = 0, direction = 'up' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const baseClasses = "transition-all duration-1000 ease-out will-change-transform";
  const directionClasses = {
    up: isVisible ? "opacity-100 translate-y-0 scale-100 blur-none" : "opacity-0 translate-y-12 scale-95 blur-[2px]",
    left: isVisible ? "opacity-100 translate-x-0 blur-none" : "opacity-0 -translate-x-12 blur-[2px]",
    right: isVisible ? "opacity-100 translate-x-0 blur-none" : "opacity-0 translate-x-12 blur-[2px]",
    scale: isVisible ? "opacity-100 scale-100 blur-none" : "opacity-0 scale-90 blur-[4px]",
  };

  return (
    <div ref={ref} className={`${baseClasses} ${directionClasses[direction]}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

// Demo Data
const BOOKS = [
  { id: 1, title: 'The Principia: Mathematical Principles of Natural Philosophy', author: 'Isaac Newton', category: 'Science', available: true, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop' },
  { id: 2, title: 'Introduction to Algorithms, 4th Edition', author: 'Thomas H. Cormen', category: 'Technology', available: false, image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop' },
  { id: 3, title: 'A People\'s History of the World', author: 'Chris Harman', category: 'History', available: true, image: 'https://images.unsplash.com/photo-1589998059171-98e9fac7a7af?q=80&w=600&auto=format&fit=crop' },
  { id: 4, title: 'The Wealth of Nations', author: 'Adam Smith', category: 'Economics', available: true, image: 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?q=80&w=600&auto=format&fit=crop' },
  { id: 5, title: 'The Art of Computer Programming', author: 'Donald E. Knuth', category: 'Technology', available: false, image: 'https://images.unsplash.com/photo-1555662100-609b4fb7121c?q=80&w=600&auto=format&fit=crop' },
  { id: 6, title: 'Principles of Neural Science', author: 'Eric R. Kandel', category: 'Medicine', available: true, image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=600&auto=format&fit=crop' },
];

export const LibraryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = BOOKS.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen font-sans selection:bg-[#D97706] selection:text-white">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-[#17100B]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity scale-105 animate-[ken-burns_20s_ease-out_forwards]"
          style={{ backgroundImage: 'url(/modern_library.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#17100B]/80 via-transparent to-[#FAF8F5]" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center mt-12">
          <Reveal direction="scale">
            <div className="w-12 h-12 bg-[#17100B] border border-[#D97706] rounded-full flex items-center justify-center mb-8 mx-auto">
              <Library className="w-5 h-5 text-[#D97706]" />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-5xl md:text-7xl font-serif font-black text-white tracking-tight uppercase leading-[0.9] mb-6 drop-shadow-2xl">
              The Grand <br className="hidden md:block" /> Athenaeum
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-sm md:text-base text-[#A39171] font-medium max-w-2xl mx-auto tracking-widest uppercase leading-relaxed">
              Explore our vast collection of academic resources, rare manuscripts, and state-of-the-art digital archives.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-32">
        
        {/* Sleek Floating Search Bar */}
        <Reveal delay={300} direction="up">
          <div className="bg-white p-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-[#E5D7BE] flex flex-col md:flex-row mb-24 max-w-4xl mx-auto rounded-[2px]">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-6 w-5 h-5 text-[#A39171]" />
              <input
                type="text"
                placeholder="Search catalog by title, author, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-transparent outline-none text-[#261A12] font-medium text-lg placeholder:text-[#A89885]"
              />
            </div>
            <button className="bg-[#261A12] text-[#D97706] px-10 py-5 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#17100B] hover:text-[#F59E0B] transition-colors shrink-0">
              Search Catalog
            </button>
          </div>
        </Reveal>

        {/* Featured Collections Grid */}
        <Reveal>
          <div className="flex items-center justify-between mb-12 border-b border-[#E5D7BE] pb-6">
            <h2 className="text-xl md:text-2xl font-black uppercase text-[#261A12] tracking-[0.1em] flex items-center gap-4">
              <span className="w-8 h-px bg-[#D97706]"></span>
              Featured Collections
            </h2>
            <button className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#855D1E] hover:text-[#D97706] transition-colors group">
              View All Archives <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16 mb-32">
          {filteredBooks.map((book, idx) => (
            <Reveal key={book.id} delay={idx * 100} direction="up">
              <div className="group cursor-pointer flex flex-col h-full">
                {/* Book Cover Container */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#EBE3D5] mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                  <div className="absolute inset-0 bg-[#17100B]/10 group-hover:bg-transparent transition-colors z-10" />
                  <img 
                    src={book.image} 
                    alt={book.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                  {/* Availability Badge Floating on Image */}
                  <div className="absolute top-4 right-4 z-20">
                    {book.available ? (
                      <span className="bg-white/90 backdrop-blur-sm text-[#059669] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 rounded-[2px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse"></span> Available
                      </span>
                    ) : (
                      <span className="bg-white/90 backdrop-blur-sm text-[#DC2626] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 rounded-[2px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span> Checked Out
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Book Details */}
                <div className="flex flex-col flex-1">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#D97706] mb-3">
                    {book.category}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#261A12] leading-snug mb-2 group-hover:text-[#D97706] transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-[#855D1E] font-medium tracking-wide mt-auto">
                    {book.author}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
          {filteredBooks.length === 0 && (
            <div className="col-span-full py-24 text-center text-[#855D1E] font-serif text-xl">
              No manuscripts found matching your inquiry.
            </div>
          )}
        </div>

        {/* Media & Journals Section - Horizontal Layout */}
        <Reveal direction="up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Feature */}
            <div className="bg-[#17100B] text-white p-8 md:p-12 shadow-2xl relative overflow-hidden group cursor-pointer flex flex-col justify-end min-h-[400px]">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:scale-105 group-hover:opacity-50 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17100B] via-[#17100B]/50 to-transparent" />
              
              <div className="relative z-10 flex flex-col items-start text-left">
                <div className="w-16 h-16 bg-[#D97706] flex items-center justify-center rounded-full mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <PlayCircle className="w-8 h-8 text-[#17100B]" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D97706] mb-3">
                  Campus Media
                </div>
                <h3 className="font-serif font-black text-3xl md:text-4xl mb-3 leading-none">The Athenaeum Tour</h3>
                <p className="text-[#A39171] font-medium tracking-wider text-sm max-w-md leading-relaxed">
                  Take a guided virtual walkthrough of the newly renovated East Wing and digital archives.
                </p>
              </div>
            </div>

            {/* Latest Journals/Docs */}
            <div className="bg-white border border-[#E5D7BE] p-8 md:p-12 shadow-xl flex flex-col">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D97706] mb-3 flex items-center gap-3">
                <FileText className="w-4 h-4" /> Recent Publications
              </div>
              <h3 className="font-serif font-black text-3xl text-[#261A12] mb-8 leading-none">Academic Journals</h3>
              
              <ul className="space-y-0 flex-1 flex flex-col justify-center">
                {[
                  { title: "Global Economics Quarterly - Vol 42", date: "SEP 2026", author: "Dept. of Economics" },
                  { title: "Journal of Applied AI in Education", date: "AUG 2026", author: "College of Technology" },
                  { title: "Historical Perspectives: 20th Century", date: "JUL 2026", author: "Dept. of History" },
                  { title: "Franciscan Review of Liberal Arts", date: "JUN 2026", author: "College of Arts" },
                ].map((pub, i) => (
                  <li key={i} className="group cursor-pointer border-b border-[#EBE3D5] last:border-0 py-5 flex items-center justify-between">
                    <div>
                      <h4 className="text-base text-[#261A12] font-bold group-hover:text-[#D97706] transition-colors mb-1">
                        {pub.title}
                      </h4>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#A89885]">
                        {pub.author}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black tracking-widest text-[#855D1E]">
                      <span className="hidden sm:inline">{pub.date}</span>
                      <ChevronRight className="w-4 h-4 text-[#D97706] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </li>
                ))}
              </ul>
              
              <button className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#261A12] hover:text-[#D97706] transition-colors group self-start">
                Browse Full Catalog <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </Reveal>
        
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
      `}} />
    </div>
  );
};
