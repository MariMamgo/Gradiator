
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Cloud, CloudOff, ExternalLink } from "lucide-react";

const BackendStatus: React.FC = () => {
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkBackendStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch("http://localhost:8000", { 
        method: "GET",
        signal: AbortSignal.timeout(3000)
      });
      setIsBackendAvailable(response.ok);
    } catch (error) {
      setIsBackendAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkBackendStatus();
    // Check again every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-1 px-2"
              onClick={checkBackendStatus}
              disabled={isChecking}
            >
              {isBackendAvailable === null ? (
                <Badge variant="outline" className="px-1">
                  Checking...
                </Badge>
              ) : isBackendAvailable ? (
                <>
                  <Cloud size={16} className="text-green-500" />
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-1">
                    Backend Online
                  </Badge>
                </>
              ) : (
                <>
                  <CloudOff size={16} className="text-red-500" />
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-1">
                    Backend Offline
                  </Badge>
                </>
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-80">
          <div className="space-y-2">
            <p>
              {isBackendAvailable 
                ? "Backend is connected. All features including AI grading are available." 
                : "Backend is not running. AI grading and file uploads won't work properly."}
            </p>
            {!isBackendAvailable && (
              <div className="text-sm">
                <p className="font-semibold">To start the backend:</p>
                <ol className="list-decimal pl-4 text-xs space-y-1">
                  <li>Navigate to the Gradiator-Grader-API folder</li>
                  <li>Run: <code className="bg-gray-100 px-1 rounded">pip install -r requirements.txt</code></li>
                  <li>Run: <code className="bg-gray-100 px-1 rounded">uvicorn main:app --reload</code></li>
                </ol>
                <a 
                  href="/Gradiator-Grader-API/README.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 hover:text-blue-700 mt-2 text-xs"
                >
                  View detailed instructions <ExternalLink size={12} className="ml-1" />
                </a>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BackendStatus;
