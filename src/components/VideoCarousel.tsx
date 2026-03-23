import React, { useMemo } from 'react';
import { Play } from 'lucide-react';

interface Video {
    id: string;
    title: string;
    url: string;
    tag: string;
}

const videos: Video[] = [
    {
        id: '-WVx9_pTqhM',
        title: 'NIAT X EAMCET Colleges',
        url: 'https://www.youtube.com/watch?v=-WVx9_pTqhM',
        tag: 'Admissions',
    },
    {
        id: 'bAPP4fh9GDc',
        title: 'NIAT Admissions 2026 Explained: 4 Steps to Apply After 12th',
        url: 'https://www.youtube.com/watch?v=bAPP4fh9GDc',
        tag: 'Admissions',
    },
    {
        id: 'ZCSDiXavVrU',
        title: "Don't Join NIAT Before Watching This | Honest 1st Year Review",
        url: 'https://www.youtube.com/watch?v=ZCSDiXavVrU',
        tag: 'Student Review',
    },
    {
        id: '_wAi9c5HGEQ',
        title: 'Is NIAT Worth it in 2026 | Honest NIAT Review',
        url: 'https://www.youtube.com/watch?v=_wAi9c5HGEQ',
        tag: 'Student Review',
    },
    {
        id: 'uY2hEQqac9s',
        title: 'NIAT NAT Exam Full Details | Syllabus, Pattern & Preparation Strategy',
        url: 'https://www.youtube.com/watch?v=uY2hEQqac9s',
        tag: 'Exam Prep',
    },
];

const VideoCarousel: React.FC = () => {
    const movingTrack = useMemo(() => [...videos, ...videos], []);

    const getTagColor = (tag: string) => {
        switch (tag) {
            case 'Admissions':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Student Review':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Exam Prep':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <section className="py-12 bg-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div>
                        <h2 className="font-display text-2xl md:text-3xl font-bold text-black mb-2 flex items-center gap-2">
                            Life at NIAT
                        </h2>
                        <p className="text-[#64748b]">
                            Real student stories from NIAT campuses. Tap any thumbnail to watch.
                        </p>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-[#f8fafc] to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-[#f8fafc] to-transparent z-10" />

                    <div className="video-marquee-track flex gap-5 w-max py-2">
                        {movingTrack.map((video, idx) => (
                            <a
                                key={`${video.id}-${idx}`}
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="video-thumb group relative block flex-none w-[78vw] sm:w-[360px] md:w-[390px] rounded-xl overflow-hidden border border-[rgba(30,41,59,0.08)] shadow-card hover:shadow-lg hover:border-[#991b1b]/30 transition-all duration-300"
                            >
                                <div className="relative aspect-video overflow-hidden bg-[#0f172a]">
                                    <img
                                        src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                                        alt={video.title}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                                    <div className="absolute top-3 left-3">
                                        <span
                                            className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border backdrop-blur-sm ${getTagColor(
                                                video.tag
                                            )}`}
                                        >
                                            {video.tag}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                                        <h3 className="font-display font-semibold text-white leading-snug line-clamp-2 text-sm sm:text-base">
                                            {video.title}
                                        </h3>
                                        <span className="shrink-0 w-10 h-10 rounded-full bg-white/90 text-[#991b1b] flex items-center justify-center shadow-md transform transition-transform duration-300 group-hover:scale-110">
                                            <Play className="w-5 h-5 ml-0.5" />
                                        </span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 motion-reduce:grid">
                    {videos.map((video) => (
                        <a
                            key={`fallback-${video.id}`}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="motion-reduce:block hidden group relative rounded-lg overflow-hidden border border-[rgba(30,41,59,0.1)]"
                        >
                            <img
                                src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                                alt={video.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                <span className="w-8 h-8 rounded-full bg-white/90 text-[#991b1b] flex items-center justify-center">
                                    <Play className="w-4 h-4 ml-0.5" />
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
        .video-marquee-track {
          animation: niat-video-marquee 48s linear infinite;
          will-change: transform;
        }
        .video-marquee-track:hover,
        .video-marquee-track:focus-within {
          animation-play-state: paused;
        }
        @keyframes niat-video-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (max-width: 640px) {
          .video-marquee-track { animation-duration: 34s; }
        }
        @media (prefers-reduced-motion: reduce) {
          .video-marquee-track { animation: none !important; }
          .video-thumb { display: none !important; }
        }
      `,
                }}
            />
        </section>
    );
};

export default VideoCarousel;
