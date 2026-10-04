import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Award } from 'lucide-react';

export const AlumniShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const graduates = [
    {
      name: "Atty. Haide T. Espuelas",
      role: "Batch ___",
      profession: "Director IV, Commission on Audit",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
      bio: "Serving as a Director IV at the Commission on Audit (COA), Atty. Espuelas embodies the Franciscan spirit of integrity and public service. In her distinguished legal career, she has managed crucial state audit divisions and collaborated globally with organizations like the World Bank to champion institutional transparency."
    },
    {
      name: "Judge Christian Ron C. Esponilla",
      role: "Batch ____",
      profession: "Presiding Judge, RTC Branch 8",
      img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
      bio: "Currently presiding over Branch 8 of the Regional Trial Court in Tacloban City, Judge Esponilla exemplifies the Franciscan ideal of justice and equity. From his foundational career as an Associate Solicitor at the Office of the Solicitor General to his work as a dedicated public prosecutor, he has spent his life ensuring fairness and the rule of law."
    },
    {
      name: "Judge Ricardo E. Amos",
      role: "Batch __",
      profession: "Executive Judge, RTC Branch 22",
      img: "/judge-amos.jpg",
      objectPosition: "object-[20%_top]",
      bio: "Serving as the Executive Judge of the Regional Trial Court (RTC) Branch 22 in Laoang, Judge Amos exemplifies the Franciscan dedication to truth, justice, and community peace. Throughout his distinguished judicial career, he has proven himself a steadfast defender of the rule of law and a guardian of judicial integrity in Northern Samar."
    },
    {
      name: "Dr. Ronald E. Cuyco",
      role: "Batch 1987",
      profession: "Cardiologist / Fmr PHA President",
      img: "/dr-cuyco.png",
      bio: "As a leading adult cardiologist and former National President of the Philippine Heart Association, Dr. Cuyco exemplifies the Franciscan mission of compassionate service and healing. Balancing a high-profile practice at the Philippine Heart Center with community clinics, he dedicates his life to combating cardiovascular disease."
    },
    {
      name: "Fr. Reu Jose C. Galoy, OFM, Ph.D.",
      role: "Batch ___",
      profession: "Vicar Provincial",
      img: "/galoy.jpg",
      bio: "Holding a Doctorate in Ministry from Chicago, he serves as the Vicar Provincial of the Franciscan Province of San Pedro Bautista. Throughout his priestly journey—from founding mission communities to leading major metropolitan parishes—he remains an inspiring model of faith and servant leadership for our global SFC family."
    }
,
    {
      name: "Judge Ruth Arlene Tan-Ching",
      role: "Batch ___",
      profession: "Judge / Fmr Public Prosecutor",
      img: "/judge-ching.png",
      bio: "Embodying the Franciscan commitment to truth, justice, and integrity, Hon. Tan-Ching has spent decades safeguarding the rule of law. From her extensive career as a steadfast Public Prosecutor to her eventual elevation to the bench, her legal career stands as a model of unwavering devotion to public service and community excellence."
    },
    {
      name: "Ms. Delfin",
      role: "Batch ___",
      profession: "Distinguished Alumna",
      img: "/delfin.png",
      bio: "Details for Ms. Delfin need to be updated. She stands as a stellar example of our alumni community's excellence and leadership."
    }
,
    {
      name: "Dr. Joseph Cary O. Tomada",
      role: "Batch ___",
      profession: "Internal Medicine",
      img: "/doc-tomada.png",
      bio: "As a dedicated physician specializing in Internal Medicine, Dr. Tomada exemplifies the Franciscan value of compassionate care and healing. His commitment to public health and personalized patient care continues to inspire the community and embody the mission of Saint Francis College."
    }
  ];

  // Auto rotation logic
  useEffect(() => {
    let interval;
    if (!isHovered && inView) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % graduates.length);
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isHovered, inView, graduates.length]);

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.15 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % graduates.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? graduates.length - 1 : prev - 1));
  };

  const activeGrad = graduates[activeIndex];

  return (
    <section 
      id="graduates" 
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-[#FAF8F5] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle Archival Background Motif */}
      <div className="absolute top-1/4 -right-32 text-[15rem] leading-none font-serif text-[#1C0E07]/[0.02] uppercase tracking-[0.2em] pointer-events-none select-none">
        ALUMNI
      </div>

      <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        
        {/* Editorial Introduction */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 gap-8">
          <div className="w-full md:w-[45%] lg:w-[40%]">
            <h3 
              className={`text-[10px] md:text-xs font-bold text-[#D97706] uppercase tracking-[0.25em] mb-6 flex items-center gap-4 transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <span className="w-8 h-[1px] bg-[#D97706]"></span> ALUMNI / DISTINGUISHED GRADUATES
            </h3>
            
            <h2 
              className={`text-4xl md:text-5xl lg:text-7xl font-serif text-[#1C0E07] tracking-tight leading-[1.05] transition-all duration-1000 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              Our Distinguished <br/><span className="italic font-light text-[#8C7A68]">Graduates</span>
            </h2>
          </div>
          
          <div 
            className={`w-full md:w-[45%] lg:w-[40%] flex flex-col justify-end transition-all duration-1000 delay-300 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <p className="text-[#5A4A3D] text-sm md:text-base leading-relaxed max-w-lg border-l border-[#D5CFC4] pl-6 mb-6">
              Our graduates carry the Franciscan identity out into the world, achieving outstanding success in their respective professions and fulfilling their missions with integrity. We are deeply proud to highlight them.
            </p>
            <p className="text-xs uppercase tracking-widest text-[#A89885] font-bold pl-6">
              01 — 120+ Distinguished Alumni
            </p>
          </div>
        </div>

        {/* Horizontal Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Featured Image (Left) */}
          <div 
            className={`col-span-1 lg:col-span-5 relative w-full aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-[#EBE7E0] transition-all duration-1000 delay-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${inView ? 'opacity-100 clip-path-full' : 'opacity-0 clip-path-inset'}`}
            style={{ clipPath: inView ? 'inset(0)' : 'inset(100% 0 0 0)' }}
          >
            {graduates.map((grad, idx) => (
              <img 
                key={idx}
                src={grad.img} 
                alt={grad.name}
                className={`absolute inset-0 w-full h-full object-cover ${grad.objectPosition || 'object-top'} transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${activeIndex === idx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'} hover:scale-105 hover:contrast-110`}
              />
            ))}
            <div className="absolute inset-0 border border-[#1C0E07]/10 z-20 pointer-events-none" />
          </div>

          {/* Featured Content (Right) */}
          <div className="col-span-1 lg:col-span-7 flex flex-col pt-8 lg:pt-0">
            <div className="relative flex flex-col justify-center">
              {graduates.map((grad, idx) => (
                <div 
                  key={idx}
                  className={`transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${activeIndex === idx ? 'relative opacity-100 translate-x-0 pointer-events-auto z-10' : 'absolute top-0 left-0 w-full opacity-0 translate-x-12 pointer-events-none z-0'}`}
                >
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-[#A89885] mb-6 flex items-center gap-3">
                    <Award className="w-4 h-4 text-[#D97706]" /> {grad.role}
                  </p>
                  
                  <h4 className="text-3xl md:text-5xl lg:text-6xl font-serif text-[#1C0E07] leading-[1.1] mb-6">
                    {grad.name}
                  </h4>
                  
                  <p className="text-sm md:text-base font-bold uppercase tracking-widest text-[#D97706] mb-8 pb-8 border-b border-[#D5CFC4]/50">
                    {grad.profession}
                  </p>
                  
                  <p className="text-[#5A4A3D] text-sm md:text-base leading-relaxed max-w-2xl font-sans">
                    {grad.bio}
                  </p>
                  
                  <button className="mt-10 group inline-flex items-center gap-3 text-[#1C0E07] font-bold uppercase tracking-widest text-[10px] border-b border-[#1C0E07] pb-1 hover:text-[#D97706] hover:border-[#D97706] transition-colors">
                    View Full Profile
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>

            {/* Thumbnail Navigation */}
            <div 
              className={`mt-16 lg:mt-24 pt-8 border-t border-[#D5CFC4]/50 transition-all duration-1000 delay-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <div className="flex items-center justify-between mb-8">
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#8C7A68] uppercase">Explore Directory</p>
                <div className="flex items-center gap-6">
                  <button onClick={handlePrev} className="text-[#8C7A68] hover:text-[#D97706] transition-colors group flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Prev
                  </button>
                  <button onClick={handleNext} className="text-[#8C7A68] hover:text-[#D97706] transition-colors group flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                    Next <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Thumbnails Container */}
              <div 
                ref={scrollRef}
                className="flex gap-4 md:gap-6 overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 lg:mx-0 lg:px-0"
              >
                {graduates.map((grad, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`group relative flex-shrink-0 w-32 md:w-40 cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeIndex === idx ? 'opacity-100 -translate-y-2' : 'opacity-50 hover:opacity-80 hover:-translate-y-1'}`}
                  >
                    <div className="w-full aspect-[3/4] overflow-hidden bg-[#EBE7E0] mb-4">
                      <img 
                        src={grad.img} 
                        alt={grad.name}
                        className={`w-full h-full object-cover object-top transition-all duration-700 ${activeIndex === idx ? 'grayscale-0 scale-105' : 'grayscale-[0.8]'} group-hover:grayscale-0 group-hover:scale-105`}
                      />
                    </div>
                    
                    <div className="relative">
                      {/* Animated gold line */}
                      <div className={`absolute -top-4 left-0 h-[2px] bg-[#D97706] transition-all duration-700 ${activeIndex === idx ? 'w-full' : 'w-0 group-hover:w-1/2'}`} />
                      
                      <p className="text-[9px] font-bold text-[#D97706] mb-1">0{idx + 1} / {grad.role.replace('Batch', '').trim() || 'SFC'}</p>
                      <h5 className={`font-serif leading-tight transition-colors duration-500 ${activeIndex === idx ? 'text-[#1C0E07] font-semibold text-sm' : 'text-[#8C7A68] text-xs'}`}>
                        {grad.name.split(',')[0]}
                      </h5>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
