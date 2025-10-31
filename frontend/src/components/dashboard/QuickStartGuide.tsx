import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Play, Code, ArrowRight } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
  link?: string;
  linkText?: string;
  code?: string;
}

export function QuickStartGuide() {
  const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

  const steps: Step[] = isElectron
    ? [
        {
          number: 1,
          title: 'Login to Qwen',
          description: 'Authenticate with Qwen to enable AI features with automatic cookie extraction',
          icon: Database,
        },
        {
          number: 2,
          title: 'Start Proxy Server',
          description: 'Click "Start Proxy" to launch the backend service',
          icon: Play,
        },
        {
          number: 3,
          title: 'Use the API',
          description: 'Connect your applications to the OpenAI-compatible endpoint',
          icon: Code,
        },
      ]
    : [
        {
          number: 1,
          title: 'Configure Providers',
          description: 'Add one or more AI providers (LM Studio, Qwen, etc.)',
          icon: Database,
          link: '/providers/create',
          linkText: 'Add Provider',
        },
        {
          number: 2,
          title: 'Start Backend Server',
          description: 'Run the backend in a separate terminal',
          icon: Play,
          code: 'cd backend/provider-router && npm start',
        },
        {
          number: 3,
          title: 'Use with OpenAI SDK',
          description: 'Point your OpenAI client to the local endpoint',
          icon: Code,
        },
      ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Quick Start Guide</h2>
        <p className="text-sm text-muted-foreground">
          Get up and running in three simple steps
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                    {step.number}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {step.description}
                  </p>

                  {/* Code snippet */}
                  {step.code && (
                    <code className="block text-xs bg-muted px-3 py-2 rounded font-mono mt-2">
                      {step.code}
                    </code>
                  )}

                  {/* Link */}
                  {step.link && step.linkText && (
                    <Link to={step.link}>
                      <Button variant="link" size="sm" className="px-0 h-auto">
                        {step.linkText}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Help */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Need help?</p>
          <p className="text-sm text-muted-foreground">
            Check the documentation or view example code in the sections below.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
