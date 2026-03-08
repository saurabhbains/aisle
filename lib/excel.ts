import * as XLSX from 'xlsx';
import type { Venue } from './types';

export function downloadVenuesAsExcel(venues: Venue[], filename: string = 'venues') {
  const rows = venues.map((v) => ({
    Name: v.name,
    Location: v.location,
    Type: v.type.replace(/_/g, ' '),
    'Capacity Min': v.capacity.min,
    'Capacity Max': v.capacity.max,
    'Price Min (£)': v.priceRange.min,
    'Price Max (£)': v.priceRange.max,
    'Match Score (%)': v.matchScore,
    Status: v.status.replace(/_/g, ' '),
    Features: v.features.join(', '),
    Website: v.website || '',
    'Contact Name': v.contact?.name || '',
    'Contact Email': v.contact?.email || '',
    'Contact Phone': v.contact?.phone || '',
    Notes: v.notes || '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Venues');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
