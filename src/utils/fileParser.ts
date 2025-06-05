
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Address } from '@/pages/Index';

export const parseExcelFile = (file: File): Promise<Address[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
        
        const addresses = parseAddressData(jsonData);
        resolve(addresses);
      } catch (error) {
        reject(new Error('Fehler beim Lesen der Excel-Datei'));
      }
    };
    
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
    reader.readAsArrayBuffer(file);
  });
};

export const parseCSVFile = (file: File): Promise<Address[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        try {
          const addresses = parseAddressData(results.data);
          resolve(addresses);
        } catch (error) {
          reject(new Error('Fehler beim Parsen der CSV-Datei'));
        }
      },
      error: (error) => {
        reject(new Error(`CSV-Parser Fehler: ${error.message}`));
      },
      delimiter: ';',
      skipEmptyLines: true,
      encoding: 'UTF-8'
    });
  });
};

const parseAddressData = (data: any[][]): Address[] => {
  const addresses: Address[] = [];
  
  // Skip header row if it exists
  const startIndex = data.length > 0 && typeof data[0][0] === 'string' && 
                    data[0][0].toLowerCase().includes('straße') ? 1 : 0;
  
  for (let i = startIndex; i < data.length; i++) {
    const row = data[i];
    
    if (!row || row.length < 2) continue;
    
    const street = String(row[0] || '').trim();
    const houseNumber = String(row[1] || '').trim();
    const extra = row[2] ? String(row[2]).trim() : '';
    
    if (!street || !houseNumber || street === 'undefined' || houseNumber === 'undefined') {
      continue;
    }
    
    const fullHouseNumber = extra ? `${houseNumber}${extra}` : houseNumber;
    const fullAddress = `${street} ${fullHouseNumber}`;
    
    addresses.push({
      street,
      houseNumber,
      extra,
      fullAddress
    });
  }
  
  return addresses;
};
