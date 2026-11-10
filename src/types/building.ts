export interface Building {
  id: string;
  name: string;
  location: string;
  function: string;
  year: string;
  floors: string;
  material: string;
  structure: string;
  status: 'Draf' | 'Data tercatat';
}
