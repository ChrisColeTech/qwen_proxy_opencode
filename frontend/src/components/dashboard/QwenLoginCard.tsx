import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogIn, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface QwenCredentials {
  hasToken: boolean;
  tokenExpiry?: number;
}

export function QwenLoginCard() {
  // Mock state - will be replaced with real Electron IPC
  const [credentials, setCredentials] = useState<QwenCredentials>({
    hasToken: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check if running in Electron
  const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

  useEffect(() => {
    if (!isElectron) return;

    // TODO: Wire up real Electron IPC
    // window.electronAPI.getCredentials().then(setCredentials);

    // TODO: Listen for credential updates
    // const unsubscribe = window.electronAPI.onCredentialsUpdated(setCredentials);
    // return () => unsubscribe();

    // Mock data for now
    setCredentials({
      hasToken: true,
      tokenExpiry: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days from now
    });
  }, [isElectron]);

  const handleLogin = async () => {
    if (!isElectron) {
      alert('Login is only available in the Electron desktop app');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Wire up real Electron IPC
      // await window.electronAPI.openLogin();

      // Mock success
      setTimeout(() => {
        setCredentials({
          hasToken: true,
          tokenExpiry: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Login failed:', error);
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
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Qwen login is only available in the Electron desktop app.
            <br />
            <br />
            In browser mode, you can configure Qwen providers manually with API keys.
          </p>
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
