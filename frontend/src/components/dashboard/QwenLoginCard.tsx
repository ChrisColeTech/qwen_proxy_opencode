import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogIn, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import type { QwenCredentials } from '@/types/electron';

export function QwenLoginCard() {
  const navigate = useNavigate();

  // Mock state - will be replaced with real Electron IPC
  const [credentials, setCredentials] = useState<QwenCredentials>({
    hasToken: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check if running in Electron
  const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

  useEffect(() => {
    if (!isElectron) return;

    // Wire up real Electron IPC
    const electronAPI = window.electronAPI as any;

    if (electronAPI?.getCredentials) {
      electronAPI.getCredentials().then((creds: QwenCredentials) => {
        setCredentials(creds);
      }).catch((error: Error) => {
        console.error('Failed to get credentials:', error);
      });
    }

    // Listen for credential updates
    if (electronAPI?.onCredentialsUpdated) {
      const unsubscribe = electronAPI.onCredentialsUpdated((creds: QwenCredentials) => {
        setCredentials(creds);
      });
      return () => unsubscribe();
    }
  }, [isElectron]);

  const handleLogin = async () => {
    if (!isElectron) {
      // Show helpful message for browser mode
      alert(
        'Qwen Login via Embedded Browser\n\n' +
        'This feature is only available in the Electron desktop app.\n\n' +
        'In browser mode, you can:\n' +
        '• Create a Qwen provider manually\n' +
        '• Add your API key or credentials in the provider config\n' +
        '• Navigate to Providers → Create Provider'
      );
      return;
    }

    setIsLoading(true);
    try {
      // Wire up real Electron IPC
      const electronAPI = window.electronAPI as any;
      if (electronAPI?.openLogin) {
        await electronAPI.openLogin();
        // Credentials will be updated via event listener
      } else {
        console.warn('electronAPI.openLogin not available');
        alert('Electron login not available. Make sure the Electron app is properly configured.');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Login failed:', error);
      alert(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!isElectron) return;

    setIsLoading(true);
    try {
      // TODO: Wire up real Electron IPC
      // const newCreds = await window.electronAPI.refreshCredentials();
      // setCredentials(newCreds);

      // Mock refresh
      setTimeout(() => {
        setCredentials({
          hasToken: true,
          tokenExpiry: Math.floor(Date.now() / 1000) + 86400 * 30,
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Refresh failed:', error);
      setIsLoading(false);
    }
  };

  const formatExpiry = (timestamp?: number) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const getTimeRemaining = (timestamp?: number) => {
    if (!timestamp) return 'Unknown';
    const now = Date.now() / 1000;
    const remaining = timestamp - now;
    if (remaining < 0) return 'Expired';
    const hours = Math.floor(remaining / 3600);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const isExpiringSoon = (timestamp?: number) => {
    if (!timestamp) return false;
    const now = Date.now() / 1000;
    const remaining = timestamp - now;
    return remaining < 86400; // Less than 24 hours
  };

  if (!isElectron) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Qwen Authentication</h2>
          <Badge variant="secondary">Browser Mode</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Automatic Qwen login with embedded browser is only available in the Electron desktop app.
          </p>
          <div className="bg-muted/50 p-3 rounded-md space-y-2">
            <p className="text-sm font-medium">In browser mode, you can:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Create a Qwen provider manually</li>
              <li>Add your API key or credentials</li>
              <li>Configure provider settings</li>
            </ul>
          </div>
          <Button
            onClick={() => navigate('/providers/create')}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Create Qwen Provider
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold">Qwen Authentication</h2>
        {credentials.hasToken ? (
          <Badge variant={isExpiringSoon(credentials.tokenExpiry) ? 'warning' : 'success'}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Authenticated
          </Badge>
        ) : (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Logged In
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {credentials.hasToken ? (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Expires:</span>
                <p className="font-medium mt-1">{formatExpiry(credentials.tokenExpiry)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Time Left:</span>
                <p className={`font-medium mt-1 ${isExpiringSoon(credentials.tokenExpiry) ? 'text-yellow-600' : ''}`}>
                  {getTimeRemaining(credentials.tokenExpiry)}
                </p>
              </div>
            </div>

            {isExpiringSoon(credentials.tokenExpiry) && (
              <div className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                ⚠️ Your token will expire soon. Please refresh or re-login.
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleLogin}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Re-login
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Login to Qwen to enable AI-powered features with automatic cookie extraction.
            </p>
            <Button
              onClick={handleLogin}
              className="w-full"
              disabled={isLoading}
            >
              <LogIn className="h-4 w-4 mr-2" />
              {isLoading ? 'Opening Login...' : 'Login to Qwen'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
