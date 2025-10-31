import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const LogsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View system logs and request history
          </p>
        </div>
        {/* Main Message Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Request Logs</CardTitle>
            </div>
            <CardDescription>
              All request logs are available in the Requests section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To view detailed logs of API requests, including request/response data,
              timing information, and error details, please navigate to the Requests page.
            </p>
            <Button onClick={() => navigate('/requests')}>
              <FileText className="h-4 w-4 mr-2" />
              Go to Requests
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Log Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Logs</CardTitle>
              <CardDescription>
                View all API request and response logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Access detailed information about API requests, including:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Request and response payloads</li>
                <li>HTTP status codes</li>
                <li>Response times</li>
                <li>Error messages</li>
              </ul>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => navigate('/requests')}
              >
                View Request Logs
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Logs</CardTitle>
              <CardDescription>
                View conversation session history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Access session-level information, including:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Session start and end times</li>
                <li>Number of requests per session</li>
                <li>Session metadata</li>
                <li>Associated requests</li>
              </ul>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => navigate('/sessions')}
              >
                View Session Logs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Information Note */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This centralized logs page can be enhanced in the future
              to provide aggregated log views, filtering capabilities, and search functionality
              across all log types.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default LogsPage;
