import type { Building } from '../types/building';

export const demoBuildings: Building[] = [
  {
    id: 'DEMO-001',
    name: 'Rumah Contoh A',
    location: 'Kawasan contoh, Bandung Barat',
    function: 'Rumah tinggal',
    year: '2008',
    floors: '2',
    material: 'Bata',
    structure: 'Belum diketahui',
    status: 'Data tercatat',
  },
  {
    id: 'DEMO-002',
    name: 'Ruang Usaha Contoh',
    location: 'Kawasan contoh, Bandung',
    function: 'Tempat usaha',
    year: '2015',
    floors: '1',
    material: 'Bata',
    structure: 'Belum diketahui',
    status: 'Data tercatat',
  },
  {
    id: 'DEMO-003',
    name: 'Balai Warga Contoh',
    location: 'Kawasan contoh, Cimahi',
    function: 'Fasilitas umum',
    year: '',
    floors: '1',
    material: 'Belum diketahui',
    structure: 'Belum diketahui',
    status: 'Draf',
  },
];

export const workflow = [
  'Registrasi',
  'Screening RVS',
  'Profil digital',
  'Rujukan ahli',
  'Rencana retrofit',
  'Dukungan & evaluasi',
];
