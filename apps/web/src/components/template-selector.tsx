"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  CheckmarkCircle01Icon,
  PaintBoardIcon,
} from "@hugeicons/core-free-icons";

export interface TemplateOption {
  id: string;
  name: string;
  description: string | null;
  previewColor: string;
}

interface TemplateSelectorProps {
  templates: TemplateOption[];
  onSelect: (template: TemplateOption) => void;
  selectedId?: string;
}

export function TemplateSelector({ templates, onSelect, selectedId }: TemplateSelectorProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-3"
      >
        <div className="p-1.5 bg-brand/10 rounded-lg">
          <HugeiconsIcon icon={PaintBoardIcon} size={18} className="text-brand" />
        </div>
        <p className="text-sm font-medium text-foreground">Pick a template style</p>
      </motion.div>
      
      {/* Horizontal scrolling container */}
      <div className="relative">
        <div 
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          style={{ scrollbarWidth: 'thin' }}
        >
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-shrink-0"
            >
              <TemplateCard
                template={template}
                isSelected={selectedId === template.id}
                onClick={() => onSelect(template)}
              />
            </motion.div>
          ))}
        </div>
        
        {/* Fade edges for scroll indication */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: TemplateOption;
  isSelected: boolean;
  onClick: () => void;
}

function TemplateCard({ template, isSelected, onClick }: TemplateCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`
        relative w-40 p-3 cursor-pointer transition-all duration-200 border-2
        ${isSelected 
          ? 'border-brand shadow-lg shadow-brand/20' 
          : 'border-transparent hover:border-muted-foreground/30 hover:shadow-md'
        }
      `}
    >
      {/* Color preview bar */}
      <div 
        className="h-16 rounded-md mb-2 transition-transform"
        style={{ backgroundColor: template.previewColor }}
      >
        {/* Simulated document lines */}
        <div className="p-2 space-y-1.5">
          <div className="h-2 w-3/4 bg-white/30 rounded" />
          <div className="h-1.5 w-full bg-white/20 rounded" />
          <div className="h-1.5 w-2/3 bg-white/20 rounded" />
          <div className="h-1.5 w-4/5 bg-white/20 rounded" />
        </div>
      </div>
      
      {/* Template info */}
      <div>
        <p className="text-sm font-medium text-foreground truncate">
          {template.name}
        </p>
        {template.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {template.description}
          </p>
        )}
      </div>
      
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1.5 -right-1.5 bg-brand text-white rounded-full p-0.5"
        >
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
        </motion.div>
      )}
    </Card>
  );
}

/**
 * Compact version for inline use in chat messages
 */
export function InlineTemplateSelector({ templates, onSelect }: Omit<TemplateSelectorProps, 'selectedId'>) {
  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/20 dark:to-background border border-brand/20">
      <TemplateSelector templates={templates} onSelect={onSelect} />
    </Card>
  );
}
