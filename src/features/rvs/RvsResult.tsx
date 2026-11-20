import { calculateRvs, rvsSource } from '../../lib/rvs';
import type { RvsInputs } from '../../lib/rvs';
import Notice from '../../components/Notice';

export default function RvsResult({
  inputs,
  showStatus = true,
}: {
  inputs: RvsInputs;
  showStatus?: boolean;
}) {
  const result = calculateRvs(inputs);
  return (
    <section className="rvs-result" aria-label="Hasil simulasi RVS">
      {showStatus && (
        <span className="rvs-saved-status">
          Simulasi · belum divalidasi ahli
        </span>
      )}
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
        <Notice
          tone="error"
          title="Kendala perhitungan"
          className="rvs-alert rvs-blockers"
        >
          <ul>
            {result.blockers.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </Notice>
      )}
      {!!result.warnings.length && (
        <Notice
          tone="warning"
          title="Hal yang perlu diperiksa"
          className="rvs-alert rvs-warnings"
        >
          <ul>
            {result.warnings.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </Notice>
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
