
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { AddressProcessor } from '@/components/AddressProcessor';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { MapPin, Upload, Download } from 'lucide-react';

export interface Address {
  street: string;
  houseNumber: string;
  extra?: string;
  fullAddress: string;
}

export interface GeocodedAddress extends Address {
  latitude: number | null;
  longitude: number | null;
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
}

const Index = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [geocodedAddresses, setGeocodedAddresses] = useState<GeocodedAddress[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUploaded = (parsedAddresses: Address[]) => {
    setAddresses(parsedAddresses);
    setGeocodedAddresses([]);
  };

  const handleProcessingComplete = (results: GeocodedAddress[]) => {
    setGeocodedAddresses(results);
    setIsProcessing(false);
  };

  const handleStartProcessing = () => {
    setIsProcessing(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-12 w-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Adress-Geocodierer
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Laden Sie eine Excel- oder CSV-Datei mit Adressen hoch und erhalten Sie die entsprechenden Koordinaten
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="shadow-lg">
            <CardHeader className="bg-indigo-50">
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-indigo-600" />
                Datei hochladen
              </CardTitle>
              <CardDescription>
                Unterstützte Formate: Excel (.xlsx, .xls) und CSV-Dateien
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <FileUpload onFileUploaded={handleFileUploaded} />
              
              {addresses.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium">
                    ✓ {addresses.length} Adressen erfolgreich geladen
                  </p>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {addresses.slice(0, 5).map((addr, index) => (
                      <p key={index} className="text-sm text-green-700 truncate">
                        {addr.fullAddress}
                      </p>
                    ))}
                    {addresses.length > 5 && (
                      <p className="text-sm text-green-600 italic">
                        ... und {addresses.length - 5} weitere
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Section */}
          <Card className="shadow-lg">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Geocodierung
              </CardTitle>
              <CardDescription>
                Verarbeitung der Adressen zu Koordinaten
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {addresses.length > 0 ? (
                <AddressProcessor
                  addresses={addresses}
                  onProcessingComplete={handleProcessingComplete}
                  onStartProcessing={handleStartProcessing}
                  isProcessing={isProcessing}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Laden Sie zuerst eine Datei hoch, um mit der Geocodierung zu beginnen</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {geocodedAddresses.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2 text-blue-600" />
                Ergebnisse
              </CardTitle>
              <CardDescription>
                Geocodierte Adressen mit Koordinaten
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResultsDisplay geocodedAddresses={geocodedAddresses} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
