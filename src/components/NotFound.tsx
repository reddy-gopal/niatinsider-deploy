"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const headlines = [
  "Page Found Wandering Near Canteen, Sources Say",
  "URL Went on Assignment, Failed to Return",
  "Breaking: This Page Has Gone Off the Record",
  "Exclusive: Page Last Seen Attending 3AM Study Session",
  "Sources Confirm: Link Has Requested Anonymity",
  "Page Officially Listed as Missing Since Your Last Click",
];

const tips = [
  "Try checking the URL for typos",
  "Head back to the homepage",
  "Search for what you were looking for",
  "Browse our latest campus stories",
];

export default function NotFound() {
  const [headline, setHeadline] = useState("");
  const [displayedHeadline, setDisplayedHeadline] = useState("");
  const [tipIndex, setTipIndex] = useState(0);
  const [stamped, setStamped] = useState(false);
  const [noiseCanvas, setNoiseCanvas] = useState(null);

  useEffect(() => {
    const h = headlines[Math.floor(Math.random() * headlines.length)];
    setHeadline(h);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!headline) return;
    let i = 0;
    setDisplayedHeadline("");
    const interval = setInterval(() => {
      setDisplayedHeadline(headline.slice(0, i + 1));
      i++;
      if (i >= headline.length) clearInterval(interval);
    }, 38);
    return () => clearInterval(interval);
  }, [headline]);

  // Stamp animation delay
  useEffect(() => {
    const t = setTimeout(() => setStamped(true), 900);
    return () => clearTimeout(t);
  }, []);

  // Cycle tips
  useEffect(() => {
    const t = setInterval(() => {
      setTipIndex((i) => (i + 1) % tips.length);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Courier+Prime:wght@400;700&display=swap');

        :root {
          --ink: #1a1209;
          --paper: #f5f0e8;
          --paper-dark: #ede7d4;
          --red: #991B1B;
          --red-light: #fef2f2;
          --rule: #c9bfa8;
          --muted: #7a6e5f;
        }

        .page-404 {
          min-height: 100vh;
          background: var(--paper);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
          font-family: 'Courier Prime', monospace;
        }

        /* Paper texture lines */
        .page-404::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: repeating-linear-gradient(
            transparent,
            transparent 27px,
            var(--rule) 27px,
            var(--rule) 28px
          );
          opacity: 0.35;
          pointer-events: none;
        }

        /* Left red margin line */
        .page-404::after {
          content: '';
          position: fixed;
          top: 0; bottom: 0;
          left: 72px;
          width: 1.5px;
          background: #e8a0a0;
          opacity: 0.5;
          pointer-events: none;
        }

        .notebook {
          position: relative;
          width: 100%;
          max-width: 680px;
          z-index: 10;
        }

        /* Torn top edge */
        .torn-top {
          width: 100%;
          height: 32px;
          background: var(--paper);
          position: relative;
          margin-bottom: -2px;
          clip-path: polygon(
            0% 100%, 1% 30%, 2% 85%, 3.5% 20%, 5% 70%, 6.5% 15%,
            8% 60%, 9.5% 25%, 11% 75%, 12.5% 10%, 14% 55%, 15.5% 30%,
            17% 80%, 18.5% 20%, 20% 65%, 21.5% 35%, 23% 85%, 24.5% 15%,
            26% 60%, 27.5% 40%, 29% 75%, 30.5% 20%, 32% 65%, 33.5% 30%,
            35% 80%, 36.5% 25%, 38% 55%, 39.5% 15%, 41% 70%, 42.5% 35%,
            44% 85%, 45.5% 20%, 47% 60%, 48.5% 40%, 50% 78%, 51.5% 22%,
            53% 68%, 54.5% 32%, 56% 82%, 57.5% 18%, 59% 58%, 60.5% 42%,
            62% 76%, 63.5% 28%, 65% 62%, 66.5% 38%, 68% 80%, 69.5% 24%,
            71% 64%, 72.5% 36%, 74% 72%, 75.5% 18%, 77% 58%, 78.5% 42%,
            80% 78%, 81.5% 26%, 83% 66%, 84.5% 34%, 86% 72%, 87.5% 22%,
            89% 60%, 90.5% 38%, 92% 76%, 93.5% 28%, 95% 64%, 96.5% 32%,
            98% 70%, 99% 40%, 100% 100%
          );
          filter: drop-shadow(0 -3px 6px rgba(0,0,0,0.12));
        }

        .paper-body {
          background: var(--paper);
          padding: 2.5rem 3rem 3rem;
          box-shadow: 0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.08);
          position: relative;
        }

        /* Hole punches */
        .holes {
          position: absolute;
          left: -18px;
          top: 0; bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          padding: 3rem 0;
          gap: 0;
        }
        .hole {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--paper-dark);
          border: 1.5px solid var(--rule);
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.15);
        }

        /* Tape at top */
        .tape {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%) rotate(-1.5deg);
          width: 90px;
          height: 28px;
          background: rgba(255,235,150,0.55);
          border: 0.5px solid rgba(200,180,80,0.3);
          z-index: 20;
        }

        .masthead {
          border-bottom: 3px double var(--ink);
          padding-bottom: 0.6rem;
          margin-bottom: 1.4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .masthead-brand {
          font-family: 'Special Elite', cursive;
          font-size: 1.05rem;
          color: var(--red);
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .masthead-meta {
          font-family: 'Courier Prime', monospace;
          font-size: 0.7rem;
          color: var(--muted);
          text-align: right;
          line-height: 1.5;
        }

        .edition-bar {
          text-align: center;
          font-family: 'Courier Prime', monospace;
          font-size: 0.68rem;
          color: var(--muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-top: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
          padding: 3px 0;
          margin-bottom: 1.6rem;
        }

        .error-number {
          font-family: 'Special Elite', cursive;
          font-size: clamp(5rem, 18vw, 9rem);
          color: var(--ink);
          line-height: 0.9;
          letter-spacing: -0.04em;
          position: relative;
          display: inline-block;
          margin-bottom: 0.2rem;
        }

        /* Strikethrough on 404 */
        .error-number::after {
          content: '';
          position: absolute;
          top: 50%;
          left: -4px; right: -4px;
          height: 3px;
          background: var(--red);
          transform: rotate(-2deg);
          opacity: 0.7;
        }

        .breaking-tag {
          display: inline-block;
          background: var(--red);
          color: #fff;
          font-family: 'Courier Prime', monospace;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 3px 10px;
          margin-bottom: 0.7rem;
        }

        .headline {
          font-family: 'Libre Baskerville', serif;
          font-size: clamp(1.15rem, 3vw, 1.55rem);
          font-weight: 700;
          color: var(--ink);
          line-height: 1.25;
          margin-bottom: 1rem;
          min-height: 2.6em;
        }

        .headline::after {
          content: '|';
          animation: blink 1s step-end infinite;
          color: var(--red);
          font-weight: 400;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .byline {
          font-family: 'Courier Prime', monospace;
          font-size: 0.72rem;
          color: var(--muted);
          margin-bottom: 1.2rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .byline-dot { color: var(--rule); }

        .article-body {
          font-family: 'Libre Baskerville', serif;
          font-size: 0.88rem;
          color: var(--ink);
          line-height: 1.85;
          margin-bottom: 1.5rem;
          column-count: 2;
          column-gap: 2rem;
          column-rule: 1px solid var(--rule);
        }

        @media (max-width: 520px) {
          .article-body { column-count: 1; }
          .paper-body { padding: 2rem 1.5rem 2.5rem; }
        }

        .article-body p { margin: 0 0 0.8em; }

        .drop-cap::first-letter {
          font-family: 'Special Elite', cursive;
          font-size: 3.2em;
          float: left;
          line-height: 0.75;
          margin: 0.1em 0.08em 0 0;
          color: var(--ink);
        }

        /* Handwritten correction */
        .correction {
          font-family: 'Special Elite', cursive;
          font-size: 0.78rem;
          color: var(--red);
          transform: rotate(-2deg);
          display: inline-block;
          margin-left: 4px;
        }

        /* MISSING stamp */
        .stamp-wrap {
          position: absolute;
          top: 3.5rem;
          right: 2.5rem;
          transform: rotate(12deg);
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        .stamp-wrap.visible {
          opacity: 1;
          transform: rotate(12deg) scale(1);
          animation: stampIn 0.25s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        @keyframes stampIn {
          0% { transform: rotate(12deg) scale(1.4); opacity: 0; }
          60% { transform: rotate(12deg) scale(0.92); opacity: 1; }
          100% { transform: rotate(12deg) scale(1); opacity: 1; }
        }
        .stamp {
          border: 3px solid var(--red);
          color: var(--red);
          font-family: 'Special Elite', cursive;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          padding: 6px 14px 4px;
          opacity: 0.75;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .divider {
          border: none;
          border-top: 1px solid var(--rule);
          margin: 1.4rem 0;
        }

        /* Reporter's tip box */
        .tip-box {
          border: 1px solid var(--rule);
          border-left: 3px solid var(--red);
          padding: 0.7rem 1rem;
          margin-bottom: 1.4rem;
          background: var(--paper-dark);
          font-family: 'Courier Prime', monospace;
          font-size: 0.75rem;
          color: var(--muted);
          position: relative;
        }
        .tip-label {
          font-size: 0.62rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--red);
          font-weight: 700;
          margin-bottom: 3px;
        }
        .tip-text {
          transition: opacity 0.4s ease;
          min-height: 1.2em;
        }

        .actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .btn-primary {
          background: var(--ink);
          color: var(--paper);
          font-family: 'Courier Prime', monospace;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.55rem 1.3rem;
          border: none;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: background 0.15s;
        }
        .btn-primary:hover { background: var(--red); }

        .btn-ghost {
          background: transparent;
          color: var(--ink);
          font-family: 'Courier Prime', monospace;
          font-size: 0.78rem;
          letter-spacing: 0.04em;
          padding: 0.55rem 1rem;
          border: 1px solid var(--rule);
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: border-color 0.15s, color 0.15s;
        }
        .btn-ghost:hover { border-color: var(--ink); color: var(--red); }

        .footer-note {
          margin-top: 1.5rem;
          font-family: 'Courier Prime', monospace;
          font-size: 0.65rem;
          color: var(--rule);
          text-align: center;
          letter-spacing: 0.05em;
          border-top: 1px dashed var(--rule);
          padding-top: 0.8rem;
        }

        /* Pencil scribble decoration */
        .scribble {
          position: absolute;
          bottom: 1.2rem;
          right: 1.5rem;
          font-family: 'Special Elite', cursive;
          font-size: 0.7rem;
          color: var(--rule);
          transform: rotate(-8deg);
          opacity: 0.6;
          pointer-events: none;
        }
      `}</style>

      <div className="page-404">
        <div className="notebook">
          <div className="torn-top" />
          <div className="paper-body">

            {/* Hole punches */}
            <div className="holes">
              <div className="hole" />
              <div className="hole" />
              <div className="hole" />
            </div>

            {/* Tape */}
            <div className="tape" />

            {/* MISSING stamp */}
            <div className={`stamp-wrap ${stamped ? "visible" : ""}`}>
              <div className="stamp">Missing</div>
            </div>

            {/* Masthead */}
            <div className="masthead">
              <div className="masthead-brand">
                {/* Inline NIAT SVG icon at small size */}
                <svg width="18" height="23" viewBox="0 0 54 69" fill="none">
                  <path d="M0 0H53.8866V41.2459C53.8866 56.1256 41.8236 68.2556 26.9427 68.2556C12.063 68.2556 0 56.1256 0 41.2459V0ZM26.9427 63.8775C39.3433 63.8775 49.5755 53.6453 49.5755 41.2459V4.31107H26.9427V63.8775ZM9.01096 25.1242V25.5057H12.4688V25.1242L11.8631 24.945C11.5779 24.8694 11.3914 24.728 11.3012 24.5184C11.2122 24.3088 11.1671 24.0467 11.1671 23.7322V13.9205L19.8258 25.5057H21.0825V12.6188C21.0825 12.3189 21.1129 12.0642 21.1727 11.8545C21.2482 11.6303 21.4274 11.473 21.7114 11.3828L22.2733 11.2268V10.7771H18.9275V11.2268L19.6016 11.3828C19.9002 11.4584 20.0952 11.6083 20.1854 11.8326C20.2902 12.0569 20.3426 12.3189 20.3426 12.6188V20.9484L12.7833 10.7771H8.94393V11.2268L9.34859 11.5181C9.52776 11.6522 9.67036 11.7729 9.77518 11.8777C9.88 11.9825 9.97751 12.1093 10.0665 12.2592C10.1713 12.3933 10.292 12.6029 10.426 12.8869V23.7554C10.426 24.054 10.3663 24.3088 10.2469 24.5184C10.1421 24.728 9.94704 24.8694 9.66305 24.945L9.01096 25.1242ZM11.5852 51.7975V51.5062L11.0915 51.349C10.7625 51.2295 10.5747 51.065 10.5297 50.8553C10.4858 50.6457 10.515 50.3763 10.6198 50.0472L11.5852 47.1951H16.5471L17.4905 50.0923C17.5953 50.4202 17.61 50.6981 17.5356 50.9224C17.4759 51.1466 17.2809 51.3112 16.9518 51.416L16.5703 51.5281V51.7975H22.2733V51.5281L21.9357 51.4392C21.6066 51.3343 21.3677 51.199 21.2178 51.0345C21.0678 50.8553 20.9338 50.6006 20.8131 50.2715L16.3009 37.0019H14.4373L9.90194 50.1813C9.79712 50.4958 9.65452 50.7432 9.47535 50.9224C9.3108 51.1015 9.07069 51.2368 8.75622 51.327L8.15045 51.5062V51.7975H11.5852ZM14.1448 39.7857L16.3448 46.5443H11.8107L14.1448 39.7857ZM26.9427 29.8167H7.90303V32.6908H26.9427V29.8167ZM36.0146 24.9901C36.3144 24.8853 36.5095 24.75 36.5984 24.5854C36.7033 24.4063 36.7557 24.1588 36.7557 23.8444V12.5054C36.7557 12.1922 36.7033 11.9521 36.5984 11.7875C36.5095 11.6083 36.3144 11.4657 36.0146 11.3609L35.5661 11.2268V10.7771H40.9534V11.2268L40.5048 11.3609C40.2196 11.4657 40.0258 11.6083 39.921 11.7875C39.8162 11.9521 39.7638 12.1922 39.7638 12.5054V23.8444C39.7638 24.1588 39.8162 24.4063 39.921 24.5854C40.0258 24.75 40.2196 24.8853 40.5048 24.9901L40.9534 25.1242V25.5057H35.5661V25.1242L36.0146 24.9901ZM35.6099 51.0686C36.2389 50.9346 36.5533 50.5677 36.5533 49.9692V40.6962C36.5533 39.648 36.5448 38.5998 36.5302 37.5528H34.7567C34.2777 37.5528 33.9255 37.6796 33.7012 37.9343C33.477 38.1878 33.2527 38.5474 33.0272 39.0118L32.2423 40.673H31.6133L31.7706 37.0019H44.8379L44.9049 40.673H44.276L43.491 39.0118C43.2668 38.5474 43.0413 38.1878 42.817 37.9343C42.5927 37.6796 42.2405 37.5528 41.7627 37.5528H39.9661V49.9692C39.9661 50.5823 40.2806 50.9492 40.9083 51.0686L41.8297 51.2478V51.7195H34.7117V51.2478L35.6099 51.0686ZM45.9824 29.8167H26.9427V32.6908H45.9824V29.8167Z" fill="#991B1B"/>
                </svg>
                NIAT Insider
              </div>
              <div className="masthead-meta">
                Vol. 1 · Error Edition<br />
                niatinsider.com
              </div>
            </div>

            <div className="edition-bar">
              Special Report &nbsp;·&nbsp; Campus Dispatch &nbsp;·&nbsp; Hyderabad Bureau
            </div>

            {/* 404 number */}
            <div style={{ marginBottom: "0.6rem" }}>
              <span className="error-number">404</span>
            </div>

            {/* Breaking tag */}
            <div className="breaking-tag">⬛ Breaking</div>

            {/* Typewriter headline */}
            <h1 className="headline">{displayedHeadline}</h1>

            {/* Byline */}
            <div className="byline">
              By Our Web Correspondent
              <span className="byline-dot">·</span>
              NIAT Insider
              <span className="byline-dot">·</span>
              Just now
            </div>

            <hr className="divider" />

            {/* Article body */}
            <div className="article-body">
              <p className="drop-cap">
                The page you were looking for has gone completely off the grid.
                Our reporters have searched every corner of the campus —
                the library, the canteen, even the 3AM study sessions —
                and found <span className="correction">absolutely nothing.</span>
              </p>
              <p>
                Witnesses report the URL was last seen heading toward an
                unknown destination, muttering something about a deadline.
                The web server, reached for comment, declined to elaborate
                beyond the cryptic response: "404."
              </p>
              <p>
                Investigations are ongoing. Sources close to the situation
                suggest the link may have never existed at all — or perhaps
                it existed once, briefly, and chose to move on. Much like
                that group project partner who disappeared after week two.
              </p>
            </div>

            {/* Reporter tip box */}
            <div className="tip-box">
              <div className="tip-label">📋 Reporter's Tip</div>
              <div className="tip-text">{tips[tipIndex]}</div>
            </div>

            {/* CTA buttons */}
            <div className="actions">
              <Link href="/" className="btn-primary">← Back to Homepage</Link>
              <Link href="/articles" className="btn-ghost">Browse Stories</Link>
              <Link href="/search" className="btn-ghost">Search</Link>
            </div>

            <div className="footer-note">
              This error has been filed under: Things That Happen · Page not found · Not our fault
            </div>

            {/* Pencil scribble */}
            <div className="scribble">follow up tmrw?</div>
          </div>
        </div>
      </div>
    </>
  );
}