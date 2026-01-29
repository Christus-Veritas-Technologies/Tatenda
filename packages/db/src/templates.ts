/**
 * Default Project Templates
 * 
 * These templates define different visual styles for ZIMSEC project PDFs.
 * Each template has a unique color scheme and structural formatting.
 */

export interface TemplateColorScheme {
  primary: string;      // Main brand/accent color
  secondary: string;    // Secondary accent
  heading: string;      // Section heading color
  text: string;         // Body text color
  muted: string;        // Muted/subtitle text
  background: string;   // Section background
  divider: string;      // Line dividers
}

export interface TemplateStructure {
  headerStyle: 'centered' | 'left-aligned' | 'boxed';
  sectionStyle: 'bar' | 'underline' | 'boxed' | 'minimal';
  bulletStyle: 'disc' | 'square' | 'dash' | 'arrow';
  dividerStyle: 'line' | 'double' | 'dashed' | 'none';
  fontFamily: 'times' | 'helvetica' | 'courier';
  titleSize: number;
  headingSize: number;
  bodySize: number;
}

export interface DefaultTemplate {
  id: string;
  name: string;
  description: string;
  colorScheme: TemplateColorScheme;
  structure: TemplateStructure;
  previewColor: string; // For card display
}

export const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  {
    id: 'tpl_classic_professional',
    name: 'Classic Professional',
    description: 'Traditional academic style with purple accents. Clean and formal.',
    previewColor: '#7148FC',
    colorScheme: {
      primary: '#7148FC',     // Brand purple
      secondary: '#9B7EFC',
      heading: '#1a1a1a',
      text: '#333333',
      muted: '#666666',
      background: '#F5F3FF',
      divider: '#E5E5E5',
    },
    structure: {
      headerStyle: 'centered',
      sectionStyle: 'bar',
      bulletStyle: 'disc',
      dividerStyle: 'line',
      fontFamily: 'times',
      titleSize: 22,
      headingSize: 14,
      bodySize: 11,
    },
  },
  {
    id: 'tpl_modern_minimal',
    name: 'Modern Minimal',
    description: 'Clean, minimalist design with teal accents. Contemporary feel.',
    previewColor: '#0D9488',
    colorScheme: {
      primary: '#0D9488',     // Teal
      secondary: '#14B8A6',
      heading: '#0F172A',
      text: '#334155',
      muted: '#64748B',
      background: '#F0FDFA',
      divider: '#E2E8F0',
    },
    structure: {
      headerStyle: 'left-aligned',
      sectionStyle: 'underline',
      bulletStyle: 'dash',
      dividerStyle: 'dashed',
      fontFamily: 'helvetica',
      titleSize: 20,
      headingSize: 13,
      bodySize: 10,
    },
  },
  {
    id: 'tpl_bold_academic',
    name: 'Bold Academic',
    description: 'Strong, structured layout with blue accents. Serious and impactful.',
    previewColor: '#2563EB',
    colorScheme: {
      primary: '#2563EB',     // Blue
      secondary: '#3B82F6',
      heading: '#111827',
      text: '#1F2937',
      muted: '#6B7280',
      background: '#EFF6FF',
      divider: '#D1D5DB',
    },
    structure: {
      headerStyle: 'boxed',
      sectionStyle: 'boxed',
      bulletStyle: 'square',
      dividerStyle: 'double',
      fontFamily: 'times',
      titleSize: 24,
      headingSize: 14,
      bodySize: 11,
    },
  },
  {
    id: 'tpl_elegant_rust',
    name: 'Elegant Earth',
    description: 'Warm, earthy tones with rust accents. Sophisticated and grounded.',
    previewColor: '#B45309',
    colorScheme: {
      primary: '#B45309',     // Amber/Rust
      secondary: '#D97706',
      heading: '#292524',
      text: '#44403C',
      muted: '#78716C',
      background: '#FFFBEB',
      divider: '#D6D3D1',
    },
    structure: {
      headerStyle: 'centered',
      sectionStyle: 'underline',
      bulletStyle: 'arrow',
      dividerStyle: 'line',
      fontFamily: 'times',
      titleSize: 22,
      headingSize: 14,
      bodySize: 11,
    },
  },
  {
    id: 'tpl_vibrant_green',
    name: 'Fresh & Vibrant',
    description: 'Energetic green theme. Perfect for Agriculture and Science projects.',
    previewColor: '#16A34A',
    colorScheme: {
      primary: '#16A34A',     // Green
      secondary: '#22C55E',
      heading: '#14532D',
      text: '#166534',
      muted: '#4D7C0F',
      background: '#F0FDF4',
      divider: '#BBF7D0',
    },
    structure: {
      headerStyle: 'left-aligned',
      sectionStyle: 'bar',
      bulletStyle: 'disc',
      dividerStyle: 'line',
      fontFamily: 'helvetica',
      titleSize: 20,
      headingSize: 13,
      bodySize: 11,
    },
  },
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): DefaultTemplate | undefined {
  return DEFAULT_TEMPLATES.find(t => t.id === id);
}

/**
 * Get the default template (first one)
 */
export function getDefaultTemplate(): DefaultTemplate {
  return DEFAULT_TEMPLATES[0]!;
}
