import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useProviders } from '@/hooks/useProviders';

export function CodeExample() {
  const [copied, setCopied] = useState(false);
  const { data: providersData } = useProviders({ enabled: true });

  // Get first enabled provider or use default
  const firstProvider = providersData?.providers?.[0];
  const modelName = firstProvider?.id || 'qwen-max';

  const CODE_EXAMPLE = `import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:8000/v1',
  apiKey: 'any-key'  // Not validated, but required by SDK
});

const response = await client.chat.completions.create({
  model: '${modelName}',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello! How are you?' }
  ],
  temperature: 0.7,
});

console.log(response.choices[0].message.content);`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CODE_EXAMPLE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-muted/50 border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Example Usage (JavaScript/TypeScript)
            </span>
            {firstProvider && (
              <span className="text-xs text-muted-foreground">
                • Using model: <code className="font-mono">{modelName}</code>
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Code Block */}
        <pre className="p-4 overflow-x-auto text-sm bg-card">
          <code className="font-mono text-xs leading-relaxed">{CODE_EXAMPLE}</code>
        </pre>

        {/* Footer */}
        <div className="border-t px-4 py-3 bg-muted/30">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-xs font-medium mb-1">
                OpenAI SDK Compatibility
              </p>
              <p className="text-xs text-muted-foreground">
                This proxy is fully compatible with the OpenAI SDK. Just point the{' '}
                <code className="bg-muted px-1 py-0.5 rounded">baseURL</code> to your local endpoint.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
