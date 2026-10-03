"use client";

import { ArrowRight, BookOpen, CheckCircle2, Globe, GraduationCap, MapPin, Users, Compass, Library, Calendar, Award, ChevronRight, ChevronLeft, PlayCircle, Clock, ShieldCheck, Microscope, HeartPulse, Church, Cpu, X, Sparkles, Star, Hammer, Mail, Phone } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { APP_CONFIG } from '../../config/app.config';
import { CAMPUS_GALLERY_PHOTOS } from '../../data/mockData';
import { CampusMapAndArchive } from './CampusMapAndArchive';

// Reusable Scroll Reveal Component for section-wide animations
const Reveal: React.FC<{ children: React.ReactNode, delay?: number }> = ({ children, delay = 0 }) => {
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

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] transform w-full ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const PROJECTS_DATA = [
  { 
    title: "Science Laboratory", 
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800", 
    status: "Phase 1 - Under Construction", 
    icon: Microscope, 
    desc: "State-of-the-art facilities for hands-on scientific exploration and research.",
    expect: "A fully immersive learning environment with cutting-edge equipment that bridges the gap between theory and real-world application.",
    services: ["Bio-Tech Stations", "Chemical Fume Hoods", "Interactive Smart Boards", "Dedicated Research Bays"],
    comingSoon: "Advanced VR Dissection Modules and 3D printing lab.",
    gallery: ["https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=400", "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=400"]
  },
  { 
    title: "Elementary Library", 
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800", 
    status: "70% Complete", 
    icon: Library, 
    desc: "A vibrant space dedicated to fostering a love for reading among our youngest learners.",
    expect: "A cozy, colorful, and engaging environment that feels like a second home to our young readers, complete with interactive storytelling zones.",
    services: ["Audiobook Stations", "Interactive Storytelling Tree", "Soft Reading Nooks", "Extensive Picture Book Collection"],
    comingSoon: "AR-enabled reading corners that bring stories to life.",
    gallery: ["https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=400", "https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=400"]
  },
  { 
    title: "JHS & SHS Library", 
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800", 
    status: "Planning Phase", 
    icon: BookOpen, 
    desc: "Comprehensive academic resources and quiet study zones for junior and senior high students.",
    expect: "A mature, university-style research center designed for deep focus and collaborative group work.",
    services: ["Quiet Study Pods", "Collaborative Meeting Rooms", "Digital Research Terminals", "Extensive Journal Archives"],
    comingSoon: "24/7 digital resource access and thesis archiving system.",
    gallery: ["https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=400", "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=400"]
  },
  { 
    title: "School Clinic", 
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800", 
    status: "Finishing Touches", 
    icon: HeartPulse, 
    desc: "Modern health facilities ensuring the well-being and safety of our entire student body.",
    expect: "A sterile, welcoming, and fully equipped medical facility staffed by certified healthcare professionals.",
    services: ["First Aid & Trauma Care", "Isolation Rooms", "Mental Health Counseling", "Regular Health Screenings"],
    comingSoon: "Tele-medicine consultations and integrated student health records.",
    gallery: ["https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=400", "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=400"]
  },
  { 
    title: "Chapel", 
    image: "https://images.unsplash.com/photo-1548625361-ec8590bfcfb7?q=80&w=800", 
    status: "Foundation Laid", 
    icon: Church, 
    desc: "A serene spiritual center for prayer, reflection, and community worship.",
    expect: "A breathtaking architectural masterpiece designed to elevate the spirit and provide a sanctuary for quiet reflection.",
    services: ["Daily Mass", "Confessional Services", "Spiritual Direction Rooms", "Choir Balcony"],
    comingSoon: "Stained glass installation and custom pipe organ.",
    gallery: ["https://images.unsplash.com/photo-1514896856000-91cb6de818e0?q=80&w=400", "https://images.unsplash.com/photo-1522079237617-ce2220b22a01?q=80&w=400"]
  },
  { 
    title: "Digital Innovations", 
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800", 
    status: "Equipment Staging", 
    icon: Cpu, 
    desc: "Next-generation tech hubs equipped with the latest tools for digital learning.",
    expect: "A futuristic playground for coders, designers, and innovators to push the boundaries of technology.",
    services: ["AI Workstations", "Robotics Arena", "Esports Training Facility", "Media Production Studio"],
    comingSoon: "Holographic displays and motion-capture studio.",
    gallery: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400", "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400"]
  }
];

const TABLE_OF_CONTENTS = [
  { id: 'about', label: 'Vision' },
  { id: 'legacy', label: 'History' },
  { id: 'campus-life', label: 'Campus Life' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'academics', label: 'Academics' },
  { id: 'projects', label: 'Projects' },
  { id: 'visit-us', label: 'Connect' }
];

interface LandingPageProps {
  onBegin: () => void;
  onViewCalendar?: () => void;
  onViewAcademics?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onBegin, onViewCalendar, onViewAcademics }) => {
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visionSlide, setVisionSlide] = useState(0);
  const [activeQuote, setActiveQuote] = useState(0);
  const [legacySlide, setLegacySlide] = useState(0);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeTocSection, setActiveTocSection] = useState<string>('');
  const mapScrollRef = useRef<HTMLDivElement>(null);

  const legacyBgSlides = [
    "/legacy-bg-2.jpg",
    "/legacy-bg-1.jpg",
    "/legacy-bg-3.jpg"
  ];

  const guidingQuotes: { title: string; image: string; text?: string; bullets?: string[] }[] = [
    {
      title: "The Core Values",
      bullets: [
        "Studiositas – great love for education",
        "Minoritas – humble service to all God’s creation",
        "Fraternitas – respect for human dignity and life",
        "Oratio et Devotio – moral and spiritual integration"
      ],
      image: "/carousel-1.jpg"
    },
    {
      title: "The Mission",
      text: "To provide a transformative Catholic education that empowers students to achieve academic excellence, moral integrity, and a lifelong commitment to serving others.",
      image: "/student-group-1.jpg"
    },
    {
      title: "The Vision",
      text: "As Catholic-Franciscan missionary school, St. Francis College envisions to be a living witness to the Gospel values of Jesus Christ rooted in the love of God, oneness with whole creation and service to the society in the spirit of justice and peace in journey towards God’s Kingdom.",
      image: "/carousel-3.jpg"
    },
    {
      title: "Objectives and Goals",
      bullets: [
        "To foster a vibrant Catholic-Franciscan academic community where student formation is deeply anchored in Gospel Values, explicitly integrating DepEd's intensified peace education and a culture of truth, freedom, justice, peace, and love.",
        "To evangelize through a modern, contextualized catechetical curriculum that bridges theory and practice, ensuring alignment with current basic education curriculum standards while preserving distinct faith formation.",
        "To develop high intellectual competence and 21st-century skills while fostering a profound appreciation for the historical and cultural heritage of the Samareños and the Filipino nation, keeping learning responsive to local and global realities.",
        "To transmit a Christ-centered Franciscan value system that promotes human dignity, children's rights, and a positive, safe learning environment free from abuse, alongside a dedicated stewardship for the integrity of creation.",
        "To form nationalistic, job-ready, and resilient citizens who live an active Catholic Christian life, emerging as dedicated leaders committed to the proactive transformation of society.",
        "To guide the school community as an active agent of human development by adhering to PEAC Standards-Based Quality Assurance across instruction, continuous school improvement, and sustainable community extension programs."
      ],
      image: "/carousel-4.jpg"
    }
  ];

  const heroSlides = [
    "/school-bg-2.jpg"
  ];

  const visionSlides = [
    "/st-francis-prayer.jpg"
  ];

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setVisionSlide((prev) => (prev + 1) % visionSlides.length);
      setLegacySlide((prev) => (prev + 1) % legacyBgSlides.length);
    }, 4000); // 4 seconds per slide
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveQuote((prev) => (prev < guidingQuotes.length - 1 ? prev + 1 : 0));
    }, 7000);
    return () => clearInterval(timer);
  }, [activeQuote, guidingQuotes.length]);

  // Interactive Map Carousel Auto-Scroll Effect
  useEffect(() => {
    let scrollDirection = 1;
    
    const carouselInterval = setInterval(() => {
      if (mapScrollRef.current) {
        const container = mapScrollRef.current;
        // Pause auto-scroll if the user is hovering over the carousel wrapper
        if (container.parentElement?.matches(':hover') || container.matches(':hover')) return;

        const maxScroll = container.scrollWidth - container.clientWidth;
        const currentScroll = container.scrollLeft;

        // Determine if we hit boundaries (with a small 10px buffer)
        if (currentScroll >= maxScroll - 10) {
          scrollDirection = -1; // Reverse to left
        } else if (currentScroll <= 10) {
          scrollDirection = 1; // Forward to right
        }

        // Scroll smoothly by approximately one card width + gap
        container.scrollBy({ left: 500 * scrollDirection, behavior: 'smooth' });
      }
    }, 3500); // Trigger every 3.5 seconds

    return () => clearInterval(carouselInterval);
  }, []);

  // Table of Contents active section tracker
  useEffect(() => {
    const handleScroll = () => {
      const aboutEl = document.getElementById('about');
      // Hide the TOC entirely if we haven't scrolled down to the 'about' section
      if (aboutEl && window.scrollY < aboutEl.offsetTop - window.innerHeight / 2) {
        setActiveTocSection('');
        return;
      }

      let current = '';
      const scrollPos = window.scrollY + window.innerHeight / 3;
      
      TABLE_OF_CONTENTS.forEach(item => {
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPos) {
          current = item.id;
        }
      });
      
      setActiveTocSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[#FAF6EE] overflow-x-hidden relative">
      
      {/* Floating Table of Contents */}
      <div 
        className={`fixed left-8 top-1/2 -translate-y-1/2 z-[100] flex-col gap-5 transition-all duration-700 hidden xl:flex ${
          activeTocSection ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'
        }`}
      >
        {TABLE_OF_CONTENTS.map((item) => {
          const isActive = activeTocSection === item.id;
          return (
            <div 
              key={item.id} 
              onClick={() => scrollToSection(item.id)}
              className="group flex items-center cursor-pointer relative w-48 h-6"
            >
              <div className={`absolute left-0 w-2 h-2 rounded-full transition-all duration-500 ease-out ${isActive ? 'bg-[#D97706] scale-150 shadow-[0_0_10px_rgba(217,119,6,0.5)]' : 'bg-[#8C7A68]/40 group-hover:bg-[#D97706]/70 group-hover:scale-125'}`} />
              <span className={`absolute left-6 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ease-out origin-left ${isActive ? 'text-[#D97706] opacity-100 translate-x-1' : 'text-[#8C7A68] opacity-0 group-hover:opacity-100 translate-x-0'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Immersive Cinematic Hero Section */}
      <section className="relative w-full h-[calc(100vh-96px)] flex items-center justify-center overflow-hidden">

        {/* Cinematic Image Carousel */}
        <div className={`absolute inset-0 w-full h-full z-0 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-all duration-[2000ms] ease-in-out origin-center ${currentSlide === index
                ? 'opacity-100 scale-105 z-0'
                : 'opacity-0 scale-100 z-[-1]'
                }`}
            >
              <img
                src={slide}
                alt={`Campus Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Rich Architectural Overlays for Contrast & Blending */}
        {/* 1. Deep overall tint to ensure text readability */}
        <div className="absolute inset-0 bg-[#1C0E07]/60 z-10" />

        {/* 2. Top-down gradient for the header blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C0E07]/90 via-transparent to-transparent z-10" />

        {/* 3. Bottom-up gradient to blend seamlessly into the beige next section */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF6EE] via-[#FAF6EE]/10 to-transparent z-10" />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center mt-[-3rem]">
          <div className={`transition-all duration-1000 delay-300 transform flex flex-col items-center ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>

            {/* Elegant Logo Container */}
            <div className="w-32 h-32 md:w-40 md:h-40 p-1.5 md:p-2 bg-[#FFFDF7]/10 backdrop-blur-sm rounded-full border border-[#FFFDF7]/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-center mb-8 relative group overflow-hidden">
              <div className="absolute inset-0 rounded-full border border-[#D97706]/40 scale-105 group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
              <img
                src="/logo.jpg"
                alt="St. Francis College Logo"
                className="w-full h-full object-cover rounded-full bg-white drop-shadow-md"
              />
            </div>

            {/* Subtle Academic Year Badge */}
            <div className="flex items-center gap-4 mb-8">
              <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#D97706]/70"></span>
              <div className="flex items-center gap-2 text-[#D97706] text-[10px] font-bold uppercase tracking-[0.3em]">
                <GraduationCap className="w-4 h-4" />
                <span>Est. 1948 <span className="mx-1 opacity-50">•</span> AY {APP_CONFIG.school.academicYear}</span>
              </div>
              <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#D97706]/70"></span>
            </div>
          </div>

          <h1 className={`text-5xl md:text-7xl lg:text-[6rem] font-display font-medium text-[#FFFDF7] tracking-wider uppercase leading-[1] mb-6 transition-all duration-1000 delay-500 transform drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            Franciscan Education <br />
            <span className="text-[#D97706] drop-shadow-[0_2px_15px_rgba(217,119,6,0.3)]">In Motion</span>
          </h1>

          <p className={`text-base md:text-xl font-serif text-[#EBE3D5] max-w-3xl mx-auto mb-12 tracking-wide leading-relaxed transition-all duration-1000 delay-700 transform drop-shadow-lg ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            {APP_CONFIG.school.tagline}. Shaping global leaders for over a century through rigorous academics and character formation.
          </p>

          <button
            onClick={() => scrollToSection('legacy')}
            className={`group relative overflow-hidden bg-[#D97706] hover:bg-[#F59E0B] border border-[#F59E0B]/50 text-white py-5 px-8 sm:px-12 text-sm md:text-base font-bold uppercase tracking-[0.25em] transition-all duration-500 delay-1000 transform flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(217,119,6,0.5)] hover:shadow-[0_0_60px_rgba(245,158,11,0.8)] hover:scale-105 rounded-sm ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <span className="relative z-10 font-sans drop-shadow-md">Discover Our Heritage</span>
            <ArrowRight className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-2" />
          </button>
        </div>
      </section>

      {/* Spiritual Formation - Franciscan Novena */}
      <section id="spiritual-formation" className="py-24 md:py-32 bg-[#FAF6EE] relative border-y border-[#D5CFC4]">
        <Reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 md:mb-24">
              <h3 className="text-xs md:text-sm font-bold text-[#D97706] uppercase tracking-[0.25em] mb-4 flex items-center justify-center gap-4">
                <span className="w-8 h-px bg-[#D97706]"></span>
                Franciscan Heritage
                <span className="w-8 h-px bg-[#D97706]"></span>
              </h3>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-[#2E2016]">Novena to St. Francis of Assisi</h2>
              <p className="text-[#54483C] max-w-2xl mx-auto mt-6 text-lg font-medium leading-relaxed">
                Daily reflections to guide our community in living totally as followers of Jesus, rooted in peace, love, and care for creation.
              </p>
            </div>

          </div>
        </Reveal>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-100% / 3)); }
          }
          .animate-scroll-left {
            animation: scroll-left 60s linear infinite;
          }
          .animate-scroll-left:hover {
            animation-play-state: paused;
          }
        `}} />

        <div className="w-full overflow-hidden mt-16 relative">
          <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#FAF6EE] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#FAF6EE] to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-8 md:gap-12 w-max animate-scroll-left px-4 md:px-6">
            {[...Array(3)].map((_, groupIdx) => (
              <React.Fragment key={groupIdx}>
                {[
                  { img: "/novena-1.jpg", alt: "Novena Day Reflection" },
                  { img: "/novena-2.jpg", alt: "Novena Day Reflection" },
                  { img: "/novena-3.jpg", alt: "Novena Day Reflection" },
                  { img: "/novena-4.jpg", alt: "Padre Pio Day Reflection" },
                  { img: "/novena-5.jpg", alt: "Padre Pio Day Reflection" },
                  { img: "/novena-6.jpg", alt: "Padre Pio Day Reflection" },
                  { img: "/novena-7.jpg", alt: "Padre Pio Day Reflection" },
                  { img: "/novena-8.jpg", alt: "Padre Pio Day Reflection" }
                ].map((item, idx) => (
                  <div key={`${groupIdx}-${idx}`} className="w-[300px] sm:w-[450px] md:w-[550px] lg:w-[700px] shrink-0 bg-white border-4 md:border-8 border-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] cursor-pointer group">
                    <div className="relative w-full aspect-square overflow-hidden border border-[#E5D7BE]">
                      <img 
                        src={item.img} 
                        alt={item.alt} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]" 
                      />
                      <div className="absolute inset-0 bg-[#D97706]/0 group-hover:bg-[#D97706]/10 transition-colors duration-500 mix-blend-multiply" />
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Vision & Mission */}
      <section id="about" className="py-24 md:py-32 bg-[#1C0E07] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-[#2E2016] z-0 hidden lg:block" />
        <Reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col-reverse lg:flex-row items-center">
            
            {/* Left Content (Overlapping) */}
            <div className="w-full lg:w-5/12 relative z-20 mt-[-10%] lg:mt-0 lg:pr-0">
              <div className="bg-[#FAF6EE] p-10 md:p-14 border border-[#D5CFC4] shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative lg:-mr-16">
                <div className="absolute top-0 left-0 w-1.5 h-16 bg-[#D97706]" />
                
                <h3 className="text-[10px] md:text-xs font-bold text-[#8C7A68] uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                  <Church className="w-4 h-4 text-[#D97706]" />
                  Spiritual Reflection
                </h3>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-black text-[#2E2016] tracking-tight leading-[1.05] mb-8">
                  St. Francis's Prayer <br />Before the Crucifix
                </h2>
                
                <p className="text-base text-[#54483C] leading-relaxed mb-6 font-medium italic">
                  Most High and Glorious God, enlighten the darkness of my mind and inflame the inner recesses of my heart. Give me a right faith, a firm hope and a perfect charity.
                </p>
                
                <p className="text-sm text-[#8C7A68] leading-relaxed mb-10 italic">
                  Let me have the right feelings and knowledge for the task You give me in truth. Help me to know You, O Lord, in order that I may always and in all things act according to Your most holy and perfect Will. Amen.
                </p>
                
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#E5D7BE]">
                  <div>
                    <span className="block text-3xl md:text-4xl font-serif font-medium text-[#2E2016] mb-1">40+</span>
                    <span className="text-[9px] uppercase tracking-widest text-[#D97706] font-bold">Nationalities</span>
                  </div>
                  <div>
                    <span className="block text-3xl md:text-4xl font-serif font-medium text-[#2E2016] mb-1">100%</span>
                    <span className="text-[9px] uppercase tracking-widest text-[#D97706] font-bold">Acceptance</span>
                  </div>
                  <div>
                    <span className="block text-3xl md:text-4xl font-serif font-medium text-[#2E2016] mb-1">1:8</span>
                    <span className="text-[9px] uppercase tracking-widest text-[#D97706] font-bold">Faculty Ratio</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="w-full lg:w-7/12 relative z-10">
              <div className="relative w-full aspect-square lg:aspect-[3/2] overflow-hidden border border-[#D5CFC4] bg-[#1C0E07]">
                <img
                  src="/st-francis-prayer.jpg"
                  alt="St. Francis's Prayer Before the Crucifix"
                  className="absolute inset-0 w-full h-full object-cover grayscale-[0.15]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2E2016]/50 via-transparent to-transparent z-20 pointer-events-none" />
              </div>
              
              {/* Abstract Architectural Details */}
              <div className="absolute -bottom-8 -right-8 w-48 h-48 border border-[#D97706]/40 hidden lg:block pointer-events-none" />
              <div className="absolute -bottom-4 -right-4 w-48 h-48 border border-[#D97706]/40 hidden lg:block pointer-events-none" />
            </div>
            
          </div>
        </Reveal>
      </section>

      {/* Guiding Principles / Editorial Section */}
      <section className="relative w-full min-h-[85vh] bg-white text-[#2E2016] flex flex-col items-center justify-center py-24 px-4 md:px-8 overflow-hidden">

        <div className="relative z-10 w-full max-w-[1600px] px-4 lg:px-8 mx-auto flex flex-col items-center">

          {/* Header */}
          <Reveal>
            <div className="text-center mb-16 flex flex-col items-center">
              <h3 className="text-[10px] md:text-xs tracking-[0.3em] text-[#D97706] uppercase mb-4 font-sans flex items-center gap-4">
                <span className="w-12 h-[1px] bg-[#D97706]" /> GUIDING PRINCIPLES <span className="w-12 h-[1px] bg-[#D97706]" />
              </h3>
              <h2 className="text-3xl md:text-5xl font-serif text-[#2E2016] font-medium tracking-tight">
                Foundation of Our Heritage
              </h2>
            </div>
          </Reveal>

          {/* Asymmetric Editorial Magazine Layout */}
          <div className="w-full flex flex-col lg:flex-row shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden mt-8 border border-white/5">

            {/* Left: Photographic Canvas */}
            <div className="w-full lg:w-[60%] h-[500px] lg:h-[750px] relative bg-[#1A120C]">
              {guidingQuotes.map((quote, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${activeQuote === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <img
                    src={quote.image}
                    alt={quote.title}
                    className="w-full h-full object-cover sepia-[.1] brightness-[0.8] contrast-[1.1] transition-transform duration-[8000ms] ease-linear"
                    style={{ transform: activeQuote === idx ? 'scale(1.05)' : 'scale(1)' }}
                  />
                  {/* Subtle gradient overlay to merge into right column */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1A120C]/10 via-transparent to-[#1A120C]/60 z-20 pointer-events-none" />
                </div>
              ))}
              <div className="absolute bottom-6 left-6 z-30 text-[150px] leading-[0.8] text-white/10 font-serif pointer-events-none">
                0{activeQuote + 1}
              </div>
            </div>

            {/* Right: Editorial Content & Navigation */}
            <div className="w-full lg:w-[40%] h-auto lg:h-[750px] bg-[#FAF6EE] p-8 md:p-14 lg:p-16 xl:p-20 flex flex-col justify-between relative border-l-8 border-[#D97706]">
              {/* Subtle Pattern Texture */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2E2016 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

              {/* Top: Active Content Display */}
              <div className="relative z-10 w-full flex-1">
                {guidingQuotes.map((quote, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 flex flex-col transition-all duration-700 ease-in-out ${activeQuote === idx ? 'opacity-100 translate-y-0 z-10 pointer-events-auto' : 'opacity-0 translate-y-8 z-0 pointer-events-none'}`}
                  >
                    <div className="flex-shrink-0">
                      <h3 className="text-[10px] md:text-xs font-bold text-[#D97706] uppercase tracking-[0.3em] mb-4">
                        Principle 0{idx + 1}
                      </h3>
                      <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#2E2016] tracking-tight mb-8">
                        {quote.title}
                      </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 text-[#54483C] leading-relaxed">
                      {quote.text && (
                        <p className="text-lg md:text-xl font-serif leading-relaxed text-[#2E2016] italic">
                          "{quote.text}"
                        </p>
                      )}
                      {quote.bullets && (
                        <ul className="flex flex-col gap-5 mt-4">
                          {quote.bullets.map((b, i) => (
                            <li key={i} className="flex items-start gap-4 text-base font-serif text-[#54483C] leading-relaxed">
                              <span className="text-[#D97706] text-xs mt-1.5 font-bold">/</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom: Interactive Index */}
              <div className="relative z-10 mt-12 pt-8 border-t border-[#D5CFC4]">
                <h4 className="text-[10px] font-bold tracking-[0.3em] text-[#A89885] uppercase mb-6">
                  Select Principle
                </h4>
                <div className="flex flex-col gap-4">
                  {guidingQuotes.map((navQuote, navIdx) => (
                    <button
                      key={navIdx}
                      onClick={() => setActiveQuote(navIdx)}
                      className="group flex flex-col items-start w-full focus:outline-none"
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <div className="flex items-center gap-4">
                          <span className={`text-[10px] md:text-xs font-serif transition-colors duration-300 ${activeQuote === navIdx ? 'text-[#D97706]' : 'text-[#A89885] group-hover:text-[#54483C]'}`}>
                            0{navIdx + 1}
                          </span>
                          <span className={`text-xs md:text-sm uppercase tracking-[0.2em] transition-all duration-300 ${activeQuote === navIdx ? 'text-[#2E2016] font-bold' : 'text-[#A89885] group-hover:text-[#54483C]'}`}>
                            {navQuote.title}
                          </span>
                        </div>
                        {activeQuote === navIdx && (
                          <div className="w-1.5 h-1.5 rotate-45 bg-[#D97706]" />
                        )}
                      </div>
                      <div className="w-full h-[1px] bg-[#EBE3D5] relative overflow-hidden">
                        <div className={`absolute top-0 left-0 h-full bg-[#D97706] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${activeQuote === navIdx ? 'w-full' : 'w-0 group-hover:w-1/4'}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Aesthetic Section Divider */}
      <div className="w-full bg-white flex justify-center items-center py-8 pb-16">
        <div className="flex items-center gap-4 md:gap-6 opacity-40">
          <div className="w-24 md:w-64 h-[1px] bg-gradient-to-r from-transparent to-[#D97706]" />
          <div className="w-1.5 h-1.5 rotate-45 border border-[#D97706]" />
          <div className="w-2.5 h-2.5 rotate-45 bg-[#D97706]" />
          <div className="w-1.5 h-1.5 rotate-45 border border-[#D97706]" />
          <div className="w-24 md:w-64 h-[1px] bg-gradient-to-l from-transparent to-[#D97706]" />
        </div>
      </div>

      {/* History & Identity Section */}
      <section id="legacy" className="relative py-24 md:py-32 px-4 bg-[#241A14]">
        <div className="w-full max-w-[1600px] px-4 lg:px-8 mx-auto flex flex-col items-center">

          {/* Section Header */}
          <Reveal>
            <div className="text-center mb-16 flex flex-col items-center">
              <h3 className="text-xs md:text-sm tracking-[0.3em] text-[#D97706] uppercase mb-4 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-[#D97706]" /> OUR LEGACY <span className="w-12 h-[1px] bg-[#D97706]" />
              </h3>
              <h2 className="text-3xl md:text-5xl font-serif text-[#FFFDF7] font-medium tracking-tight">
                A Brief History of St. Francis College
              </h2>
            </div>
          </Reveal>

          {/* Cinematic Background Frame */}
          <div className="w-full h-[500px] md:h-[600px] lg:h-[750px] border border-[#D97706]/30 shadow-2xl bg-[#1A120C] overflow-hidden relative group rounded-sm z-0">
            {legacyBgSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${legacySlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img
                  src={slide}
                  alt="Legacy Background"
                  className="w-full h-full object-cover sepia-[.2] brightness-[0.75] contrast-[1.1] transition-transform duration-[8000ms] ease-linear"
                  style={{ transform: legacySlide === idx ? 'scale(1.05)' : 'scale(1)' }}
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A120C]/90 via-[#1A120C]/20 to-transparent z-20" />
            <div className="absolute bottom-6 left-6 text-6xl md:text-8xl text-[#F59E0B]/20 font-serif z-20 pointer-events-none">1948</div>
          </div>

          {/* Side-by-Side Text Content */}
          <div className="relative z-30 w-full px-4 md:px-8 lg:px-12 xl:px-24 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 -mt-32 md:-mt-48 xl:-mt-64">

            {/* Left Column: Our Legacy */}
            <Reveal>
              <div className="w-full h-full lg:h-[700px] bg-[#FAF6EE] p-8 md:p-14 lg:p-16 xl:p-20 shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-t-8 border-[#F59E0B] relative rounded-sm flex flex-col">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 text-8xl text-[#F59E0B]/10 font-serif z-0 pointer-events-none">1948</div>

                <div className="relative z-10 flex-shrink-0">
                  <h3 className="text-xs md:text-sm font-bold text-[#D97706] uppercase tracking-[0.25em] mb-4">Our Legacy</h3>
                  <h2 className="text-3xl md:text-5xl font-serif font-medium text-[#2E2016] tracking-tight mb-6">
                    A Brief History of St. Francis College
                  </h2>
                  <div className="w-16 h-1 bg-[#D97706] mb-8" />
                </div>

                <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-6 text-[#54483C] leading-relaxed font-medium text-lg text-justify space-y-6">
                  <p><span className="text-5xl font-serif text-[#D97706] float-left mr-3 leading-[0.8] mt-2">O</span>n the tip of Northern Samar lies the Municipality of Allen, the gateway town for travelers crossing from Luzon to the Visayas and Mindanao. When Capul Island ended its galleon-shipping role after the Philippine Revolution of 1898, Allen became the favored point of entry for businessmen, travelers, and missionaries bound for the islands to the south.</p>

                  <p>In 1948, as the nation rebuilt from the havoc of the Second World War, Mr. Juan Portes, Sr. and Dr. Rosalina Portes founded St. James Academy of Allen to provide secondary education for the whole Balicuatro area. The school rose on Church parish property beside the Parish Church of St. James the Greater, with only four classrooms, while the administration offices and library were housed in the home of Mr. Timoteo Esquillo across the street. Atty. Isabelo Ortego served as its first High School Principal.</p>

                  <p>College courses and the Elementary Department were opened in School-Year 1951–52, with Dr. Rosalina Portes heading the College and Caridad Pastorfide the Elementary. But in School-Year 1955–56 both departments had to close for lack of enrollees and financial constraints; only the High School survived. In November 1957, a great conflagration consumed much of central Allen, and the all-wooden St. James Academy was totally burned and destroyed. In the wake of this tragedy, the Portes couple offered the institution to the Bishop of the Diocese of Calbayog.</p>

                  <p>The school reopened in SY 1958–59 under a new Diocesan administration — Fr. Emilio Bernardo as Director, Fr. Anastacio Balite as Registrar, and Miss Salud Dubongco continuing as Principal — and a new building of six classrooms rose from the ashes under the construction of Mr. Alberto Bermejo. St. James Academy thus became the first Catholic school in the whole Balicuatro area.</p>

                  <p>By 1960, the Diocese of Calbayog experienced a shortage of priests, and Bishop Most Rev. Miguel Acebedo invited the American Franciscans to take over the school’s administration. In SY 1964–65, St. James Academy opened under the Franciscans, with Fr. Urban Planchinski, OFM as its first Director, appointed by the Regional Superior in Samar, Fr. Adalbert Kalenski, OFM. In November 1964, the Bishop turned over the legal rights, documents, and pertinent papers of the school to the friars as new owners and administrators, and the Board of Trustees changed the school’s name to St. Francis of Assisi High School — the incorporators, approved by the Securities and Exchange Commission, being Miss Laureana Dubungco, Miss Ida Royandoyan, Mr. Osmundo Bandal, Mr. Arnulfo Lim, and Fr. Urban Planchinski, OFM.</p>

                  <p>When Fr. Urban left for Manila in 1972, Filipino friars took the helm in line with the Government's Filipinization policy: Fr. Ramon Isaac, OFM (1972–73); Bro. Joseph Godelasao, OFM (1973–75); and Alphonse Ching, OFM (1976–80). Construction of the main building in Sabang II began in 1974 under Bro. Godelasao, funded by the American Franciscan Assumption Province, and Fr. Urban secured the five-hectare lot for the students and youth of the Balicuatro District with the help of the Dubongco, Gutay, and Suan families of Allen.</p>

                  <p>The Franciscan Apostolic Sisters — a local congregation founded by Fr. Gerardo Felipeto, OFM and based in Sta. Ana, Cagayan — accepted the friars' invitation in 1980 and administered SFAHS from SY 1980–81, with Sr. Adelina Aguaviva, FAS as its first Directress. Under the Sisters the school grew steadily: the Elementary Department opened in SY 1986–87, the school took its present name St. Francis College, and the Elementary Department was granted Government Recognition in 1990. The opening of the Bachelor of Elementary Education in SY 1990–91 elevated the school to tertiary level, joining the Bachelor of Arts (1987) and the two-year Associate in Computer Science (1986). The FAS Directresses who served faithfully — Sr. Adelina Aguaviva (1981–1992), Sr. Delia Brimon (1992–1993), Sr. Flordelina Espiritu (1993–1995), Sr. Nemesia Gabales (1995–1998), and Sr. Lolita Rodriguez (2001–2004) — built the school into an institution that honors the Municipality of Allen.</p>

                  <p>On March 30, 2004, during the school’s 17th College graduation rites, the Franciscan friars of the Philippine Province of San Pedro Bautista formally took back the administration through Provincial Minister Rev. Fr. Arturo Daquilanea, OFM. On May 2, 2004, Fr. Rodrigo P. San Jose, OFM received the school’s legal papers and financial records from the last FAS Directress, Sr. Delia C. Brimon, FAS. Christ the King College of Calbayog City initially supervised the school’s academic affairs while SFC personnel pursued graduate studies. The Directors who followed were: Bro. Pablo Cui, OFM (2005–2007); Fr. Edgardo Alutaya (2007–2010); Fr. Felix Jungco, OFM (2010–2013); Fr. Rey Canonoy, OFM (2013–2016); Fr. Jovito Malinao, OFM (2016–2019); Fr. Allan Arcebuche, OFM (2019–2022); Fr. Noniel Pe, OFM (2022–2023); Fr. Prisco Cajes, OFM (2023–2024); Fr. Dan Solayao, OFM (2024–2026); and Fr. Neil J. Badillo (2026–).</p>

                  <div className="font-serif italic text-xl text-[#2E2016] mt-8 p-6 md:p-8 bg-[#F8F6F2] border-l-4 border-[#D97706] shadow-inner">
                    Today, St. Francis College of Allen is a Catholic-Franciscan basic education institution offering elementary, junior high school, and senior high school education — a continuing witness to the vision of its founders and of the Poor Man of Assisi. As our worthy predecessors declared:
                    <br /><br />
                    <span className="font-bold text-[#D97706] uppercase tracking-widest text-lg not-italic">Go Forward SFC! Go Forward Allen!</span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right Column: Franciscan Identity */}
            <Reveal delay={200}>
              <div className="w-full h-full lg:h-[700px] bg-[#1A120C] text-[#FFFDF7] p-8 md:p-14 lg:p-16 xl:p-20 shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-t-8 border-[#D97706] relative rounded-sm flex flex-col">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 text-[120px] leading-none text-[#D97706]/10 font-serif z-0 pointer-events-none">Tau</div>

                <div className="relative z-10 flex-shrink-0">
                  <h3 className="text-xs md:text-sm font-bold text-[#F59E0B] uppercase tracking-[0.25em] mb-4">Our Roots</h3>
                  <h2 className="text-3xl md:text-5xl font-serif font-medium tracking-tight mb-6">
                    Our Franciscan Identity in Education
                  </h2>
                  <div className="w-16 h-1 bg-[#F59E0B] mb-8" />
                </div>

                <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-6 text-[#EBE3D5] leading-relaxed font-medium text-lg text-justify space-y-8">
                  <p>
                    The Church and the Franciscan Order see education as a basic and privileged way of spreading the Gospel, and as a necessary way to keep Christian thinking alive in a world of many cultures and beliefs. Franciscan schools carry out this mission in many different countries and cultures; in each one they work for the growth of the person and for the building of a society where liberty, equality, truth, justice, solidarity, and peace can be practiced — values lived the Franciscan way.
                  </p>
                  <p>
                    In this school, the student is the center of the Franciscan way of formation. Each student is encouraged to take the first step and to make the school's values his own, while the school walks with the student until he becomes the subject and leader of his own formation — guiding, not forcing. Franciscan education does not treat the student as an empty container to be filled with knowledge by the teacher, nor as an object to be shaped. The student is the active shaper of his own learning. It teaches the student to read and understand reality, to interpret it, and to act on it with a critical but constructive spirit — and it always asks whether the school is truly serving society, especially those who are poor in money, in family, in social standing, in culture, and in faith.
                  </p>
                </div>
              </div>
            </Reveal>

          </div>

        </div>
      </section>





      {/* Embedded Campus Map & Archive */}
      <section id="campus-map" className="bg-[#FAF6EE] pb-16">
        <Reveal>
          <CampusMapAndArchive />
        </Reveal>
      </section>

      {/* Media & Events Section */}
      <section id="campus-life" className="py-24 md:py-32 bg-[#1C0E07] relative overflow-hidden border-t border-[#332318]">
        <div className="absolute top-0 left-0 w-[30%] h-full bg-[#2E2016] z-0 hidden lg:block border-r border-[#4A3525]" />
        <Reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Section Header */}
            <div className="text-center mb-16 md:mb-20">
              <h3 className="text-[10px] md:text-xs font-bold text-[#D97706] uppercase tracking-[0.3em] mb-4">Spotlight & Updates</h3>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-white tracking-tight">Campus Life</h2>
            </div>

            <div className="flex flex-col lg:flex-row items-center">
            
            {/* Main Video Area (Overlapping) */}
            <div className="w-full lg:w-7/12 relative z-20 mt-[-5%] lg:mt-0 lg:pl-0 order-2 lg:order-1 mt-12 lg:mt-0">
              <div className="relative w-full aspect-video bg-[#1C0E07] border border-[#D5CFC4] shadow-[0_30px_60px_rgba(0,0,0,0.15)] group cursor-pointer overflow-hidden lg:-ml-12">
                <img
                  src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1200&auto=format&fit=crop"
                  alt="Campus Video Thumbnail"
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-[2s] ease-out"
                />
                <div className="absolute inset-0 bg-[#2E2016]/40 group-hover:bg-[#2E2016]/20 transition-colors duration-500 flex items-center justify-center">
                  <div className="w-20 h-20 bg-[#F59E0B]/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_40px_rgba(245,158,11,0.6)]">
                    <PlayCircle className="w-10 h-10 text-white ml-1" />
                  </div>
                </div>
                {/* Architectural Decor */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-white/30 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-white/30 pointer-events-none" />
              </div>
            </div>

            {/* Upcoming Events Sidebar (Split) */}
            <div className="w-full lg:w-5/12 relative z-10 order-1 lg:order-2">
              <div className="bg-[#FAF6EE] p-10 md:p-12 lg:p-16 border border-[#D5CFC4] shadow-[0_30px_60px_rgba(0,0,0,0.2)] lg:-ml-8 lg:mt-16">
                <h3 className="text-[10px] md:text-xs font-bold text-[#8C7A68] uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#D97706]" />
                  Calendar
                </h3>
                <h2 className="text-4xl md:text-5xl font-serif font-black text-[#2E2016] tracking-tight mb-10 leading-[1.1]">
                  Upcoming Events
                </h2>

                <div className="space-y-6">
                  {[
                    { date: "Oct 15", title: "Fall Open House & Campus Tour", time: "9:00 AM - 2:00 PM" },
                    { date: "Oct 22", title: "Distinguished Alumni Lecture", time: "6:30 PM - 8:30 PM" },
                    { date: "Nov 05", title: "International Student Mixer", time: "4:00 PM - 7:00 PM" },
                  ].map((event, idx) => (
                    <div key={idx} className="group flex gap-6 p-5 border border-[#EBE7E0] hover:border-[#D97706] hover:bg-[#FAF6EE] transition-colors cursor-pointer bg-white">
                      <div className="flex flex-col items-center justify-center w-16 h-16 bg-[#2E2016] text-white shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest">{event.date.split(' ')[0]}</span>
                        <span className="text-2xl font-serif leading-none mt-1">{event.date.split(' ')[1]}</span>
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-bold text-[#2E2016] leading-tight mb-2 group-hover:text-[#D97706] transition-colors">{event.title}</h4>
                        <p className="text-[10px] uppercase tracking-widest text-[#8C7A68] flex items-center gap-2 font-bold">
                          <Clock className="w-3 h-3 text-[#D97706]" /> {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onViewCalendar}
                  className="mt-10 group flex items-center gap-3 text-[#2E2016] font-bold uppercase tracking-widest text-[10px] border-b-2 border-[#D97706] pb-2 hover:text-[#D97706] transition-colors"
                >
                  View Full Calendar
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            </div>
          </div>
        </Reveal>
      </section>

      {/* Leadership / Directors Section */}
      <section id="leadership" className="py-24 md:py-32 px-4 bg-[#FAF6EE]">
        <Reveal>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 md:mb-24">
              <h3 className="text-xs md:text-sm font-bold text-[#D97706] uppercase tracking-[0.25em] mb-4">Leadership</h3>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#2E2016] tracking-tight">Meet the Administrators</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  name: "Fr. Neil J. Badillo, OFM, S.Th.D.",
                  role: "School Director",
                  img: "/director-1.jpg",
                  bio: "A theologian and administrator at heart, he earned his Licentiate and Doctorate in Theology from the Instituto Teológico de Murcia (ITM) in Spain and the Pontificia Università Antonianum (PUA) in Rome, respectively. From 2019 to 2026, he served as a professor, Director, and Dean of Studies at the St. Alphonsus Theological Mission Institute in Davao City."
                },
                {
                  name: "Ms. Fermina G. Villanobos",
                  role: "School Principal",
                  img: "/principal-villanobos.png",
                  bio: "With an impressive 44-year legacy in public education, she has served as a classroom teacher (16 years), Teacher-in-Charge (4 years), Head Teacher (2 years), Principal (3 years), and District Supervisor (19 years). She now brings this vast expertise and dedication to our community here at SFC."
                },
                {
                  name: "Fr. Jaymar C. Escoltor, OFM, MA (Pastoral Ministry)",
                  role: "Finance Officer",
                  img: "/director-2.jpg",
                  bio: "An ordained Franciscan friar originally from Escalante, Negros Occidental, he earned his Master of Arts in Pastoral Ministry from Ateneo de Davao University, in consortium with St. Alphonsus Theological Mission Institute. Though an agriculturist by profession, he beautifully exemplifies the Franciscan charism of service through simplicity, humility, and joy."
                }
              ].map((leader, idx) => (
                <div key={idx} className="group relative overflow-hidden bg-white shadow-xl cursor-pointer flex flex-col h-full border border-[#EBE3D5]">
                  <div className="relative overflow-hidden w-full aspect-[4/5]">
                    <img
                      src={leader.img}
                      alt={leader.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#17100B]/80 via-transparent to-transparent opacity-80" />

                    {/* Hover Overlay Info */}
                    <div className="absolute inset-0 bg-[#17100B]/95 p-6 sm:p-8 flex flex-col justify-center translate-y-[101%] group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 border border-[#D97706]/30 mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#D97706] rounded-full" />
                      </div>
                      <h4 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">{leader.name}</h4>
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#D97706] mb-4 sm:mb-6">{leader.role}</p>
                      <p className="text-xs sm:text-sm text-[#D5CFC4] leading-relaxed font-sans border-t border-[#332318] pt-4 sm:pt-6">
                        {leader.bio}
                      </p>
                    </div>
                  </div>

                  {/* Default State Bottom Bar */}
                  <div className="p-5 sm:p-6 bg-white border-t border-[#D97706]/20 relative z-10 group-hover:bg-[#FAF8F5] transition-colors">
                    <h4 className="text-lg sm:text-xl font-serif font-bold text-[#17100B] mb-1">{leader.name}</h4>
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#D97706]">{leader.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Academics & Programs */}
      <section id="academics" className="py-24 md:py-32 px-4 bg-[#1C120B] text-white relative border-y border-[#332318]">
        {/* Subtle grid pattern background removed as per user request */}
        
        <Reveal>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-[#332318] pb-10">
              <div>
                <h3 className="text-[10px] font-black text-[#D97706] uppercase tracking-[0.3em] mb-4 flex items-center gap-4">
                  <span className="w-8 h-[2px] bg-[#D97706]"></span> Academic Excellence
                </h3>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-black tracking-tight text-[#FFFDF7] leading-[0.9]">
                  Strands &<br />Programs
                </h2>
              </div>
              
              <button
                onClick={onViewAcademics}
                className="mt-8 md:mt-0 group flex items-center gap-3 text-[#D5CFC4] font-bold uppercase tracking-widest text-[10px] border-b-2 border-[#D97706] pb-2 hover:text-[#D97706] transition-colors"
              >
                View Full Curriculum
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-[#332318] bg-[#120B07] shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
              {[
                {
                  icon: Compass,
                  title: "Pre-School & Kindergarten",
                  desc: "A nurturing environment that fosters early cognitive development, social skills, and foundational values through play-based and guided learning.",
                  img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop"
                },
                {
                  icon: Users,
                  title: "Elementary",
                  subtitle: "Grades 1–6",
                  desc: "Building a strong academic core while emphasizing character formation, critical thinking, and collaborative discovery.",
                  img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop"
                },
                {
                  icon: Globe,
                  title: "Junior High",
                  subtitle: "Grades 7–10",
                  desc: "A robust curriculum preparing students for complex challenges, developing holistic leaders with a global perspective.",
                  img: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600&auto=format&fit=crop"
                },
                {
                  icon: GraduationCap,
                  title: "Senior High",
                  subtitle: "Grades 11–12",
                  desc: "Rigorous preparation for university excellence and career readiness with specialized tracks.",
                  img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop"
                }
              ].map((program, idx) => (
                <div 
                  key={idx} 
                  onClick={onViewAcademics}
                  className={`group relative h-[450px] md:h-[550px] lg:h-[650px] overflow-hidden border-[#332318] cursor-pointer ${idx !== 3 ? 'border-b md:border-b-0 md:border-r' : ''}`}
                >
                  <img src={program.img} alt={program.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-[2s] ease-[cubic-bezier(0.25,1,0.5,1)]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120B07] via-[#120B07]/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-4xl font-serif text-white font-black group-hover:text-[#D97706]/30 transition-colors">0{idx + 1}</span>
                      <div className="bg-[#120B07]/80 backdrop-blur-sm w-12 h-12 border border-[#332318] flex items-center justify-center group-hover:border-[#D97706] group-hover:bg-[#D97706] transition-colors">
                        <program.icon className="w-5 h-5 text-[#D97706] group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-2xl lg:text-3xl font-serif font-black tracking-tight mb-2 text-[#FFFDF7] group-hover:text-[#D97706] transition-colors leading-[1.1]">{program.title}</h4>
                      {program.subtitle && (
                        <div className="text-[9px] uppercase tracking-[0.2em] text-[#D97706] font-bold mb-4">{program.subtitle}</div>
                      )}
                      
                      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                        <div className="overflow-hidden">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200 border-t border-[#332318] pt-4 mt-2">
                            <p className="text-[#A89885] leading-relaxed font-sans text-xs">{program.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Campus Life / Facilities (Library) */}
      <section id="library" className="py-24 md:py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[40%] h-full bg-[#EBE7E0] z-0 hidden lg:block" />
        <Reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center">
            
            {/* Right Content (Overlapping) - Swapped for variety */}
            <div className="w-full lg:w-5/12 relative z-20 lg:pl-0 order-2 lg:order-2 mt-12 lg:mt-0">
              <div className="bg-[#FAF6EE] p-10 md:p-14 border border-[#D5CFC4] shadow-[0_30px_60px_rgba(0,0,0,0.08)] relative lg:-ml-16">
                <div className="absolute top-0 right-0 w-1.5 h-16 bg-[#D97706]" />
                
                <h3 className="text-[10px] md:text-xs font-bold text-[#8C7A68] uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                  <Library className="w-4 h-4 text-[#D97706]" />
                  State-of-the-Art Facilities
                </h3>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-[#2E2016] tracking-tight leading-[1.05] mb-8">
                  The Grand <br />Athenaeum
                </h2>
                
                <p className="text-base text-[#54483C] leading-relaxed mb-6 font-medium">
                  Our newly renovated, multi-level library houses over 500,000 physical volumes and provides access to millions of digital journals worldwide.
                </p>
                
                <p className="text-sm text-[#8C7A68] leading-relaxed mb-10">
                  Featuring quiet study halls, collaborative tech-pods, and a rare manuscripts archive, it is the intellectual heart of the campus where students spend hours delving into research and group projects.
                </p>
                
                <button
                  className="group flex items-center gap-3 text-[#2E2016] font-bold uppercase tracking-widest text-[10px] border-b-2 border-[#D97706] pb-2 hover:text-[#D97706] transition-colors"
                  onClick={() => {
                    const headerBtns = Array.from(document.querySelectorAll('button'));
                    const headerBtn = headerBtns.find(el => el.textContent?.includes('Library'));
                    if (headerBtn) (headerBtn as HTMLElement).click();
                  }}
                >
                  Explore The Library
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Left Image (Tall Portrait) */}
            <div className="w-full lg:w-7/12 relative z-10 order-1 lg:order-1">
              <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] overflow-hidden border-8 border-white shadow-[0_30px_60px_rgba(0,0,0,0.15)] bg-[#1C0E07]">
                <img
                  src="/modern_library.jpg"
                  alt="Grand Library"
                  className="absolute inset-0 w-full h-full object-cover grayscale-[0.25] transition-all duration-[2s] ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-105 hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2E2016]/50 via-transparent to-transparent z-20 pointer-events-none" />
              </div>
              
              {/* Abstract Architectural Details */}
              <div className="absolute -bottom-8 -left-8 w-48 h-48 border border-[#D97706]/40 hidden lg:block pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-48 h-48 border border-[#D97706]/40 hidden lg:block pointer-events-none" />
            </div>

          </div>
        </Reveal>
      </section>


      {/* Support Us / Giving Section */}
      <section id="support" className="relative py-24 md:py-32 overflow-hidden bg-[#1C0E07]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600" 
            alt="Support St. Francis" 
            className="w-full h-full object-cover opacity-20 grayscale mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C0E07] via-[#1C0E07]/80 to-transparent" />
        </div>
        
        <Reveal>
          <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
            <h3 className="text-xs md:text-sm font-bold text-[#D97706] uppercase tracking-[0.3em] mb-6 flex items-center justify-center gap-4">
              <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#D97706]/70"></span>
              Join Our Mission
              <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#D97706]/70"></span>
            </h3>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-[#FFFDF7] tracking-tight mb-8">
              Support St. Francis College
            </h2>
            <p className="text-[#C4B59D] max-w-2xl mx-auto text-lg leading-relaxed font-light mb-12">
              Your generosity fuels our ongoing projects, provides vital scholarships, and ensures the continuation of our century-long legacy of holistic and integrative education. Partner with us to shape the leaders of tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => window.open('/banking-details', '_blank')}
                className="w-full sm:w-auto bg-[#D97706] hover:bg-[#F59E0B] text-white py-4 px-10 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_30px_rgba(217,119,6,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] rounded-sm"
              >
                Donations
              </button>
            </div>

            {/* Certificate of Appreciation Highlight */}
            <div className="mt-24 max-w-4xl mx-auto relative group perspective-[2000px]">
              {/* Decorative Glow */}
              <div className="absolute inset-0 bg-[#D97706]/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-[#D97706]/20 transition-all duration-1000" />
              
              <div className="relative bg-[#FAF6EE] text-[#2E2016] p-10 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-[#EBE7E0] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] transform sm:rotate-x-6 sm:-rotate-y-3 hover:rotate-x-0 hover:rotate-y-0 text-center rounded-sm group-hover:-translate-y-4">
                
                {/* Logo & Header */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full border-4 border-[#FAF6EE] flex items-center justify-center p-1 shadow-xl z-10 transition-transform duration-700 group-hover:scale-110">
                  <img src="/logo.jpg" alt="SFC Logo" className="w-full h-full object-cover rounded-full" />
                </div>
                
                <h4 className="text-[11px] md:text-xs font-serif font-bold uppercase tracking-[0.3em] text-[#54483C] mt-4">Saint Francis College</h4>
                <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#8C7A68] mb-8">Allen, Northern Samar</p>
                
                <h3 className="text-xl md:text-2xl font-serif font-bold text-[#D97706] mb-4 tracking-wide">CERTIFICATE OF APPRECIATION OF ACCEPTANCE</h3>
                
                <p className="text-xs md:text-sm text-[#54483C] mb-6 italic font-serif">This certificate is proudly presented to</p>
                
                <h2 className="text-2xl md:text-3xl font-serif font-black text-[#2E2016] mb-8 border-b border-[#D97706]/30 pb-4 inline-block px-8 md:px-16 tracking-tight">ALUMNI BATCH 1987</h2>
                
                {/* Body Text */}
                <div className="text-xs md:text-sm text-[#54483C] leading-relaxed italic font-serif text-justify space-y-5 mb-12 max-w-2xl mx-auto">
                  <p>in profound recognition and grateful acceptance of their generous partnership in the <strong className="font-bold text-[#2E2016]">Adopt a Classroom Program</strong> of Saint Francis College. Through this noble act, they have offered a beautiful expression of gratitude to Almighty God through our beloved Alma Mater. By adopting a classroom, they have embraced the responsibility of physically improving its structures and providing technological innovations, transforming it into an excellent environment for learning. As Saint Francis College celebrates over eight decades of dedicated service, this timely assistance deeply touches the institution.</p>
                  
                  <p>Given this <strong className="font-bold text-[#2E2016]">4th day of October, 2026</strong>, during the Feast of Saint Francis of Assisi and on the occasion of the school's <strong className="font-bold text-[#2E2016]">87th Founding Anniversary</strong>.</p>
                </div>
                
                {/* Prayer */}
                <h4 className="text-sm font-bold text-[#D97706] tracking-[0.2em] uppercase mb-4">+ PRAYER OF BLESSING +</h4>
                <p className="text-[11px] md:text-xs text-[#54483C] leading-relaxed italic font-serif text-justify mb-16 max-w-2xl mx-auto">
                  Heavenly Father, Lord of goodness and grace, we thank You on this 87th Founding Anniversary of Saint Francis College for the generosity of ALUMNI BATCH 1987. Through the Adopt a Classroom Program, they have beautifully uplifted our Alma Mater with physical improvements and technological innovation. Lord, bless their family abundantly, protect their health, and prosper their hands; though physical structures fade, may their kindness remain forever engraved deep within the heart of SFC. Guided by Saint Francis of Assisi, keep us all as instruments of Your peace, through Christ our Lord. Amen.
                </p>
                
                {/* Signatures */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end text-center md:text-left max-w-2xl mx-auto gap-8 md:gap-0">
                  <div className="flex flex-col items-center md:items-start">
                    <div className="border-b border-[#2E2016] pb-2 mb-2 px-4 md:px-0 md:pr-12">
                      <span className="font-bold text-[#2E2016] text-[11px] md:text-xs uppercase">(SGD) FR. NEIL J. BADILLO, OFM</span>
                    </div>
                    <p className="text-[10px] text-[#8C7A68] uppercase tracking-wider font-sans">Director</p>
                  </div>
                  <div className="flex flex-col items-center md:items-start">
                    <div className="border-b border-[#2E2016] pb-2 mb-2 px-4 md:px-0 md:pr-12">
                      <span className="font-bold text-[#2E2016] text-[11px] md:text-xs uppercase">(SGD) FR. JAYMAR ESCOLTOR, OFM</span>
                    </div>
                    <p className="text-[10px] text-[#8C7A68] uppercase tracking-wider font-sans">Finance Officer</p>
                  </div>
                </div>
                
              </div>
            </div>

          </div>
        </Reveal>
      </section>

      {/* Interactive Map / Development Trail */}
      <section id="projects" className="py-24 md:py-32 bg-[#FAF6EE] relative overflow-hidden border-b border-[#EBE7E0]">
        
        <style>{`
          @keyframes strike {
            0% { transform: rotate(0deg); }
            30% { transform: rotate(-45deg); }
            50% { transform: rotate(45deg); }
            70% { transform: rotate(10deg); }
            100% { transform: rotate(0deg); }
          }
          .animate-hammer {
            animation: strike 1.5s infinite ease-out;
            transform-origin: bottom right;
          }
        `}</style>

        {/* Subtle Map / Topography Background */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23d97706\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }} />

        <Reveal>
          <div className="w-full relative z-10">
            <div className="text-center mb-16 md:mb-20 px-4">
              <h3 className="text-xs font-bold text-[#D97706] uppercase tracking-[0.4em] mb-4 flex items-center justify-center gap-4">
                <span className="w-16 h-[1px] bg-[#D97706]" /> DEVELOPMENT JOURNEY <span className="w-16 h-[1px] bg-[#D97706]" />
              </h3>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-black text-[#2E2016] tracking-tight flex items-center justify-center">
                On Going Projects
              </h2>
            </div>
            {/* Carousel Wrapper */}
            <div className="relative group/carousel">
              
              {/* Carousel Navigation Buttons */}
              <button 
                onClick={() => mapScrollRef.current?.scrollBy({ left: -600, behavior: 'smooth' })}
                className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-16 md:h-16 bg-[#FAF6EE] rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.1)] border-2 border-[#D97706] text-[#D97706] opacity-0 group-hover/carousel:opacity-100 hover:scale-110 hover:bg-[#D97706] hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
              </button>
              
              <button 
                onClick={() => mapScrollRef.current?.scrollBy({ left: 600, behavior: 'smooth' })}
                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-16 md:h-16 bg-[#FAF6EE] rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.1)] border-2 border-[#D97706] text-[#D97706] opacity-0 group-hover/carousel:opacity-100 hover:scale-110 hover:bg-[#D97706] hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </button>

              {/* Horizontal Scrolling Container */}
              <div ref={mapScrollRef} className="w-full overflow-x-auto overflow-y-hidden pb-24 pt-12 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="relative flex items-center w-max mx-auto px-8 md:px-24 h-[700px] md:h-[800px]">
                
                {/* The Horizontal Trail Line */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#D97706]/40 to-transparent border-t-2 border-dashed border-[#D97706]/50" />

                <div className="flex gap-12 md:gap-24">
                  {PROJECTS_DATA.map((project, idx) => {
                    const isTop = idx % 2 === 0;
                    const rotations = ['rotate-[-2deg]', 'rotate-[3deg]', 'rotate-[-1.5deg]', 'rotate-[2deg]', 'rotate-[-3deg]', 'rotate-[1.5deg]'];
                    const rotation = rotations[idx % rotations.length];
                    
                    return (
                      <div 
                        key={idx} 
                        className="relative w-[320px] md:w-[400px] h-full flex flex-col justify-center snap-center group"
                      >
                        {/* The Node on the Trail */}
                        <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-white border-4 border-[#FAF6EE] outline outline-2 outline-[#D97706] rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-20 shadow-[0_0_20px_rgba(217,119,6,0.4)] group-hover:bg-[#D97706] group-hover:outline-[#2E2016] transition-all duration-500">
                           <project.icon className="w-5 h-5 text-[#D97706] group-hover:text-white transition-colors" />
                        </div>

                        {/* Card Positioning Wrapper */}
                        <div className={`w-full absolute left-0 right-0 flex flex-col ${isTop ? 'bottom-1/2 mb-12 md:mb-16' : 'top-1/2 mt-12 md:mt-16'}`}>
                          
                          {/* Connecting Vertical Line */}
                          <div className={`absolute left-1/2 w-[2px] border-l-2 border-dashed border-[#D97706]/50 -z-10 -translate-x-1/2 ${isTop ? 'top-full h-12 md:h-16' : 'bottom-full h-12 md:h-16'}`} />

                          {/* The Card (Stamp/Polaroid Design) */}
                          <div 
                            onClick={() => setSelectedProject(project)}
                            className={`bg-[#FAF9F6] rounded-sm p-4 md:p-6 shadow-[0_15px_35px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_rgba(217,119,6,0.2)] transition-all duration-500 cursor-pointer relative ${rotation} hover:rotate-0 hover:-translate-y-2`}
                          >
                            {/* The Metal Pin */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-[#EBE7E0] to-[#8C7A68] shadow-md border border-[#54483C] z-20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-white to-[#EBE7E0] shadow-inner" />
                            </div>

                            {/* Folded Status Ribbon */}
                            <div className="absolute -right-2 top-6 bg-[#D97706] text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest shadow-md z-30 before:content-[''] before:absolute before:top-full before:right-0 before:border-[4px] before:border-transparent before:border-t-[#9c5300] before:border-l-[#9c5300]">
                              {project.status}
                            </div>

                            {/* Map Style Image Container (Polaroid look) */}
                            <div className="w-full h-48 rounded-sm overflow-hidden mb-4 relative border border-[#EBE7E0] bg-white p-2 pb-6">
                              <div className="w-full h-full relative overflow-hidden bg-[#2E2016]">
                                <img 
                                  src={project.image} 
                                  alt={project.title} 
                                  className="w-full h-full object-cover filter sepia-[0.3] saturate-[0.7] group-hover:sepia-0 group-hover:saturate-100 group-hover:scale-110 transition-all duration-700 ease-out" 
                                />
                              </div>
                              <div className="absolute bottom-1 left-0 right-0 text-center">
                                <span className="font-serif text-[9px] text-[#8C7A68] italic tracking-widest uppercase">Target Area</span>
                              </div>
                            </div>

                            <div className="px-1">
                              <h4 className="text-2xl md:text-2xl font-serif font-black text-[#2E2016] mb-2 group-hover:text-[#D97706] transition-colors pr-6">{project.title}</h4>
                              <p className="text-[#54483C] text-xs leading-relaxed mb-4 font-serif italic line-clamp-3">{project.desc}</p>
                              
                              <div className="flex items-center text-[#D97706] text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] border-t border-dashed border-[#D97706]/30 pt-3">
                                <span>Accept Quest</span>
                                <div className="w-5 h-5 rounded-full bg-[#D97706]/10 flex items-center justify-center ml-2 group-hover:bg-[#D97706] group-hover:text-white transition-colors">
                                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                  
                  {/* Trail End Node */}
                  <div className="relative flex items-center justify-center pl-8 md:pl-16">
                     <div className="absolute h-[2px] w-12 md:w-24 border-t-2 border-dashed border-[#D97706]/50 right-full" />
                     <div className="w-4 h-4 bg-[#D97706] rounded-full shadow-[0_0_15px_rgba(217,119,6,0.6)] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Visit Us */}
      <section id="visit-us" className="py-24 md:py-32 bg-[#FAF9F6] relative border-b border-[#EBE7E0]">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-[#F5F2EB] hidden lg:block border-l border-[#EBE7E0]" />
        
        <Reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
              
              {/* Left Column: Contact & Location */}
              <div className="flex-1 lg:py-10">
                <h3 className="text-[10px] md:text-xs font-bold text-[#D97706] uppercase tracking-[0.3em] mb-4 flex items-center gap-4">
                  <span className="w-8 h-[1px] bg-[#D97706]" /> GET IN TOUCH
                </h3>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-[#2E2016] tracking-tight mb-10">
                  Visit Us
                </h2>
                
                <p className="text-[#8C7A68] text-lg leading-relaxed max-w-lg mb-12">
                  We welcome you to visit our campus, connect with our community, and discover the St. Francis College difference in person.
                </p>

                <div className="space-y-8">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-full bg-[#EBE7E0] flex items-center justify-center flex-shrink-0 text-[#2E2016]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2E2016] uppercase tracking-widest text-[11px] mb-2">Campus Location</h4>
                      <p className="text-[#54483C] text-sm md:text-base leading-relaxed">
                        Campus Heights, Maharlika Highway<br />
                        Allen, Northern Samar, 6405<br />
                        Philippines
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-full bg-[#EBE7E0] flex items-center justify-center flex-shrink-0 text-[#2E2016]">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2E2016] uppercase tracking-widest text-[11px] mb-2">General Inquiries</h4>
                      <a href="mailto:info@stfrancisallen.edu.ph" className="text-[#D97706] hover:text-[#2E2016] font-medium transition-colors">
                        info@stfrancisallen.edu.ph
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-full bg-[#EBE7E0] flex items-center justify-center flex-shrink-0 text-[#2E2016]">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2E2016] uppercase tracking-widest text-[11px] mb-2">Contact Numbers</h4>
                      <p className="text-[#54483C] font-medium">+63 (055) 555-1234</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <button 
                    onClick={() => document.getElementById('campus-map')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center gap-3 bg-[#2E2016] hover:bg-[#D97706] text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors rounded-sm"
                  >
                    View Campus Map
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Affiliations & Socials */}
              <div className="w-full lg:w-[45%] flex flex-col justify-center">
                <div className="bg-white p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-[#EBE7E0] rounded-xl relative">
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#FAF9F6] border border-[#EBE7E0] rounded-full z-0 pointer-events-none" />
                  
                  <h3 className="relative z-10 text-2xl font-serif font-black text-[#2E2016] mb-8">
                    Our Network & Affiliations
                  </h3>

                  <div className="relative z-10 flex flex-col gap-3">
                    {[
                      { title: "Official School Page", url: "https://www.facebook.com/profile.php?id=61551047840314", subtitle: "St. Francis School", profileImage: "/images/facebook/school-profile.png" },
                      { title: "Order of Friars Minor", url: "https://www.facebook.com/ofm.org/?rdid=2C8JcLGsIjel6WS0", subtitle: "OFM Global", profileImage: "/images/facebook/ofm-profile.png" },
                      { title: "Franciscan Missions", url: "https://www.facebook.com/franciscanmissions/?rdid=3MCEEqIHE4iAnFyV", subtitle: "Global Outreach", profileImage: "https://graph.facebook.com/franciscanmissions/picture?type=large" },
                      { title: "PEAC Official", url: "https://www.facebook.com/PEACOfficial/?rdid=3rAbsqJALjaGna46", subtitle: "Private Education Assistance", profileImage: "https://graph.facebook.com/PEACOfficial/picture?type=large" },
                      { title: "OFM South Philippines", url: "https://www.facebook.com/ofmsouthphil/?rdid=LnpmwHERHYQtyJe9", subtitle: "San Pedro Bautista Province", profileImage: "https://graph.facebook.com/ofmsouthphil/picture?type=large" },
                      { title: "CEAP Channel", url: "https://www.facebook.com/CEAPChannel/?rdid=2ogKfiW9dXmrfMbl", subtitle: "Catholic Educational Association", profileImage: "https://graph.facebook.com/CEAPChannel/picture?type=large" }
                    ].map((page, idx) => (
                      <a 
                        key={idx} 
                        href={page.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group flex items-center justify-between p-4 rounded-lg hover:bg-[#FAF9F6] border border-transparent hover:border-[#EBE7E0] transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#EBE7E0] group-hover:border-[#D97706] transition-colors flex-shrink-0 bg-white shadow-sm">
                            <img src={page.profileImage} alt={page.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#2E2016] text-sm md:text-base group-hover:text-[#D97706] transition-colors">{page.title}</h4>
                            <p className="text-[10px] md:text-xs text-[#8C7A68] uppercase tracking-wider font-bold mt-0.5">{page.subtitle}</p>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#EBE7E0] group-hover:bg-[#D97706] text-[#8C7A68] group-hover:text-white flex items-center justify-center transition-colors">
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </a>
                    ))}
                  </div>

                </div>
              </div>

            </div>
          </div>
        </Reveal>
      </section>

      {/* Campus Photo Album */}
      <section id="photo-album" className="py-24 md:py-32 bg-[#17100B] relative overflow-hidden border-t border-[#2C150B]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D97706] opacity-5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D97706] opacity-5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <Reveal>
          <div className="max-w-7xl mx-auto text-center mb-16 relative z-10 px-4">
            <h3 className="text-xs md:text-sm font-bold text-[#D97706] uppercase tracking-[0.3em] mb-6 flex items-center justify-center gap-4">
              <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#D97706]/50"></span>
              Campus Life
              <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#D97706]/50"></span>
            </h3>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#FFFDF7] tracking-tight mb-8">
              A Glimpse of St. Francis
            </h2>
            <p className="text-[#A89885] max-w-2xl mx-auto text-lg leading-relaxed font-light">
              Experience the vibrant spirit, rich traditions, and historic beauty of our campus through the lens of our community.
            </p>
          </div>
        </Reveal>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {CAMPUS_GALLERY_PHOTOS.map((photo, index) => (
              <Reveal key={photo.id} delay={(index % 4) * 100}>
                <div className="relative group overflow-hidden bg-[#1C0E07] border border-[#3A2216]/50 cursor-pointer break-inside-avoid shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full object-cover group-hover:scale-105 group-hover:brightness-110 transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                    <span className="inline-block bg-[#D97706] text-[#1C0E07] px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] mb-3">{photo.category}</span>
                    <h3 className="text-[#FFFDF7] font-serif text-xl md:text-2xl font-bold mb-1.5 leading-tight drop-shadow-md">{photo.title}</h3>
                    <p className="text-[#D97706] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {photo.location}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Project Expansion Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-[fadeIn_0.3s_ease-out]">
          <style>{`
            @keyframes fadeIn { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(12px); } }
            @keyframes scaleUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            .animate-modal-content { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #D97706; border-radius: 10px; }
          `}</style>
          
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#1A120A]/80 backdrop-blur-md cursor-pointer"
            onClick={() => setSelectedProject(null)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-5xl bg-[#FAF6EE] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-[80vh] animate-modal-content">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Left Image Side */}
            <div className="w-full md:w-2/5 h-64 md:h-full relative flex-shrink-0">
              <img 
                src={selectedProject.image} 
                alt={selectedProject.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C0E07] via-[#1C0E07]/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                 <div className="bg-[#D97706]/90 backdrop-blur-sm text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/20 inline-block mb-4 shadow-lg">
                    {selectedProject.status}
                  </div>
                 <h3 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">{selectedProject.title}</h3>
              </div>
            </div>

            {/* Right Content Side (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-[#FAF6EE]">
              
              <div className="mb-10">
                <h4 className="text-xs font-bold text-[#D97706] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" /> What to Expect
                </h4>
                <p className="text-[#54483C] text-[17px] leading-relaxed font-serif">{selectedProject.expect}</p>
              </div>

              <div className="mb-10">
                <h4 className="text-xs font-bold text-[#D97706] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Services to Offer
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedProject.services.map((service: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-[#EBE7E0] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-[#D97706] transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D97706] flex-shrink-0" />
                      <span className="text-[#2E2016] font-medium text-sm leading-tight">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-10 p-6 bg-[#2E2016] rounded-2xl text-white relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#D97706] rounded-full blur-3xl opacity-20" />
                <h4 className="text-xs font-bold text-[#D97706] uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                  <Sparkles className="w-4 h-4" /> Coming Soon
                </h4>
                <p className="text-white/90 text-sm leading-relaxed relative z-10">{selectedProject.comingSoon}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#D97706] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Microscope className="w-4 h-4" /> Construction Images
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedProject.gallery.map((img: string, i: number) => (
                    <div key={i} className="relative h-32 md:h-40 rounded-xl overflow-hidden bg-gray-200 group">
                      <img src={img} alt="Construction progress" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
