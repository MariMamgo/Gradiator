
import React from "react";
import { useNavigate } from "react-router-dom";
import { Material } from "@/types/education";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface MaterialsListProps {
  materials: Material[];
  title?: string;
  emptyMessage?: string;
  showSubject?: boolean;
  subjectNames?: Record<string, string>;
}

const MaterialsList = ({
  materials,
  title = "Class Materials",
  emptyMessage = "No materials available",
  showSubject = false,
  subjectNames = {}
}: MaterialsListProps) => {
  const navigate = useNavigate();

  const handleViewMaterial = (material: Material) => {
    // In a real app, this would open the material in a new tab or download it
    window.open(material.fileUrl, '_blank');
    toast({
      title: "Material opened",
      description: `Opening ${material.title} in a new tab.`
    });
  };

  const handleDownloadMaterial = (material: Material) => {
    // In a real app, this would trigger a download
    // For now, we'll just show a toast notification
    toast({
      title: "Download started",
      description: `Downloading ${material.title}.`
    });
    
    // Create a dummy download for demo purposes
    const link = document.createElement('a');
    link.href = material.fileUrl;
    link.download = material.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGoToSubject = (subjectId: string) => {
    navigate(`/subject/${subjectId}`);
  };

  // Group materials by type
  const materialsByType = materials.reduce((acc, material) => {
    const type = material.type.charAt(0).toUpperCase() + material.type.slice(1);
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(material);
    return acc;
  }, {} as Record<string, Material[]>);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">{title}</h3>
      
      {materials.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-md">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(materialsByType).map(([type, typeMaterials]) => (
            <div key={type} className="space-y-4">
              <h4 className="text-md font-medium">{type}</h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {typeMaterials.map((material) => (
                  <Card key={material.id} className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{material.title}</CardTitle>
                          <div className="text-sm text-muted-foreground">
                            Added: {format(new Date(material.dateAdded), "PPP")}
                            {showSubject && subjectNames[material.subjectId] && (
                              <span 
                                className="ml-2 cursor-pointer text-primary" 
                                onClick={() => handleGoToSubject(material.subjectId)}
                              >
                                {subjectNames[material.subjectId]}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-sm mb-4 flex-1">{material.description}</p>
                      <div className="flex gap-2 mt-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewMaterial(material)}
                          className="flex-1"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownloadMaterial(material)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsList;
