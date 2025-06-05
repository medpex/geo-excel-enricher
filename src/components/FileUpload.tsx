
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { parseExcelFile, parseCSVFile } from '@/utils/fileParser';
import { Address } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUploaded: (addresses: Address[]) => void;
}

export const FileUpload = ({ onFileUploaded }: FileUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    try {
      let addresses: Address[] = [];
      
      if (file.name.endsWith('.csv')) {
        addresses = await parseCSVFile(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        addresses = await parseExcelFile(file);
      } else {
        throw new Error('Nicht unterstütztes Dateiformat');
      }

      if (addresses.length === 0) {
        throw new Error('Keine gültigen Adressen in der Datei gefunden');
      }

      onFileUploaded(addresses);
      toast({
        title: "Datei erfolgreich geladen",
        description: `${addresses.length} Adressen wurden gefunden`,
      });
    } catch (error) {
      toast({
        title: "Fehler beim Laden der Datei",
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onFileUploaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    disabled: isLoading
  });

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`p-8 border-2 border-dashed cursor-pointer transition-all duration-200 ${
          isDragActive 
            ? 'border-indigo-400 bg-indigo-50' 
            : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
        } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {isLoading ? (
            <div className="space-y-4">
              <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600">Datei wird verarbeitet...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto" />
              {isDragActive ? (
                <p className="text-indigo-600 font-medium">Datei hier ablegen...</p>
              ) : (
                <div>
                  <p className="text-gray-700 font-medium mb-2">
                    Drag & Drop oder klicken zum Auswählen
                  </p>
                  <p className="text-sm text-gray-500">
                    Excel (.xlsx, .xls) oder CSV-Dateien
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 mb-1">Erwartetes Dateiformat:</p>
            <p className="text-blue-700">
              Spalte 1: Straße | Spalte 2: Hausnummer | Spalte 3: Zusatz (optional)
            </p>
            <p className="text-blue-600 text-xs mt-1">
              Beispiel: Pracherbusch | 10 | a
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
