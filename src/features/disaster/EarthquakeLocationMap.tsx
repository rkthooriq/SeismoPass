import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { earthquakeMapView } from '../../lib/bmkg';
import type { BmkgCoordinates } from '../../lib/bmkg';
import './earthquake-map.css';

// Epicenter map drawn with Leaflet over OpenStreetMap tiles, so the zoom
// buttons can follow the site's glass style (an OSM iframe cannot be styled).
// The marker is BMKG's coordinate; the view size is not an impact radius.
export default function EarthquakeLocationMap({
  coordinates,
  region,
}: {
  coordinates: BmkgCoordinates | null;
  region: string;
}) {
  const view = earthquakeMapView(coordinates);
  const canvas = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const latitude = view?.center[0];
  const longitude = view?.center[1];

  useEffect(() => {
    const target = canvas.current;
    const current =
      latitude === undefined || longitude === undefined
        ? null
        : earthquakeMapView({ latitude, longitude });
    if (!target || !current) return;
    let map: LeafletMap | undefined;
    let cancelled = false;
    // Loaded on demand so Leaflet stays out of the first page bundle.
    import('leaflet')
      .then(({ default: L }) => {
        if (cancelled) return;
        map = L.map(target, {
          zoomControl: false,
          // Page scrolling keeps working over the map; zoom with the buttons,
          // a double click, or a pinch.
          scrollWheelZoom: false,
          dragging: !L.Browser.mobile,
        });
        L.control
          .zoom({
            position: 'topright',
            zoomInTitle: 'Perbesar',
            zoomOutTitle: 'Perkecil',
          })
          .addTo(map);
        map.attributionControl.setPrefix(
          '<a href="https://leafletjs.com" target="_blank" rel="noreferrer">Leaflet</a>',
        );
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
        }).addTo(map);
        L.marker(current.center, {
          icon: L.divIcon({
            className: 'eq-map-pin',
            html: '<span></span>',
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          }),
          keyboard: false,
          interactive: false,
        }).addTo(map);
        map.fitBounds(current.bounds);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [latitude, longitude]);

  if (!view || failed)
    return (
      <div className="eq-map-unavailable">
        <strong>Peta lokasi belum tersedia</strong>
        <p>
          {view
            ? 'Peta tidak dapat dimuat. Buka lokasinya lewat tautan di bawah.'
            : 'Koordinat untuk peta tidak tersedia pada laporan ini.'}
        </p>
        {view && (
          <a href={view.full} target="_blank" rel="noreferrer">
            Buka di OpenStreetMap
          </a>
        )}
      </div>
    );

  return (
    <figure className="eq-map">
      <div
        ref={canvas}
        className="eq-map-canvas"
        role="region"
        aria-label={`Peta lokasi pusat gempa: ${region}`}
      />
      <figcaption>
        <span>Lokasi pusat gempa</span>
        <a href={view.full} target="_blank" rel="noreferrer">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="5" />
            <path d="M8 5v6M5 8h6m6 6-5-5" />
          </svg>
          Perbesar peta
        </a>
      </figcaption>
    </figure>
  );
}
