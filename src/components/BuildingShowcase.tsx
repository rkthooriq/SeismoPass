import { useEffect, useState } from 'react';
import BuildingScene from './BuildingScene';

const slides = [
  {
    label: 'Catat',
    title: 'Kenali bangunanmu.',
    description:
      'Mulai dari informasi yang kamu tahu. Lengkapi catatannya sedikit demi sedikit.',
    facts: [
      ['Contoh bangunan', 'Rumah Contoh A'],
      ['Status penilaian', 'Belum dinilai'],
    ],
  },
  {
    label: 'Pantau',
    title: 'Ikuti prosesnya.',
    description:
      'Laporan yang terkirim diperiksa admin. Pesurvei mencatat kunjungan sesuai penugasan.',
    facts: [
      ['Pelapor', 'Mengirim catatan'],
      ['Admin & pesurvei', 'Menangani laporan'],
    ],
  },
  {
    label: 'Tindak lanjut',
    title: 'Pahami langkah berikutnya.',
    description:
      'Baca catatan dan arah tindak lanjut. Evaluasi teknis serta rencana perkuatan memerlukan ahli.',
    facts: [
      ['RVS', 'Penyaringan awal'],
      ['Evaluasi teknis', 'Oleh ahli struktur'],
    ],
  },
];

export default function BuildingShowcase() {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [playing, setPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  const rotating = playing && !reducedMotion && !hovered && visible;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      setReducedMotion(query.matches);
      if (query.matches) setPlaying(false);
    };
    const updateVisibility = () => setVisible(!document.hidden);
    query.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      query.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      8000,
    );
    return () => window.clearInterval(timer);
  }, [rotating]);

  function selectSlide(next: number) {
    setPlaying(false);
    setIndex((next + slides.length) % slides.length);
  }

  return (
    <section
      className="sp-passport-preview sp-showcase"
      aria-label="Kenali alur SeismoPass"
      aria-roledescription="karusel"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={(event) => {
        if (!event.target.closest('[data-carousel-rotation]'))
          setPlaying(false);
      }}
    >
      <div className="sp-preview-heading">
        <span>Bangunan & catatannya</span>
        {!reducedMotion && (
          <button
            type="button"
            className="sp-rotation-control"
            data-carousel-rotation
            onClick={() => setPlaying((current) => !current)}
            aria-label={
              playing
                ? 'Jeda pergantian slide otomatis'
                : 'Putar slide otomatis'
            }
          >
            <span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span>
            {playing ? 'Jeda' : 'Putar otomatis'}
          </button>
        )}
      </div>
      <div className="sp-building-art">
        <BuildingScene />
      </div>
      <p className="sp-art-note">
        Ilustrasi konseptual bangunan dan lapisan tanah.
      </p>
      <div className="sp-passport-sheet sp-slide-sheet">
        <span className="sp-preview-tag">
          Contoh alur, bukan penilaian resmi
        </span>
        <div
          className="sp-slide-stack"
          aria-live={rotating ? 'off' : 'polite'}
          aria-atomic="true"
        >
          {slides.map((slide, slideIndex) => (
            <div
              key={slide.label}
              className={`sp-showcase-slide ${index === slideIndex ? 'is-active' : ''}`}
              aria-hidden={index !== slideIndex}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} dari ${slides.length}`}
            >
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
              <dl>
                {slide.facts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        <div className="sp-slide-footer">
          <span>
            Langkah {index + 1} dari {slides.length}
          </span>
          <div>
            <button
              type="button"
              aria-label="Slide sebelumnya"
              onClick={() => selectSlide(index - 1)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Slide berikutnya"
              onClick={() => selectSlide(index + 1)}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
