"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileScriptIcon, MoreIcon } from "@hugeicons/core-free-icons";
import { format } from "date-fns";

interface ProjectCardProps {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  createdAt: Date;
  onView?: (id: string) => void;
}

export function ProjectCard({
  id,
  title,
  description,
  subject,
  createdAt,
  onView,
}: ProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
              <HugeiconsIcon
                icon={FileScriptIcon}
                size={20}
                color="#7148FC"
                strokeWidth={1.5}
              />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate text-lg">{title}</CardTitle>
              {subject && (
                <CardDescription className="text-sm mt-1">
                  {subject}
                </CardDescription>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <HugeiconsIcon
              icon={MoreIcon}
              size={18}
              strokeWidth={1.5}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {format(new Date(createdAt), "MMM d, yyyy")}
          </span>
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={() => onView?.(id)}
          >
            View Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
