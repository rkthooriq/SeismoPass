import { calculateRvs, rvsSource } from '../../lib/rvs';
import type { RvsInputs } from '../../lib/rvs';

export default function RvsResult({ inputs }: { inputs: RvsInputs }) {
  const result = calculateRvs(inputs);
  return (
    <section className="rvs-result" aria-label="Hasil simulasi RVS">
      <span className="ws-badge">SIMULASI · BELUM DIVALIDASI AHLI</span>
      <h3>Hasil perhitungan Level 1</h3>
      {result.score === null ? (
        <p>Skor belum dapat dihitung.</p>
      ) : (
        <>
          <div className="rvs-score">
            <strong>{result.score.toFixed(1)}</strong>
            <span>
              S<sub>L1</sub> simulasi
              <br />
              FEMA P-154 · HIGH
            </span>
          </div>
          <table className="rvs-calculation">
            <caption>Rincian skor dari pilihan input</caption>
            <thead>
              <tr>
                <th scope="col">Komponen</th>
                <th scope="col">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {result.terms.map((term) => (
                <tr key={term.label}>
                  <th scope="row">{term.label}</th>
                  <td>{term.value.toFixed(1)}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">Jumlah sebelum batas minimum</th>
                <td>{result.raw?.toFixed(1)}</td>
              </tr>
              <tr>
                <th scope="row">Smin dari tabel</th>
                <td>{result.minimum?.toFixed(1)}</td>
              </tr>
              <tr>
                <th scope="row">SL1 = maksimum (jumlah, Smin)</th>
                <td>{result.score.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
          <p>
            Smin adalah batas bawah perhitungan, bukan ambang aman atau ambang
            rujukan. Tidak ada kategori risiko maupun keputusan rujukan
            otomatis.
          </p>
        </>
      )}
      {!!result.blockers.length && (
        <ul className="rvs-alert">
          {result.blockers.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
      {!!result.warnings.length && (
        <ul className="rvs-alert">
          {result.warnings.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
      <p className="ws-disclaimer">
        <strong>RVS adalah penyaringan awal, bukan sertifikat aman.</strong> Ini
        simulasi aritmetika tabel, bukan hasil penilaian bangunan yang sah.
        Pemilihan wilayah seismisitas, tipe bangunan, kode acuan, dan tindak
        lanjut perlu ahli struktur.
      </p>
      <a href={rvsSource} target="_blank" rel="noreferrer">
        Lihat formulir sumber FEMA P-154 (2015), halaman B-4 ↗
      </a>
    </section>
  );
}
