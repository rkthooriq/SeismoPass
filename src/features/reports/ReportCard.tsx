import type { FormEvent } from 'react';
import { canSurvey } from '../../lib/surveyorAccess';
import type { DemoAccount, Report, ReportAction } from '../../lib/reportDemo';
import type { RvsRecord } from '../../lib/rvs';
import ReportPassport from './ReportPassport';
import RvsForm from '../rvs/RvsForm';
export default function ReportCard({
  report,
  account,
  accounts,
  onUpdate,
  onAssign,
  onEdit,
  onRvs,
}: {
  report: Report;
  account: DemoAccount;
  accounts: DemoAccount[];
  onUpdate: (event: FormEvent<HTMLFormElement>, report: Report) => void;
  onAssign: (event: FormEvent<HTMLFormElement>, report: Report) => void;
  onEdit: () => void;
  onRvs: (record: RvsRecord) => boolean;
}) {
  const surveyor = accounts.find((person) => person.id === report.assignee);
  const actions = (items: [ReportAction, string][]) => (
    <div className="report-actions">
      {items.map(([value, label], i) => (
        <button
          key={value}
          className={i === 0 ? 'ws-primary' : 'ws-secondary'}
          value={value}
        >
          {label}
        </button>
      ))}
    </div>
  );
  return (
    <details className="report-item">
      <summary>
        <span className="report-building-icon" aria-hidden="true">
          ⌂
        </span>
        <span className="report-summary-name">
          <strong>{report.title}</strong>
          <small>{report.location || 'Lokasi belum diisi'}</small>
        </span>
        <span
          className={`ws-badge status-${report.status === 'Selesai' ? 'complete' : report.status === 'Perlu revisi' || report.status === 'Perlu dilengkapi' ? 'attention' : 'progress'}`}
        >
          {report.status}
        </span>
        <span className="report-summary-arrow" aria-hidden="true">
          ↗
        </span>
      </summary>
      <div className="report-detail">
        <p className="ws-muted">
          {report.id} · Pelapor:{' '}
          {accounts.find((person) => person.id === report.reporterId)?.name ??
            'Akun contoh'}
        </p>
        <p>{report.description || 'Catatan belum diisi.'}</p>
        <dl className="report-visit-info">
          <div>
            <dt>Alamat kunjungan</dt>
            <dd>
              {report.address || 'Belum diisi. Minta pelapor melengkapi.'}
            </dd>
          </div>
          {report.landmark && (
            <div>
              <dt>Patokan</dt>
              <dd>{report.landmark}</dd>
            </div>
          )}
          {report.contactPhone && (
            <div>
              <dt>Nomor yang bisa dihubungi</dt>
              <dd>
                <a href={`tel:${report.contactPhone.replace(/[^\d+]/g, '')}`}>
                  {report.contactPhone}
                </a>
              </dd>
            </div>
          )}
        </dl>
        {surveyor && (
          <div className="role-assignment-note">
            <strong>Pesurvei: {surveyor.name}</strong>
            <p>{report.assignmentNote || 'Penugasan dari sesi sebelumnya.'}</p>
          </div>
        )}
        {report.visitDate && (
          <p>
            <strong>Kunjungan {report.visitDate}</strong> · {report.visitNote}
          </p>
        )}
        {report.reviewNote && (
          <p className="ws-disclaimer">
            <strong>Catatan admin: </strong>
            {report.reviewNote}
          </p>
        )}
        {account.role === 'admin' &&
          ['Siap disurvei', 'Ditugaskan'].includes(report.status) && (
            <form
              className="report-form role-assignment-form"
              onSubmit={(event) => onAssign(event, report)}
            >
              <h3>
                {report.assignee ? 'Ubah penugasan' : 'Tugaskan pesurvei'}
              </h3>
              <label>
                Pesurvei aktif
                <select
                  name="surveyorId"
                  required
                  defaultValue={report.assignee ?? ''}
                >
                  <option value="">Pilih pesurvei yang disetujui</option>
                  {accounts
                    .filter(
                      (person) => canSurvey(person) && person.emailVerified,
                    )
                    .map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name} · {person.organization || person.email}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Catatan penugasan
                <textarea
                  name="assignmentNote"
                  maxLength={1000}
                  required
                  placeholder="Lingkup kunjungan dan koordinasi supervisi"
                />
              </label>
              <button className="ws-primary">Simpan penugasan</button>
            </form>
          )}
        <form
          className="report-form"
          key={report.status}
          onSubmit={(event) => onUpdate(event, report)}
        >
          {account.role === 'owner' &&
            ['Draf', 'Perlu dilengkapi'].includes(report.status) && (
              <div className="report-actions">
                <button type="button" className="ws-secondary" onClick={onEdit}>
                  Ubah draf
                </button>
                <button className="ws-primary" value="submit">
                  Kirim laporan
                </button>
              </div>
            )}
          {account.role === 'admin' && report.status === 'Dikirim' && (
            <>
              <label>
                Catatan untuk pelapor (wajib jika dikembalikan)
                <textarea name="note" maxLength={1000} />
              </label>
              {actions([
                ['verify', 'Data lengkap, siap ditugaskan'],
                ['return', 'Minta kelengkapan'],
              ])}
            </>
          )}
          {account.role === 'surveyor' &&
            report.assignee === account.id &&
            report.status === 'Ditugaskan' &&
            actions([['start', 'Mulai survei']])}
          {account.role === 'surveyor' &&
            report.assignee === account.id &&
            ['Dalam survei', 'Perlu revisi'].includes(report.status) && (
              <>
                <label>
                  Tanggal kunjungan
                  <input
                    type="date"
                    name="date"
                    defaultValue={report.visitDate}
                    required
                  />
                </label>
                <label>
                  Catatan kunjungan
                  <textarea
                    name="note"
                    required
                    maxLength={1000}
                    defaultValue={report.visitNote}
                    placeholder="Catat kunjungan dan kebutuhan tindak lanjut. Simulasi RVS belum menjadi hasil resmi."
                  />
                </label>
                {actions([['visit', 'Kirim catatan ke admin']])}
              </>
            )}
          {account.role === 'admin' && report.status === 'Ditinjau' && (
            <>
              <label>
                Catatan tinjauan administrasi
                <textarea name="note" required maxLength={1000} />
              </label>
              {actions([
                ['close', 'Tutup administrasi laporan'],
                ['revise', 'Minta revisi'],
              ])}
            </>
          )}
        </form>
        {account.role === 'surveyor' &&
          report.assignee === account.id &&
          ['Dalam survei', 'Perlu revisi'].includes(report.status) && (
            <details className="role-rvs-entry">
              <summary>Isi input RVS dan lihat hasil simulasi</summary>
              <RvsForm
                initial={report.rvs}
                stories={report.floors}
                screener={account.name}
                onSave={onRvs}
              />
            </details>
          )}
        <details className="role-passport-entry">
          <summary>Profil bangunan, simulasi RVS, dan QR</summary>
          <ReportPassport report={report} />
        </details>
        {!!report.activity?.length && (
          <details>
            <summary>Riwayat penugasan</summary>
            <ol className="role-report-history">
              {report.activity.map((event, index) => (
                <li key={index}>
                  <strong>{event.action}</strong>
                  <p>{event.note}</p>
                  <small>{event.at}</small>
                </li>
              ))}
            </ol>
          </details>
        )}
      </div>
    </details>
  );
}
