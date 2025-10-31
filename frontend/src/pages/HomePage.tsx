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

const HomePage: React.FC = () => {
  const navigate = useNavigate();

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
          Welcome to Qwen Proxy OpenCode
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your AI proxy infrastructure with ease
        </p>
      </div>

      {/* Main Sections */}
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

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Quick tips to help you get the most out of Qwen Proxy OpenCode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
              1
            </div>
            <div>
              <p className="font-medium">Configure Providers</p>
              <p className="text-sm text-muted-foreground">
                Add your AI service providers with API keys and endpoints
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
              2
            </div>
            <div>
              <p className="font-medium">Set Up Models</p>
              <p className="text-sm text-muted-foreground">
                Configure the AI models you want to use from each provider
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
              3
            </div>
            <div>
              <p className="font-medium">Monitor Sessions</p>
              <p className="text-sm text-muted-foreground">
                Track conversations and requests through the Sessions and Requests pages
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
