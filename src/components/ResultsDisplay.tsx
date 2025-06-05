import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GeocodedAddress } from '@/pages/Index';
import { Download, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResultsDisplayProps {
  geocodedAddresses: GeocodedAddress[];
}

export const ResultsDisplay = ({ geocodedAddresses }: ResultsDisplayProps) => {
  const { toast } = useToast();

  const downloadCSV = () => {
    const headers = ['Adresse', 'Latitude', 'Longitude'];
    const csvContent = [
      headers.join(','),
      ...geocodedAddresses.map(addr => [
        addr.fullAddress,
        addr.latitude || '',
        addr.longitude || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `geocoded_addresses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download gestartet",
      description: "Die CSV-Datei wird heruntergeladen",
    });
  };

  const downloadExcel = async () => {
    try {
      // Dynamischer Import von xlsx für bessere Performance
      const XLSX = await import('xlsx');
      
      const worksheet = XLSX.utils.json_to_sheet(
        geocodedAddresses.map(addr => ({
          'Adresse': addr.fullAddress,
          'Latitude': addr.latitude || '',
          'Longitude': addr.longitude || ''
        }))
      );
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Geocodierte Adressen');
      
      XLSX.writeFile(workbook, `geocoded_addresses_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Download gestartet",
        description: "Die Excel-Datei wird heruntergeladen",
      });
    } catch (error) {
      toast({
        title: "Download-Fehler",
        description: "Fehler beim Erstellen der Excel-Datei",
        variant: "destructive",
      });
    }
  };

  const successCount = geocodedAddresses.filter(addr => addr.status === 'success').length;
  const errorCount = geocodedAddresses.filter(addr => addr.status === 'error').length;
  const successRate = ((successCount / geocodedAddresses.length) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center bg-blue-50 border-blue-200">
          <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-800">{geocodedAddresses.length}</p>
          <p className="text-sm text-blue-600">Gesamt</p>
        </Card>
        
        <Card className="p-4 text-center bg-green-50 border-green-200">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-800">{successCount}</p>
          <p className="text-sm text-green-600">Erfolgreich</p>
        </Card>
        
        <Card className="p-4 text-center bg-red-50 border-red-200">
          <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-800">{errorCount}</p>
          <p className="text-sm text-red-600">Fehler</p>
        </Card>
        
        <Card className="p-4 text-center bg-purple-50 border-purple-200">
          <div className="text-2xl font-bold text-purple-800 mx-auto mb-2">
            {successRate}%
          </div>
          <p className="text-sm text-purple-600">Erfolgsrate</p>
        </Card>
      </div>

      {/* Download Buttons */}
      <div className="flex space-x-4">
        <Button onClick={downloadCSV} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Als CSV herunterladen
        </Button>
        <Button onClick={downloadExcel} variant="outline" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Als Excel herunterladen
        </Button>
      </div>

      {/* Results Table */}
      <Card className="overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Adresse</TableHead>
                <TableHead>Latitude</TableHead>
                <TableHead>Longitude</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {geocodedAddresses.map((addr, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{addr.fullAddress}</TableCell>
                  <TableCell>
                    {addr.latitude !== null ? addr.latitude.toFixed(6) : '-'}
                  </TableCell>
                  <TableCell>
                    {addr.longitude !== null ? addr.longitude.toFixed(6) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={addr.status === 'success' ? 'default' : 'destructive'}
                      className={addr.status === 'success' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {addr.status === 'success' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Erfolgreich</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Fehler</>
                      )}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
