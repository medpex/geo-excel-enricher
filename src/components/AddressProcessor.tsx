
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Address, GeocodedAddress } from '@/pages/Index';
import { geocodeAddress } from '@/utils/geocoding';
import { Play, Pause, RotateCcw, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddressProcessorProps {
  addresses: Address[];
  onProcessingComplete: (results: GeocodedAddress[]) => void;
  onStartProcessing: () => void;
  isProcessing: boolean;
}

export const AddressProcessor = ({ 
  addresses, 
  onProcessingComplete, 
  onStartProcessing,
  isProcessing 
}: AddressProcessorProps) => {
  const [progress, setProgress] = useState(0);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [isPaused, setIsPaused] = useState(false);
  const [results, setResults] = useState<GeocodedAddress[]>([]);
  const { toast } = useToast();

  const processAddresses = async () => {
    onStartProcessing();
    setProgress(0);
    setResults([]);
    setIsPaused(false);
    
    const geocodedResults: GeocodedAddress[] = [];
    
    for (let i = 0; i < addresses.length; i++) {
      if (isPaused) break;
      
      const address = addresses[i];
      setCurrentAddress(address.fullAddress);
      
      try {
        const coordinates = await geocodeAddress(address.fullAddress);
        
        const geocodedAddress: GeocodedAddress = {
          ...address,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          status: coordinates.latitude !== null ? 'success' : 'error',
          errorMessage: coordinates.latitude === null ? 'Koordinaten nicht gefunden' : undefined
        };
        
        geocodedResults.push(geocodedAddress);
        setResults([...geocodedResults]);
        
        console.log(`Geocoded: ${address.fullAddress} -> ${coordinates.latitude}, ${coordinates.longitude}`);
      } catch (error) {
        const geocodedAddress: GeocodedAddress = {
          ...address,
          latitude: null,
          longitude: null,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unbekannter Fehler'
        };
        
        geocodedResults.push(geocodedAddress);
        setResults([...geocodedResults]);
        
        console.error(`Error geocoding ${address.fullAddress}:`, error);
      }
      
      const progressPercent = ((i + 1) / addresses.length) * 100;
      setProgress(progressPercent);
      
      // Delay to respect API rate limits
      if (i < addresses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!isPaused) {
      onProcessingComplete(geocodedResults);
      setCurrentAddress('');
      
      const successCount = geocodedResults.filter(r => r.status === 'success').length;
      toast({
        title: "Geocodierung abgeschlossen",
        description: `${successCount} von ${geocodedResults.length} Adressen erfolgreich geocodiert`,
      });
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const resetProcessing = () => {
    setProgress(0);
    setCurrentAddress('');
    setResults([]);
    setIsPaused(false);
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex space-x-3">
        <Button 
          onClick={processAddresses} 
          disabled={isProcessing}
          className="flex-1"
        >
          <Play className="h-4 w-4 mr-2" />
          Geocodierung starten
        </Button>
        
        {isProcessing && (
          <>
            <Button 
              onClick={togglePause} 
              variant="outline"
              className="px-3"
            >
              <Pause className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={resetProcessing} 
              variant="outline"
              className="px-3"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {isProcessing && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Fortschritt: {Math.round(progress)}%</span>
              <span>{results.length} von {addresses.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {currentAddress && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="animate-spin">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Aktuell verarbeitet:</p>
                  <p className="text-sm text-blue-700 truncate">{currentAddress}</p>
                </div>
              </div>
            </Card>
          )}
          
          {results.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-3 bg-green-50 border-green-200">
                <div className="text-center">
                  <p className="text-lg font-bold text-green-800">{successCount}</p>
                  <p className="text-sm text-green-600">Erfolgreich</p>
                </div>
              </Card>
              
              <Card className="p-3 bg-red-50 border-red-200">
                <div className="text-center">
                  <p className="text-lg font-bold text-red-800">{errorCount}</p>
                  <p className="text-sm text-red-600">Fehler</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {isPaused && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800 text-center">
            Verarbeitung pausiert. Klicken Sie auf Play um fortzufahren.
          </p>
        </Card>
      )}
    </div>
  );
};
