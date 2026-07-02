import React, { useRef, useState, useEffect, useMemo } from 'react';
import { VideoItem } from '../types';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  SlidersHorizontal,
  Check,
  Tv,
  ArrowLeft,
  Smartphone,
  Sparkles,
  Info,
  Sliders,
  Database,
  FolderOpen,
  Film,
  List,
  Grid,
  Music,
  Type,
  Scissors,
  Hand,
  Layers,
  MousePointerClick,
  Share2,
  HelpCircle,
  Lock,
  Unlock,
  Volume1,
  Layout,
  Maximize2,
  Sliders as SlidersIcon,
  Video,
  Disc,
  Folder,
  Eye,
  EyeOff,
  Zap,
  Activity,
  ChevronRight
} from 'lucide-react';

interface VideoPlayerModalProps {
  video: VideoItem;
  videos: VideoItem[];
  onSelectVideoInModal: (video: VideoItem) => void;
  onClose: () => void;
  colorFilters: {
    exposure: number;
    saturation: number;
    contrast: number;
    hue: number;
  };
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

export const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function VideoPlayerModal({
  video,
  videos,
  onSelectVideoInModal,
  onClose,
  colorFilters,
  isPlaying: isPlayingTimeline,
  onTogglePlay: onTogglePlayTimeline,
}: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Track currently playing video locally so user can click other clips in library
  const [currentVideo, setCurrentVideo] = useState<VideoItem>(video);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [currentTimeCode, setCurrentTimeCode] = useState('00:00:00:00');
  const [durationTimeCode, setDurationTimeCode] = useState('00:00:45:00');
  const [isCopied, setIsCopied] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(true);

  // Inspector States
  const [activeTab, setActiveTab] = useState<'video' | 'color' | 'audio' | 'effects'>('video');
  
  // Video layout transforms (Live!)
  const [scale, setScale] = useState(100);
  const [opacity, setOpacity] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Color Grading Sliders (Live overrides)
  const [exposure, setExposure] = useState(colorFilters.exposure);
  const [saturation, setSaturation] = useState(colorFilters.saturation);
  const [contrast, setContrast] = useState(colorFilters.contrast);
  const [hue, setHue] = useState(colorFilters.hue);

  // Visual effects presets
  const [activeEffect, setActiveEffect] = useState<'none' | 'monochrome' | 'golden' | 'cyberpunk' | 'vintage' | 'blur'>('none');

  // Audio adjustments
  const [audioEq, setAudioEq] = useState<'flat' | 'bass-boost' | 'vocal-enhance' | 'cinematic'>('flat');
  const [voiceIsolation, setVoiceIsolation] = useState(true);
  const [humRemoval, setHumRemoval] = useState(false);

  // Resolution features
  const [resolution, setResolution] = useState<'4K Master' | '1080p Proxy' | '720p Draft'>('4K Master');
  const [isSwitchingRes, setIsSwitchingRes] = useState(false);
  const [resProgress, setResProgress] = useState(0);

  // Viewer Helpers
  const [showSafeAreas, setShowSafeAreas] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [viewerZoom, setViewerZoom] = useState<'fit' | '50%' | '100%' | '150%'>('fit');

  // Browser folder state
  const [browserCategory, setBrowserCategory] = useState<string>('All Clips');
  const [searchQuery, setSearchQuery] = useState('');

  // Stereo dB meter audio simulation
  const [leftDb, setLeftDb] = useState(-45);
  const [rightDb, setRightDb] = useState(-45);

  // Sync state if initial prop video changes
  useEffect(() => {
    setCurrentVideo(video);
    setExposure(colorFilters.exposure);
    setSaturation(colorFilters.saturation);
    setContrast(colorFilters.contrast);
    setHue(colorFilters.hue);
  }, [video, colorFilters]);

  // Sync isPlaying with timeline play/pause controls
  useEffect(() => {
    if (isPlayingTimeline !== undefined) {
      setIsPlaying(isPlayingTimeline);
      if (!getYoutubeId(currentVideo.videoUrl) && videoRef.current) {
        if (isPlayingTimeline) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      }
    }
  }, [isPlayingTimeline, currentVideo.videoUrl]);

  // Handle actual playback loading on video change
  useEffect(() => {
    if (getYoutubeId(currentVideo.videoUrl)) {
      setIsPlaying(true);
      return;
    }
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [currentVideo]);

  // YouTube Simulated Progress Timer
  useEffect(() => {
    let playTimer: NodeJS.Timeout;
    if (getYoutubeId(currentVideo.videoUrl) && isPlaying) {
      playTimer = setInterval(() => {
        setProgress((prev) => {
          const next = prev + (100 / 135); // simulated 2m 15s (135s)
          if (next >= 100) return 0;
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(playTimer);
  }, [currentVideo, isPlaying]);

  // Sync simulated progress to timecode
  useEffect(() => {
    if (getYoutubeId(currentVideo.videoUrl)) {
      const totalSecs = 135; // 2:15
      const currentSecs = (progress / 100) * totalSecs;
      setCurrentTimeCode(formatTimeCode(currentSecs));
      setDurationTimeCode(formatTimeCode(totalSecs));
    }
  }, [progress, currentVideo]);

  // Bouncing Volume Peak Meter Loop
  useEffect(() => {
    let meterInterval: NodeJS.Timeout;
    if (isPlaying && !isMuted) {
      meterInterval = setInterval(() => {
        // Generate random realistic audio decibel values oscillating between -30 and -2dB
        const randomLeft = Math.floor(Math.random() * 22) - 24;
        const randomRight = Math.floor(Math.random() * 22) - 24;
        setLeftDb(randomLeft);
        setRightDb(randomRight);
      }, 100);
    } else {
      setLeftDb(-60);
      setRightDb(-60);
    }
    return () => clearInterval(meterInterval);
  }, [isPlaying, isMuted]);

  const togglePlay = () => {
    if (onTogglePlayTimeline) {
      onTogglePlayTimeline();
    } else {
      if (getYoutubeId(currentVideo.videoUrl)) {
        setIsPlaying(!isPlaying);
        return;
      }
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          videoRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        }
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (getYoutubeId(currentVideo.videoUrl)) {
      if (val === 0) {
        setIsMuted(true);
      } else {
        setIsMuted(false);
      }
      return;
    }
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (getYoutubeId(currentVideo.videoUrl)) {
      setIsMuted(!isMuted);
      return;
    }
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  // Convert current seconds to real video editor timecode HH:MM:SS:FF (at 24fps)
  const formatTimeCode = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const frames = Math.floor((secs % 1) * 24);
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 45;
      setProgress((current / duration) * 100);
      setCurrentTimeCode(formatTimeCode(current));
      setDurationTimeCode(formatTimeCode(duration));
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextProgress = parseFloat(e.target.value);
    setProgress(nextProgress);
    if (videoRef.current) {
      const duration = videoRef.current.duration || 45;
      const newTime = (nextProgress / 100) * duration;
      videoRef.current.currentTime = newTime;
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    setProgress(percentage);
    if (videoRef.current) {
      const duration = videoRef.current.duration || 45;
      videoRef.current.currentTime = (percentage / 100) * duration;
    }
  };

  const restartVideo = () => {
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(true);
  };

  // Handle switching resolution with cool buffering HUD
  const handleResolutionChange = (res: typeof resolution) => {
    if (res === resolution) return;
    setIsSwitchingRes(true);
    setResProgress(0);

    const steps = [18, 45, 80, 100];
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setResProgress(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        setResolution(res);
        setIsSwitchingRes(false);
      }
    }, 120);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out this incredible edit: "${currentVideo.title}" by Sagar Cinema Bangalore.`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const resetTransforms = () => {
    setScale(100);
    setOpacity(100);
    setRotation(0);
  };

  const resetColors = () => {
    setExposure(100);
    setSaturation(100);
    setContrast(100);
    setHue(0);
  };

  // Compose dynamic CSS filters based on user sliders AND active visual effect LUT
  const getFilterStyle = () => {
    let effectFilter = '';
    switch (activeEffect) {
      case 'monochrome':
        effectFilter = 'grayscale(100%) contrast(125%) ';
        break;
      case 'golden':
        effectFilter = 'sepia(45%) saturate(145%) hue-rotate(-8deg) brightness(105%) ';
        break;
      case 'cyberpunk':
        effectFilter = 'hue-rotate(140deg) saturate(190%) contrast(115%) ';
        break;
      case 'vintage':
        effectFilter = 'sepia(65%) contrast(110%) brightness(92%) saturate(75%) ';
        break;
      case 'blur':
        effectFilter = 'blur(4px) ';
        break;
      default:
        effectFilter = '';
    }

    return {
      filter: `${effectFilter}brightness(${exposure}%) saturate(${saturation}%) contrast(${contrast}%) hue-rotate(${hue}deg)`,
      transform: `scale(${scale / 100}) rotate(${rotation}deg)`,
      opacity: opacity / 100,
      transition: 'transform 0.1s ease-out, opacity 0.1s ease-out, filter 0.1s ease-out'
    };
  };

  // Filter video library in browser list
  const filteredBrowserVideos = useMemo(() => {
    return videos.filter(v => {
      const matchesCategory = 
        browserCategory === 'All Clips' ||
        (browserCategory === 'Showreels' && v.category === 'Showreels & Promos') ||
        (browserCategory === 'Wedding' && v.category === 'Wedding & Pre-wedding') ||
        (browserCategory === 'Corporate' && v.category === 'Corporate') ||
        (browserCategory === 'Lifestyle' && (v.category === 'Housewarming & Maternity' || v.category === 'DJ Night')) ||
        (browserCategory === 'Samples' && v.category === 'Editing Samples');

      const matchesSearch = 
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.fcpTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [videos, browserCategory, searchQuery]);

  // Audio level dB meter segments converter helper
  const getDbSegments = (db: number) => {
    // scale db from -60 to 0 to 12 segments
    const scaled = Math.round(((db + 60) / 60) * 12);
    return Math.max(0, Math.min(12, scaled));
  };

  // Handle jump back/forward 10s
  const skipTime = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 45, videoRef.current.currentTime + amount));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#161617] flex flex-col font-sans select-none overflow-hidden text-zinc-100 antialiased">
      
      {/* 1. PROFESSIONAL FCP TOP APPLICATION HEADER */}
      <nav className="h-11 bg-[#1e1e1f] border-b border-[#121213] px-3 flex items-center justify-between shrink-0 text-xs">
        {/* Apple Style Window Controls & Clear Back Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-2">
            <button 
              onClick={onClose} 
              className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors flex items-center justify-center text-[7px] text-zinc-950 font-black cursor-pointer" 
              title="Back to Portfolio"
            >
              ✕
            </button>
            <div className="w-3 h-3 rounded-full bg-amber-500 opacity-60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-60" />
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 text-[10px] font-bold transition-all cursor-pointer mr-2 shadow-sm active:scale-95"
            title="Back to Portfolio Gallery"
          >
            <ArrowLeft className="w-3 h-3 text-cyan-400" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-3 font-medium text-zinc-300">
            <span className="font-bold text-white flex items-center gap-1">
              <span className="bg-cyan-500 text-zinc-950 px-1 py-0.5 rounded text-[9px] font-mono font-black">FCP</span>
              <span>Final Cut Pro</span>
            </span>
            <div className="h-3.5 w-[1px] bg-zinc-800"></div>
            
            {/* Fake macOS / FCP Menubar Dropdowns */}
            <div className="hidden lg:flex items-center gap-4 text-zinc-400">
              <button className="hover:text-white transition-colors">File</button>
              <button className="hover:text-white transition-colors">Edit</button>
              <button className="hover:text-white transition-colors">Trim</button>
              <button className="hover:text-white transition-colors">Mark</button>
              <button className="hover:text-white transition-colors">View</button>
              <button className="hover:text-white transition-colors">Window</button>
              <button className="hover:text-white transition-colors">Share</button>
            </div>
          </div>
        </div>

        {/* Center: Interactive Project Title & Render Status */}
        <div className="bg-[#101011] border border-[#252526] px-4 py-1 rounded-md flex items-center gap-3 font-mono text-[10px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-zinc-200 font-bold truncate max-w-[200px]">
              Sagar_Bangalore_Project_{currentVideo.id}.fcp
            </span>
          </div>
          <div className="h-3 w-[1px] bg-zinc-800"></div>
          <div>
            <span>Format: </span>
            <span className="text-cyan-400 font-bold">4K ProRes 422 HQ</span>
          </div>
          <div className="h-3 w-[1px] bg-zinc-800"></div>
          <div className="flex items-center gap-1">
            <span className="text-emerald-400 font-bold">Render: 100% Ready</span>
          </div>
        </div>

        {/* Right side: Exit Button and Applet Meta */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 bg-[#101011] px-2 py-1 rounded border border-zinc-800 text-[9px] font-mono text-zinc-500">
            <Activity className="w-2.5 h-2.5 text-cyan-400 mr-1 animate-pulse" />
            <span>GPU_ACCELERATED</span>
          </div>
          
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 hover:text-cyan-300 font-bold rounded border border-cyan-800 transition-all text-[11px] cursor-pointer shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Back to Portfolio</span>
          </button>
        </div>
      </nav>

      {/* 2. THREE-PANEL UPPER WORKSTATION BLOCK */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#161617] border-b border-[#121213]">
        
        {/* PANEL A: MEDIA BROWSER / LIBRARY (LEFT - 23% width) */}
        <div className="w-full lg:w-[23%] bg-[#1a1a1b] border-r border-[#121213] flex flex-col overflow-hidden select-none shrink-0">
          
          {/* Library Header */}
          <div className="p-3 bg-[#202021] border-b border-[#121213] flex items-center justify-between text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span>Sagar Cinema Library</span>
            </div>
            <span className="text-[9px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500 font-mono">
              Clips: {filteredBrowserVideos.length}
            </span>
          </div>

          {/* Search box & folders */}
          <div className="p-2 border-b border-[#121213] space-y-1.5 bg-[#181819]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search media library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1 bg-[#101011] border border-zinc-800 rounded text-[11px] text-white focus:outline-none focus:border-cyan-500 transition-all font-mono"
              />
              <span className="absolute left-2.5 top-1.5 text-zinc-600">
                <Folder className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Folder Collection Sidebar Filter list */}
            <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none text-[10px]">
              {(['All Clips', 'Showreels', 'Wedding', 'Corporate', 'Lifestyle', 'Samples'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setBrowserCategory(cat)}
                  className={`px-2 py-0.5 rounded whitespace-nowrap border transition-all ${
                    browserCategory === cat
                      ? 'bg-zinc-800 border-zinc-700 text-cyan-400 font-bold'
                      : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid list of project video assets */}
          <div className="flex-1 overflow-y-auto p-2.5 grid grid-cols-2 gap-2 bg-[#141415] scrollbar-thin content-start">
            {filteredBrowserVideos.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-zinc-600 font-mono text-[10px]">
                No matching clips in folder.
              </div>
            ) : (
              filteredBrowserVideos.map((v) => {
                const isActive = v.id === currentVideo.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      setCurrentVideo(v);
                      onSelectVideoInModal(v);
                    }}
                    className={`aspect-[16/10] rounded-md overflow-hidden cursor-pointer transition-all relative group border ${
                      isActive
                        ? 'border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/20'
                        : 'border-[#222223] hover:border-zinc-600 bg-zinc-950'
                    }`}
                    title={v.title}
                  >
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[8px] text-zinc-300 font-mono z-10">
                      {v.duration}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1.5 pt-4 z-10">
                      <p className={`text-[9px] leading-tight font-medium truncate ${
                        isActive ? 'text-cyan-400 font-semibold' : 'text-zinc-200'
                      }`}>
                        {v.title}
                      </p>
                    </div>
                    {isActive ? (
                      <div className="absolute inset-0 bg-cyan-500/10 flex items-center justify-center z-20">
                        <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 z-20">
                        <Play className="w-3.5 h-3.5 text-white/80" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL B: MAIN PREVIEW VIEWER (CENTER - 52% width) */}
        <div className="flex-1 bg-black flex flex-col justify-between relative overflow-hidden select-none border-r border-[#121213]">
          
          {/* Top Viewer Overlay Status bar */}
          <div className="h-9 bg-[#1a1a1b]/95 border-b border-[#121213] px-4 flex items-center justify-between text-[11px] text-zinc-400 font-mono z-10 shrink-0">
            <div className="flex items-center gap-3">
              {/* Zoom control */}
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-600">Scale:</span>
                <select
                  value={viewerZoom}
                  onChange={(e) => setViewerZoom(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-300 focus:outline-none text-[10px]"
                >
                  <option value="fit">Fit Viewer</option>
                  <option value="50%">50% View</option>
                  <option value="100%">100% View</option>
                  <option value="150%">150% Scale</option>
                </select>
              </div>

              <div className="h-3.5 w-[1px] bg-zinc-800"></div>

              {/* Safe Areas Switch */}
              <button
                onClick={() => setShowSafeAreas(!showSafeAreas)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all ${
                  showSafeAreas ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/30 font-bold' : 'hover:text-white'
                }`}
                title="Toggle Title Safe Guides"
              >
                <Tv className="w-3 h-3" />
                <span>Safe Areas</span>
              </button>

              {/* Grid Lines switch */}
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all ${
                  showGrid ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/30 font-bold' : 'hover:text-white'
                }`}
                title="Toggle Composition Grid"
              >
                <Layout className="w-3 h-3" />
                <span>Grid</span>
              </button>
            </div>

            {/* Render Output Resolution Selection */}
            <div className="flex bg-zinc-950 rounded p-0.5 border border-zinc-900">
              {(['4K Master', '1080p Proxy', '720p Draft'] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => handleResolutionChange(res)}
                  className={`text-[9px] px-2 py-0.5 rounded font-bold transition-all ${
                    resolution === res
                      ? 'bg-cyan-500 text-zinc-950'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {res.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Central Active Video Screen Canvas */}
          <div className="flex-1 flex items-center justify-center relative bg-black overflow-hidden p-4">
            
            {/* Safe Area Guides overlay overlay */}
            {showSafeAreas && (
              <div className="absolute inset-8 border border-dashed border-cyan-500/40 pointer-events-none rounded-sm z-10">
                <div className="absolute inset-8 border border-dashed border-cyan-500/20 pointer-events-none rounded-sm">
                  <div className="absolute top-2 left-2 text-[8px] text-cyan-400/50 font-mono">TITLE SAFE 90%</div>
                  <div className="absolute top-10 left-10 text-[8px] text-cyan-400/30 font-mono">ACTION SAFE 80%</div>
                </div>
              </div>
            )}

            {/* Rule of Thirds Grid overlay */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10">
                <div className="border-r border-b border-zinc-700/20"></div>
                <div className="border-r border-b border-zinc-700/20"></div>
                <div className="border-b border-zinc-700/20"></div>
                <div className="border-r border-b border-zinc-700/20"></div>
                <div className="border-r border-b border-zinc-700/20"></div>
                <div className="border-b border-zinc-700/20"></div>
                <div className="border-r border-zinc-700/20"></div>
                <div className="border-r border-zinc-700/20"></div>
                <div></div>
              </div>
            )}

            {/* Custom Interactive Resolution Buffering Overlay */}
            {isSwitchingRes ? (
              <div className="absolute inset-0 bg-black/95 z-20 flex flex-col items-center justify-center space-y-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-zinc-900"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Switching Render Engine</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Buffering {resolution} ({resProgress}%)
                  </p>
                </div>
              </div>
            ) : null}

            {/* Main Video Stream Player with transforms and CSS Filter grading applied */}
            <div 
              style={{
                width: viewerZoom === 'fit' ? '100%' : viewerZoom === '50%' ? '50%' : viewerZoom === '100%' ? '100%' : '150%',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
              className="relative aspect-video flex items-center justify-center"
            >
              {getYoutubeId(currentVideo.videoUrl) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYoutubeId(currentVideo.videoUrl)}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${getYoutubeId(currentVideo.videoUrl)}&controls=1&rel=0&showinfo=0&modestbranding=1`}
                  style={getFilterStyle()}
                  className="w-full h-full object-contain aspect-video border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  src={currentVideo.videoUrl}
                  style={getFilterStyle()}
                  onTimeUpdate={handleTimeUpdate}
                  loop={loopEnabled}
                  muted={isMuted}
                  playsInline
                  autoPlay
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlay}
                />
              )}

              {/* Pause overlay button screen */}
              {!isPlaying && !getYoutubeId(currentVideo.videoUrl) && (
                <button
                  onClick={togglePlay}
                  className="absolute p-4 rounded-full bg-cyan-500/90 text-zinc-950 shadow-2xl hover:scale-110 transition-transform z-10"
                >
                  <Play className="w-8 h-8 fill-current" />
                </button>
              )}
            </div>

            {/* STEREO AUDIO dB PEAK METERS (RIGHT COLUMN FLICKERS!) */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-zinc-950/90 border border-zinc-900 p-2 rounded-lg flex items-center gap-1.5 z-10 shadow-lg">
              {/* Left Channel */}
              <div className="flex flex-col gap-0.5 items-center">
                <div className="flex flex-col gap-[2px] h-32 w-1.5 justify-end">
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const level = 11 - idx; // 11 is top, 0 is bottom
                    const isActive = getDbSegments(leftDb) > level;
                    
                    // LEDs color grouping (red for top peaks, yellow mid, green low)
                    let bgClass = 'bg-zinc-800';
                    if (isActive) {
                      if (level >= 10) bgClass = 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]';
                      else if (level >= 7) bgClass = 'bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.5)]';
                      else bgClass = 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]';
                    }
                    return <div key={idx} className={`w-full h-1.5 rounded-sm transition-all duration-75 ${bgClass}`} />;
                  })}
                </div>
                <span className="text-[7px] text-zinc-600 font-mono uppercase font-bold">L</span>
              </div>

              {/* Right Channel */}
              <div className="flex flex-col gap-0.5 items-center">
                <div className="flex flex-col gap-[2px] h-32 w-1.5 justify-end">
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const level = 11 - idx;
                    const isActive = getDbSegments(rightDb) > level;
                    
                    let bgClass = 'bg-zinc-800';
                    if (isActive) {
                      if (level >= 10) bgClass = 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]';
                      else if (level >= 7) bgClass = 'bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.5)]';
                      else bgClass = 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]';
                    }
                    return <div key={idx} className={`w-full h-1.5 rounded-sm transition-all duration-75 ${bgClass}`} />;
                  })}
                </div>
                <span className="text-[7px] text-zinc-600 font-mono uppercase font-bold">R</span>
              </div>
            </div>
          </div>

          {/* Transport / Playback bar below viewer */}
          <div className="bg-[#1c1c1d] border-t border-[#121213] p-2 px-4 flex items-center justify-between shrink-0">
            {/* Timecode Indicators */}
            <div className="font-mono text-xs flex items-center gap-1.5">
              <span className="text-cyan-400 font-bold bg-[#101011] px-2 py-0.5 rounded border border-zinc-800 text-[11px] tracking-widest">
                {currentTimeCode}
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400 text-[11px] font-bold">
                {durationTimeCode}
              </span>
            </div>

            {/* Playback Controls Center */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => skipTime(-10)}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
                title="Rewind 10 Seconds"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="p-1.5 bg-zinc-950 hover:bg-zinc-900 text-cyan-400 hover:text-cyan-300 rounded-full border border-zinc-800 shadow-md transition-all active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={restartVideo}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
                title="Restart Video clip"
              >
                <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-1 rounded hover:text-white transition-colors">RESTART</span>
              </button>

              <button
                onClick={() => setLoopEnabled(!loopEnabled)}
                className={`p-1.5 rounded text-xs transition-colors font-mono ${
                  loopEnabled ? 'text-cyan-400 bg-cyan-950/20 border border-cyan-800/20' : 'text-zinc-600 hover:text-zinc-400'
                }`}
                title="Toggle Looping"
              >
                LOOP
              </button>
            </div>

            {/* Realtime volume controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="font-mono text-[10px] text-zinc-500 w-8">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* PANEL C: INSPECTOR CONTROLS (RIGHT - 25% width) */}
        <div className="w-full lg:w-[25%] bg-[#1a1a1b] flex flex-col overflow-y-auto select-none shrink-0 border-l border-[#121213]">
          
          {/* Tabs header */}
          <div className="flex border-b border-[#121213] bg-[#202021] p-1 gap-1">
            {(['video', 'color', 'audio', 'effects'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded tracking-wider transition-all border ${
                  activeTab === tab
                    ? 'bg-[#1a1a1b] border-zinc-800 text-cyan-400'
                    : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Active Tab Screen Area */}
          <div className="p-4 flex-1 flex flex-col justify-between bg-[#1a1a1b] space-y-6">
            
            {/* TAB 1: VIDEO TRANSFORM / LAYOUT */}
            {activeTab === 'video' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-[#2d2d2f]">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Video Layout Transforms</span>
                  <button onClick={resetTransforms} className="text-[9px] text-cyan-400 hover:underline">Reset</button>
                </div>

                {/* Scale slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">Scale / Zoom:</span>
                    <span className="text-white font-bold">{scale}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={scale}
                    onChange={(e) => setScale(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#101011] rounded accent-cyan-400"
                  />
                </div>

                {/* Opacity slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">Opacity / Blend:</span>
                    <span className="text-white font-bold">{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#101011] rounded accent-cyan-400"
                  />
                </div>

                {/* Rotation slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">Rotation Axis:</span>
                    <span className="text-white font-bold">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#101011] rounded accent-cyan-400"
                  />
                </div>

                {/* Blend modes dropdown */}
                <div className="space-y-1 text-[11px]">
                  <span className="text-zinc-400">Compositing Mode:</span>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300 text-xs">
                    <option>Normal (Source Over)</option>
                    <option>Multiply (Linear Burn)</option>
                    <option>Screen (Additive)</option>
                    <option>Overlay (Contrast Blend)</option>
                  </select>
                </div>

                {/* Video Info Card */}
                <div className="p-3 bg-zinc-950/40 rounded border border-zinc-900/60 mt-4 space-y-2">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 uppercase">
                    <Info className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Active Video Metadata</span>
                  </div>
                  <div className="space-y-1 font-mono text-[10px] text-zinc-400">
                    <div>Title: <span className="text-zinc-200">{currentVideo.title}</span></div>
                    <div>Location: <span className="text-zinc-200">{currentVideo.location}</span></div>
                    <div>Client: <span className="text-zinc-200">{currentVideo.clientName}</span></div>
                    <div>Release: <span className="text-zinc-200">{currentVideo.date}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COLOR GRADING BOARD */}
            {activeTab === 'color' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-[#2d2d2f]">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">FCP Color Wheels Board</span>
                  <button onClick={resetColors} className="text-[9px] text-cyan-400 hover:underline">Reset</button>
                </div>

                {/* Exposure */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">Luma Exposure:</span>
                    <span className="text-amber-400 font-bold">{exposure}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={exposure}
                    onChange={(e) => setExposure(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#101011] rounded accent-cyan-400"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">Chroma Saturation:</span>
                    <span className="text-cyan-400 font-bold">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#101011] rounded accent-cyan-400"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">Dynamic Contrast:</span>
                    <span className="text-purple-400 font-bold">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#101011] rounded accent-cyan-400"
                  />
                </div>

                {/* Hue rotation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">Hue Tilt Angle:</span>
                    <span className="text-pink-400 font-bold">{hue}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={hue}
                    onChange={(e) => setHue(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#101011] rounded accent-cyan-400"
                  />
                </div>

                <div className="p-2.5 bg-zinc-950/80 rounded border border-zinc-900 text-[10px] font-mono text-zinc-500">
                  ⚡ These sliders dynamically alter the primary raw pixel values inside the browser video decoder.
                </div>
              </div>
            )}

            {/* TAB 3: AUDIO EFFECTS */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-[#2d2d2f]">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Audio Processor Stack</span>
                </div>

                {/* Dynamic EQ preset selection */}
                <div className="space-y-1 text-[11px]">
                  <span className="text-zinc-400 block mb-1">Equalizer Blueprint:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['flat', 'bass-boost', 'vocal-enhance', 'cinematic'] as const).map((eq) => (
                      <button
                        key={eq}
                        onClick={() => setAudioEq(eq)}
                        className={`py-1 rounded text-[9px] font-mono border text-center uppercase ${
                          audioEq === eq
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-400 font-bold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {eq.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-[1px] bg-zinc-800 my-2"></div>

                {/* Professional toggles */}
                <div className="space-y-2.5 text-xs text-zinc-300">
                  {/* Voice Isolation */}
                  <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-zinc-900/60">
                    <div className="flex flex-col">
                      <span className="font-bold">Voice Isolation</span>
                      <span className="text-[9px] text-zinc-500 font-mono">Blocks ambient drone & wind noise</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={voiceIsolation}
                      onChange={(e) => setVoiceIsolation(e.target.checked)}
                      className="w-3.5 h-3.5 accent-cyan-400 rounded cursor-pointer"
                    />
                  </label>

                  {/* Hum Removal */}
                  <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-zinc-900/60">
                    <div className="flex flex-col">
                      <span className="font-bold">Hum Removal (50/60 Hz)</span>
                      <span className="text-[9px] text-zinc-500 font-mono">Removes steady power hum</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={humRemoval}
                      onChange={(e) => setHumRemoval(e.target.checked)}
                      className="w-3.5 h-3.5 accent-cyan-400 rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div className="p-3 bg-zinc-950/40 rounded border border-[#252526] mt-4 space-y-1.5 text-[10px] font-mono text-zinc-500">
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <Music className="w-3 h-3 text-emerald-400" />
                    <span>AUDIO_ENGINE: ON</span>
                  </div>
                  <div>Output: 48 kHz Stereo Floating-point CAF</div>
                </div>
              </div>
            )}

            {/* TAB 4: VISUAL FX & LUT BLUEPRINTS */}
            {activeTab === 'effects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-[#2d2d2f]">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Creative LUT Filters</span>
                </div>

                {/* Effects items selection */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  {([
                    { id: 'none', label: 'None (Natural)' },
                    { id: 'monochrome', label: 'Noir (High-Contrast B&W)' },
                    { id: 'golden', label: 'Golden hour (Wedding Warm)' },
                    { id: 'cyberpunk', label: 'Cyberpunk (Neon Hue)' },
                    { id: 'vintage', label: 'Vintage 8mm (Lomo)' },
                    { id: 'blur', label: 'Dreamy (Lens Blur)' }
                  ] as const).map((fx) => (
                    <button
                      key={fx.id}
                      onClick={() => setActiveEffect(fx.id)}
                      className={`p-2 rounded text-left border flex flex-col justify-between h-14 ${
                        activeEffect === fx.id
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-zinc-900/50 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                      }`}
                    >
                      <span>{fx.label}</span>
                      <span className="text-[8px] text-zinc-500 uppercase">Preset</span>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-zinc-950/40 rounded border border-zinc-900 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 block">Post-Production Stack</span>
                  <div className="flex flex-wrap gap-1">
                    {currentVideo.fcpTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Inquire & Call Actions bottom deck */}
            <div className="pt-4 border-t border-[#121213] space-y-1.5">
              <button
                onClick={handleShare}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-zinc-800 active:scale-95"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{isCopied ? 'Asset Reference Copied' : 'Copy Project Reference'}</span>
              </button>

              <a
                href={`https://wa.me/917619633201?text=Hi%20Sagar,%20I'm%20highly%20interested%20in%20your%20"${encodeURIComponent(currentVideo.title)}"%20FCP%20project.%20Let's%20collaborate!`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Inquire on WhatsApp</span>
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* 3. MAGNETIC MULTITRACK TIMELINE (BOTTOM - 30% height) */}
      <div className="h-44 bg-[#101011] flex flex-col overflow-hidden shrink-0 select-none">
        
        {/* Timeline Control Ribbon */}
        <div className="h-8 bg-[#1a1a1b] border-b border-[#121213] px-3 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="font-bold text-zinc-300">Magnetic Storyline</span>
            <div className="h-3 w-[1px] bg-zinc-800"></div>

            {/* Current tool indicator */}
            <div className="flex items-center gap-1">
              <span className="text-zinc-600">Active Tool:</span>
              <span className="text-cyan-400 font-bold bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 flex items-center gap-1 text-[10px]">
                <MousePointerClick className="w-2.5 h-2.5" />
                <span>SELECT (A)</span>
              </span>
            </div>
          </div>

          {/* Prompt warning */}
          <div className="text-[10px] text-zinc-500">
            💡 Click on the primary clip storyline track below to scrub/seek playhead instantly!
          </div>

          {/* Playhead speed tag */}
          <div>
            <span>Playhead Speed: </span>
            <span className="text-white font-bold">1.0x Normal</span>
          </div>
        </div>

        {/* Dynamic Multi-track Storyboard Scroll block */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[#0a0a0b] relative p-3 flex flex-col justify-around">
          
          {/* THE ACTUAL FLOATING PLAYHEAD LINE */}
          <div 
            style={{ left: `calc(${progress}% + 130px)` }}
            className="absolute top-0 bottom-0 w-[2px] bg-amber-400 z-30 pointer-events-none shadow-[0_0_8px_#fbbf24]"
          >
            {/* Playhead head banner */}
            <div className="absolute top-0 -left-1.5 w-3.5 h-3.5 rounded-sm bg-amber-400 border border-amber-500 flex items-center justify-center">
              <div className="w-[1px] h-2 bg-black" />
            </div>
          </div>

          {/* TRACK 1: TITLE / EFFECTS LAYER (T1) */}
          <div className="flex items-center gap-3 text-[10px] w-full min-w-[800px] shrink-0">
            <div className="w-28 text-right font-mono text-zinc-600 font-bold text-[9px] pr-2 uppercase">
              T1: Titles
            </div>
            <div className="flex-1 relative h-6">
              {/* Overlay title blocks */}
              <div 
                style={{ left: '5%', width: '40%' }}
                className="absolute h-full rounded border border-cyan-800 bg-cyan-950/20 text-cyan-400 font-mono text-[9px] px-2 flex items-center gap-1"
              >
                <Type className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">Lower-Third Title: {currentVideo.title}</span>
              </div>

              <div 
                style={{ left: '55%', width: '30%' }}
                className="absolute h-full rounded border border-purple-800 bg-purple-950/20 text-purple-400 font-mono text-[9px] px-2 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="truncate">Cross Dissolve Dissolve</span>
              </div>
            </div>
          </div>

          {/* TRACK 2: PRIMARY VIDEO STORYLINE (V1 - Scrubbing active here!) */}
          <div className="flex items-center gap-3 text-[10px] w-full min-w-[800px] shrink-0">
            <div className="w-28 text-right font-mono text-zinc-500 font-bold text-[9px] pr-2 uppercase">
              V1: Primary
            </div>
            
            {/* Interactive Timeline track container */}
            <div 
              onClick={handleTimelineClick}
              className="flex-1 h-10 bg-zinc-950/60 border border-zinc-900 rounded-lg relative cursor-pointer group select-none overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_100%]"></div>
              
              {/* Video Block spanning the entire width */}
              <div className="absolute inset-y-0 left-0 right-0 rounded-md px-4 py-1.5 flex items-center justify-between border bg-rose-600/25 border-rose-500/80 group-hover:bg-rose-600/30 transition-all">
                <div className="flex items-center gap-2 min-w-0">
                  <Film className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
                  <div className="min-w-0">
                    <span className="font-bold text-white text-[11px] truncate block">
                      RAW_VIDEO_{currentVideo.id}_MASTER_STREAM
                    </span>
                    <span className="text-[8px] text-zinc-500 font-mono block">
                      Resolution: 3840 x 2160 • Codec: Apple ProRes 422
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[8px] text-rose-400/80 font-mono">
                  <span>{currentVideo.duration} mins</span>
                  <Lock className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* TRACK 3: PRIMARY AUDIO CHANNEL (A1) */}
          <div className="flex items-center gap-3 text-[10px] w-full min-w-[800px] shrink-0">
            <div className="w-28 text-right font-mono text-zinc-500 font-bold text-[9px] pr-2 uppercase">
              A1: Audio
            </div>
            <div className="flex-1 h-9 bg-zinc-950/40 border border-zinc-900/60 rounded-lg relative overflow-hidden">
              <div className="absolute inset-y-0 inset-x-0 bg-emerald-950/15 flex items-center justify-between px-4 border border-emerald-500/30">
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-400">
                  <Volume1 className="w-3 h-3" />
                  <span>AUDIO_{currentVideo.id}_STEREO.caf</span>
                </div>

                {/* Simulated Waveform bars */}
                <div className="absolute inset-x-32 bottom-1 top-1.5 flex gap-[1.5px] items-end pointer-events-none">
                  {Array.from({ length: 90 }).map((_, sIdx) => {
                    // Generate pretty sinus/cosinus height waves
                    const waveVal = isPlaying && !isMuted
                      ? Math.abs(Math.sin(sIdx * 0.15)) * 18 + Math.abs(Math.cos(sIdx * 0.5)) * 6 + 2
                      : Math.abs(Math.sin(sIdx * 0.1)) * 6 + 1;
                    return (
                      <div
                        key={sIdx}
                        style={{ height: `${waveVal}px` }}
                        className={`flex-1 rounded-sm transition-all duration-75 ${
                          isPlaying && !isMuted ? 'bg-emerald-400/60' : 'bg-zinc-700/30'
                        }`}
                      />
                    );
                  })}
                </div>

                <span className="text-[8px] text-emerald-500/50 font-mono">48 kHz</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
