import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BuildingPoint } from '../../lib/ownerProgress';

// Read-only map for the report preview: the same pin the owner placed in the
// form, without click-to-move. Zoom buttons stay so the surroundings can be
// checked; page scrolling is not captured.
export default function PointPreviewMap({ point }: { point: BuildingPoint }) {
  const canvas = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const { latitude, longitude } = point;

  useEffect(() => {
    const target = canvas.current;
    if (!target) return;
    let cancelled = false;
    let map: LeafletMap | undefined;
    const resize = new ResizeObserver(() => {
      if (target.clientWidth && target.clientHeight)
        map?.invalidateSize({ animate: false });
    });
    resize.observe(target);
    import('leaflet')
      .then(({ default: L }) => {
        if (cancelled) return;
        map = L.map(target, {
          scrollWheelZoom: false,
          dragging: !L.Browser.mobile,
          zoomAnimation: false,
          fadeAnimation: false,
        }).setView([latitude, longitude], 16);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
        }).addTo(map);
        L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: 'owner-map-pin',
            html: '<span></span>',
            iconSize: [24, 30],
            iconAnchor: [12, 30],
          }),
          keyboard: false,
          interactive: false,
        }).addTo(map);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      resize.disconnect();
      map?.remove();
    };
  }, [latitude, longitude]);

  if (failed) return null;
  return (
    <div
      ref={canvas}
      className="owner-preview-map"
      role="img"
      aria-label={`Peta titik bangunan di ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
    />
  );
}
