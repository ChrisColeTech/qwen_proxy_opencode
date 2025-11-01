import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Copy, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ProxyStatus {
  running: boolean;
  port?: number;
}

export function ProxyControlCard() {
  const [proxyStatus, setProxyStatus] = useState<ProxyStatus>({ running: false });
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Check if running in Electron
  const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

  useEffect(() => {
    if (!isElectron) return;

    // Wire up real Electron IPC
    const electronAPI = window.electronAPI as any;

    if (electronAPI?.getProxyStatus) {
      electronAPI.getProxyStatus().then((status: ProxyStatus) => {
        setProxyStatus(status);
      }).catch((error: Error) => {
        console.error('Failed to get proxy status:', error);
      });
    }

    // Listen for status updates
    if (electronAPI?.onProxyStatusChanged) {
      const unsubscribe = electronAPI.onProxyStatusChanged((status: ProxyStatus) => {
        setProxyStatus(status);
      });
      return () => unsubscribe();
    }
  }, [isElectron]);

  const handleStart = async () => {
    if (!isElectron) {
      alert('Proxy control is only available in the Electron desktop app');
      return;
    }

    setIsStarting(true);
    try {
      const electronAPI = window.electronAPI as any;
      const result = await electronAPI.startProxy();
      if (result.success) {
        // Status will be updated via event listener or we can update it directly
        setProxyStatus({ running: true, port: result.port || 8000 });
      } else {
        alert(`Failed to start: ${result.message}`);
      }
      setIsStarting(false);
    } catch (error) {
      console.error('Failed to start proxy:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    if (!isElectron) return;

    setIsStopping(true);
    try {
      const electronAPI = window.electronAPI as any;
      const result = await electronAPI.stopProxy();
      if (result.success) {
        // Status will be updated via event listener or we can update it directly
        setProxyStatus({ running: false, port: 8000 });
      } else {
        alert(`Failed to stop: ${result.message}`);
      }
      setIsStopping(false);
    } catch (error) {
      console.error('Failed to stop proxy:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsStopping(false);
    }
  };

  const handleCopyUrl = async () => {
    const port = proxyStatus.port || 8000;
    const url = `http://localhost:${port}/v1`;

    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy URL to clipboard');
    }
  };

  if (!isElectron) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Proxy Control</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Proxy control is only available in the Electron desktop app.
          </p>
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium mb-2">Start backend manually:</p>
            <code className="text-xs bg-background px-2 py-1 rounded">
              cd backend/provider-router && npm start
            </code>
          </div>
        </CardContent>
      </Card>
    );
  }

  const port = proxyStatus.port || 8000;
  const endpointUrl = `http://localhost:${port}/v1`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold">Proxy Server</h2>
        {proxyStatus.running ? (
          <Badge variant="success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Running
          </Badge>
        ) : (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Stopped
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Endpoint URL */}
        <div>
          <span className="text-sm text-muted-foreground">Endpoint URL:</span>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
              {endpointUrl}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              disabled={!proxyStatus.running}
            >
              {copySuccess ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Status Info */}
        {proxyStatus.running && (
          <div className="text-sm">
            <span className="text-muted-foreground">Port: </span>
            <span className="font-medium">{port}</span>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {proxyStatus.running ? (
            <Button
              onClick={handleStop}
              variant="destructive"
              className="flex-1"
              disabled={isStopping}
            >
              {isStopping ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Stopping...
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop Proxy
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              disabled={isStarting}
              className="flex-1"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Proxy
                </>
              )}
            </Button>
          )}
        </div>

        {/* Help Text */}
        {!proxyStatus.running && (
          <p className="text-xs text-muted-foreground">
            Start the proxy server to enable API access for AI providers
          </p>
        )}
      </CardContent>
    </Card>
  );
}
