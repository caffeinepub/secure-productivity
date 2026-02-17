import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Shield, AlertTriangle, Key } from 'lucide-react';
import { encryptionService } from '@/core/crypto/encryptionService';
import { toast } from 'sonner';

export default function EncryptionKeyPanel() {
  const [hasKey, setHasKey] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useState(() => {
    encryptionService.initialize().then(() => {
      encryptionService.hasKey().then(result => {
        setHasKey(result);
        setIsChecking(false);
      });
    });
  });

  const handleGenerateKey = async () => {
    try {
      await encryptionService.generateKey();
      setHasKey(true);
      toast.success('Encryption key generated successfully');
    } catch (error) {
      toast.error('Failed to generate encryption key');
    }
  };

  const handleResetKey = async () => {
    try {
      await encryptionService.resetKey();
      toast.success('Encryption key reset successfully');
      toast.warning('Existing private notes cannot be decrypted with the new key');
    } catch (error) {
      toast.error('Failed to reset encryption key');
    }
  };

  if (isChecking) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Encryption Key Management
        </CardTitle>
        <CardDescription>
          Your encryption key is stored locally in your browser and never sent to the server.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            {hasKey
              ? 'You have an active encryption key. Private notes are encrypted before being saved.'
              : 'No encryption key found. Generate one to create private notes.'}
          </AlertDescription>
        </Alert>

        {!hasKey ? (
          <Button onClick={handleGenerateKey} className="w-full">
            <Key className="mr-2 h-4 w-4" />
            Generate Encryption Key
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Reset Encryption Key
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Encryption Key?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    This will generate a new encryption key and replace your current one.
                  </p>
                  <p className="font-semibold text-destructive">
                    Warning: You will lose access to all existing private notes encrypted with the old key.
                    This action cannot be undone.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetKey} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Reset Key
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}
