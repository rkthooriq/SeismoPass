import { useRef, useState } from 'react';
import QRCode from 'qrcode';
import type { RvsInputs } from '../../lib/rvs';
import { rvsDemoPath } from '../../lib/rvsQr';

export default function QrPanel({ inputs }: { inputs?: RvsInputs }) {
  const [generated, setGenerated] = useState(false);
  const [message, setMessage] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);
  const path = rvsDemoPath(inputs);
  const href =
    typeof window === 'undefined'
      ? path
      : `${window.location.origin}${window.location.pathname}${path}`;
  function download() {
    if (!svgRef.current) return;
    const data = new XMLSerializer().serializeToString(svgRef.current);
    const url = URL.createObjectURL(
      new Blob([data], { type: 'image/svg+xml' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'seismopass-qr.svg';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  let matrix: ReturnType<typeof QRCode.create> | null = null;
  try {
    if (generated) matrix = QRCode.create(href, { errorCorrectionLevel: 'M' });
  } catch {
    /* Keep the plain link available for long URLs. */
  }
  const size = matrix?.modules.size ?? 0;
  let pixels = '';
  if (matrix)
    for (let row = 0; row < size; row++)
      for (let col = 0; col < size; col++)
        if (matrix.modules.get(row, col))
          pixels += `M${col + 4} ${row + 4}h1v1h-1z`;
  return (
    <section
      className="report-qr-preview rvs-qr"
      aria-label="Contoh QR simulasi"
    >
      <h3>Contoh QR SeismoPass</h3>
      <p>
        {inputs
          ? 'QR membagikan hanya pilihan perhitungan dan tanda bahaya simulasi. Nama, alamat, koordinat, foto, dan komentar tidak ikut.'
          : 'QR membuka contoh halaman profil tanpa identitas atau hasil penilaian bangunan.'}
      </p>
      {!generated ? (
        <button
          className="ws-secondary"
          type="button"
          onClick={() => setGenerated(true)}
        >
          Buat QR
        </button>
      ) : (
        <>
          {matrix ? (
            <svg
              ref={svgRef}
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="QR untuk halaman simulasi SeismoPass"
              viewBox={`0 0 ${size + 8} ${size + 8}`}
              width="280"
              height="280"
              shapeRendering="crispEdges"
            >
              <title>QR simulasi SeismoPass, bukan sertifikat aman</title>
              <path fill="#fff" d={`M0 0h${size + 8}v${size + 8}H0z`} />
              <path fill="#000" d={pixels} />
            </svg>
          ) : (
            <p role="alert">QR belum dapat dibuat. Gunakan tautan berikut.</p>
          )}
          <label>
            Tautan profil
            <input
              readOnly
              value={href}
              onFocus={(event) => event.target.select()}
            />
          </label>
          <div className="report-actions">
            <a
              href={path}
              className="ws-secondary"
              target="_blank"
              rel="noreferrer"
            >
              Buka halaman QR ↗
            </a>
            {matrix && (
              <button className="ws-secondary" type="button" onClick={download}>
                Unduh QR SVG
              </button>
            )}
            <button
              className="ws-secondary"
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(href);
                  setMessage('Tautan disalin.');
                } catch {
                  setMessage('Pilih dan salin tautan dari kolom di atas.');
                }
              }}
            >
              Salin tautan
            </button>
          </div>
        </>
      )}
      {message && <p role="status">{message}</p>}
      <p className="ws-muted">
        Jika dibuka melalui localhost, tautan hanya bekerja di komputer ini.
        Untuk memindai lewat HP, buka web lewat alamat jaringan laptop pada
        Wi-Fi yang sama, lalu buat ulang QR. Hasil dari tautan ini dapat diubah
        dan bukan data terverifikasi.
      </p>
      <p>
        <strong>RVS adalah penyaringan awal, bukan sertifikat aman.</strong>
      </p>
    </section>
  );
}
