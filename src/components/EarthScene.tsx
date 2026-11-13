import './earth-scene.css';

// Animated version of src/assets/earth-hills.svg for the landing backdrop:
// clouds drift across the sky and the brown soil strata slowly flow, with an
// occasional faint tremor. Decorative only; motion stops under reduced motion.
const clouds = [
  { y: 150, scale: 1, className: 'sp-cloud-a' },
  { y: 96, scale: 1.25, className: 'sp-cloud-b' },
  { y: 186, scale: 0.75, className: 'sp-cloud-c' },
  { y: 60, scale: 0.9, className: 'sp-cloud-d' },
];

export default function EarthScene() {
  return (
    <div className="sp-earth-scene" aria-hidden="true">
      <svg viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice">
        {/* Far ridge with a stepped scarp, a nod to the Lembang fault escarpment */}
        <path
          d="M0 250 C 180 228 360 206 560 214 L 700 212 L 722 178 C 900 152 1100 160 1300 176 C 1450 186 1540 180 1600 176 L1600 420 L0 420 Z"
          fill="#f1e5d4"
        />
        {clouds.map((cloud) => (
          <g
            key={cloud.className}
            className={`sp-cloud ${cloud.className}`}
            fill="#fffaf2"
          >
            <g transform={`translate(0 ${cloud.y}) scale(${cloud.scale})`}>
              <ellipse cx="0" cy="0" rx="78" ry="17" />
              <ellipse cx="-26" cy="-10" rx="36" ry="15" />
              <ellipse cx="22" cy="-14" rx="44" ry="18" />
            </g>
          </g>
        ))}
        {/* Mid hills */}
        <path
          d="M0 300 C 180 270 360 292 540 276 C 760 256 920 302 1120 286 C 1320 270 1460 296 1600 280 L1600 420 L0 420 Z"
          fill="#e8d4b9"
        />
        <g fill="#dcc3a3">
          <path d="M300 286 h26 v-16 l-13 -10 l-13 10 Z" />
          <path d="M334 284 h18 v-12 l-9 -7 l-9 7 Z" />
          <path d="M880 290 h30 v-18 l-15 -11 l-15 11 Z" />
          <path d="M918 291 h20 v-13 l-10 -8 l-10 8 Z" />
          <path d="M1380 284 h24 v-15 l-12 -9 l-12 9 Z" />
        </g>
        {/* Near soil: the brown bands move, the hills above stay calm */}
        <g className="sp-soil">
          <path
            d="M-40 346 C 220 326 420 350 640 338 C 880 326 1100 356 1340 340 C 1460 334 1540 340 1640 336 L1640 440 L-40 440 Z"
            fill="#dcc0a0"
          />
          <g fill="none" strokeWidth="2" opacity="0.6">
            <path
              className="sp-strata sp-strata-a"
              stroke="#c9a57c"
              d="M-40 366 C 220 348 420 372 640 360 C 880 348 1100 378 1340 362 C 1460 356 1540 362 1640 358"
            />
            <path
              className="sp-strata sp-strata-b"
              stroke="#b8865c"
              d="M-40 384 C 240 370 460 392 700 380 C 940 368 1160 396 1400 382 C 1500 377 1560 381 1640 379"
            />
          </g>
          <path
            d="M-40 398 C 300 386 600 404 900 394 C 1200 384 1400 400 1640 392 L1640 440 L-40 440 Z"
            fill="#cfae88"
          />
          <g className="sp-pebbles" fill="#f5ead9" opacity="0.8">
            <ellipse cx="420" cy="405" rx="6" ry="3" />
            <ellipse cx="1040" cy="402" rx="5" ry="2.5" />
            <ellipse cx="1460" cy="406" rx="6" ry="3" />
            <ellipse cx="740" cy="408" rx="4" ry="2" />
          </g>
        </g>
      </svg>
    </div>
  );
}
