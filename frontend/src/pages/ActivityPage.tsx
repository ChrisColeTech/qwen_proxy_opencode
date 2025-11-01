import React, { useState, useEffect } from 'react';
import { Activity, Clock, Database, Cpu, MessageSquare, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ActivityItem {
  id: number;
  type: string;
  action: string;
  description: string;
  timestamp: string;
}

interface ActivityStats {
  total_providers: number;
  providers_change: string;
  active_models: number;
  models_change: string;
  api_requests: number;
  requests_change: string;
}

const ActivityPage: React.FC = () => {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch recent activity
        const activityResponse = await fetch('http://localhost:8000/api/v1/activity/recent');
        if (!activityResponse.ok) {
          throw new Error(`Failed to fetch activity: ${activityResponse.statusText}`);
        }
        const activityData = await activityResponse.json();

        // Fetch stats
        const statsResponse = await fetch('http://localhost:8000/api/v1/activity/stats');
        if (!statsResponse.ok) {
          throw new Error(`Failed to fetch stats: ${statsResponse.statusText}`);
        }
        const statsData = await statsResponse.json();

        setActivity(activityData);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Map activity types to icons and colors
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'provider':
        return { icon: Database, color: 'text-blue-500' };
      case 'model':
        return { icon: Cpu, color: 'text-purple-500' };
      case 'session':
        return { icon: MessageSquare, color: 'text-green-500' };
      case 'request':
        return { icon: FileText, color: 'text-orange-500' };
      default:
        return { icon: Activity, color: 'text-gray-500' };
    }
  };

  return (
    <PageLayout>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Activity Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor recent activity and system events
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Content - Only show when not loading */}
        {!isLoading && !error && (
          <>
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
                {activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No recent activity to display
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activity.map((item) => {
                      const { icon: Icon, color } = getActivityIcon(item.type);
                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0"
                        >
                          <div className={`p-2 rounded-lg bg-secondary ${color}`}>
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
                )}
              </CardContent>
            </Card>

            {/* Activity Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Total Providers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_providers}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.providers_change}
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
                    <div className="text-2xl font-bold">{stats.active_models}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.models_change}
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
                    <div className="text-2xl font-bold">{stats.api_requests.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.requests_change}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default ActivityPage;
