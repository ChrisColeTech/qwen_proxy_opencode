import React from 'react';
import { Activity, Clock, Database, Cpu, MessageSquare, FileText } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const ActivityPage: React.FC = () => {
  // Mock activity data - in a real app, this would come from an API
  const recentActivity = [
    {
      id: 1,
      type: 'provider',
      action: 'created',
      description: 'New provider "OpenAI" was created',
      timestamp: '2 minutes ago',
      icon: Database,
      color: 'text-blue-500',
    },
    {
      id: 2,
      type: 'model',
      action: 'updated',
      description: 'Model "GPT-4" configuration updated',
      timestamp: '15 minutes ago',
      icon: Cpu,
      color: 'text-purple-500',
    },
    {
      id: 3,
      type: 'session',
      action: 'started',
      description: 'New conversation session initiated',
      timestamp: '1 hour ago',
      icon: MessageSquare,
      color: 'text-green-500',
    },
    {
      id: 4,
      type: 'request',
      action: 'completed',
      description: 'API request completed successfully',
      timestamp: '2 hours ago',
      icon: FileText,
      color: 'text-orange-500',
    },
  ];

  return (
    <PageLayout>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Activity Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor recent activity and system events
          </p>
        </div>
        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <CardDescription>
              Track recent changes and events across your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0"
                  >
                    <div className={`p-2 rounded-lg bg-secondary ${item.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{item.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {item.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground mt-1">
                +1 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Active Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">
                +3 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                API Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground mt-1">
                +15% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Note */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              This is a placeholder activity dashboard. In a production environment,
              this page would display real-time activity from your API and system events.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ActivityPage;
