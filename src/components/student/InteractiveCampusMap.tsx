"use client";

import React, { useState, useMemo, useRef } from 'react';
import { CampusBuilding, CampusBuildingCategory, PageTab } from '../../types';
import { CAMPUS_BUILDINGS } from '../../data/mockData';
import { 
  MapPin, 
  Layers, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Compass, 
  X, 
  ChevronRight, 
  ExternalLink,
  Footprints,
  Eye,
  EyeOff,
  Sparkles,
  Info
} from 'lucide-react';

interface InteractiveCampusMapProps {
  onSelectTab?: (tab: PageTab) => void;
  className?: string;
  defaultBuildingId?: string;
}

const CATEGORY_COLORS: Record<CampusBuildingCategory, { bg: string; text: string; border: string; pinBg: string; hex: string }> = {
  Academic: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300', pinBg: 'bg-amber-600', hex: '#D97706' },
  Library: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300', pinBg: 'bg-emerald-700', hex: '#047857' },
  Residence: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300', pinBg: 'bg-rose-700', hex: '#BE123C' },
  Athletics: { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-300', pinBg: 'bg-blue-600', hex: '#2563EB' },
  Administrative: { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300', pinBg: 'bg-purple-700', hex: '#7E22CE' },
  Sacred: { bg: 'bg-stone-200', text: 'text-[#23120B]', border: 'border-stone-400', pinBg: 'bg-[#23120B]', hex: '#23120B' }
};

export const InteractiveCampusMap: React.FC<InteractiveCampusMapProps> = ({ 
  onSelectTab, 
  className = '',
  defaultBuildingId
}) => {
  // Tab-based Active Filter ('All' or specific category)
  const [activeTab, setActiveTab] = useState<string>('All');

  // Button-based Multi-Category Visibility Toggles
  const [visibleCategories, setVisibleCategories] = useState<Record<CampusBuildingCategory, boolean>>({
    Academic: true,
    Library: true,
    Residence: true,
    Athletics: true,
    Administrative: true,
    Sacred: true
  });

  // Additional Layer Toggles
  const [showPathways, setShowPathways] = useState<boolean>(true);
  const [showZoneLabels, setShowZoneLabels] = useState<boolean>(true);
  const [showTrees, setShowTrees] = useState<boolean>(true);

  // Search Query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Landmark
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(() => {
    if (defaultBuildingId) {
      return CAMPUS_BUILDINGS.find(b => b.id === defaultBuildingId) || CAMPUS_BUILDINGS[0];
    }
    return CAMPUS_BUILDINGS[0];
  });

  // Simulated Walking Path (from Main Gate [500, 600] to building)
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // Pan & Zoom
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Category Tabs
  const tabs = [
    { label: 'All Landmarks', value: 'All' },
    { label: 'Academic & STEM', value: 'Academic' },
    { label: 'Libraries & Archives', value: 'Library' },
    { label: 'Residence & Dining', value: 'Residence' },
    { label: 'Athletics & Crew', value: 'Athletics' },
    { label: 'Administrative', value: 'Administrative' },
    { label: 'Sacred & Historic', value: 'Sacred' }
  ];

  const allCategories: CampusBuildingCategory[] = [
    'Academic',
    'Library',
    'Residence',
    'Athletics',
    'Administrative',
    'Sacred'
  ];

  // Handle Tab Selection
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    if (tabValue === 'All') {
      // Enable all
      setVisibleCategories({
        Academic: true,
        Library: true,
        Residence: true,
        Athletics: true,
        Administrative: true,
        Sacred: true
      });
    } else {
      // Isolate to selected category
      const newVis: Record<CampusBuildingCategory, boolean> = {
        Academic: false,
        Library: false,
        Residence: false,
        Athletics: false,
        Administrative: false,
        Sacred: false
      };
      newVis[tabValue as CampusBuildingCategory] = true;
      setVisibleCategories(newVis);
    }
  };

  // Handle Button-based Toggle for a specific category
  const toggleCategory = (cat: CampusBuildingCategory) => {
    setVisibleCategories(prev => {
      const next = { ...prev, [cat]: !prev[cat] };
      // Check if all are active
      const allActive = allCategories.every(c => next[c]);
      if (allActive) {
        setActiveTab('All');
      } else {
        const activeList = allCategories.filter(c => next[c]);
        if (activeList.length === 1) {
          setActiveTab(activeList[0]);
        } else {
          setActiveTab('Custom');
        }
      }
      return next;
    });
  };

  const handleSelectAllCategories = () => {
    setActiveTab('All');
    setVisibleCategories({
      Academic: true,
      Library: true,
      Residence: true,
      Athletics: true,
      Administrative: true,
      Sacred: true
    });
  };

  const handleClearAllCategories = () => {
    setActiveTab('Custom');
    setVisibleCategories({
      Academic: false,
      Library: false,
      Residence: false,
      Athletics: false,
      Administrative: false,
      Sacred: false
    });
  };

  // Filtered Buildings
  const displayedBuildings = useMemo(() => {
    return CAMPUS_BUILDINGS.filter(bldg => {
      const isCatVisible = visibleCategories[bldg.category];
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        bldg.name.toLowerCase().includes(q) ||
        bldg.code.toLowerCase().includes(q) ||
        bldg.description.toLowerCase().includes(q) ||
        (bldg.zone && bldg.zone.toLowerCase().includes(q)) ||
        bldg.features.some(f => f.toLowerCase().includes(q));

      return isCatVisible && matchesSearch;
    });
  }, [visibleCategories, searchQuery]);

  // Zoom helpers
  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setIsNavigating(false);
  };

  const focusOnBuilding = (bldg: CampusBuilding) => {
    setSelectedBuilding(bldg);
    if (bldg.x && bldg.y) {
      // Calculate pan to center the building (center of 1000x650 is 500, 325)
      const targetPanX = (500 - bldg.x) * 0.5;
      const targetPanY = (325 - bldg.y) * 0.5;
      setPanOffset({ x: targetPanX, y: targetPanY });
      setZoomLevel(1.4);
    }
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Main Gate anchor for navigation line
  const mainGateCoord = { x: 500, y: 610 };

  return (
    <div className={`bg-[#FAF7F2] border-2 border-[#E8DFC8] shadow-md flex flex-col ${className}`}>
      {/* 1. Header with Title & Legend Summary */}
      <div className="bg-[#23120B] text-[#FFFDF7] p-5 sm:p-6 border-b-2 border-[#E5A910] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#E5A910]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E5A910]">
              240-Acre Franciscan Heights Blueprint
            </span>
          </div>
          <h2 className="font-collegiate-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Interactive Campus Architectural Map
          </h2>
          <p className="font-collegiate-serif text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
            Explore collegiate quads, Gothic sandstone halls, research pavilions, and the Charles River waterfront. Toggle categories or select landmarks to inspect blueprints.
          </p>
        </div>

        {/* Map Status & Quick Counter */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto bg-[#331A0F] border border-stone-700 px-4 py-2.5 text-xs">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono text-stone-400">Landmarks Visible</div>
            <div className="font-bold text-[#E5A910] font-mono text-sm">
              {displayedBuildings.length} of {CAMPUS_BUILDINGS.length}
            </div>
          </div>
          <div className="h-7 w-px bg-stone-600" />
          <div className="text-stone-300 text-[11px]">
            <span className="font-semibold text-white">Scale:</span> 1:2000
          </div>
        </div>
      </div>

      {/* 2. TAB-BASED INTERFACE: Primary Category Tabs */}
      <div className="bg-white border-b border-[#E8DFC8] px-4 pt-3 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.value
                  ? 'border-[#E5A910] text-[#23120B] bg-[#FAF7F2]'
                  : 'border-transparent text-stone-600 hover:text-[#23120B] hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative pb-2 sm:pb-0 min-w-[200px] shrink-0">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find hall or landmark..."
            className="w-full pl-8 pr-7 py-1 text-xs bg-[#FAF7F2] border border-[#E8DFC8] focus:border-[#E5A910] text-[#23120B] placeholder-stone-400 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. BUTTON-BASED INTERFACE: Multi-Layer Visibility Controls */}
      <div className="bg-[#FAF7F2] border-b border-[#E8DFC8] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Layer Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-[#23120B] text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5 text-[#8B4513]" />
            <span>Filter Layers:</span>
          </span>

          {allCategories.map((cat) => {
            const isVisible = visibleCategories[cat];
            const meta = CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isVisible
                    ? 'bg-white text-[#23120B] border-stone-400 shadow-2xs'
                    : 'bg-stone-100 text-stone-400 border-stone-200 line-through opacity-65'
                }`}
                title={`Toggle ${cat} visibility`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: isVisible ? meta.hex : '#A8A29E' }} 
                />
                <span>{cat}</span>
                {isVisible ? <Eye className="w-3 h-3 text-stone-400 ml-0.5" /> : <EyeOff className="w-3 h-3 text-stone-400 ml-0.5" />}
              </button>
            );
          })}

          {/* Quick All / Clear Action Buttons */}
          <div className="flex items-center gap-1 ml-1 pl-1 border-l border-stone-300">
            <button
              onClick={handleSelectAllCategories}
              className="text-[10px] font-bold uppercase text-[#8B4513] hover:text-[#23120B] px-2 py-1 bg-white border border-[#E8DFC8] hover:border-[#E5A910] cursor-pointer"
            >
              Show All
            </button>
            <button
              onClick={handleClearAllCategories}
              className="text-[10px] font-bold uppercase text-stone-500 hover:text-stone-800 px-2 py-1 bg-white border border-[#E8DFC8] hover:border-stone-400 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Auxiliary Map Layer Toggles */}
        <div className="flex items-center gap-3 text-[11px] text-stone-600">
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={showPathways} 
              onChange={(e) => setShowPathways(e.target.checked)}
              className="accent-[#8B4513] rounded-xs"
            />
            <span>Cobblestone Paths</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={showZoneLabels} 
              onChange={(e) => setShowZoneLabels(e.target.checked)}
              className="accent-[#8B4513] rounded-xs"
            />
            <span>Quad Zones</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={showTrees} 
              onChange={(e) => setShowTrees(e.target.checked)}
              className="accent-[#8B4513] rounded-xs"
            />
            <span>Arboretum</span>
          </label>
        </div>
      </div>

      {/* 4. MAIN MAP CANVAS & DETAIL DRAWER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative bg-[#EFECE6] min-h-[580px] overflow-hidden">
        {/* Left / Center Map Viewport (8 or 12 Cols depending on selection) */}
        <div 
          ref={mapContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="lg:col-span-8 relative h-[500px] sm:h-[580px] overflow-hidden cursor-grab active:cursor-grabbing select-none bg-[#EBE7DF]"
        >
          {/* Zoom & Pan Navigation Control HUD */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 bg-white/95 backdrop-blur-xs border border-stone-300 shadow-md p-1">
            <button
              onClick={zoomIn}
              className="p-2 text-stone-700 hover:text-[#23120B] hover:bg-stone-100 transition-colors"
              title="Zoom in (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="h-px bg-stone-200" />
            <button
              onClick={zoomOut}
              className="p-2 text-stone-700 hover:text-[#23120B] hover:bg-stone-100 transition-colors"
              title="Zoom out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="h-px bg-stone-200" />
            <button
              onClick={resetView}
              className="p-2 text-stone-700 hover:text-[#23120B] hover:bg-stone-100 transition-colors"
              title="Reset view and centering"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Compass Rose Indicator */}
          <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-xs border border-stone-300 p-2 shadow-sm pointer-events-none flex flex-col items-center">
            <div className="text-[10px] font-bold text-[#8B4513] font-mono">N</div>
            <div className="w-6 h-6 relative flex items-center justify-center">
              <div className="w-0.5 h-5 bg-[#8B4513]" />
              <div className="w-5 h-0.5 bg-stone-400 absolute" />
              <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[8px] border-b-[#E5A910] absolute -top-0.5" />
            </div>
            <div className="text-[9px] text-stone-500 font-mono">CAMPUS</div>
          </div>

          {/* Simulated Route Banner when navigating */}
          {isNavigating && selectedBuilding && (
            <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#23120B] text-white p-3 border-2 border-[#E5A910] shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2.5">
                <Footprints className="w-5 h-5 text-[#E5A910] animate-bounce" />
                <div className="text-xs">
                  <div className="font-bold text-[#E5A910] uppercase tracking-wider text-[10px]">
                    Walking Route Activated
                  </div>
                  <div className="text-stone-200">
                    From Chancellor&apos;s South Portal to <strong>{selectedBuilding.name}</strong> • Approx. 4 min stroll
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsNavigating(false)}
                className="px-2.5 py-1 text-[11px] bg-stone-800 text-stone-300 hover:text-white uppercase font-bold"
              >
                Clear Route
              </button>
            </div>
          )}

          {/* SVG ARCHITECTURAL MAP CONTAINER */}
          <div 
            className="w-full h-full transition-transform duration-100 ease-out origin-center"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`
            }}
          >
            <svg
              viewBox="0 0 1000 650"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Lawn Grass Pattern */}
                <pattern id="lawnGrass" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect width="20" height="20" fill="#E6EDDF" />
                  <circle cx="5" cy="5" r="0.8" fill="#D2DEC8" opacity="0.6" />
                  <circle cx="15" cy="15" r="0.8" fill="#D2DEC8" opacity="0.6" />
                </pattern>

                {/* River Wave Pattern */}
                <pattern id="waterPattern" width="30" height="20" patternUnits="userSpaceOnUse">
                  <rect width="30" height="20" fill="#C5DCE8" />
                  <path d="M0 10 Q7.5 5 15 10 T30 10" fill="none" stroke="#A9C7D7" strokeWidth="1.5" />
                </pattern>

                {/* Building Shadow Filter */}
                <filter id="bldgShadow" x="-10%" y="-10%" width="130%" height="130%">
                  <feDropShadow dx="3" dy="4" stdDeviation="4" floodColor="#23120B" floodOpacity="0.25" />
                </filter>
                
                {/* Active Glow Filter */}
                <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#E5A910" floodOpacity="0.9" />
                </filter>
              </defs>

              {/* 1. Base Ground (Campus Acreage) */}
              <rect x="0" y="0" width="1000" height="650" fill="url(#lawnGrass)" />

              {/* 2. Charles River Waterfront on the East/Right Border */}
              <path 
                d="M840,0 C880,150 820,300 870,450 C900,530 960,600 1000,650 L1000,0 Z" 
                fill="url(#waterPattern)" 
                stroke="#8CB5C9" 
                strokeWidth="2"
              />
              <text x="920" y="240" fill="#4B778D" fontSize="11" fontFamily="serif" fontStyle="italic" letterSpacing="2">
                CHARLES RIVER
              </text>

              {/* River Boathouse Dock Pier */}
              <path d="M860,530 L930,530 L930,550 L860,550 Z" fill="#8B5A2B" stroke="#5C3818" strokeWidth="1.5" />
              <line x1="880" y1="520" x2="880" y2="560" stroke="#FAF7F2" strokeWidth="2" strokeDasharray="3,3" />

              {/* 3. The Great Quadrangle Lawn (Central Emerald Oval) */}
              <ellipse cx="500" cy="325" rx="360" ry="210" fill="#DCF0D1" stroke="#BDD9B0" strokeWidth="3" opacity="0.8" />

              {/* 4. Cobblestone Pathways & Avenues */}
              {showPathways && (
                <g stroke="#D4C7B0" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  {/* Central Ring Path */}
                  <ellipse cx="500" cy="325" rx="270" ry="150" strokeWidth="7" />
                  
                  {/* Cross Avenues */}
                  <line x1="140" y1="325" x2="840" y2="325" />
                  <line x1="500" y1="90" x2="500" y2="610" />

                  {/* Diagonal collegiate avenues */}
                  <line x1="270" y1="170" x2="500" y2="310" strokeWidth="6" />
                  <line x1="750" y1="160" x2="500" y2="310" strokeWidth="6" />
                  <line x1="220" y1="330" x2="500" y2="310" strokeWidth="6" />
                  <line x1="770" y1="340" x2="500" y2="310" strokeWidth="6" />
                  <line x1="200" y1="490" x2="480" y2="490" strokeWidth="6" />
                  <line x1="480" y1="490" x2="740" y2="490" strokeWidth="6" />
                  <line x1="740" y1="490" x2="880" y2="530" strokeWidth="6" />
                  <line x1="480" y1="490" x2="500" y2="310" strokeWidth="6" />
                </g>
              )}

              {/* Central Fountain of Veritas */}
              <circle cx="500" cy="225" r="16" fill="#A4C8D8" stroke="#719FB3" strokeWidth="2" />
              <circle cx="500" cy="225" r="7" fill="#E8DFC8" stroke="#8B4513" strokeWidth="1.5" />
              <text x="500" y="248" textAnchor="middle" fill="#6B7280" fontSize="8" fontStyle="italic">Fountain of Veritas</text>

              {/* 5. Quad Zone Labels */}
              {showZoneLabels && (
                <g fill="#786C5A" fontSize="10" fontFamily="serif" fontWeight="bold" letterSpacing="1.5" textAnchor="middle">
                  <text x="500" y="70">NORTH QUADRANGLE & CHANCELLOR&apos;S ENCLAVE</text>
                  <text x="210" y="270">WEST RESIDENTIAL QUAD</text>
                  <text x="770" y="115">EAST SANCTUARY QUAD</text>
                  <text x="770" y="440">SOUTH INNOVATION CONCOURSE</text>
                  <text x="200" y="580">ATHLETIC FIELDS & CONCOURSE</text>
                  <text x="500" y="635">SOUTHERN MATRICULATION GATEWAY</text>
                </g>
              )}

              {/* 6. Arboretum Canopy Trees */}
              {showTrees && (
                <g fill="#7A9A60" stroke="#5E7D47" strokeWidth="1.2">
                  {[
                    [420, 190], [580, 190], [390, 260], [610, 260],
                    [360, 390], [640, 390], [420, 440], [580, 440],
                    [160, 220], [140, 380], [330, 490], [650, 520],
                    [720, 240], [800, 220], [820, 410], [900, 460]
                  ].map(([tx, ty], i) => (
                    <g key={i}>
                      <circle cx={tx} cy={ty} r="10" fill="#688B4E" opacity="0.85" />
                      <circle cx={tx - 2} cy={ty - 2} r="5" fill="#88AA6E" opacity="0.9" />
                    </g>
                  ))}
                </g>
              )}

              {/* 7. Active Walking Route Trace (if simulating) */}
              {isNavigating && selectedBuilding && selectedBuilding.x && selectedBuilding.y && (
                <g>
                  <path
                    d={`M${mainGateCoord.x},${mainGateCoord.y} L480,490 L500,310 L${selectedBuilding.x},${selectedBuilding.y}`}
                    stroke="#E5A910"
                    strokeWidth="5"
                    strokeDasharray="8,6"
                    strokeLinecap="round"
                    fill="none"
                    className="animate-pulse"
                  />
                  <circle cx={mainGateCoord.x} cy={mainGateCoord.y} r="8" fill="#23120B" stroke="#E5A910" strokeWidth="2" />
                  <text x={mainGateCoord.x} y={mainGateCoord.y + 18} fill="#23120B" fontSize="9" fontWeight="bold" textAnchor="middle">
                    You Are Here (Main Portal)
                  </text>
                </g>
              )}

              {/* 8. Building Footprints (Architectural Polygons) */}
              {CAMPUS_BUILDINGS.map((bldg) => {
                const isSelected = selectedBuilding?.id === bldg.id;
                const isVisible = visibleCategories[bldg.category];
                if (!bldg.x || !bldg.y) return null;

                const bx = bldg.x;
                const by = bldg.y;

                return (
                  <g 
                    key={`bldg-footprint-${bldg.id}`}
                    onClick={() => focusOnBuilding(bldg)}
                    className="cursor-pointer transition-opacity duration-300"
                    opacity={isVisible ? 1 : 0.25}
                    filter={isSelected ? 'url(#goldGlow)' : 'url(#bldgShadow)'}
                  >
                    {/* Gabled Architectural Outline */}
                    <rect
                      x={bx - 42}
                      y={by - 24}
                      width="84"
                      height="48"
                      rx="3"
                      fill={isSelected ? '#23120B' : '#F5F0E6'}
                      stroke={isSelected ? '#E5A910' : '#8B7355'}
                      strokeWidth={isSelected ? '3' : '1.5'}
                    />
                    {/* Roof Ridge Accents */}
                    <line 
                      x1={bx - 36} 
                      y1={by} 
                      x2={bx + 36} 
                      y2={by} 
                      stroke={isSelected ? '#E5A910' : '#BAA892'} 
                      strokeWidth="1.2" 
                      strokeDasharray="4,2" 
                    />
                    <polygon
                      points={`${bx - 42},${by - 24} ${bx},${by - 34} ${bx + 42},${by - 24}`}
                      fill={isSelected ? '#3D2012' : '#E2D8C6'}
                      stroke={isSelected ? '#E5A910' : '#8B7355'}
                      strokeWidth="1"
                    />
                  </g>
                );
              })}

              {/* 9. Interactive Landmark Pinpoints */}
              {displayedBuildings.map((bldg) => {
                const isSelected = selectedBuilding?.id === bldg.id;
                const meta = CATEGORY_COLORS[bldg.category];
                if (!bldg.x || !bldg.y) return null;

                return (
                  <g
                    key={`pin-${bldg.id}`}
                    transform={`translate(${bldg.x}, ${bldg.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      focusOnBuilding(bldg);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing Target Ring when selected */}
                    {isSelected && (
                      <circle
                        cx="0"
                        cy="0"
                        r="24"
                        fill="none"
                        stroke="#E5A910"
                        strokeWidth="2.5"
                        strokeDasharray="4,3"
                        className="animate-spin"
                        style={{ animationDuration: '8s' }}
                      />
                    )}

                    {/* Outer Badge Shadow */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? '16' : '13'}
                      fill={isSelected ? '#E5A910' : meta.hex}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="transition-all duration-200 group-hover:scale-110"
                    />

                    {/* Building Code Label */}
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isSelected ? '#1E0F08' : '#FFFFFF'}
                      fontSize={isSelected ? '9' : '8'}
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      {bldg.code}
                    </text>

                    {/* Floating Hover Label Badge */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <rect
                        x="-60"
                        y="-42"
                        width="120"
                        height="20"
                        rx="3"
                        fill="#23120B"
                        stroke="#E5A910"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-28"
                        textAnchor="middle"
                        fill="#FFFDF7"
                        fontSize="9"
                        fontWeight="bold"
                        className="font-collegiate-sans"
                      >
                        {bldg.name.length > 22 ? `${bldg.name.slice(0, 20)}...` : bldg.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Landmark Detail Dossier (4 Cols on desktop) */}
        <div className="lg:col-span-4 bg-white border-t lg:border-t-0 lg:border-l border-[#E8DFC8] flex flex-col justify-between overflow-y-auto max-h-[580px] p-5 sm:p-6 space-y-4">
          {selectedBuilding ? (
            <div className="space-y-4">
              {/* Image & Category Pill Header */}
              <div className="relative h-44 w-full bg-stone-900 border border-stone-200 overflow-hidden shrink-0">
                <img
                  src={selectedBuilding.imageUrl}
                  alt={selectedBuilding.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Top Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase font-mono tracking-wider border ${CATEGORY_COLORS[selectedBuilding.category].bg} ${CATEGORY_COLORS[selectedBuilding.category].text} ${CATEGORY_COLORS[selectedBuilding.category].border}`}>
                    {selectedBuilding.category}
                  </span>
                  <span className="px-1.5 py-0.5 bg-black/70 text-white font-mono text-[10px] font-bold">
                    {selectedBuilding.code}
                  </span>
                </div>

                {/* Bottom Title Bar on Image */}
                <div className="absolute bottom-2 left-3 right-3 text-white">
                  <div className="text-[10px] text-[#E5A910] font-mono">
                    Erected {selectedBuilding.yearBuilt} • {selectedBuilding.zone}
                  </div>
                  <h3 className="font-collegiate-display text-base font-bold leading-snug">
                    {selectedBuilding.name}
                  </h3>
                </div>
              </div>

              {/* Architectural Style & Location */}
              <div className="bg-[#FAF7F2] border border-[#E8DFC8] p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-[10px] uppercase font-mono">Style:</span>
                  <span className="font-semibold text-[#23120B]">{selectedBuilding.architecturalStyle || 'Collegiate Heritage'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-[10px] uppercase font-mono">Location:</span>
                  <span className="font-semibold text-stone-700">{selectedBuilding.location}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-stone-200 text-stone-600">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-[#8B4513]" />
                    <span>{selectedBuilding.hours}</span>
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-500 font-mono block">
                  Collegiate Blueprint & Purpose
                </span>
                <p className="font-collegiate-serif text-xs text-stone-700 leading-relaxed">
                  {selectedBuilding.description}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-stone-500 font-mono block">
                  Signature Facilities & Collections
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {selectedBuilding.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8B4513] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accessibility */}
              {selectedBuilding.accessibilityNotes && (
                <div className="text-[11px] text-stone-600 bg-white border border-stone-200 p-2 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#E5A910] shrink-0 mt-0.5" />
                  <span>{selectedBuilding.accessibilityNotes}</span>
                </div>
              )}

              {/* Interactive Navigation Action */}
              <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setIsNavigating(true)}
                  className="flex-1 px-3 py-2 bg-[#23120B] hover:bg-[#3D2012] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Footprints className="w-3.5 h-3.5 text-[#E5A910]" />
                  <span>Walk Route</span>
                </button>

                {onSelectTab && (
                  <button
                    onClick={() => {
                      if (selectedBuilding.category === 'Academic') onSelectTab('academics');
                      else if (selectedBuilding.category === 'Administrative') onSelectTab('admissions');
                      else onSelectTab('campus-life');
                    }}
                    className="px-3 py-2 bg-[#FAF7F2] hover:bg-stone-200 text-[#8B4513] border border-[#E8DFC8] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Portal</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500 space-y-2">
              <Building2 className="w-8 h-8 text-stone-400" />
              <div className="font-collegiate-display text-sm font-bold text-[#23120B]">
                Select a Campus Landmark
              </div>
              <p className="text-xs max-w-xs">
                Click any building pin on the map or select from the category buttons to inspect architectural archives.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Bottom Directory Strip with Quick Select Cards */}
      <div className="bg-[#FAF7F2] border-t border-[#E8DFC8] p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#23120B] uppercase tracking-wider text-[11px]">
            Landmark Directory ({displayedBuildings.length} Visible on Grounds)
          </span>
          <span className="text-stone-500 text-[10px]">Click any card to pinpoint on blueprint</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {displayedBuildings.map((bldg) => {
            const isSelected = selectedBuilding?.id === bldg.id;
            const meta = CATEGORY_COLORS[bldg.category];
            return (
              <button
                key={bldg.id}
                onClick={() => focusOnBuilding(bldg)}
                className={`p-2.5 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#23120B] text-white border-[#E5A910] shadow-sm'
                    : 'bg-white hover:bg-[#FFFDF7] text-stone-800 border-[#E8DFC8] hover:border-stone-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span 
                      className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded-xs"
                      style={{ 
                        backgroundColor: isSelected ? '#E5A910' : meta.hex,
                        color: isSelected ? '#1E0F08' : '#FFFFFF' 
                      }}
                    >
                      {bldg.code}
                    </span>
                    <span className={`text-[9px] font-mono ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                      {bldg.yearBuilt}
                    </span>
                  </div>
                  <h4 className="font-collegiate-display text-xs font-bold line-clamp-1 leading-snug">
                    {bldg.name}
                  </h4>
                </div>
                <div className={`text-[10px] mt-1.5 flex items-center justify-between ${
                  isSelected ? 'text-[#E5A910]' : 'text-[#8B4513]'
                }`}>
                  <span className="truncate">{bldg.category}</span>
                  <ChevronRight className="w-3 h-3 shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
