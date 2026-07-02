import React, { useState, useEffect, useMemo } from 'react';
import { SHOWCASE_VIDEOS } from './data/videos';
import { VideoItem, VideoCategory, GitHubUser } from './types';
import ThreeDGallery from './components/ThreeDGallery';
import FCPTimeline from './components/FCPTimeline';
import VideoPlayerModal from './components/VideoPlayerModal';
import ProjectPlanner from './components/ProjectPlanner';
import {
  Search,
  Sliders,
  Phone,
  Mail,
  MapPin,
  FolderOpen,
  SlidersHorizontal,
  Tv,
  Film,
  Info,
  Layers,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Settings,
  HelpCircle,
  Activity,
  Send,
  Smartphone,
  CheckCircle,
  Github,
  LogOut,
  Calculator
} from 'lucide-react';

export default function App() {
  // 1. Core States
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePlayVideo, setActivePlayVideo] = useState<VideoItem | null>(null);
  const [selectedTool, setSelectedTool] = useState<'select' | 'blade' | 'hand' | 'trim'>('select');
  const [selectedPresetName, setSelectedPresetName] = useState('Default Grade');

  // GitHub Integration States
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [isGithubDropdownOpen, setIsGithubDropdownOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);

  const fetchGitHubUser = async () => {
    try {
      const res = await fetch('/api/github/user');
      if (res.ok) {
        const data = await res.json();
        setGithubUser(data);
      } else {
        setGithubUser(null);
      }
    } catch (err) {
      console.error("Error fetching GitHub user:", err);
      setGithubUser(null);
    }
  };

  const handleConnectGitHub = async () => {
    try {
      const res = await fetch('/api/auth/url');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to get authorization URL');
      }
      const { url } = await res.json();
      
      const width = 600;
      const height = 750;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        url,
        'github_oauth_popup',
        `width=${width},height=${height},top=${top},left=${left}`
      );
      
      if (!popup) {
        alert("Please allow popups to connect with GitHub.");
      }
    } catch (err: any) {
      alert(err.message || 'Error starting GitHub connection');
    }
  };

  const handleLogoutGitHub = async () => {
    try {
      await fetch('/api/github/logout', { method: 'POST' });
      setGithubUser(null);
      setIsGithubDropdownOpen(false);
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  useEffect(() => {
    fetchGitHubUser();
    
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchGitHubUser();
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Interactive FCP Color Grading sliders state
  const [colorFilters, setColorFilters] = useState({
    exposure: 100,     // default brightness
    saturation: 100,   // default saturation
    contrast: 100,     // default contrast
    hue: 0,            // default hue tilt
  });

  // Contact Panel States
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactCategory, setContactCategory] = useState('Wedding & Pre-wedding');
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [contactProgress, setContactProgress] = useState(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;

    setIsSendingContact(true);
    setContactProgress(0);

    const steps = [20, 45, 75, 100];
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setContactProgress(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsSendingContact(false);
        setContactSubmitted(true);
      }
    }, 150);
  };

  // Color grading preset buttons definitions
  const PRESETS = [
    { name: 'Default Grade', exposure: 100, saturation: 100, contrast: 100, hue: 0 },
    { name: 'Cinematic Teal & Orange', exposure: 105, saturation: 135, contrast: 110, hue: -10 },
    { name: 'Moody Cyberpunk', exposure: 95, saturation: 160, contrast: 120, hue: 140 },
    { name: 'Warm Royal Gold', exposure: 110, saturation: 120, contrast: 105, hue: 10 },
    { name: 'Classic Noir', exposure: 90, saturation: 0, contrast: 130, hue: 0 },
  ];

  const applyColorPreset = (preset: typeof PRESETS[0]) => {
    setColorFilters({
      exposure: preset.exposure,
      saturation: preset.saturation,
      contrast: preset.contrast,
      hue: preset.hue,
    });
    setSelectedPresetName(preset.name);
  };

  // 2. Filter & Search Logic
  const filteredVideos = useMemo(() => {
    return SHOWCASE_VIDEOS.filter((video) => {
      const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
      const matchesSearch =
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.fcpTags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Handle boundary clips safely if lists change dynamically
  useEffect(() => {
    if (selectedIndex >= filteredVideos.length) {
      setSelectedIndex(Math.max(0, filteredVideos.length - 1));
    }
  }, [filteredVideos.length, selectedIndex]);

  // Sync selectedIndex and activePlayVideo one way: when selectedIndex changes, update activePlayVideo to match the current selected video.
  useEffect(() => {
    if (activePlayVideo && filteredVideos.length > 0) {
      const currentSelectedVideo = filteredVideos[selectedIndex];
      if (currentSelectedVideo && currentSelectedVideo.id !== activePlayVideo.id) {
        setActivePlayVideo(currentSelectedVideo);
      }
    }
  }, [selectedIndex, filteredVideos]);

  // Unified selection helper to set active video and sync selectedIndex simultaneously
  const handleSelectVideoInModal = (video: VideoItem) => {
    setActivePlayVideo(video);
    setIsPlaying(true); // Automatically play on open
    if (filteredVideos.length > 0) {
      const idx = filteredVideos.findIndex((v) => v.id === video.id);
      if (idx !== -1 && idx !== selectedIndex) {
        setSelectedIndex(idx);
      }
    }
  };

  // 3. Autoplay Carousel Interval Setup
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && filteredVideos.length > 0) {
      interval = setInterval(() => {
        setSelectedIndex((prev) => (prev + 1) % filteredVideos.length);
      }, 5000); // Shift front focus every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isPlaying, filteredVideos.length]);

  // 4. Keyboard Navigation Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if user is typing in form inputs
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredVideos.length));
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev - 1 + filteredVideos.length) % Math.max(1, filteredVideos.length));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key.toLowerCase() === 'i' && filteredVideos[selectedIndex]) {
        setActivePlayVideo(filteredVideos[selectedIndex]);
      } else if (e.key.toLowerCase() === 'b') {
        setSelectedTool('blade');
      } else if (e.key.toLowerCase() === 'a') {
        setSelectedTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredVideos, selectedIndex, activePlayVideo]);

  const activeSelectedVideo = filteredVideos[selectedIndex] || null;

  // Custom Category Info Tags
  const categoriesList: { name: VideoCategory | 'All'; count: number }[] = useMemo(() => {
    const counts = SHOWCASE_VIDEOS.reduce((acc, v) => {
      acc[v.category] = (acc[v.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'All', count: SHOWCASE_VIDEOS.length },
      { name: 'Showreels & Promos', count: counts['Showreels & Promos'] || 0 },
      { name: 'Wedding & Pre-wedding', count: counts['Wedding & Pre-wedding'] || 0 },
      { name: 'Corporate', count: counts['Corporate'] || 0 },
      { name: 'Housewarming & Maternity', count: counts['Housewarming & Maternity'] || 0 },
      { name: 'DJ Night', count: counts['DJ Night'] || 0 },
      { name: 'Editing Samples', count: counts['Editing Samples'] || 0 },
    ];
  }, []);

  // Determine container cursor class based on selected tool
  const getCursorClass = () => {
    if (selectedTool === 'blade') return 'cursor-[url(https://cdn-icons-png.flaticon.com/32/3426/3426533.png),_col-resize]';
    if (selectedTool === 'hand') return 'cursor-grab active:cursor-grabbing';
    if (selectedTool === 'trim') return 'cursor-col-resize';
    return 'cursor-default';
  };

  return (
    <div className={`min-h-screen bg-zinc-950 flex flex-col overflow-x-hidden text-zinc-100 ${getCursorClass()}`} id="fcp-portfolio-root">
      {/* 1. Header Navigation Bar (Styled like FCP X Top Bar) */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md px-4 flex items-center justify-between z-40 shrink-0 select-none">
        {/* Editor Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-cyan-500 flex items-center justify-center p-[2px] shadow-lg shadow-cyan-500/10 animate-pulse">
            <div className="w-full h-full bg-zinc-950 rounded-[6px] flex items-center justify-center font-display font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-amber-300">
              FCP
            </div>
          </div>
          <div>
            <h1 className="text-sm font-display font-black text-white tracking-tight flex items-center gap-1.5">
              <span>EDITOR SAGAR</span>
              <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                Pro
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wide leading-none">Final Cut Pro X Masterclass Studio</p>
          </div>
        </div>

        {/* Rapid Location & Contact Badge */}
        <div className="hidden md:flex items-center gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <div className="text-left">
              <span className="text-[9px] text-zinc-500 block font-mono">LOCATION</span>
              <span className="font-semibold text-zinc-300">Rajajinagar, Bangalore</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            <div className="text-left">
              <span className="text-[9px] text-zinc-500 block font-mono">CALL / WHATSAPP</span>
              <a href="tel:7619633201" className="font-semibold text-zinc-300 hover:text-cyan-400 transition-colors">
                +91 76196 33201
              </a>
            </div>
          </div>
        </div>

        {/* FCP App Header Panel Widgets */}
        <div className="flex items-center gap-2.5">
          {/* Quick status bar */}
          <div className="hidden sm:flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded text-[10px] font-mono">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-zinc-500">Render:</span>
            <span className="text-emerald-400 font-bold">100% Cache</span>
          </div>

          {/* Project Planner Launcher Button */}
          <button
            onClick={() => setIsPlannerOpen(true)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-xs font-bold transition-all border border-zinc-700 flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>Plan Project</span>
          </button>

          {/* GitHub Connection Badge / Button */}
          {githubUser ? (
            <div className="relative">
              <button
                onClick={() => setIsGithubDropdownOpen(!isGithubDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={githubUser.avatarUrl}
                    alt={githubUser.username}
                    className="w-5.5 h-5.5 rounded-full border border-cyan-500/30"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-zinc-950 animate-pulse"></span>
                </div>
                <span className="text-[11px] font-mono text-zinc-300 font-bold hidden sm:inline truncate max-w-[80px]">{githubUser.name}</span>
              </button>

              {isGithubDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-3 z-50 text-xs animate-fade-in text-left">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-zinc-800">
                    <img
                      src={githubUser.avatarUrl}
                      alt=""
                      className="w-8 h-8 rounded-full border border-zinc-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-zinc-100 truncate">{githubUser.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">@{githubUser.username}</p>
                    </div>
                  </div>
                  {githubUser.bio && (
                    <p className="text-[10px] text-zinc-400 mt-2 italic leading-normal border-b border-zinc-800/60 pb-2">
                      {githubUser.bio}
                    </p>
                  )}
                  <div className="pt-2 border-t border-zinc-800 flex gap-2">
                    <a
                      href={githubUser.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-center rounded-md text-[10px] font-semibold flex items-center justify-center gap-1"
                    >
                      <Github className="w-3 h-3" />
                      <span>Profile</span>
                    </a>
                    <button
                      onClick={handleLogoutGitHub}
                      className="flex-1 py-1.5 bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 text-center rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 border border-rose-900/30 cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnectGitHub}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Github className="w-3.5 h-3.5 text-zinc-400" />
              <span>Connect GitHub</span>
            </button>
          )}

          <a
            href="https://wa.me/917619633201"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-cyan-500/10 flex items-center gap-1 active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Export</span>
          </a>
        </div>
      </header>

      {/* 2. Main FCP Workspace Editor Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-[450px]">
        {/* LEFT COLUMN: Media Browser & Event Directory (Filters) */}
        <aside className="w-full md:w-64 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 p-4 flex flex-col gap-4 shrink-0 select-none">
          {/* Media Browser Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
            <div className="flex items-center gap-2 text-zinc-400">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Media Libraries</h3>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">FCP_Sagar.library</span>
          </div>

          {/* Search box within library */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search edits, keywords, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-zinc-500"
            />
          </div>

          {/* Directory Folder Tree (Visual Categories List) */}
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[180px] md:max-h-none">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-1.5">Event Channels</span>
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSelectedIndex(0); // reset page slide
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 font-semibold border-l-2 border-cyan-400 shadow-sm'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Film className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-zinc-600'}`} />
                    <span className="truncate">{cat.name === 'All' ? 'All Showcase Clips' : cat.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-cyan-950 text-cyan-400' : 'bg-zinc-900 text-zinc-500'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CENTER COLUMN: Immersive 3D Space & Helix Video Showcase */}
        <main className="flex-1 bg-[#09090b] flex flex-col relative overflow-hidden min-h-[300px]">
          {/* Main 3D Canvas Box */}
          <div className="flex-1 relative">
            {filteredVideos.length > 0 && !activePlayVideo ? (
              <ThreeDGallery
                videos={filteredVideos}
                selectedIndex={selectedIndex}
                onSelectVideo={setSelectedIndex}
                colorFilters={colorFilters}
                onPlayVideo={handleSelectVideoInModal}
              />
            ) : filteredVideos.length > 0 && activePlayVideo ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center select-none z-10">
                <Film className="w-12 h-12 text-cyan-500/80 mb-3 animate-pulse" />
                <h4 className="text-sm font-bold text-zinc-300">Active Video Project Opened</h4>
                <p className="text-xs text-zinc-500 max-w-xs mt-1 font-mono">
                  Currently playing: RAW_STREAM_{activePlayVideo.id}.mov
                </p>
                <button
                  onClick={() => setActivePlayVideo(null)}
                  className="mt-4 px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition-colors border border-zinc-800"
                >
                  Return to 3D Board
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none z-10">
                <Film className="w-12 h-12 text-zinc-700 mb-3 animate-pulse" />
                <h4 className="text-sm font-bold text-zinc-400">No showcase footage matches search</h4>
                <p className="text-xs text-zinc-500 max-w-xs mt-1">
                  Adjust your media filter or clear the search timeline browser above.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors border border-zinc-700"
                >
                  Clear Timeline Browser
                </button>
              </div>
            )}
          </div>

          {/* Bottom FCP timeline scrub deck */}
          <div className="shrink-0">
            <FCPTimeline
              videos={filteredVideos}
              selectedIndex={selectedIndex}
              onSelectVideo={setSelectedIndex}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
            />
          </div>
        </main>

        {/* RIGHT COLUMN: FCP Contact & Booking Inquiry Panel */}
        <aside className="w-full md:w-80 bg-zinc-950 border-t md:border-t-0 md:border-l border-zinc-800 p-4 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
          <div>
            <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-900 mb-4 text-zinc-400">
              <Phone className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Booking & Contact</h3>
            </div>

            {/* Direct Contact Info */}
            <div className="space-y-3 mb-5">
              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-900 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block font-mono">CALL / WHATSAPP</span>
                    <a href="tel:7619633201" className="text-xs font-semibold text-zinc-200 hover:text-cyan-400 transition-colors">
                      +91 76196 33201
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5 text-pink-400" />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block font-mono">EMAIL INQUIRY</span>
                    <a href="mailto:maharshithefox@gmail.com" className="text-xs font-semibold text-zinc-200 hover:text-pink-400 transition-colors">
                      maharshithefox@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block font-mono">STUDIO LOCATION</span>
                    <span className="text-xs font-semibold text-zinc-200">
                      Rajajinagar, Bangalore
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Planner Promo Card */}
            <div className="mb-5 p-3.5 bg-gradient-to-br from-cyan-950/40 to-blue-950/20 border border-cyan-800/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">FCP Budget & Quote Planner</h4>
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Need an instant, tailored edit quote? Adjust raw footage volume, timeline details and sync your FCP brief!
              </p>
              <button
                onClick={() => setIsPlannerOpen(true)}
                className="w-full py-1.5 bg-cyan-950/50 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-400 text-[10px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                Launch FCP Project Planner
              </button>
            </div>

            {/* Interactive Inquiry Form */}
            {!contactSubmitted ? (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Quick Proposal Builder</span>
                  <span className="text-[9px] text-zinc-500 font-mono">FCP_Inquiry.package</span>
                </div>

                {isSendingContact ? (
                  /* Rendering Progress Simulation */
                  <div className="py-8 p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-14 h-14">
                      <div className="absolute inset-0 rounded-full border-2 border-zinc-800"></div>
                      <div
                        style={{ clipPath: `polygon(50% 50%, -50% -50%, ${contactProgress}% -50%, ${contactProgress}% 150%, -50% 150%)` }}
                        className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-spin-slow"
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                        {contactProgress}%
                      </div>
                    </div>
                    <div className="text-center space-y-0.5">
                      <h4 className="text-[11px] font-bold text-zinc-200">Processing FCP Inquiry...</h4>
                      <p className="text-[9px] text-cyan-400 font-mono animate-pulse">Exporting package parameters</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Your Full Name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-zinc-500"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        required
                        placeholder="WhatsApp / Phone Number"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-zinc-500"
                      />
                    </div>

                    <div>
                      <select
                        value={contactCategory}
                        onChange={(e) => setContactCategory(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value="Wedding & Pre-wedding">Wedding & Pre-wedding Film</option>
                        <option value="Corporate">Corporate Profile</option>
                        <option value="Housewarming & Maternity">Housewarming & Maternity</option>
                        <option value="DJ Night">DJ Night & Aftermovie</option>
                        <option value="Showreels & Promos">Showreels & Promos</option>
                        <option value="Editing Samples">Post-Production Only</option>
                      </select>
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        placeholder="Briefly describe your requirements..."
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none placeholder:text-zinc-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/10 active:scale-95 transition-transform"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>RENDER & SEND INQUIRY</span>
                    </button>
                  </div>
                )}
              </form>
            ) : (
              /* Success Panel */
              <div className="p-4 bg-zinc-900/40 rounded-xl border border-emerald-900/40 text-center space-y-4 animate-fade-in">
                <div className="w-10 h-10 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">Inquiry Rendered Successfully!</h4>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Hi <strong>{contactName}</strong>, your brief for <strong>{contactCategory}</strong> has been cached and sent.
                  </p>
                </div>
                <div className="pt-1 flex flex-col gap-1.5">
                  <a
                    href={`https://wa.me/917619633201?text=Hi%20Sagar,%20I'm%20${encodeURIComponent(contactName)}.%20I'd%20like%20to%20discuss%20a%20${encodeURIComponent(contactCategory)}%20project!%20My%20details:%20${encodeURIComponent(contactMessage)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Chat on WhatsApp Now</span>
                  </a>
                  <button
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactName('');
                      setContactPhone('');
                      setContactMessage('');
                    }}
                    className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold rounded-lg transition-colors border border-zinc-700"
                  >
                    Submit Another Brief
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Copyright/Footer details */}
          <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase font-mono">Available for projects Bangalore</span>
            </div>
            <p className="text-[8px] text-zinc-600 font-mono leading-tight">
              © {new Date().getFullYear()} Editor Sagar Bangalore. All rights reserved. Registered Rajajinagar Studio.
            </p>
          </div>
        </aside>
      </div>

      {/* 4. Fullscreen Video Playback Overlay Modal */}
      {activePlayVideo && (
        <VideoPlayerModal
          video={activePlayVideo}
          videos={SHOWCASE_VIDEOS}
          onSelectVideoInModal={handleSelectVideoInModal}
          onClose={() => setActivePlayVideo(null)}
          colorFilters={colorFilters}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
        />
      )}

      {/* 5. Custom Project Planner Modal */}
      {isPlannerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-lg relative animate-fade-in my-8">
            <button
              onClick={() => setIsPlannerOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-950/60 w-7 h-7 rounded-full flex items-center justify-center z-10 hover:scale-110 active:scale-95 transition-all border border-zinc-800 cursor-pointer text-xs font-bold"
            >
              ✕
            </button>
            <ProjectPlanner 
              onClose={() => setIsPlannerOpen(false)} 
              githubUser={githubUser}
              onConnectGitHub={handleConnectGitHub}
            />
          </div>
        </div>
      )}
    </div>
  );
}
