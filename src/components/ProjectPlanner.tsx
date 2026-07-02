import React, { useState } from 'react';
import { VideoCategory, GitHubUser } from '../types';
import { Sparkles, Film, Clock, HardDrive, Cpu, CheckCircle, Smartphone, Send, Github, Loader2, ExternalLink, ArrowLeft } from 'lucide-react';

interface ProjectPlannerProps {
  onClose: () => void;
  githubUser: GitHubUser | null;
  onConnectGitHub: () => void;
}

export default function ProjectPlanner({ onClose, githubUser, onConnectGitHub }: ProjectPlannerProps) {
  const [category, setCategory] = useState<VideoCategory>('Wedding & Pre-wedding');
  const [durationDays, setDurationDays] = useState<number>(2);
  const [rawDataSize, setRawDataSize] = useState<number>(250); // GB
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStep, setRenderStep] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  // Gist state
  const [isSavingGist, setIsSavingGist] = useState(false);
  const [gistUrl, setGistUrl] = useState<string | null>(null);
  const [gistError, setGistError] = useState<string | null>(null);

  const handleSaveGist = async () => {
    setIsSavingGist(true);
    setGistError(null);
    setGistUrl(null);

    const brief = {
      clientName,
      clientPhone,
      clientMessage,
      category,
      durationDays,
      rawDataSize,
      editHours: calculateEditHours(),
      timeline: calculateRecommendedTimeline(),
      estimatedPrice: calculateEstimatedPrice(),
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/github/save-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brief }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save brief to GitHub.');
      }

      const data = await res.json();
      if (data.success && data.htmlUrl) {
        setGistUrl(data.htmlUrl);
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (err: any) {
      console.error(err);
      setGistError(err.message || 'Failed to save to GitHub Gist');
    } finally {
      setIsSavingGist(false);
    }
  };

  // Dynamic calculations based on selected configurations
  const calculateEditHours = () => {
    let base = 12;
    if (category === 'Wedding & Pre-wedding') base = 32;
    if (category === 'Corporate') base = 20;
    if (category === 'DJ Night') base = 16;
    if (category === 'Showreels & Promos') base = 10;
    return base + Math.round(durationDays * 4) + Math.round(rawDataSize * 0.04);
  };

  const calculateRecommendedTimeline = () => {
    if (category === 'Wedding & Pre-wedding') return '10 - 14 Days';
    if (category === 'Corporate') return '5 - 7 Days';
    if (category === 'DJ Night') return '3 - 4 Days';
    return '2 - 3 Days';
  };

  const calculateEstimatedPrice = () => {
    let ratePerGb = 15;
    let baseRate = 8000;
    if (category === 'Wedding & Pre-wedding') { baseRate = 25000; ratePerGb = 25; }
    if (category === 'Corporate') { baseRate = 18000; ratePerGb = 20; }
    if (category === 'DJ Night') { baseRate = 12000; ratePerGb = 30; }
    if (category === 'Housewarming & Maternity') { baseRate = 15000; ratePerGb = 20; }

    return baseRate + (rawDataSize * ratePerGb) + (durationDays * 3500);
  };

  const handleStartRender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert("Please fill in your Name and Contact Phone.");
      return;
    }

    setIsRendering(true);
    setRenderProgress(0);

    const steps = [
      { prg: 15, msg: 'Ingesting raw footage sequences...' },
      { prg: 35, msg: 'Generating FCP proxy files for fluid scrubbing...' },
      { prg: 55, msg: 'Syncing multicam feeds & audio markers...' },
      { prg: 75, msg: 'Applying dynamic beat mapping & Speed Ramps...' },
      { prg: 90, msg: 'Injecting customized cinematographic LUT grading...' },
      { prg: 100, msg: 'Exporting Master 4K ProRes edit package...' },
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setRenderProgress(steps[currentStepIdx].prg);
        setRenderStep(steps[currentStepIdx].msg);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setIsRendering(false);
        setIsFinished(true);
      }
    }, 700);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl font-sans relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {!isFinished ? (
        <form onSubmit={handleStartRender} className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer mr-1 flex items-center justify-center"
                title="Back to Portfolio"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>FCP Project Planner & Quote</span>
                </h3>
                <p className="text-[10px] text-zinc-500">Configure your cinematic brief in real-time</p>
              </div>
            </div>
          </div>

          {/* Project Category */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Project Genre</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as VideoCategory)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="Wedding & Pre-wedding">Wedding & Pre-wedding Film</option>
              <option value="Corporate">Corporate & Tech Brand Profile</option>
              <option value="Housewarming & Maternity">Housewarming & Maternity Vlog</option>
              <option value="DJ Night">DJ Night & Event Aftermovie</option>
              <option value="Showreels & Promos">Showreels & Commercial Promos</option>
              <option value="Editing Samples">FCP X Post-Production Only</option>
            </select>
          </div>

          {/* Slider Inputs: Shoot Days and Footage Volume */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Shoot Days</label>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">{durationDays} Day(s)</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Raw Footage Volume</label>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">{rawDataSize} GB</span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="20"
                value={rawDataSize}
                onChange={(e) => setRawDataSize(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Dynamic FCP Engine Spec Summary Panel */}
          <div className="p-3 bg-zinc-950 border border-zinc-800/60 rounded-xl space-y-2">
            <h5 className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">FCP Workspace Target Estimate</h5>
            <div className="grid grid-cols-3 gap-2 text-center text-zinc-300">
              <div className="bg-zinc-900/60 p-1.5 rounded border border-zinc-800">
                <Clock className="w-3.5 h-3.5 text-rose-500 mx-auto mb-1" />
                <div className="text-[9px] text-zinc-500">Edit Time</div>
                <div className="text-xs font-bold font-mono text-white">~{calculateEditHours()} hrs</div>
              </div>
              <div className="bg-zinc-900/60 p-1.5 rounded border border-zinc-800">
                <HardDrive className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1" />
                <div className="text-[9px] text-zinc-500">Buffer Space</div>
                <div className="text-xs font-bold font-mono text-white">~{(rawDataSize * 2.2).toFixed(0)} GB</div>
              </div>
              <div className="bg-zinc-900/60 p-1.5 rounded border border-zinc-800">
                <Cpu className="w-3.5 h-3.5 text-cyan-500 mx-auto mb-1" />
                <div className="text-[9px] text-zinc-500">Delivery</div>
                <div className="text-[10px] font-bold text-white truncate">{calculateRecommendedTimeline()}</div>
              </div>
            </div>

            {/* Price Preview */}
            <div className="pt-2 border-t border-zinc-900 flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-400">ESTIMATED INVESTMENT:</span>
              <span className="text-sm font-bold text-amber-400 font-mono">₹{calculateEstimatedPrice().toLocaleString('en-IN')}*</span>
            </div>
          </div>

          {/* Contact details */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Your Info</label>
            <input
              type="text"
              required
              placeholder="Your Full Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <input
              type="tel"
              required
              placeholder="WhatsApp / Phone (e.g. 9876543210)"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <textarea
              rows={2}
              placeholder="Brief description of your wedding, corporate shoot, event or requirements..."
              value={clientMessage}
              onChange={(e) => setClientMessage(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Render CTA with Back option */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all border border-zinc-700 active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-extrabold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 transition-transform cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-zinc-950 animate-pulse" />
              <span>RENDER PROPOSAL BRIEF</span>
            </button>
          </div>
        </form>
      ) : isRendering ? (
        /* Real-time FCP Rendering Simulation */
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
            <div
              style={{ clipPath: `polygon(50% 50%, -50% -50%, ${renderProgress}% -50%, ${renderProgress}% 150%, -50% 150%)` }}
              className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-spin-slow"
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white">
              {renderProgress}%
            </div>
          </div>
          <div className="text-center space-y-1 max-w-xs">
            <h4 className="text-xs font-bold text-zinc-200">Processing FCP Timelines...</h4>
            <p className="text-[10px] text-cyan-400 font-mono animate-pulse">{renderStep}</p>
          </div>
        </div>
      ) : (
        /* Render Success & Proposal Sent message */
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">FCP Project Export Successful!</h4>
            <p className="text-xs text-zinc-400">
              Hi <strong>{clientName}</strong>, your custom production timeline (<strong>{category}</strong>, ~{calculateEditHours()} editing hours) has been successfully parsed & cached.
            </p>
            <p className="text-[11px] text-zinc-500 mt-2">
              Editor Sagar will review the data packet and contact you on <strong>{clientPhone}</strong> within 1 hour!
            </p>
          </div>

          {/* GitHub Gist Synchronization Integration */}
          <div className="border-t border-b border-zinc-800/80 py-3.5 my-1.5">
            {githubUser ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-400">
                  <Github className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Logged in as <strong>@{githubUser.username}</strong></span>
                </div>
                
                {gistUrl ? (
                  <div className="p-2.5 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-xs space-y-1.5 animate-fade-in text-center">
                    <p className="text-emerald-400 font-bold flex items-center justify-center gap-1 text-[11px]">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Synced to GitHub Gists!</span>
                    </p>
                    <a
                      href={gistUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-[10px] underline"
                    >
                      <span>View your Brief Gist</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2 max-w-xs mx-auto">
                    <button
                      type="button"
                      onClick={handleSaveGist}
                      disabled={isSavingGist}
                      className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingGist ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          <span>Syncing to GitHub Gists...</span>
                        </>
                      ) : (
                        <>
                          <Github className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Sync & Save brief to GitHub Gist</span>
                        </>
                      )}
                    </button>
                    {gistError && (
                      <p className="text-[10px] text-rose-400 font-mono leading-tight bg-rose-950/20 border border-rose-900/30 p-2 rounded-lg">
                        {gistError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl max-w-xs mx-auto text-left space-y-2 animate-fade-in">
                <div className="flex items-center gap-1.5">
                  <Github className="w-4 h-4 text-cyan-400" />
                  <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-wider font-mono">Sync with GitHub</span>
                </div>
                <p className="text-[9px] text-zinc-500 leading-normal">
                  Connect your GitHub account to back up and save this production brief directly to your Gists!
                </p>
                <button
                  type="button"
                  onClick={onConnectGitHub}
                  className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Github className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Connect GitHub Account</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <a
                href={`https://wa.me/917619633201?text=Hi%20Sagar,%20I%20have%20submitted%20a%20project%20brief%20on%20your%203D%20website%20for%20a%20${category}.%20Please%20check!`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-zinc-950" />
                <span>Ping via WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setIsFinished(false)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold rounded-lg transition-colors border border-zinc-700 cursor-pointer"
              >
                Plan Another Video
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white text-[11px] font-bold rounded-lg transition-colors border border-zinc-800 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portfolio Gallery</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
