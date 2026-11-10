export default function BuildingScene() {
  return (
    <svg className="building-scene" viewBox="0 0 740 540" role="img" aria-labelledby="scene-title scene-desc">
      <title id="scene-title">Ilustrasi lingkungan bangunan SeismoPass</title>
      <desc id="scene-desc">Rumah berwarna terakota, bangunan bertingkat hijau, dan pepohonan pada sebuah pulau kecil. Ilustrasi dekoratif, bukan hasil pemeriksaan bangunan.</desc>
      <defs>
        <linearGradient id="island-top" x2="1" y2="1"><stop stopColor="#e2ebcb"/><stop offset="1" stopColor="#b5c99c"/></linearGradient>
        <linearGradient id="house-front" x2="0" y2="1"><stop stopColor="#f9dec0"/><stop offset="1" stopColor="#efba92"/></linearGradient>
        <linearGradient id="roof-top" x2="1" y2="1"><stop stopColor="#eea074"/><stop offset="1" stopColor="#cd704e"/></linearGradient>
        <linearGradient id="tower-front" x2="1" y2="1"><stop stopColor="#a7c3a9"/><stop offset="1" stopColor="#779e84"/></linearGradient>
        <radialGradient id="tree-top"><stop stopColor="#b0c594"/><stop offset="1" stopColor="#6d946f"/></radialGradient>
        <filter id="shadow" x="-40%" y="-40%" width="180%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
      </defs>
      <ellipse cx="375" cy="456" rx="220" ry="38" fill="#657653" opacity=".17" filter="url(#shadow)"/>
      <g className="scene-island">
        <path d="M106 352 348 215Q371 202 395 215L639 353V379Q639 392 624 401L396 530Q372 543 348 530L119 401Q106 393 106 379Z" fill="#94a683"/>
        <path d="M119 338 348 208Q371 195 395 208L624 338Q651 353 624 369L395 500Q371 514 348 500L119 369Q92 354 119 338" fill="url(#island-top)"/>
        <path d="m148 365 208-119 235 134M280 456l214-124" stroke="#edf0da" strokeWidth="24" strokeLinejoin="round" fill="none"/>
        <path d="m148 365 208-119 235 134M280 456l214-124" stroke="#c0c8ad" strokeWidth="1.5" strokeDasharray="7 7" fill="none"/>
        <ellipse cx="457" cy="340" rx="75" ry="20" fill="#456e55" opacity=".15"/>
        <path d="m382 306 79 45 78-45V163l-78-45-79 45Z" fill="url(#tower-front)"/>
        <path d="m461 208 78-45v143l-78 45Z" fill="#60886f"/>
        <path d="m382 163 79-45 78 45-78 45Z" fill="#d8e3ce"/>
        <path d="m399 163 62-35 61 35-61 35Z" fill="#b4cbb4"/>
        {[0, 1, 2].map((row) => (
          <g key={row} transform={`translate(0 ${row * 36})`} fill="#e3edce">
            <path d="m399 190 16 9v21l-16-9Z"/><path d="m429 207 16 9v21l-16-9Z"/>
            <path d="m478 216 16-9v21l-16 9Z" fill="#a9c5ad"/><path d="m509 199 16-9v21l-16 9Z" fill="#a9c5ad"/>
          </g>
        ))}
        <ellipse cx="289" cy="378" rx="98" ry="27" fill="#795d40" opacity=".13"/>
        <path d="m202 288 91-53 91 53v91l-91 53-91-53Z" fill="url(#house-front)"/>
        <path d="m293 341 91-53v91l-91 53Z" fill="#d99d78"/>
        <path d="m192 289 101-59 101 59-101 59Z" fill="#bb654b"/>
        <path d="m192 289 51-97 101-58-51 96Z" fill="#f4b58a"/>
        <path d="m243 192 50 97 101-58-50-97Z" fill="url(#roof-top)"/>
        <path d="m243 192 50 97-101-58Z" fill="#f8d8b9" transform="translate(0 58)"/>
        <path d="m229 328 26 15v35l-26-15Z" fill="#54766a"/>
        <path d="m242 336v34m-13-24 26 15" stroke="#efcfad" strokeWidth="3"/>
        <path d="m310 361 25-14v61l-25 15Z" fill="#6d7762"/>
        <path d="m348 341 21-12v29l-21 12Z" fill="#597b70"/>
        <path d="m290 408 22 12 29-17-22-12Z" fill="#d9d6ba"/>
        <path d="m302 422 22 12 29-17-22-12Z" fill="#ede8cd"/>
        <g><path d="m555 346v53" stroke="#8e8360" strokeWidth="9"/><ellipse cx="555" cy="338" rx="35" ry="43" fill="url(#tree-top)"/><ellipse cx="545" cy="322" rx="19" ry="24" fill="#aac18c" opacity=".6"/></g>
        <g><path d="m176 306v45" stroke="#8e8360" strokeWidth="7"/><ellipse cx="176" cy="297" rx="27" ry="34" fill="url(#tree-top)"/></g>
        <g><path d="m405 420v44" stroke="#8e8360" strokeWidth="7"/><ellipse cx="405" cy="411" rx="27" ry="34" fill="url(#tree-top)"/></g>
        <path d="m480 436 23-13 18 10-23 13Z" fill="#88a275"/>
        <path d="m490 424v12m7-16v13m7-17v13" stroke="#6c895d" strokeWidth="3"/>
      </g>
    </svg>
  );
}
