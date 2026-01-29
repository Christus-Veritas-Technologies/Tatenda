"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  PaintBoardIcon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Search01Icon,
  StarIcon,
  Users01Icon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Template {
  id: string;
  name: string;
  description: string | null;
  previewColor: string;
  isDefault: boolean;
  isPublic: boolean;
  usageCount: number;
}

// Color presets for creating templates
const colorPresets = [
  { name: "Purple Classic", primary: "#7148FC", bg: "#F5F3FF" },
  { name: "Teal Modern", primary: "#0D9488", bg: "#F0FDFA" },
  { name: "Blue Bold", primary: "#2563EB", bg: "#EFF6FF" },
  { name: "Amber Elegant", primary: "#B45309", bg: "#FFFBEB" },
  { name: "Green Fresh", primary: "#16A34A", bg: "#F0FDF4" },
  { name: "Rose Soft", primary: "#E11D48", bg: "#FFF1F2" },
  { name: "Slate Minimal", primary: "#475569", bg: "#F8FAFC" },
  { name: "Orange Vibrant", primary: "#EA580C", bg: "#FFF7ED" },
];

export default function TemplatesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorPresets[0]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDesc, setNewTemplateDesc] = useState("");

  // Fetch templates
  const { data, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const response = await fetch("/api/templates");
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json();
    },
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: async (template: {
      name: string;
      description: string;
      colorScheme: object;
      structure: object;
    }) => {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error("Failed to create template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setIsCreateOpen(false);
      setNewTemplateName("");
      setNewTemplateDesc("");
    },
  });

  const templates: Template[] = data?.templates || [];
  
  // Filter templates by search
  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate system and user templates
  const systemTemplates = filteredTemplates.filter((t) => t.isDefault);
  const userTemplates = filteredTemplates.filter((t) => !t.isDefault);

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return;

    createMutation.mutate({
      name: newTemplateName,
      description: newTemplateDesc,
      colorScheme: {
        primary: selectedColor!.primary,
        secondary: selectedColor!.primary,
        heading: "#1a1a1a",
        text: "#333333",
        muted: "#666666",
        background: selectedColor!.bg,
        divider: "#E5E5E5",
      },
      structure: {
        headerStyle: "centered",
        sectionStyle: "bar",
        bulletStyle: "disc",
        dividerStyle: "line",
        fontFamily: "times",
        titleSize: 22,
        headingSize: 14,
        bodySize: 11,
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Templates</h1>
            <p className="text-muted-foreground mt-1">
              Choose a template style for your ZIMSEC projects
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand hover:bg-brand/90">
                <HugeiconsIcon icon={Add01Icon} size={18} />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Your Template</DialogTitle>
                <DialogDescription>
                  Design a custom template for your projects. Choose colors that match your style.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    placeholder="e.g., My School Style"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input
                    placeholder="Brief description of your template"
                    value={newTemplateDesc}
                    onChange={(e) => setNewTemplateDesc(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Color Theme</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorPresets.map((preset) => (
                      <motion.button
                        key={preset.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedColor(preset)}
                        className={`
                          relative h-12 rounded-lg transition-all
                          ${selectedColor?.name === preset.name 
                            ? 'ring-2 ring-brand ring-offset-2' 
                            : 'ring-1 ring-border hover:ring-brand/50'
                          }
                        `}
                        style={{ backgroundColor: preset.primary }}
                      >
                        {selectedColor?.name === preset.name && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedColor?.name}
                  </p>
                </div>
                
                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div 
                    className="h-32 rounded-lg p-4"
                    style={{ backgroundColor: selectedColor?.bg }}
                  >
                    <div className="space-y-2">
                      <div 
                        className="h-4 w-3/4 rounded"
                        style={{ backgroundColor: selectedColor?.primary + '30' }}
                      />
                      <div className="h-2 w-full bg-gray-300/50 rounded" />
                      <div className="h-2 w-2/3 bg-gray-300/50 rounded" />
                      <div className="h-2 w-4/5 bg-gray-300/50 rounded" />
                      <div className="h-2 w-1/2 bg-gray-300/50 rounded" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-brand hover:bg-brand/90"
                    onClick={handleCreateTemplate}
                    disabled={!newTemplateName.trim() || createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Template"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-24 w-full rounded-lg mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </Card>
            ))}
          </div>
        )}

        {/* System Templates */}
        {!isLoading && systemTemplates.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={StarIcon} size={18} className="text-amber-500" />
              <h2 className="text-lg font-medium">System Templates</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <AnimatePresence mode="popLayout">
                {systemTemplates.map((template, index) => (
                  <TemplateCard 
                    key={template.id} 
                    template={template} 
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* User Templates */}
        {!isLoading && userTemplates.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Users01Icon} size={18} className="text-brand" />
              <h2 className="text-lg font-medium">Your Templates</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <AnimatePresence mode="popLayout">
                {userTemplates.map((template, index) => (
                  <TemplateCard 
                    key={template.id} 
                    template={template} 
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-brand/10 rounded-full flex items-center justify-center mb-4">
              <HugeiconsIcon icon={PaintBoardIcon} size={32} className="text-brand" />
            </div>
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "Try a different search term"
                : "Create your first template to get started"
              }
            </p>
            {!searchQuery && (
              <Button 
                className="bg-brand hover:bg-brand/90"
                onClick={() => setIsCreateOpen(true)}
              >
                <HugeiconsIcon icon={Add01Icon} size={18} />
                Create Template
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

interface TemplateCardProps {
  template: Template;
  index: number;
}

function TemplateCard({ template, index }: TemplateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:border-brand/30">
        {/* Color Preview - Google Docs style */}
        <div
          className="h-32 relative overflow-hidden"
          style={{ backgroundColor: template.previewColor }}
        >
          {/* Simulated document */}
          <div className="absolute inset-4 bg-white rounded shadow-sm p-3 space-y-2">
            <div 
              className="h-2 w-3/4 rounded"
              style={{ backgroundColor: template.previewColor + '40' }}
            />
            <div className="h-1.5 w-full bg-gray-200 rounded" />
            <div className="h-1.5 w-2/3 bg-gray-200 rounded" />
            <div className="h-1.5 w-4/5 bg-gray-200 rounded" />
            <div className="h-1.5 w-1/2 bg-gray-200 rounded" />
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Button size="sm" variant="secondary" className="shadow-lg">
                Use Template
              </Button>
            </motion.div>
          </div>
          
          {/* Default badge */}
          {template.isDefault && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <HugeiconsIcon icon={StarIcon} size={12} />
              Default
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-sm truncate">{template.name}</h3>
          {template.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {template.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{template.usageCount} uses</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
