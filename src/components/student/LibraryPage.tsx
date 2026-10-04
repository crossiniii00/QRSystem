"use client";

import { Book, PlayCircle, Search, Video, FileText, CheckCircle2, XCircle, ChevronRight, Library, ArrowRight, ArrowLeft, Filter, Download } from 'lucide-react';
import React, { useState, useEffect, useRef, useMemo } from 'react';

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
  { id: 1, title: 'The Principia', author: 'Isaac Newton', category: 'Science', available: true, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop' },
  { id: 2, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Technology', available: false, image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=400&auto=format&fit=crop' },
  { id: 3, title: 'A People\'s History', author: 'Chris Harman', category: 'History', available: true, image: 'https://images.unsplash.com/photo-1589998059171-98e9fac7a7af?q=80&w=400&auto=format&fit=crop' },
  { id: 4, title: 'The Wealth of Nations', author: 'Adam Smith', category: 'Economics', available: true, image: 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?q=80&w=400&auto=format&fit=crop' },
  { id: 5, title: 'The Art of Computer Prog.', author: 'Donald E. Knuth', category: 'Technology', available: false, image: 'https://images.unsplash.com/photo-1555662100-609b4fb7121c?q=80&w=400&auto=format&fit=crop' },
  { id: 6, title: 'Principles of Neural Science', author: 'Eric R. Kandel', category: 'Medicine', available: true, image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=400&auto=format&fit=crop' },
  { id: 7, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Psychology', available: true, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop' },
  { id: 8, title: 'Clean Code', author: 'Robert C. Martin', category: 'Technology', available: true, image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=400&auto=format&fit=crop' },
  { id: 9, title: 'Sapiens: A Brief History', author: 'Yuval Noah Harari', category: 'History', available: false, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400&auto=format&fit=crop' },
  { id: 10, title: 'The Elements of Style', author: 'William Strunk Jr.', category: 'Literature', available: true, image: 'https://images.unsplash.com/photo-1456953180671-730de08edaa7?q=80&w=400&auto=format&fit=crop' },
];

export const LibraryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchives, setShowArchives] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'all' | 'available'>('all');

  const ALL_CATEGORIES = useMemo(() => Array.from(new Set(BOOKS.map(b => b.category))).sort(), []);

  const filteredBooks = BOOKS.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTopic = selectedTopics.length === 0 || selectedTopics.includes(b.category);
    const matchesAvailability = availability === 'all' || (availability === 'available' && b.available);

    return matchesSearch && matchesTopic && matchesAvailability;
  });

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
              Saint Francis <br className="hidden md:block" /> Library
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-sm md:text-lg text-[#EBE3D5] font-medium max-w-2xl mx-auto tracking-[0.15em] uppercase leading-relaxed drop-shadow-lg">
              Explore our vast collection of academic resources, rare manuscripts, and state-of-the-art digital archives.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-32">
        
        {/* Sleek Floating Search Bar */}
        <Reveal delay={300} direction="up">
          <div className="bg-[#FFFDF7]/95 backdrop-blur-xl p-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-[#D97706]/40 flex flex-col md:flex-row mb-24 max-w-4xl mx-auto relative group">
            <div className="absolute inset-0 border border-[#D97706]/10 scale-[1.02] -z-10 transition-transform duration-500 group-hover:scale-100" />
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-6 w-5 h-5 text-[#855D1E]" />
              <input
                type="text"
                placeholder="Search catalog by title, author, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-transparent outline-none text-[#1C0E07] font-bold text-lg placeholder:text-[#A89885] placeholder:font-medium"
              />
            </div>
            <button className="group/btn relative overflow-hidden bg-[#1C0E07] text-[#FFFDF7] px-10 py-5 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 shrink-0 border border-[#1C0E07]">
              <div className="absolute inset-0 w-full h-full bg-[#D97706] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.85,0,0.15,1)]" />
              <span className="relative z-10 flex items-center gap-2 group-hover/btn:text-[#1C0E07] transition-colors duration-300">
                Search Catalog <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </Reveal>

        {showArchives ? (
          <Reveal direction="up" delay={100}>
            <div className="bg-white border border-[#E5D7BE] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] mb-32">
              <div className="flex items-center justify-between border-b border-[#EBE3D5] pb-6 mb-8">
                <div>
                  <h2 className="font-serif font-black text-3xl md:text-4xl text-[#17100B] mb-2 uppercase tracking-tight">Full Digital Archives</h2>
                  <p className="text-[#855D1E] text-sm font-medium tracking-wider">Browsing all catalogued manuscripts, journals, and texts.</p>
                </div>
                <button 
                  onClick={() => setShowArchives(false)}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#17100B] hover:text-[#D97706] transition-colors border border-[#EBE3D5] hover:border-[#D97706] px-4 py-2 rounded-sm"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Featured
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className="w-full md:w-56 shrink-0 flex flex-col gap-8">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A89885] mb-5 flex items-center gap-2">
                      <Filter className="w-3 h-3" /> Filter By Topic
                    </h3>
                    <ul className="space-y-3">
                      {ALL_CATEGORIES.map(topic => (
                        <li 
                          key={topic} 
                          className="flex items-center gap-3 group cursor-pointer"
                          onClick={() => setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic])}
                        >
                          <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${selectedTopics.includes(topic) ? 'border-[#D97706] bg-[#D97706]' : 'border-[#EBE3D5] group-hover:border-[#D97706]'}`}>
                            {selectedTopics.includes(topic) && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm font-medium transition-colors ${selectedTopics.includes(topic) ? 'text-[#D97706]' : 'text-[#261A12] group-hover:text-[#D97706]'}`}>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A89885] mb-5">
                      Availability
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 group cursor-pointer" onClick={() => setAvailability('available')}>
                        <div className={`w-4 h-4 border rounded-full flex items-center justify-center transition-colors ${availability === 'available' ? 'border-[#D97706]' : 'border-[#EBE3D5] group-hover:border-[#D97706]'}`}>
                          {availability === 'available' && <div className="w-2 h-2 bg-[#D97706] rounded-full" />}
                        </div>
                        <span className={`text-sm font-medium transition-colors ${availability === 'available' ? 'text-[#D97706]' : 'text-[#261A12] group-hover:text-[#D97706]'}`}>Available Now</span>
                      </li>
                      <li className="flex items-center gap-3 group cursor-pointer" onClick={() => setAvailability('all')}>
                        <div className={`w-4 h-4 border rounded-full flex items-center justify-center transition-colors ${availability === 'all' ? 'border-[#D97706]' : 'border-[#EBE3D5] group-hover:border-[#D97706]'}`}>
                          {availability === 'all' && <div className="w-2 h-2 bg-[#D97706] rounded-full" />}
                        </div>
                        <span className={`text-sm font-medium transition-colors ${availability === 'all' ? 'text-[#D97706]' : 'text-[#261A12] group-hover:text-[#D97706]'}`}>Include Checked Out</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Main List */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBooks.map((book) => (
                    <div key={book.id} className="flex flex-col gap-4 p-5 bg-white hover:bg-[#FAF8F5] border border-[#EBE3D5] hover:border-[#D97706] transition-all group rounded-sm cursor-pointer relative shadow-sm hover:shadow-md">
                      <div className="w-full aspect-[3/4] shrink-0 bg-[#EBE3D5] border border-[#E5D7BE] overflow-hidden mb-2 relative">
                        <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        {book.available ? (
                          <div className="absolute top-2 right-2 bg-white text-[#059669] px-2 py-1 text-[8px] font-black uppercase tracking-widest border border-[#059669]/20 shadow-sm">
                            Available
                          </div>
                        ) : (
                          <div className="absolute top-2 right-2 bg-white text-[#DC2626] px-2 py-1 text-[8px] font-black uppercase tracking-widest border border-[#DC2626]/20 shadow-sm">
                            Checked Out
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-[#D97706] mb-1">
                          {book.category}
                        </div>
                        <h4 className="font-serif font-bold text-lg text-[#17100B] leading-tight mb-2 group-hover:text-[#D97706] transition-colors line-clamp-2">
                          {book.title}
                        </h4>
                        <p className="text-[11px] uppercase tracking-wider text-[#855D1E] font-medium mb-4 mt-auto">
                          {book.author}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2 pt-4 border-t border-[#EBE3D5]">
                          <button className="flex-1 text-[10px] font-bold uppercase tracking-wider bg-[#17100B] text-white hover:bg-[#D97706] transition-colors py-2 flex items-center justify-center gap-2">
                            <Book className="w-3 h-3" /> Request
                          </button>
                          <button className="text-[10px] font-bold uppercase tracking-wider border border-[#EBE3D5] text-[#261A12] hover:border-[#D97706] hover:text-[#D97706] transition-colors px-3 py-2 flex items-center justify-center">
                            <Download className="w-3 h-3" /> PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredBooks.length === 0 && (
                    <div className="py-24 text-center text-[#855D1E] font-serif text-lg border border-[#EBE3D5]">
                      No manuscripts found matching your inquiry.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        ) : (
          <>
            {/* Featured Collections Grid */}
            <Reveal>
              <div className="flex items-center justify-between mb-12 border-b border-[#E5D7BE] pb-6">
                <h2 className="text-xl md:text-2xl font-black uppercase text-[#261A12] tracking-[0.1em] flex items-center gap-4">
                  <span className="w-8 h-px bg-[#D97706]"></span>
                  Featured Collections
                </h2>
                <button 
                  onClick={() => setShowArchives(true)}
                  className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#855D1E] hover:text-[#D97706] transition-colors group"
                >
                  View All Archives <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 mb-32">
          {filteredBooks.map((book, idx) => (
            <Reveal key={book.id} delay={idx * 50} direction="up">
              <div className="group cursor-pointer flex flex-col h-full">
                {/* Book Cover Container */}
                <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#EBE3D5] mb-4 border border-[#E5D7BE] shadow-sm group-hover:shadow-md transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                  <img 
                    src={book.image} 
                    alt={book.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                  />
                  {/* Availability Badge Floating on Image */}
                  <div className="absolute top-2 right-2 z-20">
                    {book.available ? (
                      <span className="bg-white text-[#059669] px-2 py-1 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border border-[#059669]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span> Available
                      </span>
                    ) : (
                      <span className="bg-white text-[#DC2626] px-2 py-1 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border border-[#DC2626]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span> Out
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Book Details */}
                <div className="flex flex-col flex-1">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#D97706] mb-1.5">
                    {book.category}
                  </div>
                  <h3 className="text-[15px] font-serif font-bold text-[#17100B] leading-tight mb-1 group-hover:text-[#D97706] transition-colors line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-[#855D1E] font-medium tracking-wide mt-auto">
                    {book.author}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
          {filteredBooks.length === 0 && (
            <div className="col-span-full py-24 text-center text-[#855D1E] font-serif text-lg">
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
                <h3 className="font-serif font-black text-3xl md:text-4xl mb-3 leading-none">Saint Francis Library Tour</h3>
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
        
          </>
        )}
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
