import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Cpu, MessageSquare, FileText, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { QwenLoginCard } from '@/components/dashboard/QwenLoginCard';
import { ProxyControlCard } from '@/components/dashboard/ProxyControlCard';
import { QuickStartGuide } from '@/components/dashboard/QuickStartGuide';
import { CodeExample } from '@/components/dashboard/CodeExample';
import { useProviders } from '@/hooks/useProviders';
import { useSessions } from '@/hooks/useSessions';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: providers } = useProviders();
  const { data: sessions } = useSessions();

  const sections = [
    {
      title: 'Providers',
      description: 'Manage AI service providers and their configurations',
      icon: Database,
      path: '/providers',
      color: 'text-blue-500',
    },
    {
      title: 'Models',
      description: 'Configure and manage AI models from various providers',
      icon: Cpu,
      path: '/models',
      color: 'text-purple-500',
    },
    {
      title: 'Sessions',
      description: 'View conversation sessions and their history',
      icon: MessageSquare,
      path: '/sessions',
      color: 'text-green-500',
    },
    {
      title: 'Requests',
      description: 'Monitor API requests and their performance metrics',
      icon: FileText,
      path: '/requests',
      color: 'text-orange-500',
    },
  ];

  const quickActions = [
    { label: 'View Activity', path: '/activity', icon: Activity },
    { label: 'View Logs', path: '/logs', icon: FileText },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your AI proxy infrastructure with ease
        </p>
      </div>

      {/* Dashboard Controls - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Qwen Login */}
        <QwenLoginCard />

        {/* Right Column - Proxy Control */}
        <ProxyControlCard />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{providers?.providers?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Total Providers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {providers?.providers?.filter((p: any) => p.enabled).length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Enabled Providers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{sessions?.sessions?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Active Sessions</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Guide */}
      <QuickStartGuide />

      {/* Code Example */}
      <CodeExample />

      {/* Main Sections */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.path}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(section.path)}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${section.color}`} />
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full" size="sm">
                    View {section.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>
        <div className="flex gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.path}
                variant="outline"
                onClick={() => navigate(action.path)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
