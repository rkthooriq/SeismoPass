export interface BuildingPhoto {
  id: string;
  scope: string;
  name: string;
  blob: Blob;
}
export const maxPhotoBytes = 2 * 1024 * 1024;
export const maxPhotos = 4;
const pendingUploads = new Map<string, Set<Promise<void>>>();
function openPhotos(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB)
      return reject(
        new Error('Penyimpanan foto tidak tersedia di browser ini.'),
      );
    const request = indexedDB.open('seismopass-building-photos', 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore('photos', {
        keyPath: 'id',
      });
      store.createIndex('scope', 'scope');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error('Penyimpanan foto tidak dapat dibuka.'));
    request.onblocked = () =>
      reject(new Error('Tutup tab aplikasi lain, lalu coba lagi.'));
  });
}
export async function listBuildingPhotos(
  scope: string,
): Promise<BuildingPhoto[]> {
  const db = await openPhotos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readonly');
    const request = tx.objectStore('photos').index('scope').getAll(scope);
    tx.oncomplete = () => {
      db.close();
      resolve(request.result as BuildingPhoto[]);
    };
    tx.onabort = () => {
      db.close();
      reject(new Error('Foto tidak dapat dibaca.'));
    };
  });
}
export async function validPhotoFile(file: File): Promise<boolean> {
  if (!file.size || file.size > maxPhotoBytes) return false;
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const png =
    file.type === 'image/png' &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  const jpeg =
    file.type === 'image/jpeg' &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255;
  const webp =
    file.type === 'image/webp' &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  return png || jpeg || webp;
}
async function storeBuildingPhoto(scope: string, file: File): Promise<void> {
  if (!(await validPhotoFile(file)))
    throw new Error(
      'Pilih foto JPG, PNG, atau WebP yang valid, maksimal 2 MB.',
    );
  try {
    const image = await createImageBitmap(file);
    const tooLarge = image.width > 6000 || image.height > 6000;
    image.close();
    if (tooLarge)
      throw new Error(
        'Foto terlalu besar. Gunakan ukuran maksimal 6000 piksel per sisi.',
      );
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message.startsWith('Foto terlalu besar')
        ? error.message
        : 'Foto tidak dapat dibaca. Pilih gambar JPG, PNG, atau WebP lain.',
    );
  }
  const db = await openPhotos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    const count = store.index('scope').count(scope);
    let full = false;
    count.onsuccess = () => {
      if (count.result >= maxPhotos) {
        full = true;
        tx.abort();
        return;
      }
      store.put({
        id: crypto.randomUUID(),
        scope,
        name: file.name.slice(0, 150),
        blob: file.slice(0, file.size, file.type),
      });
    };
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onabort = () => {
      db.close();
      reject(
        new Error(
          full
            ? 'Maksimal empat foto per bangunan.'
            : 'Foto belum tersimpan. Periksa ruang penyimpanan browser.',
        ),
      );
    };
  });
}
export function addBuildingPhoto(scope: string, file: File): Promise<void> {
  const pending = pendingUploads.get(scope) ?? new Set<Promise<void>>();
  pendingUploads.set(scope, pending);
  const task = storeBuildingPhoto(scope, file);
  pending.add(task);
  void task
    .finally(() => {
      pending.delete(task);
      if (!pending.size) pendingUploads.delete(scope);
    })
    .catch(() => {});
  return task;
}

export async function deleteBuildingPhoto(
  scope: string,
  id: string,
): Promise<void> {
  const db = await openPhotos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    const found = store.get(id);
    found.onsuccess = () => {
      if ((found.result as BuildingPhoto | undefined)?.scope === scope)
        store.delete(id);
    };
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onabort = () => {
      db.close();
      reject(new Error('Foto belum dapat dihapus.'));
    };
  });
}

export async function clearBuildingPhotos(scope: string): Promise<void> {
  while (pendingUploads.get(scope)?.size)
    await Promise.allSettled([...pendingUploads.get(scope)!]);
  const photos = await listBuildingPhotos(scope);
  for (const photo of photos) await deleteBuildingPhoto(scope, photo.id);
}
