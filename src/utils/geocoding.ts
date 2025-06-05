
interface GeocodingResult {
  latitude: number | null;
  longitude: number | null;
}

export const geocodeAddress = async (address: string): Promise<GeocodingResult> => {
  const baseUrl = "https://nominatim.openstreetmap.org/search";
  
  // Normalisiere die Adresse
  let cleanAddress = address.replace(/;/g, ' ').trim();
  cleanAddress = cleanAddress.replace(/\s+/g, ' ');
  cleanAddress = cleanAddress.replace(/strasse/gi, 'straße').replace(/Strasse/g, 'Straße');
  
  // Füge Standardort hinzu (kann angepasst werden)
  const searchAddress = `${cleanAddress}, Deutschland`;
  
  const params = new URLSearchParams({
    q: searchAddress,
    format: 'json',
    limit: '1',
    countrycodes: 'de'
  });
  
  const headers = {
    'User-Agent': 'AddressGeocoderTool/1.0'
  };
  
  try {
    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
    } else {
      console.warn(`Keine Ergebnisse für Adresse: ${address}`);
      return {
        latitude: null,
        longitude: null
      };
    }
  } catch (error) {
    console.error(`Fehler bei der Geocodierung von '${address}':`, error);
    throw error;
  }
};

export const validateAndNormalizeAddress = (address: string): string => {
  // Konvertiere zu String falls nötig
  address = String(address);
  
  // Entferne führende/nachfolgende Leerzeichen
  address = address.trim();
  
  if (!address) {
    console.warn("Leere Adresse");
    return "";
  }
  
  // Konvertiere zu Title Case
  address = address.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
  
  // Normalisiere häufige Abkürzungen
  const abbreviations: Record<string, string> = {
    'Str ': 'Straße ',
    'Str.': 'Straße',
    'St ': 'Straße ',
    'St.': 'Straße',
  };
  
  for (const [abbr, full] of Object.entries(abbreviations)) {
    address = address.replace(new RegExp(abbr, 'g'), full);
  }
  
  console.log(`Normalisierte Adresse: ${address}`);
  return address;
};
