import React, { useRef, useEffect } from 'react';
import { VideoItem } from '../types';
import { Play, Pause, SkipBack, SkipForward, Scissors, Eye, Volume2, Type, Music, Layers, Hand, MousePointerClick, RefreshCw, Film } from 'lucide-react';

interface FCPTimelineProps {
  videos: VideoItem[];
  selectedIndex: number;
  onSelectVideo: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  selectedTool: 'select' | 'blade' | 'hand' | 'trim';
  onSelectTool: (tool: 'select' | 'blade' | 'hand' | 'trim') => void;
}

export default function FCPTimeline({
  videos,
  selectedIndex,
  onSelectVideo,
  isPlaying,
  onTogglePlay,
  selectedTool,
  onSelectTool,
}: FCPTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const REPEATS = 7;
  const MIDDLE_REPEAT = 3;
  const itemTotalWidth = 150; // w-36 (144px) + gap-1.5 (6px) = 150px
  const singleSetWidth = videos.length * itemTotalWidth;

  // Initialize scroll position to center the middle copy immediately on mount
  useEffect(() => {
    const container = containerRef.current;
    if (container && videos.length > 0) {
      const targetOffset = MIDDLE_REPEAT * singleSetWidth + (selectedIndex * itemTotalWidth);
      const containerWidth = container.clientWidth;
      container.scrollLeft = targetOffset - containerWidth / 2 + itemTotalWidth / 2;
    }
  }, [videos.length]);

  // Auto-scroll the timeline container so that the active clip block in the middle copy is centered
  useEffect(() => {
    if (containerRef.current && videos.length > 0) {
      const activeElement = document.getElementById(`timeline-clip-${selectedIndex}`);
      if (activeElement) {
        const containerWidth = containerRef.current.clientWidth;
        const clipOffset = activeElement.offsetLeft;
        const clipWidth = activeElement.clientWidth;

        // Smoothly center the active clip block
        containerRef.current.scrollTo({
          left: clipOffset - containerWidth / 2 + clipWidth / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex, videos.length]);

  // Infinite wrapping scroll handler
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || videos.length === 0) return;

    const scrollLeft = container.scrollLeft;
    // If the user scrolls too far to the left, wrap to the right zone seamlessly
    if (scrollLeft < singleSetWidth * 2) {
      container.scrollLeft += singleSetWidth;
    }
    // If the user scrolls too far to the right, wrap to the left zone seamlessly
    else if (scrollLeft > singleSetWidth * 4) {
      container.scrollLeft -= singleSetWidth;
    }
  };

  return (
    <div className="w-full bg-zinc-950 border-t border-zinc-800 flex flex-col h-48 select-none font-sans text-xs">
      {/* 1. Timeline Toolbar / Control Deck */}
      <div className="h-10 border-b border-zinc-900 bg-zinc-900/60 px-4 flex items-center justify-between">
        {/* Left Side: Timecode & Selected Video Status */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Timecode display */}
          <div className="font-mono text-[11px] text-cyan-400 bg-zinc-950 px-2 py-0.5 rounded tracking-widest border border-zinc-900 shrink-0">
            00:0{selectedIndex}:{Math.round(selectedIndex * 4.3).toString().padStart(2, '0')}:12
          </div>
          <div className="h-4 w-[1px] bg-zinc-800 shrink-0 hidden sm:block"></div>
          {/* Dynamic Status / Selected Video Tag */}
          <div className="hidden sm:flex items-center gap-2 text-zinc-400 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="font-mono text-[10px] uppercase text-zinc-500 shrink-0">Timeline:</span>
            <span className="font-bold text-zinc-200 truncate">{videos[selectedIndex]?.title}</span>
          </div>
        </div>

        {/* Right Side: FCP Professional Tools Selection */}
        <div className="flex items-center justify-end flex-1">
          <div className="flex items-center gap-1 bg-zinc-950 px-1.5 py-1 rounded-md border border-zinc-900 shadow-inner">
            <button
              onClick={() => onSelectTool('select')}
              className={`p-1 rounded transition-colors ${
                selectedTool === 'select' ? 'bg-cyan-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Select Tool (A)"
            >
              <MousePointerClick className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectTool('trim')}
              className={`p-1 rounded transition-colors ${
                selectedTool === 'trim' ? 'bg-cyan-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Trim Tool (T)"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectTool('blade')}
              className={`p-1 rounded transition-colors ${
                selectedTool === 'blade' ? 'bg-cyan-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Blade / Razor Tool (B)"
            >
              <Scissors className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectTool('hand')}
              className={`p-1 rounded transition-colors ${
                selectedTool === 'hand' ? 'bg-cyan-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Hand Scroll (H)"
            >
              <Hand className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Timeline Tracks Container */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Track Headers (Left sidebar representing audio/video levels) */}
        <div className="w-20 bg-zinc-950/90 border-r border-zinc-900 flex flex-col justify-around py-2 shrink-0 z-20 font-mono text-[10px] text-zinc-500 select-none">
          <div className="flex items-center gap-1 px-2 py-1 bg-zinc-900/40 border-l-2 border-rose-500">
            <Eye className="w-3 h-3 text-rose-500" />
            <span>V1 Video</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-zinc-900/40 border-l-2 border-cyan-500">
            <Type className="w-3 h-3 text-cyan-400" />
            <span>FX Text</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-zinc-900/40 border-l-2 border-emerald-500">
            <Music className="w-3 h-3 text-emerald-400" />
            <span>A1 Audio</span>
          </div>
        </div>

        {/* Playhead Center Anchor indicator line */}
        <div className="absolute left-[calc(50%+40px)] top-0 bottom-0 w-[2px] bg-amber-500 shadow-[0_0_8px_#f59e0b] z-30 pointer-events-none">
          {/* Top visual playhead needle */}
          <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-amber-500 rotate-45 border-b border-r border-amber-600"></div>
        </div>

        {/* Tracks Content Row */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-x-auto scrollbar-none relative bg-[#09090b] flex flex-col justify-around py-1.5 px-4"
        >
          {/* TRACK 1: Video Blocks */}
          <div className="flex items-center gap-1.5 h-9 my-1 w-max">
            {Array.from({ length: REPEATS }).map((_, rIdx) => {
              const isMiddle = rIdx === MIDDLE_REPEAT;
              return (
                <React.Fragment key={`repeat-track1-${rIdx}`}>
                  {videos.map((video, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={`timeline-clip-${rIdx}-${video.id}`}
                        id={isMiddle ? `timeline-clip-${idx}` : undefined}
                        onClick={() => onSelectVideo(idx)}
                        className={`h-full w-36 shrink-0 rounded-md px-2.5 py-1 flex items-center justify-between cursor-pointer border relative transition-all overflow-hidden ${
                          isSelected
                            ? 'bg-rose-600/30 border-rose-500 shadow-md ring-1 ring-rose-500'
                            : 'bg-zinc-900/80 hover:bg-zinc-800/80 border-zinc-800'
                        }`}
                      >
                        {/* Subtle video icon */}
                        <Film className={`w-3 h-3 ${isSelected ? 'text-rose-400 animate-pulse' : 'text-zinc-600'}`} />
                        <span className={`text-[10px] font-medium truncate flex-1 ml-1.5 ${
                          isSelected ? 'text-white' : 'text-zinc-400'
                        }`}>
                          {video.title}
                        </span>

                        {/* FCP X Timeline Waveform bar underclip visualizer */}
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-rose-500/10 flex gap-0.5 px-1 items-end">
                          <div className="h-[2px] flex-1 bg-rose-500/30"></div>
                          <div className="h-[3px] flex-1 bg-rose-500/40"></div>
                          <div className="h-[1px] flex-1 bg-rose-500/30"></div>
                          <div className="h-[4px] flex-1 bg-rose-500/50"></div>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>

          {/* TRACK 2: Transition / Effects Block */}
          <div className="flex items-center gap-1.5 h-5 my-1 w-max">
            {Array.from({ length: REPEATS }).map((_, rIdx) => (
              <React.Fragment key={`repeat-track2-${rIdx}`}>
                {videos.map((video, idx) => (
                  <div
                    key={`timeline-fx-${rIdx}-${video.id}`}
                    className="flex items-center gap-1.5 w-36 shrink-0"
                  >
                    {/* Visual block representing FCP transition effect */}
                    <div className="h-2 w-16 bg-purple-900/40 border border-purple-800/30 rounded-full text-[8px] font-mono text-purple-400 flex items-center justify-center scale-90">
                      Cross Dissolve
                    </div>
                    <div className="flex-1 h-[1px] bg-zinc-800"></div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* TRACK 3: Audio Waveform Tracks */}
          <div className="flex items-center gap-1.5 h-9 my-1 w-max">
            {Array.from({ length: REPEATS }).map((_, rIdx) => (
              <React.Fragment key={`repeat-track3-${rIdx}`}>
                {videos.map((video, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={`timeline-audio-${rIdx}-${video.id}`}
                      className={`h-full w-36 shrink-0 rounded-md px-2 py-0.5 bg-emerald-950/20 border flex flex-col justify-center gap-0.5 relative ${
                        isSelected ? 'border-emerald-500/40 bg-emerald-950/30' : 'border-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[8px] text-emerald-500/70 font-mono">
                        <Volume2 className="w-2.5 h-2.5" />
                        <span className="truncate">Audio_{video.id}.caf</span>
                      </div>

                      {/* Dynamic Sound waves */}
                      <div className="flex gap-[1px] items-end h-4 overflow-hidden px-1">
                        {Array.from({ length: 24 }).map((_, sIdx) => {
                          // Generate beautiful dynamic height curves mimicking music frequencies
                          const waveVal = Math.abs(Math.sin((sIdx + idx) * 0.45)) * 12 + 2;
                          return (
                            <div
                              key={sIdx}
                              style={{ height: `${waveVal}px` }}
                              className={`flex-1 rounded-sm ${
                                isSelected ? 'bg-emerald-400/80' : 'bg-zinc-700/60'
                              }`}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
