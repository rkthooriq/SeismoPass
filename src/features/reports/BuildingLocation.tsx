import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { validPoint } from '../../lib/ownerProgress';
import type { BuildingPoint } from '../../lib/ownerProgress';

export default function BuildingLocation({
  value,
  onChange,
}: {
  value?: BuildingPoint;
  onChange: (point?: BuildingPoint) => void;
}) {
  const canvas = useRef<HTMLDivElement>(null);
  const callback = useRef(onChange);
  const pointRef = useRef(value);
  const drawRef = useRef<((point?: BuildingPoint) => void) | null>(null);
  const [error, setError] = useState('');
  const [coordinates, setCoordinates] = useState({
    lat: value ? String(value.latitude) : '',
    lng: value ? String(value.longitude) : '',
  });
  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);
  useEffect(() => {
    pointRef.current = value;
    drawRef.current?.(value);
  }, [value]);
  useEffect(() => {
    const target = canvas.current;
    if (!target) return;
    let cancelled = false;
    let map: LeafletMap | undefined;
    import('leaflet')
      .then(({ default: L }) => {
        if (cancelled) return;
        map = L.map(target, {
          scrollWheelZoom: false,
          zoomAnimation: false,
          fadeAnimation: false,
          markerZoomAnimation: false,
        });
        map.setView([-6.87, 107.6], 11);
        let marker: import('leaflet').Marker | undefined;
        drawRef.current = (point) => {
          marker?.remove();
          if (!point || !map) return;
          marker = L.marker([point.latitude, point.longitude], {
            icon: L.divIcon({
              className: 'owner-map-pin',
              html: '<span></span>',
              iconSize: [24, 30],
              iconAnchor: [12, 30],
            }),
          }).addTo(map);
          map.setView(
            [point.latitude, point.longitude],
            Math.max(map.getZoom(), 14),
            { animate: false },
          );
        };
        drawRef.current(pointRef.current);
        const tiles = L.tileLayer(
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            maxZoom: 18,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        ).addTo(map);
        tiles.on('tileerror', () => {
          if (!cancelled)
            setError(
              'Peta belum dapat dimuat. Kamu tetap bisa mengisi koordinat di bawah.',
            );
        });
        map.on('click', (event: { latlng: { lat: number; lng: number } }) => {
          const point = {
            latitude: Number(event.latlng.lat.toFixed(6)),
            longitude: Number(event.latlng.lng.toFixed(6)),
          };
          if (validPoint(point)) {
            callback.current(point);
            setCoordinates({
              lat: String(point.latitude),
              lng: String(point.longitude),
            });
            setError('');
          }
        });
      })
      .catch(() => {
        if (!cancelled)
          setError(
            'Peta belum tersedia. Isi koordinat secara manual jika diketahui.',
          );
      });
    return () => {
      cancelled = true;
      drawRef.current = null;
      map?.remove();
    };
  }, []);
  function applyCoordinates() {
    const point = {
      latitude: Number(coordinates.lat),
      longitude: Number(coordinates.lng),
    };
    if (
      !coordinates.lat.trim() ||
      !coordinates.lng.trim() ||
      !validPoint(point)
    ) {
      setError('Isi lintang −85 sampai 85 dan bujur −180 sampai 180.');
      return;
    }
    onChange(point);
    setError('');
  }
  return (
    <section className="owner-location">
      <div className="owner-section-title">
        <div>
          <h3>Tandai lokasi bangunan</h3>
          <p>Klik peta untuk meletakkan pin, atau masukkan koordinat.</p>
        </div>
        <span className="owner-chip">
          {value ? 'Titik dicatat' : 'Opsional'}
        </span>
      </div>
      <div
        className="owner-map"
        ref={canvas}
        role="region"
        aria-label="Peta pemilihan lokasi bangunan"
      />
      <div className="owner-coordinate-fields">
        <label>
          Lintang
          <input
            aria-label="Lintang bangunan"
            inputMode="decimal"
            placeholder="Contoh: -6.87"
            value={coordinates.lat}
            onChange={(event) =>
              setCoordinates({ ...coordinates, lat: event.target.value })
            }
          />
        </label>
        <label>
          Bujur
          <input
            aria-label="Bujur bangunan"
            inputMode="decimal"
            placeholder="Contoh: 107.60"
            value={coordinates.lng}
            onChange={(event) =>
              setCoordinates({ ...coordinates, lng: event.target.value })
            }
          />
        </label>
        <button
          type="button"
          className="ws-secondary"
          onClick={applyCoordinates}
        >
          Terapkan titik
        </button>
        {value && (
          <button
            type="button"
            className="owner-text-button"
            onClick={() => {
              onChange(undefined);
              setCoordinates({ lat: '', lng: '' });
            }}
          >
            Hapus titik
          </button>
        )}
      </div>
      {error && (
        <p role="status" className="owner-inline-message">
          {error}
        </p>
      )}
      <p className="owner-footnote">
        Peta awal menunjukkan area Bandung Raya, bukan lokasi bangunanmu. Titik
        baru dicatat setelah kamu memilihnya. Lokasi presisi tidak ditampilkan
        pada QR atau peta publik.
      </p>
    </section>
  );
}
