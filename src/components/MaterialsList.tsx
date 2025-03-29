
import React from "react";
import { useNavigate } from "react-router-dom";
import { Material } from "@/types/education";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    // In a real app, this would download or view the file
    console.log("Viewing material:", material);
  };

  const handleGoToSubject = (subjectId: string) => {
    navigate(`/subject/${subjectId}`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      
      {materials.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-md">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {materials.map((material) => (
            <Card key={material.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{material.title}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Added: {format(new Date(material.dateAdded), "PPP")}
                      {showSubject && subjectNames[material.subjectId] && (
                        <span className="ml-2 cursor-pointer text-primary" 
                              onClick={() => handleGoToSubject(material.subjectId)}>
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
              <CardContent>
                <p className="text-sm mb-4">{material.description}</p>
                <Button variant="outline" size="sm" onClick={() => handleViewMaterial(material)}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Material
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsList;
