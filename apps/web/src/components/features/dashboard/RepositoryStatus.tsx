import { Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RepositoryStatusProps {
  status: 'syncing' | 'active' | 'failed' | 'suspended';
  onRetry?: () => void;
}

export function RepositoryStatus({ status, onRetry }: RepositoryStatusProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'syncing':
        return {
          icon: <RefreshCw className="h-3 w-3 animate-spin" />,
          label: 'Syncing',
          variant: 'secondary' as const,
          className: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'active':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'Active',
          variant: 'default' as const,
          className: 'bg-green-50 text-green-700 border-green-200',
        };
      case 'failed':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Sync Failed',
          variant: 'destructive' as const,
          className: 'bg-red-50 text-red-700 border-red-200',
        };
      case 'suspended':
        return {
          icon: <Clock className="h-3 w-3" />,
          label: 'Suspended',
          variant: 'outline' as const,
          className: 'bg-gray-50 text-gray-700 border-gray-200',
        };
      default:
        return {
          icon: <Clock className="h-3 w-3" />,
          label: 'Unknown',
          variant: 'outline' as const,
          className: 'bg-gray-50 text-gray-700 border-gray-200',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={config.variant}
        className={`flex items-center gap-1 ${config.className}`}
        data-testid={`status-${status}`}
      >
        {config.icon}
        {config.label}
      </Badge>
      
      {status === 'failed' && onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="h-6 px-2 text-xs"
          data-testid="retry-sync-button"
        >
          Retry
        </Button>
      )}
    </div>
  );
}