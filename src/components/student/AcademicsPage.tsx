"use client";

import { Compass, Users, Globe, GraduationCap, ArrowLeft, ArrowRight, BookOpen, Clock, FileText } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';

const Reveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
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
      className={`transition-all duration-1000 ease-out will-change-transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface AcademicsPageProps {
  onBack: () => void;
}

const PROGRAMS = [
  {
    id: "preschool",
    icon: Compass,
    title: "Pre-School & Kindergarten",
    subtitle: "Ages 3–5",
    desc: "A nurturing environment that fosters early cognitive development, social skills, and foundational values through play-based and guided learning.",
    features: ["Play-based Curriculum", "Early Literacy", "Motor Skills Development", "Social Interaction"],
    img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "elementary",
    icon: Users,
    title: "Elementary",
    subtitle: "Grades 1–6",
    desc: "Building a strong academic core while emphasizing character formation, critical thinking, and collaborative discovery.",
    features: ["Core Subjects Mastery", "Character Education", "Intro to Sciences", "Creative Arts"],
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "junior-high",
    icon: Globe,
    title: "Junior High School",
    subtitle: "Grades 7–10",
    desc: "A robust curriculum preparing students for complex challenges, developing holistic leaders with a global perspective and civic responsibility.",
    features: ["Advanced Sciences", "Global Perspectives", "Civic Responsibility", "Leadership Training"],
    img: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "senior-high",
    icon: GraduationCap,
    title: "Senior High School",
    subtitle: "Grades 11–12",
    desc: "Academic Track featuring specialized Core, Contextualized, and Applied subjects. Rigorous preparation for university excellence and career readiness.",
    features: ["STEM, ABM, HUMSS Tracks", "University Preparation", "Applied Research", "Career Readiness"],
    img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1200&auto=format&fit=crop"
  }
];

export const AcademicsPage: React.FC<AcademicsPageProps> = ({ onBack }) => {
  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] min-h-[400px] bg-[#1C120B] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity animate-[ken-burns_20s_ease-out_forwards]"
          style={{ backgroundImage: 'url(/classroom-hero.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C120B]/80 via-[#1C120B]/50 to-[#FAF8F5]" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-12">
          <Reveal>
            <div className="w-12 h-12 bg-[#1C120B] border border-[#D97706]/30 flex items-center justify-center mb-8 mx-auto shadow-xl">
              <BookOpen className="w-5 h-5 text-[#D97706]" />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl md:text-6xl font-serif font-black text-[#FFFDF7] tracking-tight mb-4">
              Academic Programs
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-sm md:text-base text-[#D97706] font-bold uppercase tracking-[0.2em] max-w-2xl mx-auto">
              Cultivating Excellence at Every Stage
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-32">
        <Reveal delay={300}>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#2E2016] hover:text-[#D97706] transition-colors border border-[#D5CFC4] hover:border-[#D97706] bg-[#FFFDF7] px-6 py-3 mb-16 shadow-lg"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Home
          </button>
        </Reveal>

        <div className="space-y-32 relative">
          {/* Video Game Tracing Path */}
          <div className="hidden lg:block absolute left-1/2 top-12 bottom-12 w-px bg-gradient-to-b from-[#D97706]/0 via-[#D97706]/40 to-[#D97706]/0 -translate-x-1/2 z-0" />

          {PROGRAMS.map((program, idx) => (
            <Reveal key={program.id} delay={100}>
              <div className={`relative flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                
                {/* Tracing Node */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rotate-45 border border-[#D97706] bg-[#FAF8F5] z-10 items-center justify-center shadow-sm">
                  <div className="w-2 h-2 bg-[#D97706]" />
                </div>
                
                {/* Image Side */}
                <div className="w-full lg:w-1/2 relative group">
                  {/* Decorative backdrop */}
                  <div className={`absolute top-8 ${idx % 2 === 0 ? '-left-8' : '-right-8'} w-full h-full bg-[#E5D7BE] -z-10 transition-transform group-hover:scale-105 duration-1000`} />
                  
                  <div className="relative w-full aspect-[4/3] overflow-hidden border border-[#D5CFC4] shadow-2xl bg-[#FFFDF7]">
                    <img 
                      src={program.img} 
                      alt={program.title}
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2s] ease-[cubic-bezier(0.25,1,0.5,1)]"
                    />
                    <div className="absolute inset-0 bg-[#2E2016]/10 group-hover:bg-transparent transition-colors duration-700" />
                  </div>
                  
                  {/* Floating Icon */}
                  <div className={`absolute -bottom-8 ${idx % 2 === 0 ? '-right-8' : '-left-8'} w-24 h-24 bg-[#2E2016] border-4 border-[#FFFDF7] flex items-center justify-center shadow-xl z-20 group-hover:bg-[#D97706] transition-colors duration-500`}>
                    <program.icon className="w-10 h-10 text-[#FFFDF7]" />
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center mt-12 lg:mt-0 px-4 md:px-0">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="w-12 h-px bg-[#D97706]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D97706]">{program.subtitle}</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-serif font-black text-[#2E2016] tracking-tight mb-8">
                    {program.title}
                  </h2>
                  
                  <p className="text-lg text-[#54483C] leading-relaxed mb-10 font-medium">
                    {program.desc}
                  </p>
                  
                  <div className="bg-[#FFFDF7] border border-[#D5CFC4] p-8 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8C7A68] mb-6">Program Highlights</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      {program.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-[#D97706] rounded-full" />
                          <span className="text-sm font-bold text-[#2E2016]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="mt-10 group/btn relative overflow-hidden bg-[#2E2016] text-[#FFFDF7] px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 inline-flex self-start border border-[#2E2016]">
                    <div className="absolute inset-0 w-full h-full bg-[#D97706] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.85,0,0.15,1)]" />
                    <span className="relative z-10 flex items-center gap-2 group-hover/btn:text-[#1C0E07] transition-colors duration-300">
                      Learn More <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>

              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
};
