"use client";

import { ArrowRight, BookOpen, CheckCircle2, Globe, GraduationCap, MapPin, Users, Compass, Library, Calendar, Award, ChevronRight, PlayCircle, Clock } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { APP_CONFIG } from '../../config/app.config';
import { CampusMapAndArchive } from './CampusMapAndArchive';

// Reusable Scroll Reveal Component for section-wide animations
const Reveal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] transform w-full ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
    >
      {children}
    </div>
  );
};

interface LandingPageProps {
  onBegin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onBegin }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[#FAF6EE] overflow-x-hidden">
      {/* Immersive Hero Section */}
      <section className="relative w-full h-[calc(100vh-96px)] flex items-center justify-center overflow-hidden">
        {/* Background Image with Slow Parallax/Ken Burns effect */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[30s] ease-out ${mounted ? 'scale-110' : 'scale-100'}`}
          style={{ backgroundImage: 'url(/campus_students.jpg)' }}
        />
        
        {/* Rich Gradient Overlays for contrast and blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2E2016]/80 via-transparent to-[#FAF6EE] z-0" />
        <div className="absolute inset-0 bg-[#2E2016]/40 z-0" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto flex flex-col items-center">
          <div className={`transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-5 py-2 border border-[#F59E0B]/40 bg-[#2E2016]/60 backdrop-blur-md rounded-full text-[#F59E0B] text-xs font-bold uppercase tracking-[0.25em] mb-8 hover:bg-[#F59E0B]/10 transition-colors cursor-default">
              <GraduationCap className="w-4 h-4" />
              Est. 1920 • AY {APP_CONFIG.school.academicYear}
            </div>
          </div>
          
          <h1 className={`text-5xl md:text-6xl lg:text-7xl font-serif font-medium text-white tracking-wide uppercase leading-tight mb-8 transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            Excellence <br />
            <span className="text-[#F59E0B] drop-shadow-md">In Motion</span>
          </h1>
          
          <p className={`text-lg md:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto font-light mb-12 tracking-wide leading-relaxed transition-all duration-1000 delay-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            {APP_CONFIG.school.tagline}. Shaping global leaders for over a century through rigorous academics and character formation.
          </p>

          <button
            onClick={() => scrollToSection('about')}
            className={`group relative overflow-hidden bg-[#F59E0B] text-[#2E2016] py-5 px-10 text-sm md:text-base font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-4 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] shadow-xl transition-all duration-1000 delay-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
          >
            <div className="absolute inset-0 w-0 bg-white transition-all duration-[400ms] ease-out group-hover:w-full opacity-20" />
            <span className="relative z-10">Discover Our Heritage</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-y-2 transition-transform duration-300 rotate-90" />
          </button>
        </div>
      </section>

      {/* About Section - Vision & Mission */}
      <section id="about" className="py-24 md:py-32 px-4 bg-[#FAF6EE]">
        <Reveal>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            <div className="lg:w-1/2">
              <h3 className="text-xs md:text-sm font-bold text-[#D97706] uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                <Compass className="w-5 h-5" />
                Our Vision
              </h3>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#2E2016] tracking-tight leading-[1.1] mb-8">
                A Global Standard <br />of Education.
              </h2>
              <p className="text-lg text-[#54483C] leading-relaxed mb-6 font-medium">
                At {APP_CONFIG.school.name}, we believe in nurturing the whole person. Our holistic approach integrates world-class academics with ethical leadership and community service.
              </p>
              <p className="text-[#54483C] leading-relaxed mb-10">
                We empower our students to be critical thinkers and compassionate global citizens, prepared to tackle the challenges of a rapidly evolving world. Our heritage is rooted in tradition, yet our methods are continuously innovating for the future.
              </p>
              <div className="flex flex-wrap items-center gap-8 md:gap-12 pt-4 border-t border-[#D5CFC4]">
                <div>
                  <span className="block text-4xl lg:text-5xl font-serif font-medium text-[#D97706] mb-1">40+</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#2E2016] font-bold">Nationalities</span>
                </div>
                <div>
                  <span className="block text-4xl lg:text-5xl font-serif font-medium text-[#D97706] mb-1">100%</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#2E2016] font-bold">College Acceptance</span>
                </div>
                <div>
                  <span className="block text-4xl lg:text-5xl font-serif font-medium text-[#D97706] mb-1">1:8</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#2E2016] font-bold">Faculty Ratio</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 relative w-full">
              <div className="absolute inset-0 bg-[#F59E0B] transform translate-x-6 translate-y-6 z-0 rounded-sm"></div>
              <div className="relative z-10 w-full h-[500px] overflow-hidden rounded-sm group cursor-pointer shadow-2xl">
                <img 
                  src="/cozy_campus.jpg" 
                  alt="Campus Life" 
                  className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)]" 
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Embedded Campus Map & Archive */}
      <Reveal>
        <CampusMapAndArchive />
      </Reveal>

      {/* Media & Events Section */}
      <section className="py-24 md:py-32 px-4 bg-white border-t border-[#D5CFC4]">
        <Reveal>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
            {/* Main Video Area */}
            <div className="lg:w-2/3">
              <h3 className="text-xs md:text-sm font-bold text-[#D97706] uppercase tracking-[0.25em] mb-4">Spotlight</h3>
              <h2 className="text-4xl md:text-5xl font-serif font-medium text-[#2E2016] tracking-tight mb-8">
                Life at {APP_CONFIG.school.name}
              </h2>
              
              <div className="relative w-full aspect-video rounded-sm overflow-hidden group cursor-pointer shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1200&auto=format&fit=crop" 
                  alt="Campus Video Thumbnail" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out"
                />
                <div className="absolute inset-0 bg-[#2E2016]/40 group-hover:bg-[#2E2016]/20 transition-colors duration-500 flex items-center justify-center">
                  <div className="w-20 h-20 bg-[#F59E0B]/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                    <PlayCircle className="w-10 h-10 text-white ml-1" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Upcoming Events Sidebar */}
            <div className="lg:w-1/3 flex flex-col">
              <h3 className="text-xs md:text-sm font-bold text-[#D97706] uppercase tracking-[0.25em] mb-4">Calendar</h3>
              <h2 className="text-3xl font-serif font-medium text-[#2E2016] tracking-tight mb-8">
                Upcoming Events
              </h2>
              
              <div className="space-y-6">
                {[
                  { date: "Oct 15", title: "Fall Open House & Campus Tour", time: "9:00 AM - 2:00 PM" },
                  { date: "Oct 22", title: "Distinguished Alumni Lecture", time: "6:30 PM - 8:30 PM" },
                  { date: "Nov 05", title: "International Student Mixer", time: "4:00 PM - 7:00 PM" },
                ].map((event, idx) => (
                  <div key={idx} className="group flex gap-6 p-4 border border-[#EBE7E0] hover:border-[#F59E0B] bg-[#FAF6EE] transition-colors cursor-pointer">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-[#2E2016] text-white shrink-0">
                      <span className="text-sm font-bold uppercase">{event.date.split(' ')[0]}</span>
                      <span className="text-xl font-serif">{event.date.split(' ')[1]}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-[#2E2016] leading-tight mb-1 group-hover:text-[#D97706] transition-colors">{event.title}</h4>
                      <p className="text-xs text-[#8C7A68] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="mt-8 text-[#2E2016] font-bold uppercase tracking-widest text-xs border-b-2 border-[#D97706] pb-1 hover:text-[#D97706] transition-colors inline-flex items-center gap-2">
                View Full Calendar
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Leadership / Directors Section */}
      <section className="py-24 md:py-32 px-4 bg-[#FAF6EE]">
        <Reveal>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 md:mb-24">
              <h3 className="text-xs md:text-sm font-bold text-[#D97706] uppercase tracking-[0.25em] mb-4">Leadership</h3>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#2E2016] tracking-tight">Meet the Directors</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { name: "Dr. Arthur Pendelton", role: "Chancellor", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop" },
                { name: "Eleanor Vance, PhD", role: "Dean of Admissions", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop" },
                { name: "Robert Sterling", role: "Director of Student Affairs", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop" },
              ].map((leader, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="relative overflow-hidden w-full aspect-[4/5] mb-6">
                    <img 
                      src={leader.img} 
                      alt={leader.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)]"
                    />
                    <div className="absolute inset-0 bg-[#2E2016]/20 group-hover:bg-transparent transition-colors duration-700" />
                  </div>
                  <h4 className="text-2xl font-serif font-bold text-[#2E2016] mb-1">{leader.name}</h4>
                  <p className="text-sm font-bold uppercase tracking-widest text-[#D97706]">{leader.role}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Academics & Programs */}
      <section id="academics" className="py-24 md:py-32 px-4 bg-[#2E2016] text-white">
        <Reveal>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 md:mb-24">
              <h3 className="text-xs md:text-sm font-bold text-[#F59E0B] uppercase tracking-[0.25em] mb-4">Academic Excellence</h3>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight">Strands & Programs</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: BookOpen, title: "STEM", desc: "Science, Technology, Engineering, and Mathematics. Rigorous preparation for future innovators and medical professionals." },
                { icon: Globe, title: "HUMSS", desc: "Humanities and Social Sciences. Developing the next generation of lawyers, writers, and public servants." },
                { icon: Award, title: "ABM", desc: "Accountancy, Business, and Management. Building entrepreneurial mindsets and corporate leaders." }
              ].map((program, idx) => (
                <div key={idx} className="group h-full bg-[#3D2B1E] p-10 md:p-12 border border-[#4A3525] hover:border-[#F59E0B] hover:bg-[#4E3726] transition-all duration-500 cursor-pointer shadow-lg hover:-translate-y-2">
                  <program.icon className="w-12 h-12 text-[#F59E0B] mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500" />
                  <h4 className="text-2xl md:text-3xl font-serif font-medium tracking-tight mb-4">{program.title}</h4>
                  <p className="text-[#C9B9A6] leading-relaxed font-light">{program.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Campus Life / Facilities */}
      <section id="campus-life" className="py-24 md:py-32 px-4 bg-[#EBE7E0]">
        <Reveal>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse gap-16 lg:gap-24 items-center">
            <div className="lg:w-1/2">
              <h3 className="text-xs md:text-sm font-bold text-[#D97706] uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                <Library className="w-5 h-5" />
                State-of-the-Art Facilities
              </h3>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#2E2016] tracking-tight leading-[1.1] mb-8">
                The Grand <br />Athenaeum
              </h2>
              <p className="text-lg text-[#54483C] leading-relaxed mb-6 font-medium">
                Our newly renovated, multi-level library houses over 500,000 physical volumes and provides access to millions of digital journals worldwide.
              </p>
              <p className="text-[#54483C] leading-relaxed mb-10">
                Featuring quiet study halls, collaborative tech-pods, and a rare manuscripts archive, it is the intellectual heart of the campus where students spend hours delving into research and group projects.
              </p>
              <button 
                className="group flex items-center gap-2 text-[#2E2016] font-bold uppercase tracking-widest text-sm border-b-2 border-[#D97706] pb-1 hover:text-[#D97706] transition-colors"
                onClick={() => {
                  const headerBtn = document.querySelector('button:contains("Library")');
                  if (headerBtn) (headerBtn as HTMLElement).click();
                }}
              >
                Explore The Library
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="lg:w-1/2 w-full">
               <div className="relative group overflow-hidden shadow-2xl rounded-tr-[100px] rounded-bl-[100px]">
                 <img 
                    src="/modern_library.jpg" 
                    alt="Grand Library" 
                    className="w-full h-[500px] md:h-[600px] object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out border-8 border-white" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#2E2016]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Admissions Checklist / CTA */}
      <section id="admissions" className="py-24 md:py-32 px-4 bg-[#FAF6EE] border-t border-[#D5CFC4] relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F59E0B] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2E2016] opacity-5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <Reveal>
          <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 lg:p-20 shadow-2xl border-t-8 border-[#F59E0B] text-center relative z-10">
            <h3 className="text-xs md:text-sm font-bold text-[#D97706] uppercase tracking-[0.25em] mb-4">Admissions Portal</h3>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#2E2016] tracking-tight mb-8">
              Ready to Enroll?
            </h2>
            <p className="text-lg text-[#54483C] leading-relaxed mb-12 max-w-2xl mx-auto font-light">
              Our streamlined digital enrollment allows you to submit your official dossier, upload required documents, and track your admission status entirely online.
            </p>
            
            <div className="bg-[#F8F6F2] p-8 md:p-10 text-left mb-12 max-w-xl mx-auto border border-[#EBE7E0]">
               <h4 className="font-bold text-[#2E2016] uppercase tracking-widest mb-6 text-sm">Before you begin, please prepare:</h4>
               <ul className="space-y-5">
                  <li className="flex items-start gap-4 group">
                    <div className="mt-0.5 bg-white rounded-full p-1 shadow-sm group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-5 h-5 text-[#D97706] shrink-0" />
                    </div>
                    <span className="text-[#54483C] font-medium leading-relaxed group-hover:text-[#2E2016] transition-colors">Official academic records or previous transcripts</span>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="mt-0.5 bg-white rounded-full p-1 shadow-sm group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-5 h-5 text-[#D97706] shrink-0" />
                    </div>
                    <span className="text-[#54483C] font-medium leading-relaxed group-hover:text-[#2E2016] transition-colors">Digital copies of required IDs and certificates</span>
                  </li>
               </ul>
            </div>

            <button
              onClick={onBegin}
              className="group relative overflow-hidden inline-flex items-center gap-4 bg-[#2E2016] text-[#F59E0B] py-5 px-12 md:px-16 text-sm md:text-base font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-1 transform duration-500 shadow-xl"
            >
              <div className="absolute inset-0 w-0 bg-[#F59E0B] transition-all duration-[400ms] ease-out group-hover:w-full" />
              <span className="relative z-10 group-hover:text-[#2E2016] transition-colors duration-300">Start Application</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:text-[#2E2016] group-hover:translate-x-1 transition-all duration-300" />
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
