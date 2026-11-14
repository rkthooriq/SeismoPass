import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  cianjurDamage,
  cianjurImpact,
  cianjurSources,
  constructionQuality,
  westJavaExposure,
  exposureSources,
  lembangEvents,
  lembangFacts,
  lembangSources,
  qualitySources,
  recoveryAid,
  recoverySources,
} from '../../lib/disasterData';
import type { SeismicEvent, Source } from '../../lib/disasterData';
import { LiquidNavbar } from '../../components/ui/liquid-glass-navbar';
import './disaster.css';

const months = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}
const whole = (value: number) => value.toLocaleString('id-ID');
const decimal = (value: number) =>
  value.toLocaleString('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

function Sources({ items }: { items: Source[] }) {
  return (
    <p className="dz-source">
      Sumber:{' '}
      {items.map((item, index) => (
        <span key={item.label}>
          {item.url ? (
            <a href={item.url} target="_blank" rel="noreferrer">
              {item.label}
            </a>
          ) : (
            item.label
          )}
          {index < items.length - 1 ? '; ' : ''}
        </span>
      ))}
    </p>
  );
}

function DataTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <details className="dz-table">
      <summary>Lihat tabel data</summary>
      <div className="dz-table-scroll">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              {head.map((cell) => (
                <th key={cell} scope="col">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <th key={cellIndex} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={cellIndex}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function SeismicStrip({ events }: { events: SeismicEvent[] }) {
  const largest = events.reduce((top, event) =>
    event.magnitude > top.magnitude ? event : top,
  );
  const [active, setActive] = useState<SeismicEvent | null>(null);
  const shown = active ?? largest;
  const years = [...new Set(events.map((event) => event.date.slice(0, 4)))];
  const scale = 4;

  return (
    <figure className="dz-figure">
      <figcaption className="dz-figure-title">
        Gempa tercatat di sekitar Sesar Lembang, 2010–2025
      </figcaption>
      <p className="dz-readout" aria-live="polite">
        <strong>M{decimal(shown.magnitude)}</strong>{' '}
        {active ? 'pada' : 'terbesar, pada'} {formatDate(shown.date)}
      </p>
      <div className="dz-strip">
        <div className="dz-strip-axis" aria-hidden="true">
          {[3, 2, 1].map((tick) => (
            <span key={tick} style={{ bottom: `${(tick / scale) * 100}%` }}>
              M{tick}
            </span>
          ))}
        </div>
        <div className="dz-strip-plot" onMouseLeave={() => setActive(null)}>
          {[1, 2, 3].map((tick) => (
            <span
              key={tick}
              className="dz-gridline"
              style={{ bottom: `${(tick / scale) * 100}%` }}
              aria-hidden="true"
            />
          ))}
          {years.map((year) => {
            const yearEvents = events.filter((event) =>
              event.date.startsWith(year),
            );
            return (
              <div
                key={year}
                className="dz-year"
                style={{ flexGrow: yearEvents.length + 1 }}
              >
                <ol aria-label={`Gempa tahun ${year}`}>
                  {yearEvents.map((event, index) => (
                    <li
                      key={`${event.date}-${index}`}
                      tabIndex={0}
                      aria-label={`${formatDate(event.date)}, magnitudo ${decimal(event.magnitude)}`}
                      className={event === shown ? 'is-active' : undefined}
                      style={{ height: `${(event.magnitude / scale) * 100}%` }}
                      onMouseEnter={() => setActive(event)}
                      onFocus={() => setActive(event)}
                      onBlur={() => setActive(null)}
                    >
                      <span className="dz-stem" aria-hidden="true" />
                      <span className="dz-dot" aria-hidden="true" />
                    </li>
                  ))}
                </ol>
                <span className="dz-year-label">{year}</span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="dz-note">
        Urutan waktu. Jarak antartahun tidak berskala; tahun tanpa catatan pada
        peta tidak ditampilkan.
      </p>
    </figure>
  );
}

function BarList({
  title,
  rows,
  unit,
  format,
}: {
  title: string;
  rows: { label: string; value: number; tone: number }[];
  unit: string;
  format: (value: number) => string;
}) {
  const max = Math.max(...rows.map((row) => row.value));
  return (
    <figure className="dz-figure">
      <figcaption className="dz-figure-title">{title}</figcaption>
      <ul className="dz-bars">
        {rows.map((row) => (
          <li key={row.label}>
            <span className="dz-bar-label">{row.label}</span>
            <span className="dz-bar-track">
              <span
                className={`dz-bar dz-tone-${row.tone}`}
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            </span>
            <span className="dz-bar-value">
              {format(row.value)} <small>{unit}</small>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function StackedBars() {
  const legend = [
    { label: 'Memenuhi standar minimum', tone: 3 },
    { label: 'Sebagian aman', tone: 2 },
    { label: 'Tidak aman', tone: 1 },
    { label: 'Tidak memenuhi (tanpa rincian)', tone: 0 },
  ];
  return (
    <figure className="dz-figure">
      <figcaption className="dz-figure-title">
        Kualitas konstruksi sampel rumah program pemerintah, persen
      </figcaption>
      <ul className="dz-stacks">
        {constructionQuality.map((row) => (
          <li key={row.label}>
            <span className="dz-bar-label">{row.label}</span>
            <span className="dz-stack">
              {row.segments.map((segment) => (
                <span
                  key={segment.label}
                  className={`dz-segment dz-tone-${segment.tone}`}
                  style={{ flexBasis: `${segment.value}%` }}
                  title={`${segment.label}: ${segment.value}%`}
                >
                  {segment.value}%
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <ul className="dz-legend">
        {legend.map((item) => (
          <li key={item.label}>
            <span className={`dz-swatch dz-tone-${item.tone}`} />
            {item.label}
          </li>
        ))}
      </ul>
    </figure>
  );
}

function GroupedBars() {
  const max = 70;
  return (
    <figure className="dz-figure">
      <figcaption className="dz-figure-title">
        Bantuan stimulan perbaikan rumah pascabencana, Rp juta per rumah
      </figcaption>
      <div className="dz-columns">
        {recoveryAid.map((group) => (
          <div key={group.label} className="dz-column-group">
            <div className="dz-column-pair">
              {[
                { key: 'current', value: group.current, tone: 1 },
                { key: 'proposed', value: group.proposed, tone: 3 },
              ].map((bar) => (
                <span
                  key={bar.key}
                  className={`dz-column dz-tone-${bar.tone}`}
                  style={{ height: `${(bar.value / max) * 100}%` }}
                >
                  <span className="dz-column-value">{bar.value}</span>
                </span>
              ))}
            </div>
            <span className="dz-column-label">{group.label}</span>
          </div>
        ))}
      </div>
      <ul className="dz-legend">
        <li>
          <span className="dz-swatch dz-tone-1" />
          Berlaku sejak 2010
        </li>
        <li>
          <span className="dz-swatch dz-tone-3" />
          Usulan kenaikan 2023
        </li>
      </ul>
    </figure>
  );
}

function Panel({
  summary,
  chart,
  table,
  sources,
}: {
  summary: ReactNode;
  chart: ReactNode;
  table: ReactNode;
  sources: Source[];
}) {
  return (
    <div className="dz-panel-body">
      <div className="dz-summary">{summary}</div>
      <div className="dz-chart">
        {chart}
        {table}
        <Sources items={sources} />
      </div>
    </div>
  );
}

function ExposureLadder() {
  return (
    <figure className="dz-figure">
      <figcaption className="dz-figure-title">
        Paparan risiko, dari provinsi ke jalur sesar
      </figcaption>
      <ol className="dz-ladder">
        {westJavaExposure.map((row) => (
          <li key={row.label}>
            <div>
              <strong>{row.label}</strong>
              <p>{row.detail}</p>
            </div>
            <span>
              {row.value}
              <small>{row.source}</small>
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

const tabs = [
  {
    id: 'kejadian',
    label: 'Sesar Lembang',
    content: (
      <Panel
        summary={
          <>
            <h3>Sesar Lembang di utara Bandung</h3>
            <p>
              Catatan historis BMKG dan kajian Sesar Lembang menjadi konteks
              kesiapsiagaan bangunan di Bandung Raya.
            </p>
            <dl className="dz-facts">
              {lembangFacts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </>
        }
        chart={<SeismicStrip events={lembangEvents} />}
        table={
          <DataTable
            caption="Gempa di sekitar Sesar Lembang, 2010–2025"
            head={['Tanggal', 'Magnitudo']}
            rows={lembangEvents.map((event) => [
              formatDate(event.date),
              `M${decimal(event.magnitude)}`,
            ])}
          />
        }
        sources={lembangSources}
      />
    ),
  },
  {
    id: 'dampak',
    label: 'Dampak gempa',
    content: (
      <Panel
        summary={
          <>
            <h3>Cianjur, 21 November 2022.</h3>
            <p>
              Gempa M5,6, lebih kecil dari skenario Sesar Lembang, tetap merusak
              puluhan ribu rumah. Data BNPB per 24 November 2022.
            </p>
            <dl className="dz-facts">
              {cianjurImpact.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{whole(fact.value)}</dd>
                </div>
              ))}
            </dl>
          </>
        }
        chart={
          <BarList
            title="Rumah rusak menurut tingkat kerusakan"
            rows={cianjurDamage}
            unit="rumah"
            format={whole}
          />
        }
        table={
          <DataTable
            caption="Rumah rusak akibat gempa Cianjur 2022"
            head={['Tingkat kerusakan', 'Jumlah rumah']}
            rows={cianjurDamage.map((row) => [row.label, whole(row.value)])}
          />
        }
        sources={cianjurSources}
      />
    ),
  },
  {
    id: 'paparan',
    label: 'Paparan Jawa Barat',
    content: (
      <Panel
        summary={
          <>
            <h3>Dari Jawa Barat ke desa pilot.</h3>
            <p>
              Jawa Barat memiliki penduduk terpapar risiko gempa terbanyak di
              Pulau Jawa. Di Bandung Raya, skenario Sesar Lembang memaparkan
              jutaan orang pada guncangan kuat.
            </p>
          </>
        }
        chart={<ExposureLadder />}
        table={
          <DataTable
            caption="Paparan risiko gempa di Jawa Barat"
            head={['Wilayah', 'Nilai', 'Keterangan', 'Sumber']}
            rows={westJavaExposure.map((row) => [
              row.label,
              row.value,
              row.detail,
              row.source,
            ])}
          />
        }
        sources={exposureSources}
      />
    ),
  },
  {
    id: 'mutu',
    label: 'Mutu bangunan',
    content: (
      <Panel
        summary={
          <>
            <h3>Bahaya tidak sama dengan kerentanan.</h3>
            <p>
              Peta bahaya tidak menggambarkan kondisi tiap bangunan. Pada sampel
              rumah swadaya penerima BSPS, hanya 11% yang memenuhi standar
              konstruksi minimum.
            </p>
          </>
        }
        chart={<StackedBars />}
        table={
          <DataTable
            caption="Kualitas konstruksi sampel rumah, persen"
            head={['Program', 'Kategori', 'Persen']}
            rows={constructionQuality.flatMap((row) =>
              row.segments.map((segment) => [
                row.label,
                segment.label,
                `${segment.value}%`,
              ]),
            )}
          />
        }
        sources={qualitySources}
      />
    ),
  },
  {
    id: 'pemulihan',
    label: 'Biaya pemulihan',
    content: (
      <Panel
        summary={
          <>
            <h3>Pemulihan dibiayai setelah kejadian.</h3>
            <p>
              Bantuan stimulan diberikan setelah rumah rusak. SeismoPass
              mendorong pemeriksaan lebih awal, tanpa menjanjikan bantuan atau
              insentif yang belum disepakati.
            </p>
          </>
        }
        chart={<GroupedBars />}
        table={
          <DataTable
            caption="Bantuan stimulan perbaikan rumah, Rp juta per rumah"
            head={['Tingkat kerusakan', 'Berlaku sejak 2010', 'Usulan 2023']}
            rows={recoveryAid.map((row) => [
              row.label,
              row.current,
              row.proposed,
            ])}
          />
        }
        sources={recoverySources}
      />
    ),
  },
];

const largest = lembangEvents.reduce((top, event) =>
  event.magnitude > top.magnitude ? event : top,
);
const eventYears = [
  ...new Set(lembangEvents.map((event) => event.date.slice(0, 4))),
].sort((a, b) => Number(b) - Number(a));
const busiestYear = eventYears
  .map((year) => ({
    year,
    count: lembangEvents.filter((event) => event.date.startsWith(year)).length,
  }))
  .sort((a, b) => b.count - a.count)[0];

// Quiet soil-and-cloud landscape along the bottom of an open statistic card,
// drawn in the card's own dark-earth tones so the numbers stay readable.
// The stepped ridge echoes the Lembang fault scarp. Decorative only.
function CardTerrain() {
  return (
    <>
      {/* Sky band beside the headline number, where the card is emptiest. */}
      <svg
        className="dz-terrain dz-terrain-sky"
        viewBox="0 0 600 80"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <g className="dz-terrain-cloud dz-terrain-cloud-a">
          <g transform="translate(0 34)">
            <ellipse cx="0" cy="0" rx="46" ry="10" />
            <ellipse cx="-14" cy="-7" rx="22" ry="9" />
            <ellipse cx="14" cy="-9" rx="26" ry="11" />
          </g>
        </g>
        <g className="dz-terrain-cloud dz-terrain-cloud-b">
          <g transform="translate(0 58) scale(0.7)">
            <ellipse cx="0" cy="0" rx="46" ry="10" />
            <ellipse cx="-14" cy="-7" rx="22" ry="9" />
            <ellipse cx="14" cy="-9" rx="26" ry="11" />
          </g>
        </g>
      </svg>
      <svg
        className="dz-terrain dz-terrain-ground"
        viewBox="0 0 600 120"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        focusable="false"
      >
        <g transform="translate(0 -30)">
          <path
            className="dz-terrain-ridge"
            d="M0 104 C 70 96 150 88 236 92 L 286 91 L 296 78 C 380 68 470 72 600 80 V150 H0 Z"
          />
          <g className="dz-terrain-soil">
            <path
              className="dz-terrain-band-a"
              d="M-30 116 C 90 106 200 122 320 113 C 440 104 520 119 630 110 V160 H-30 Z"
            />
            <path
              className="dz-terrain-strata dz-terrain-strata-a"
              d="M-30 126 C 100 117 210 132 330 124 C 450 116 530 130 630 122"
            />
            <path
              className="dz-terrain-band-b"
              d="M-30 136 C 130 129 290 143 450 135 C 530 131 580 135 630 133 V160 H-30 Z"
            />
            <path
              className="dz-terrain-strata dz-terrain-strata-b"
              d="M-30 144 C 150 138 320 150 480 143 C 550 140 600 143 630 142"
            />
          </g>
        </g>
      </svg>
    </>
  );
}

function StatCard({
  title,
  source,
  lead,
  defaultOpen = false,
  children,
  more,
}: {
  title: string;
  source: string;
  /** One-line headline shown even when the card is folded. */
  lead: string;
  defaultOpen?: boolean;
  children: ReactNode;
  more?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section
      className={`dz-stat-card${open ? ' is-open' : ''}`}
      aria-labelledby={`${id}-title`}
    >
      {open && <CardTerrain />}
      <div className="dz-stat-header">
        <div className="dz-stat-head">
          <h3 id={`${id}-title`}>{title}</h3>
          <span>{source}</span>
        </div>
        {!open && <span className="dz-stat-lead">{lead}</span>}
        <button
          type="button"
          className="dz-stat-toggle"
          aria-expanded={open}
          aria-controls={`${id}-body`}
          aria-label={`${open ? 'Ringkas' : 'Buka'} ${title}`}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? 'Ringkas' : 'Buka'}
        </button>
      </div>
      <div className="dz-stat-body" id={`${id}-body`} hidden={!open}>
        {children}
        {more && (
          <button type="button" className="dz-more" onClick={more}>
            Selengkapnya <span aria-hidden="true">›</span>
          </button>
        )}
      </div>
    </section>
  );
}

function Statistics({ go }: { go: (id: string) => void }) {
  return (
    <div className="dz-stats">
      <StatCard
        title="Gempa Cianjur 2022"
        source="BNPB, per 24 Nov 2022"
        lead="56.311 rumah rusak, 272 korban meninggal dunia"
        defaultOpen
        more={() => go('dampak')}
      >
        <div className="dz-cianjur">
          <p className="dz-big">
            <small>Rumah rusak</small>
            {whole(56311)}
          </p>
          <div
            className="dz-damage-bar"
            role="img"
            aria-label={`Komposisi rumah rusak: ${cianjurDamage
              .map((row) => `${whole(row.value)} ${row.label.toLowerCase()}`)
              .join(', ')}`}
          >
            {cianjurDamage.map((row) => (
              <span
                key={row.label}
                className={`dz-damage-${row.tone}`}
                style={{ flexGrow: row.value }}
              />
            ))}
          </div>
          <ul className="dz-damage-legend">
            {cianjurDamage.map((row) => (
              <li key={row.label}>
                <span
                  className={`dz-damage-swatch dz-damage-${row.tone}`}
                  aria-hidden="true"
                />
                <strong>{whole(row.value)}</strong>
                <span className="dz-damage-label">{row.label}</span>
              </li>
            ))}
          </ul>
          <ul className="dz-human-impact">
            {cianjurImpact
              .filter((fact) => fact.label !== 'rumah rusak')
              .map((fact) => (
                <li key={fact.label}>
                  <strong>{whole(fact.value)}</strong>
                  {fact.label}
                </li>
              ))}
          </ul>
        </div>
      </StatCard>

      <StatCard
        title="Gempa tercatat di Sesar Lembang"
        source="BMKG, 2010–2025"
        lead={`${lembangEvents.length} kejadian, terbesar M${decimal(largest.magnitude)}`}
        more={() => go('terkini')}
      >
        <div className="dz-tiles">
          <p>
            <small>Kejadian tercatat</small>
            {lembangEvents.length}
          </p>
          <p>
            <small>Terbesar</small>M{decimal(largest.magnitude)}
          </p>
          <p>
            <small>Terbanyak, {busiestYear.year}</small>
            {busiestYear.count}
          </p>
        </div>
        <ul className="dz-stat-list dz-stat-list-wide">
          {lembangFacts.map((fact) => (
            <li key={fact.label}>
              <strong>{fact.value}</strong> {fact.label}
            </li>
          ))}
        </ul>
      </StatCard>

      <StatCard
        title="Paparan risiko di Jawa Barat"
        lead="47,5 juta jiwa terpapar di Jawa Barat"
        source="BNPB, BPS, studi Sesar Lembang"
        more={() => go('paparan')}
      >
        <div className="dz-accordion">
          {westJavaExposure.map((row, index) => (
            <details key={row.label} open={index === 0}>
              <summary>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </summary>
              <p>
                {row.detail} Sumber: {row.source}.
              </p>
            </details>
          ))}
        </div>
      </StatCard>

      <StatCard
        title="Mutu konstruksi rumah"
        lead="Hanya 11–16% sampel rumah memenuhi standar minimum"
        source="World Bank, 2025"
        more={() => go('mutu')}
      >
        <div className="dz-tiles">
          {constructionQuality.map((row) => (
            <p key={row.label}>
              <small>{row.label}</small>
              {row.segments[0].value}%
            </p>
          ))}
        </div>
        <p className="dz-stat-note">
          Sampel rumah yang memenuhi standar konstruksi minimum.
        </p>
      </StatCard>
    </div>
  );
}

function Latest() {
  const [year, setYear] = useState('all');
  const [minimum, setMinimum] = useState(0);
  const rows = lembangEvents
    .map((event, index) => ({ ...event, number: index + 1 }))
    .filter(
      (event) =>
        (year === 'all' || event.date.startsWith(year)) &&
        event.magnitude >= minimum,
    )
    .reverse();
  return (
    <div className="dz-latest">
      <div className="dz-filters">
        <label>
          <span className="dz-visually-hidden">Tahun</span>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="all">Semua tahun</option>
            {eventYears.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="dz-visually-hidden">Magnitudo</span>
          <select
            value={minimum}
            onChange={(e) => setMinimum(Number(e.target.value))}
          >
            <option value={0}>Semua magnitudo</option>
            <option value={2}>M2 ke atas</option>
            <option value={3}>M3 ke atas</option>
          </select>
        </label>
        <span className="dz-count" aria-live="polite">
          {rows.length} kejadian
        </span>
      </div>
      {rows.length ? (
        <ol className="dz-events">
          {rows.map((event) => (
            <li key={`${event.date}-${event.number}`}>
              <span className="dz-mag" aria-hidden="true">
                {decimal(event.magnitude)}
              </span>
              <div>
                <h4>
                  {event.number}. Gempa M{decimal(event.magnitude)}
                </h4>
                <p className="dz-place">Sekitar Sesar Lembang, Jawa Barat</p>
              </div>
              <dl>
                <div>
                  <dt>Tanggal kejadian</dt>
                  <dd>{formatDate(event.date)}</dd>
                </div>
                <div>
                  <dt>Sumber</dt>
                  <dd>BMKG (2025)</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      ) : (
        <p className="dz-empty">
          Tidak ada kejadian untuk filter ini. Pilih tahun atau magnitudo lain.
        </p>
      )}
      <p className="dz-note">
        Disalin dari label peta seismisitas BMKG. Lokasi persis tiap kejadian
        tidak dicantumkan.
      </p>
    </div>
  );
}

export default function DisasterBoard() {
  const allTabs: { id: string; label: string; content: ReactNode }[] = [
    { id: 'statistik', label: 'Statistik', content: null },
    ...tabs.filter((tab) => tab.id === 'kejadian'),
    { id: 'terkini', label: 'Riwayat', content: <Latest /> },
    ...tabs.filter((tab) => tab.id !== 'kejadian'),
  ];
  // ?data=<id> membuka tab tertentu, mirip ?type= pada SITABA.
  const [active, setActive] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('data');
    return allTabs.find((tab) => tab.id === requested)?.id ?? 'statistik';
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ left: 0, max: 0 });
  // Scroll most of a viewport per click so the next hidden tabs come in.
  const scrollTabs = (direction: -1 | 1) => {
    const row = scrollRef.current;
    if (!row) return;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    row.scrollBy({
      left: direction * row.clientWidth * 0.7,
      behavior: reduce ? 'auto' : 'smooth',
    });
  };
  useEffect(() => {
    const row = scrollRef.current;
    if (!row) return;
    let frame = 0;
    const sync = () => {
      frame = 0;
      const max = Math.max(0, row.scrollWidth - row.clientWidth);
      const next = {
        left: Math.max(0, Math.min(max, row.scrollLeft)),
        max,
      };
      setScrollState((previous) =>
        previous.left === next.left && previous.max === next.max
          ? previous
          : next,
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };
    const observer = new ResizeObserver(onScroll);
    observer.observe(row);
    if (row.firstElementChild) observer.observe(row.firstElementChild);
    row.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      row.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  const baseId = useId();
  const go = (id: string) => {
    setActive(id);
    document
      .getElementById(`${baseId}-tab-${id}`)
      ?.focus({ preventScroll: true });
  };

  return (
    <section
      id="data-bencana"
      className="dz-board"
      aria-labelledby="disaster-title"
    >
      <h2 id="disaster-title" className="dz-board-title">
        Statistik dan data gempa
      </h2>
      <p className="dz-board-subtitle">
        Konteks Bandung Raya dan Sesar Lembang
      </p>
      <div className="dz-tab-frame">
        <div
          className="dz-tab-scroll"
          ref={scrollRef}
          data-fade-start={scrollState.left > 1 ? 'on' : 'off'}
          data-fade-end={
            scrollState.max > 0 && scrollState.left < scrollState.max - 1
              ? 'on'
              : 'off'
          }
        >
          <LiquidNavbar
            className="dz-liquid-tabs"
            material="subtle"
            mode="tabs"
            ariaLabel="Kategori data bencana"
            compact={false}
            active={allTabs.findIndex((tab) => tab.id === active)}
            onChange={(index) => setActive(allTabs[index].id)}
            scrollContainerRef={scrollRef}
            items={allTabs.map((tab) => ({
              label: tab.label,
              id: `${baseId}-tab-${tab.id}`,
              panelId: `${baseId}-panel-${tab.id}`,
            }))}
          />
        </div>
        {/* Edge arrows replace a visible scrollbar: each one only shows while
            tabs are hidden on its side. Keyboard users move with the tablist
            arrow keys, so the buttons stay out of the tab order. */}
        {(['start', 'end'] as const).map((side) => {
          const visible =
            side === 'start'
              ? scrollState.left > 1
              : scrollState.max > 0 && scrollState.left < scrollState.max - 1;
          return (
            <button
              key={side}
              type="button"
              className={`dz-tab-arrow is-${side}`}
              tabIndex={-1}
              aria-label={
                side === 'start'
                  ? 'Tampilkan kategori sebelumnya'
                  : 'Tampilkan kategori berikutnya'
              }
              hidden={!visible}
              onClick={() => scrollTabs(side === 'start' ? -1 : 1)}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path
                  d={side === 'start' ? 'm14 6-6 6 6 6' : 'm10 6 6 6-6 6'}
                />
              </svg>
            </button>
          );
        })}
      </div>
      {allTabs.map((tab) => (
        <div
          key={tab.id}
          id={`${baseId}-panel-${tab.id}`}
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={active !== tab.id}
          className="dz-panel"
        >
          {tab.id === 'statistik' ? <Statistics go={go} /> : tab.content}
        </div>
      ))}
      <p className="dz-board-note">
        Data resmi untuk konteks, bukan hasil screening bangunanmu.
      </p>
    </section>
  );
}
