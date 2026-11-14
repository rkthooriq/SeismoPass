import { useEffect, useRef, useState } from 'react';
import {
  addBuildingPhoto,
  deleteBuildingPhoto,
  listBuildingPhotos,
} from '../../lib/buildingPhotos';
import type { BuildingPhoto } from '../../lib/buildingPhotos';

function Photo({
  photo,
  onDelete,
}: {
  photo: BuildingPhoto;
  onDelete: () => void;
}) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const objectUrl = URL.createObjectURL(photo.blob);
    const frame = requestAnimationFrame(() => setUrl(objectUrl));
    return () => {
      cancelAnimationFrame(frame);
      URL.revokeObjectURL(objectUrl);
    };
  }, [photo.blob]);
  return (
    <figure className="owner-photo">
      {url && (
        <img
          src={url}
          alt={`Dokumentasi bangunan: ${photo.name}`}
          loading="lazy"
        />
      )}
      <figcaption>
        <span>{photo.name}</span>
        <button
          type="button"
          className="owner-text-button"
          onClick={onDelete}
          aria-label={`Hapus foto ${photo.name}`}
        >
          Hapus
        </button>
      </figcaption>
    </figure>
  );
}

export default function BuildingPhotos({
  reportId,
  ownerId,
}: {
  reportId: string;
  ownerId: string;
}) {
  const scope = `${ownerId}/${reportId}`;
  const [photos, setPhotos] = useState<BuildingPhoto[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    listBuildingPhotos(scope)
      .then((value) => {
        if (active) setPhotos(value);
      })
      .catch((error) => {
        if (active)
          setMessage(
            error instanceof Error ? error.message : 'Foto belum dapat dimuat.',
          );
      });
    return () => {
      active = false;
    };
  }, [scope]);
  async function add(files: FileList | null) {
    if (!files?.length || busy) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        if (!active.current) break;
        await addBuildingPhoto(scope, file);
      }
      setMessage('Foto tersimpan di browser ini.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Foto belum tersimpan.',
      );
    } finally {
      setPhotos(await listBuildingPhotos(scope).catch(() => photos));
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (busy) return;
    setBusy(true);
    try {
      await deleteBuildingPhoto(scope, id);
      setPhotos(await listBuildingPhotos(scope));
      setMessage('Foto dihapus dari browser.');
    } catch {
      setMessage('Foto belum dapat dihapus. Coba lagi.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="owner-photos" aria-label="Dokumentasi foto bangunan">
      <div className="owner-section-title">
        <div>
          <h3>Foto bangunan</h3>
          <p>Tampak depan, samping, atau bagian yang ingin kamu catat.</p>
        </div>
        <span>{photos.length}/4 foto</span>
      </div>
      <div className="owner-photo-grid">
        {photos.map((photo) => (
          <Photo
            key={photo.id}
            photo={photo}
            onDelete={() => void remove(photo.id)}
          />
        ))}
      </div>
      <label className={`owner-upload ${busy ? 'is-busy' : ''}`}>
        <span aria-hidden="true">＋</span>
        <strong>
          {busy
            ? 'Menyimpan foto…'
            : photos.length >= 4
              ? 'Empat foto sudah tersimpan'
              : 'Pilih foto bangunan'}
        </strong>
        <small>JPG, PNG, WebP · maksimal 2 MB per foto</small>
        <input
          aria-label="Pilih foto bangunan"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy || photos.length >= 4}
          onChange={(event) => {
            void add(event.target.files);
            event.target.value = '';
          }}
        />
      </label>
      {message && (
        <p className="owner-inline-message" role="status">
          {message}
        </p>
      )}
      <p className="owner-footnote">
        Foto hanya disimpan di browser ini, terpisah dari sesi laporan;
        menghapus data situs akan menghapusnya. Foto tidak dikirim ke server,
        tidak masuk QR, dan tidak dinilai otomatis. Gunakan dokumentasi contoh
        tanpa identitas pribadi.
      </p>
    </section>
  );
}
