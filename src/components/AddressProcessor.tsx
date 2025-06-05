
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Address, GeocodedAddress, LocationContext } from '@/pages/Index';
import { geocodeAddress } from '@/utils/geocoding';
import { Play, Pause, RotateCcw, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface AddressProcessorProps {
  addresses: Address[];
  onProcessingComplete: (results: GeocodedAddress[]) => void;
  onStartProcessing: () => void;
  isProcessing: boolean;
  locationContext: LocationContext;
  onLocationContextChange: (context: LocationContext) => void;
}

// Schema für die Validierung der PLZ und Stadt
const locationSchema = z.object({
  postalCode: z
    .string()
    .min(4, { message: 'PLZ muss mindestens 4 Zeichen lang sein' })
    .regex(/^\d+$/, { message: 'PLZ darf nur Zahlen enthalten' }),
  city: z
    .string()
    .min(2, { message: 'Stadt muss mindestens 2 Zeichen lang sein' }),
});

export const AddressProcessor = ({ 
  addresses, 
  onProcessingComplete, 
  onStartProcessing,
  isProcessing,
  locationContext,
  onLocationContextChange 
}: AddressProcessorProps) => {
  const [progress, setProgress] = useState(0);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [isPaused, setIsPaused] = useState(false);
  const [results, setResults] = useState<GeocodedAddress[]>([]);
  const { toast } = useToast();

  // Form-Definition mit useForm und zod-Validierung
  const form = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      postalCode: locationContext.postalCode,
      city: locationContext.city
    },
  });

  // Wenn sich die Formularwerte ändern, aktualisiere den Kontext
  const handleFormChange = (values: z.infer<typeof locationSchema>) => {
    onLocationContextChange({
      postalCode: values.postalCode,
      city: values.city
    });
  };

  const processAddresses = async () => {
    // Überprüfe zuerst die Gültigkeit des Formulars
    const formValid = await form.trigger();
    if (!formValid) {
      toast({
        title: "Eingabefehler",
        description: "Bitte geben Sie gültige PLZ und Stadt ein",
        variant: "destructive",
      });
      return;
    }

    // Holen Sie die aktualisierten Werte
    const values = form.getValues();
    const locationString = `${values.postalCode} ${values.city}`;

    onStartProcessing();
    setProgress(0);
    setResults([]);
    setIsPaused(false);
    
    const geocodedResults: GeocodedAddress[] = [];
    
    for (let i = 0; i < addresses.length; i++) {
      if (isPaused) break;
      
      const address = addresses[i];
      const fullAddressWithLocation = `${address.fullAddress}, ${locationString}, Deutschland`;
      setCurrentAddress(fullAddressWithLocation);
      
      try {
        const coordinates = await geocodeAddress(address.fullAddress, locationString);
        
        const geocodedAddress: GeocodedAddress = {
          ...address,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          status: coordinates.latitude !== null ? 'success' : 'error',
          errorMessage: coordinates.latitude === null ? 'Koordinaten nicht gefunden' : undefined
        };
        
        geocodedResults.push(geocodedAddress);
        setResults([...geocodedResults]);
        
        console.log(`Geocoded: ${fullAddressWithLocation} -> ${coordinates.latitude}, ${coordinates.longitude}`);
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
        
        console.error(`Error geocoding ${fullAddressWithLocation}:`, error);
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
      <Form {...form}>
        <form 
          onChange={() => handleFormChange(form.getValues())}
          className="space-y-4 mb-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postleitzahl</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="z.B. 21493" 
                      {...field} 
                      disabled={isProcessing} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ort</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="z.B. Schwarzenbek" 
                      {...field} 
                      disabled={isProcessing} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
            <p className="text-sm text-blue-700">
              Diese Informationen werden verwendet, um Straßen in der richtigen Stadt zu finden.
            </p>
          </div>
        </form>
      </Form>

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
