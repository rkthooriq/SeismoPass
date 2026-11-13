import { useEffect, useState } from 'react';
import {
  bmkgPageUrl,
  bmkgRefreshMs,
  loadBandungEarthquakes,
} from '../../lib/bmkg';
import type { BmkgEarthquake } from '../../lib/bmkg';
import EarthquakeLocationMap from './EarthquakeLocationMap';
import './latest-earthquake.css';

export default function LatestEarthquake() {
  const [earthquakes, setEarthquakes] = useState<BmkgEarthquake[] | null>(null);
  const [checkedAt, setCheckedAt] = useState<number | null>(null);
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const earthquake = earthquakes?.[0];

  useEffect(() => {
    let active = true;
    const load = async () => {
      setBusy(true);
      try {
        const result = await loadBandungEarthquakes();
        if (!active) return;
        setEarthquakes(result.earthquakes);
        setCheckedAt(result.checkedAt);
        setFailed(false);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setBusy(false);
      }
    };
    void load();
    const refresh = () => {
      if (document.visibilityState === 'visible') void load();
    };
    const interval = window.setInterval(refresh, bmkgRefreshMs);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [attempt]);

  return (
    <section className="eq-panel" aria-labelledby="earthquake-title">
      <header className="eq-heading">
        <div>
          <h2 id="earthquake-title">Gempa Bandung Raya</h2>
          <p>Laporan gempa dirasakan dari BMKG</p>
        </div>
        <svg
          className="eq-wave"
          viewBox="0 0 36 28"
          fill="none"
          aria-hidden="true"
        >
          <path d="M1 14h8l4-10 7 20 5-14 3 4h7" />
        </svg>
      </header>

      <div className="eq-status" role="status">
        {!earthquakes && !failed && (
          <p>Memuat laporan BMKG untuk Bandung Raya…</p>
        )}
        {failed && (
          <p>
            {earthquakes
              ? 'Pembaruan gagal. Menampilkan data terakhir yang berhasil dimuat.'
              : 'Data BMKG belum dapat dimuat. Coba lagi atau buka situs BMKG.'}
          </p>
        )}
      </div>

      {earthquake && (
        <div className="eq-event">
          <div className="eq-event-heading">
            <time dateTime={earthquake.dateTime}>
              {earthquake.date}, {earthquake.time}
            </time>
          </div>
          <h3 className="eq-location">{earthquake.region}</h3>
          <EarthquakeLocationMap
            coordinates={earthquake.coordinates}
            region={earthquake.region}
          />
          <dl className="eq-measurements">
            <div>
              <dt>Magnitudo</dt>
              <dd>{earthquake.magnitude.replace('.', ',')}</dd>
            </div>
            <div>
              <dt>Kedalaman</dt>
              <dd>{earthquake.depth}</dd>
            </div>
            <div className="eq-coordinates">
              <dt>Koordinat</dt>
              <dd>
                <span>{earthquake.latitude.replace('.', ',')}</span>
                <span>{earthquake.longitude.replace('.', ',')}</span>
              </dd>
            </div>
          </dl>
          {earthquakes && earthquakes.length > 1 && (
            <details className="eq-other-events">
              <summary>
                Laporan lain yang sesuai ({earthquakes.length - 1})
              </summary>
              <ul>
                {earthquakes.slice(1).map((event) => (
                  <li key={event.dateTime}>
                    <time dateTime={event.dateTime}>
                      {event.date}, {event.time}
                    </time>
                    <strong>
                      M{event.magnitude.replace('.', ',')} · {event.region}
                    </strong>
                    <p>{event.localFelt.join('; ')}</p>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {earthquakes?.length === 0 && (
        <div className="eq-empty">
          <h3>Belum ada laporan yang sesuai</h3>
          <p>
            Tidak ditemukan nama wilayah Bandung Raya pada 15 laporan gempa
            dirasakan terbaru BMKG. Ini tidak berarti tidak ada gempa di kawasan
            ini.
          </p>
        </div>
      )}

      <details className="eq-scope">
        <summary>Tentang cakupan data</summary>
        <p>
          Menampilkan kecocokan wilayah Bandung Raya dari 15 laporan terbaru
          BMKG. Bukan katalog seluruh gempa lokal.
        </p>
        <p>
          Pusat gempa dapat berada di luar Bandung Raya. Sesar penyebabnya
          memerlukan keterangan resmi BMKG.
        </p>
      </details>

      <footer className="eq-footer">
        <div className="eq-actions">
          <a href={bmkgPageUrl} target="_blank" rel="noreferrer">
            Selengkapnya di BMKG
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M8 4H4v12h12v-4M11 3h6v6M17 3l-8 8" />
            </svg>
          </a>
          {failed && (
            <button
              type="button"
              disabled={busy}
              onClick={() => setAttempt((value) => value + 1)}
            >
              {busy ? 'Memuat…' : 'Coba lagi'}
            </button>
          )}
        </div>
        <p className="eq-source">
          <span>
            Sumber:{' '}
            <a
              href="https://data.bmkg.go.id/gempabumi/"
              target="_blank"
              rel="noreferrer"
            >
              BMKG
            </a>
          </span>
          {checkedAt && (
            <span>
              Diperiksa{' '}
              {new Intl.DateTimeFormat('id-ID', {
                timeZone: 'Asia/Jakarta',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }).format(checkedAt)}{' '}
              WIB
            </span>
          )}
        </p>
        <p className="eq-note">
          RVS adalah penyaringan awal, bukan sertifikat aman.
        </p>
      </footer>
    </section>
  );
}
