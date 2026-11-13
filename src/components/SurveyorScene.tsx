// Flat isometric illustration: a surveyor reads a total station aimed at a
// levelling staff, standing on a cut block of layered soil. Earth palette only.
export default function SurveyorScene() {
  return (
    <svg
      className="surveyor-scene"
      width="100%"
      viewBox="0 0 560 500"
      role="img"
      aria-label="Ilustrasi pesurvei mengukur tanah dengan alat ukur di atas lapisan tanah."
    >
      {/* Soft backdrop disc */}
      <circle cx="280" cy="250" r="210" fill="#f7ecdc" />

      {/* Shadow under the block */}
      <ellipse
        cx="280"
        cy="448"
        rx="230"
        ry="26"
        fill="#d9c1a3"
        opacity="0.45"
      />

      {/* Soil block: top face and two cut faces with layers */}
      <polygon points="60,330 280,220 500,330 280,440" fill="#e7cfa9" />
      <polygon points="60,330 280,440 280,470 60,360" fill="#b8865c" />
      <polygon points="60,342 280,452 280,460 60,350" fill="#d4a978" />
      <polygon points="60,354 280,464 280,470 60,360" fill="#8a5a3b" />
      <polygon points="280,440 500,330 500,360 280,470" fill="#a87650" />
      <polygon points="280,452 500,342 500,350 280,460" fill="#c99a6c" />
      <polygon points="280,464 500,354 500,360 280,470" fill="#7a4e33" />
      {/* Stones in the cut */}
      <ellipse cx="150" cy="392" rx="7" ry="4" fill="#efe0c8" />
      <ellipse cx="410" cy="392" rx="6" ry="3.5" fill="#efe0c8" />
      <ellipse cx="350" cy="430" rx="5" ry="3" fill="#e2c9a6" />

      {/* Contour lines on the ground */}
      <g fill="none" stroke="#c9a57c" strokeWidth="1.4" opacity="0.8">
        <ellipse cx="300" cy="330" rx="150" ry="62" />
        <ellipse cx="305" cy="330" rx="104" ry="42" />
        <ellipse cx="310" cy="330" rx="60" ry="24" />
      </g>

      {/* Sight line from instrument to staff */}
      <line
        x1="214"
        y1="246"
        x2="420"
        y2="226"
        stroke="#8a5a3b"
        strokeWidth="1.6"
        strokeDasharray="5 6"
      />

      {/* Levelling staff with alternating bands */}
      <g>
        <rect x="414" y="168" width="14" height="168" rx="2" fill="#fbf3e6" />
        {[0, 1, 2, 3, 4, 5, 6].map((band) => (
          <rect
            key={band}
            x="414"
            y={176 + band * 22}
            width="14"
            height="11"
            fill={band % 2 ? '#b8865c' : '#8a5a3b'}
          />
        ))}
        <ellipse cx="421" cy="337" rx="16" ry="5" fill="#c9a57c" />
      </g>

      {/* Tripod and total station */}
      <g stroke="#6b4a33" strokeWidth="5" strokeLinecap="round">
        <line x1="200" y1="262" x2="168" y2="352" />
        <line x1="200" y1="262" x2="214" y2="362" />
        <line x1="200" y1="262" x2="236" y2="342" />
      </g>
      <rect x="186" y="254" width="30" height="10" rx="3" fill="#5a3d2a" />
      <rect x="188" y="226" width="26" height="30" rx="4" fill="#efe0c8" />
      <rect x="192" y="232" width="18" height="12" rx="2" fill="#8a5a3b" />
      <rect x="208" y="240" width="14" height="10" rx="3" fill="#3b2a1e" />
      <circle cx="222" cy="245" r="3" fill="#dcbc98" />

      {/* Surveyor */}
      <g>
        {/* Legs and boots */}
        <path d="M262 300 L256 362 L268 362 L276 304 Z" fill="#4f3a2c" />
        <path d="M282 302 L290 366 L302 364 L296 300 Z" fill="#5f4634" />
        <path d="M250 360 h22 v8 h-24 z" fill="#3b2a1e" />
        <path d="M288 362 h22 v8 h-24 z" fill="#3b2a1e" />
        {/* Torso with safety vest, leaning toward the instrument */}
        <path
          d="M252 238 Q262 222 284 224 Q302 228 302 250 L300 306 L258 306 Q248 272 252 238 Z"
          fill="#e58a3b"
        />
        <rect x="256" y="268" width="44" height="7" fill="#fbf0dc" />
        <rect x="257" y="284" width="43" height="7" fill="#fbf0dc" />
        <path d="M276 226 L272 306" stroke="#c96f28" strokeWidth="2" />
        {/* Arm reaching to the instrument */}
        <path
          d="M258 244 Q236 248 222 252"
          stroke="#e58a3b"
          strokeWidth="13"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="219" cy="253" r="6" fill="#c68a5e" />
        {/* Other arm holding a clipboard */}
        <path
          d="M298 250 Q312 270 306 286"
          stroke="#e58a3b"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
        <rect
          x="300"
          y="276"
          width="26"
          height="32"
          rx="3"
          fill="#fbf3e6"
          stroke="#b8865c"
          strokeWidth="2"
          transform="rotate(-12 313 292)"
        />
        <g stroke="#c9a57c" strokeWidth="2" transform="rotate(-12 313 292)">
          <line x1="305" y1="286" x2="321" y2="286" />
          <line x1="305" y1="293" x2="321" y2="293" />
          <line x1="305" y1="300" x2="316" y2="300" />
        </g>
        {/* Head, looking through the eyepiece */}
        <rect x="260" y="212" width="10" height="14" fill="#c68a5e" />
        <circle cx="258" cy="204" r="15" fill="#c68a5e" />
        <path
          d="M248 198 Q258 190 272 198 L272 206 Q262 202 250 206 Z"
          fill="#3b2a1e"
        />
        {/* Hard hat */}
        <path d="M240 196 Q242 176 260 174 Q278 176 278 196 Z" fill="#f2b544" />
        <rect x="234" y="194" width="48" height="6" rx="3" fill="#e0a12f" />
        <rect x="257" y="174" width="6" height="20" rx="2" fill="#e0a12f" />
      </g>

      {/* Small survey flag and peg */}
      <line
        x1="120"
        y1="300"
        x2="120"
        y2="340"
        stroke="#6b4a33"
        strokeWidth="3"
      />
      <path d="M121 300 L144 307 L121 314 Z" fill="#e58a3b" />
      <ellipse cx="120" cy="341" rx="7" ry="2.5" fill="#c9a57c" />
    </svg>
  );
}
