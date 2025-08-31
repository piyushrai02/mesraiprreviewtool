import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Github,
  Shield,
  Zap,
  CheckCircle,
  ExternalLink,
  Info,
} from "lucide-react";

interface GitHubInstallButtonProps {
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  showDialog?: boolean;
  className?: string;
}

export function GitHubInstallButton({
  variant = "default",
  size = "default",
  showDialog = true,
  className = "",
}: GitHubInstallButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleInstall = () => {
    // Redirect to GitHub OAuth instead of GitHub App
    window.location.href = '/api/v1/github/auth';
    setIsOpen(false);
  };

  const features = [
    {
      icon: Shield,
      title: "Secure Integration",
      description:
        "Read-only access to your code with enterprise-grade security",
    },
    {
      icon: Zap,
      title: "Automated Reviews",
      description: "AI reviews every pull request automatically",
    },
    {
      icon: CheckCircle,
      title: "Instant Feedback",
      description: "Get detailed feedback within minutes of creating a PR",
    },
  ];

  const permissions = [
    "Read repository contents and metadata",
    "Write to pull requests (for review comments)",
    "Read and write checks (for review status)",
    "Receive webhooks for pull request events",
  ];

  if (!showDialog) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleInstall}
        className={`flex items-center gap-2 ${className}`}
        data-testid="github-install-button-direct"
      >
        <Github className="h-4 w-4" />
        Install GitHub App
        <ExternalLink className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`flex items-center gap-2 ${className}`}
          data-testid="github-install-button-dialog"
        >
          <Github className="h-4 w-4" />
          Install GitHub App
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" data-testid="github-install-dialog">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2"
            data-testid="dialog-title"
          >
            <Github className="h-5 w-5" />
            Install Mesrai AI GitHub App
          </DialogTitle>
          <DialogDescription data-testid="dialog-description">
            Connect your GitHub repositories to enable automated AI code reviews
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Features */}
          <div data-testid="features-section">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              What you'll get:
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-gray-200 dark:border-gray-700"
                  data-testid={`feature-card-${index}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <feature.icon className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h4
                          className="font-medium text-gray-900 dark:text-white text-sm"
                          data-testid={`feature-title-${index}`}
                        >
                          {feature.title}
                        </h4>
                        <p
                          className="text-xs text-gray-600 dark:text-gray-400 mt-1"
                          data-testid={`feature-description-${index}`}
                        >
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div data-testid="permissions-section">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Required Permissions:
            </h3>
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {permissions.map((permission, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm"
                      data-testid={`permission-${index}`}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {permission}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Security Notice */}
          <Alert data-testid="security-alert">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy & Security:</strong> Mesrai AI only reads your
              code to provide reviews. We never store your source code and all
              analysis happens in secure, isolated environments. You can revoke
              access at any time from your GitHub settings.
            </AlertDescription>
          </Alert>

          {/* Install Button */}
          <div className="flex gap-3 pt-4" data-testid="dialog-actions">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInstall}
              className="flex items-center gap-2"
              data-testid="button-install"
            >
              <Github className="h-4 w-4" />
              Install on GitHub
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
