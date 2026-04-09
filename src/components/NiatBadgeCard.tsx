"use client";

import React, { useEffect, useRef, useState } from 'react';

export interface NiatBadgeCardProps {
  name: string;
  role: string;
  campus: string;
  program: string;
  batch: string;
  studentId: string;
  credentialId: string;
  issuedDate: string;
  profilePictureUrl?: string;
  username: string;
}

export default function NiatBadgeCard({
  name,
  role,
  campus,
  program,
  batch,
  studentId,
  issuedDate,
  profilePictureUrl,
  username
}: NiatBadgeCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        // The intrinsic width of our card is 660px
        const newScale = width < 660 ? width / 660 : 1;
        setScale(newScale);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const initials = (name || username || "??")
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');

  const formattedDate = issuedDate ? new Date(issuedDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Pending';

  return (
    <div 
      ref={containerRef} 
      className="w-full max-w-[660px] mx-auto relative" 
      style={{ aspectRatio: '660 / 340' }}
    >
      <div 
        className="absolute top-0 left-0 w-[660px] h-[340px] overflow-hidden shadow-2xl rounded-[16px] origin-top-left transition-transform duration-300"
        style={{
          border: '1px solid rgba(201,162,39,0.3)',
          background: 'linear-gradient(135deg, #FDF8F0 0%, #f4ebd6 100%)',
          transform: `scale(${scale})`,
        }}
      >
        {/* Top Header Bar */}
        <div 
          className="flex items-center justify-between px-6 h-[40px]"
          style={{ background: 'linear-gradient(90deg, #991b1b 0%, #7f1d1d 100%)' }}
        >
          <div className="flex items-center gap-2.5">
             <div className="w-2 h-2 rounded-full bg-[#C9A227] animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_#C9A227]" />
             <span className="text-white/95 text-[11px] uppercase tracking-[3px] font-semibold">
               Official Credential
             </span>
          </div>
          <div 
            className="text-[10px] font-bold tracking-[2px] px-3 py-1 rounded-[4px] uppercase bg-gradient-to-r from-[#C9A227] to-[#e6c153] text-[#1A0505] shadow-sm"
          >
            Verified Member
          </div>
        </div>
        
        {/* Gold top accent line */}
        <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #8a6d1c, #ffe87c, #8a6d1c)' }} />

        {/* Main Body - Strictly Landscape */}
        <div className="flex relative items-stretch h-[281px]">
          {/* Diagnostic Watermark */}
          <div 
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(201,162,39,0.04) 10px, rgba(201,162,39,0.04) 11px)`
            }}
          />

          {/* LEFT Panel */}
          <div 
            className="w-[220px] flex-shrink-0 flex items-center justify-center p-6 relative z-10"
            style={{ background: 'linear-gradient(180deg, #0a0405, #1f0606)' }}
          >
            {/* Subtle glow behind the avatar */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#C41E3A] opacity-25 blur-[35px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 w-[130px] h-[130px] rounded-full overflow-hidden border-[3px] border-[#C9A227] flex items-center justify-center shadow-[0_0_35px_rgba(201,162,39,0.2)] bg-[#3a0606]">
              {profilePictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profilePictureUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-[#fbc658] tracking-wider">{initials}</span>
              )}
            </div>
          </div>

          {/* Vertical Gold Divider Line */}
          <div className="w-[1px] h-full flex-shrink-0 z-10" style={{ background: 'linear-gradient(to bottom, transparent 5%, rgba(201,162,39,0.5) 20%, rgba(201,162,39,0.5) 80%, transparent 95%)' }} />

          {/* RIGHT Panel */}
          <div className="flex-1 px-10 py-6 relative z-10 flex flex-col justify-center bg-white/10">
            
            {/* Logo perfectly placed in top right */}
            <div className="absolute top-6 right-7 z-0 opacity-80 pointer-events-none drop-shadow-sm">
              <img src="/niat.svg" alt="NIAT Logo" className="h-[36px] mix-blend-multiply" />
            </div>

            <div className="relative z-10 pr-[55px]">
              <div style={{ color: '#1A0505', fontFamily: 'Georgia, serif', lineHeight: 1.1 }} className="text-[32px] font-[800]">
                {name}
              </div>
              <div style={{ color: '#991b1b' }} className="text-[12px] font-bold tracking-[3px] uppercase mt-2">
                {role}
              </div>
            </div>

            {/* Gold rule divider */}
            <div 
              className="my-4 relative z-10 h-[1px] w-full" 
              style={{ background: 'linear-gradient(90deg, rgba(201,162,39,0.5) 0%, transparent 100%)' }} 
            />

            {/* Compact Field Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-5 bg-white/70 p-5 rounded-[12px] border border-black/5 mb-3 relative z-10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.4)] w-full">
              <div>
                <div className="text-[#8a6d1c] text-[9px] font-bold tracking-[1.5px] uppercase">Campus</div>
                <div className="text-[#1A0505] text-[15px] font-semibold mt-0.5 truncate" title={campus}>{campus}</div>
              </div>
              <div>
                <div className="text-[#8a6d1c] text-[9px] font-bold tracking-[1.5px] uppercase">Student ID</div>
                <div className="text-[#1A0505] text-[14px] font-semibold mt-0.5">{studentId || "N/A"}</div>
              </div>
              
              <div>
                <div className="text-[#8a6d1c] text-[9px] font-bold tracking-[1.5px] uppercase">Program</div>
                <div className="text-[#1A0505] text-[14px] font-medium mt-0.5">{program}</div>
              </div>
              <div>
                <div className="text-[#8a6d1c] text-[9px] font-bold tracking-[1.5px] uppercase">Issued / Batch</div>
                <div className="text-[#1A0505] text-[14px] font-medium mt-0.5">{formattedDate} <span className="opacity-40 px-1">•</span> {batch}</div>
              </div>
            </div>

            {/* Verification Seal SVG */}
            <div className="absolute right-6 bottom-6 z-20 transition-transform duration-300 origin-bottom-right">
              <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 6px 12px rgba(153, 27, 27, 0.25))' }}>
                <circle cx="50" cy="50" r="48" fill="#FDF8F0" />
                <circle cx="50" cy="50" r="42" fill="#991b1b" stroke="#C9A227" strokeWidth="6"/>
                <path d="M32 52L44 64L68 36" stroke="#FDF8F0" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M32 52L44 64L68 36" stroke="#C9A227" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Gold bottom accent line */}
        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #8a6d1c, #ffe87c, #8a6d1c)' }} />

        {/* Bottom Footer Bar */}
        <div className="h-[14px]" style={{ background: 'linear-gradient(90deg, #991b1b 0%, #7f1d1d 100%)' }} />
      </div>
    </div>
  );
}
