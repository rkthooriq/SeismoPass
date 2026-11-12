export default function BuildingScene() {
  return (
    <svg
      className="building-scene"
      viewBox="70 90 600 460"
      role="img"
      aria-labelledby="scene-title scene-desc"
    >
      <title id="scene-title">Ilustrasi lingkungan bangunan SeismoPass</title>
      <desc id="scene-desc">
        Maket rumah beratap pelana, bangunan tiga lantai, dan pepohonan dalam
        warna putih dan abu pada alas beraksen lime. Ilustrasi dekoratif, bukan
        hasil pemeriksaan bangunan.
      </desc>
      <defs>
        <linearGradient id="island-top" x2="1" y2="1">
          <stop stopColor="#e6e5df" />
          <stop offset="1" stopColor="#babbb4" />
        </linearGradient>
        <linearGradient id="house-front" x2="0" y2="1">
          <stop stopColor="#faf9f4" />
          <stop offset="1" stopColor="#d9d9d2" />
        </linearGradient>
        <linearGradient id="roof-top" x2="1" y2="1">
          <stop stopColor="#c7c9c4" />
          <stop offset="1" stopColor="#91958f" />
        </linearGradient>
        <linearGradient id="tower-front" x2="1" y2="1">
          <stop stopColor="#edede7" />
          <stop offset="1" stopColor="#c2c5bf" />
        </linearGradient>
        <radialGradient id="tree-top">
          <stop stopColor="#d7dbd0" />
          <stop offset="1" stopColor="#8c9586" />
        </radialGradient>
        <filter id="shadow" x="-40%" y="-40%" width="180%" height="200%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <ellipse
        cx="375"
        cy="456"
        rx="220"
        ry="38"
        fill="#000000"
        opacity=".4"
        filter="url(#shadow)"
      />
      <g className="scene-island">
        <path
          d="M106 352 348 215Q371 202 395 215L639 353V379Q639 392 624 401L396 530Q372 543 348 530L119 401Q106 393 106 379Z"
          fill="#696e65"
        />
        <path
          d="M119 338 348 208Q371 195 395 208L624 338Q651 353 624 369L395 500Q371 514 348 500L119 369Q92 354 119 338"
          fill="url(#island-top)"
        />
        <path
          d="m148 365 208-119 235 134M280 456l214-124"
          stroke="#f8f7f2"
          strokeWidth="24"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="m148 365 208-119 235 134M280 456l214-124"
          stroke="#acafa5"
          strokeWidth="1.5"
          strokeDasharray="7 7"
          fill="none"
        />
        <ellipse
          cx="457"
          cy="340"
          rx="75"
          ry="20"
          fill="#363d34"
          opacity=".15"
        />
        <path
          d="m382 306 79 45 78-45V163l-78-45-79 45Z"
          fill="url(#tower-front)"
        />
        <path d="m461 208 78-45v143l-78 45Z" fill="#9a9f96" />
        <path d="m382 163 79-45 78 45-78 45Z" fill="#f9f9f4" />
        <path d="m399 163 62-35 61 35-61 35Z" fill="#c2c7bc" />
        {[0, 1, 2].map((row) => (
          <g key={row} transform={`translate(0 ${row * 36})`} fill="#535d53">
            <path d="m399 190 16 9v21l-16-9Z" />
            <path d="m429 207 16 9v21l-16-9Z" />
            <path d="m478 216 16-9v21l-16 9Z" fill="#454d45" />
            <path d="m509 199 16-9v21l-16 9Z" fill="#454d45" />
          </g>
        ))}
        <ellipse
          cx="289"
          cy="378"
          rx="98"
          ry="27"
          fill="#383d34"
          opacity=".13"
        />
        <path
          d="m202 288 91-53 91 53v91l-91 53-91-53Z"
          fill="url(#house-front)"
        />
        <path d="m293 341 91-53v91l-91 53Z" fill="#bfc2ba" />
        <path d="m192 289 101-59 101 59-101 59Z" fill="#646d61" />
        <path d="m192 289 51-97 101-58-51 96Z" fill="#f2f2eb" />
        <path d="m243 192 50 97 101-58-50-97Z" fill="url(#roof-top)" />
        <path
          d="m243 192 50 97-101-58Z"
          fill="#f6f5ef"
          transform="translate(0 58)"
        />
        <path d="m229 328 26 15v35l-26-15Z" fill="#4b5749" />
        <path d="m242 336v34m-13-24 26 15" stroke="#e8e8e0" strokeWidth="3" />
        <path d="m310 361 25-14v61l-25 15Z" fill="#535d4e" />
        <path d="m348 341 21-12v29l-21 12Z" fill="#4b5749" />
        <path d="m290 408 22 12 29-17-22-12Z" fill="#a9ada1" />
        <path d="m302 422 22 12 29-17-22-12Z" fill="#e8e9df" />
        <g>
          <path d="m555 346v53" stroke="#798070" strokeWidth="9" />
          <ellipse cx="555" cy="338" rx="35" ry="43" fill="url(#tree-top)" />
          <ellipse
            cx="545"
            cy="322"
            rx="19"
            ry="24"
            fill="#e0e3d8"
            opacity=".6"
          />
        </g>
        <g>
          <path d="m176 306v45" stroke="#798070" strokeWidth="7" />
          <ellipse cx="176" cy="297" rx="27" ry="34" fill="url(#tree-top)" />
        </g>
        <g>
          <path d="m405 420v44" stroke="#798070" strokeWidth="7" />
          <ellipse cx="405" cy="411" rx="27" ry="34" fill="url(#tree-top)" />
        </g>
        <path d="m480 436 23-13 18 10-23 13Z" fill="#94e130" />
        <path
          d="m490 424v12m7-16v13m7-17v13"
          stroke="#94e130"
          strokeWidth="3"
        />
        <path
          d="m122 380 226 128q24 14 48 0l226-128"
          stroke="#94e130"
          strokeWidth="3"
          fill="none"
        />
      </g>
    </svg>
  );
}
