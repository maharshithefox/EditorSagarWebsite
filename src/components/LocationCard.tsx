import React, { useState } from 'react';
import { TESTIMONIALS } from '../data/videos';
import { MapPin, Phone, Mail, Award, Clock, Star, MessageSquare, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function LocationCard() {
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('7619633201');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const nextReview = () => {
    setCurrentReviewIdx((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevReview = () => {
    setCurrentReviewIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const currentReview = TESTIMONIALS[currentReviewIdx];

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 select-none font-sans">
      {/* 1. Bangalore Rajajinagar Contact Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        {/* Decorative Neon pulsing point on SVG Map */}
        <div className="absolute right-4 bottom-4 w-32 h-32 opacity-15 pointer-events-none">
          {/* A cool grid mesh of Bangalore lanes with a neon locator dot */}
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-zinc-600 fill-none stroke-[0.5]">
            <path d="M10,20 Q30,25 90,10 M5,50 Q40,60 95,45 M20,85 Q50,70 85,90 M20,10 L15,90 M50,5 L45,95 M80,10 L85,90" />
            <circle cx="48" cy="42" r="2" className="fill-cyan-400 stroke-none" />
            <circle cx="48" cy="42" r="6" className="stroke-cyan-500 fill-none animate-ping" />
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1.5 rounded bg-amber-950 text-amber-400">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">HQ Studio Location</h3>
              <h4 className="text-sm font-extrabold text-white">Rajajinagar, Bangalore</h4>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            Located in the heart of Bangalore's media & editing corridor. Sagar's studio is equipped with absolute high-end Mac Studio workstations running Final Cut Pro X, Color Finale, and high-fidelity sound-isolated reference monitors.
          </p>

          {/* Quick Details List */}
          <div className="space-y-3.5 mb-6">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="flex-1">
                <div className="text-[10px] text-zinc-500 font-mono">DIRECT WHATSAPP & CALl</div>
                <a href="tel:7619633201" className="text-xs font-bold text-zinc-200 hover:text-cyan-400 transition-colors">
                  +91 76196 33201
                </a>
              </div>
              <button
                onClick={handleCopyPhone}
                className="text-[10px] bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : 'Copy'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-[10px] text-zinc-500 font-mono">BUSINESS INQUIRY EMAIL</div>
                <a href="mailto:editor.sagar.bangalore@gmail.com" className="text-xs font-bold text-zinc-200 hover:text-cyan-400 transition-colors">
                  editor.sagar.bangalore@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-[10px] text-zinc-500 font-mono">FCP CERTIFICATION</div>
                <span className="text-xs font-bold text-zinc-200">
                  Apple Certified Pro - Final Cut Pro X
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Localized Footer buttons */}
        <div className="flex items-center gap-2 pt-4 border-t border-zinc-800/80 z-10">
          <a
            href="tel:7619633201"
            className="flex-1 text-center py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold rounded-lg transition-colors shadow-md active:scale-95"
          >
            Call Sagar
          </a>
          <a
            href="https://maps.google.com/?q=Rajajinagar,+Bangalore,+Karnataka"
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors border border-zinc-700"
          >
            Open in Maps
          </a>
        </div>
      </div>

      {/* 2. Slider Testimonials & Reviews card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-cyan-950 text-cyan-400">
                <MessageSquare className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Success Stories</h3>
                <h4 className="text-sm font-extrabold text-white">Client Testimonials</h4>
              </div>
            </div>

            {/* Average rating badge */}
            <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full text-amber-400 text-[10px] font-bold">
              <Star className="w-3 h-3 fill-current" />
              <span>4.9 (42 reviews)</span>
            </div>
          </div>

          {/* Current selected testimonial card representation */}
          {currentReview && (
            <div className="py-2 animate-fade-in">
              {/* Star grading */}
              <div className="flex items-center gap-0.5 mb-2.5">
                {Array.from({ length: currentReview.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Text */}
              <blockquote className="text-xs text-zinc-300 leading-relaxed italic mb-4">
                "{currentReview.content}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-3">
                <img
                  src={currentReview.avatar}
                  alt={currentReview.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                />
                <div>
                  <div className="text-xs font-bold text-white">{currentReview.name}</div>
                  <div className="text-[10px] text-zinc-500">{currentReview.role}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Carousel buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80 mt-4">
          <span className="text-[10px] text-zinc-500 font-mono">
            {currentReviewIdx + 1} of {TESTIMONIALS.length} verified reviews
          </span>

          <div className="flex gap-1">
            <button
              onClick={prevReview}
              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border border-zinc-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextReview}
              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border border-zinc-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
