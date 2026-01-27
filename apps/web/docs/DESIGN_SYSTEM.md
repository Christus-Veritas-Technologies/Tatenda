# Tatenda Design System

## Overview

The Tatenda design system establishes a consistent visual language across the platform. It defines color palettes, typography, and usage guidelines to ensure a cohesive and professional user experience.

---

## Typography

### Primary Font: Poppins

**Poppins** is the primary font used throughout the Tatenda application. It is a modern, geometric sans-serif typeface that is:
- Clean and readable
- Professional and friendly
- Well-suited for both headers and body text
- Available in multiple weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)

The font is automatically imported from Google Fonts and applied globally to the application.

```css
font-family: "Poppins", sans-serif;
```

---

## Color Palette

The Tatenda color palette consists of 6 primary colors designed to work harmoniously in light and dark modes.

### Brand Colors

| Color Name | Hex Value | CSS Variable | Usage |
|-----------|-----------|--------------|-------|
| **BRAND** | `#7148FC` | `--color-brand` | Primary interactive elements, buttons, accents |
| **DARKEST** | `#0C121C` | `--color-darkest` | Text on light backgrounds, dark mode background |
| **DARK** | `#1E293B` | `--color-dark` | Secondary text, dark mode card backgrounds |
| **MID** | `#B8BFC6` | `--color-mid` | Muted text, borders, subtle elements |
| **LIGHT** | `#D6DEE7` | `--color-light` | Light backgrounds, light borders |
| **LIGHTEST** | `#FFFFFF` | `--color-lightest` | Light mode background, light mode cards, text on dark |

---

## Using Colors in Components

### CSS Variables

All colors are defined as CSS variables and can be used directly in your stylesheets:

```css
.button-primary {
  background-color: var(--color-brand);
  color: var(--color-lightest);
}

.button-secondary {
  background-color: var(--color-light);
  color: var(--color-darkest);
}

.text-muted {
  color: var(--color-mid);
}
```

### Tailwind CSS Classes

The colors are integrated into TailwindCSS and can be used via utility classes:

```html
<!-- Background colors -->
<div class="bg-primary">Brand background</div>
<div class="bg-secondary">Light background</div>
<div class="bg-muted">Muted background</div>

<!-- Text colors -->
<p class="text-foreground">Default text</p>
<p class="text-muted-foreground">Muted text</p>
<p class="text-accent">Accent text</p>

<!-- Border colors -->
<div class="border border-border">Bordered element</div>
```

### React/TypeScript Components

When building components with shadcn/ui or custom components:

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Dashboard() {
  return (
    <Card className="bg-card border-border">
      <h1 className="text-foreground font-semibold text-lg">Welcome</h1>
      <p className="text-muted-foreground">Subtitle goes here</p>
      <Button className="bg-primary text-primary-foreground">
        Take Action
      </Button>
    </Card>
  );
}
```

---

## Color Applications by Component Type

### Buttons

**Primary Button:**
- Background: `bg-primary` (#7148FC)
- Text: `text-primary-foreground` (#FFFFFF)
- Hover State: Darker shade of brand

**Secondary Button:**
- Background: `bg-secondary` (#D6DEE7 light mode, #1E293B dark mode)
- Text: `text-secondary-foreground` (#0C121C light mode, #FFFFFF dark mode)

**Muted Button:**
- Background: `bg-muted` (#D6DEE7 light mode, #1E293B dark mode)
- Text: `text-muted-foreground` (#B8BFC6)

### Cards & Containers

- Background: `bg-card` (white in light mode, #1E293B in dark mode)
- Border: `border-border` (#D6DEE7 light mode, rgba(255,255,255,0.1) dark mode)
- Text: `text-foreground` (#0C121C light mode, #FFFFFF dark mode)

### Form Inputs

- Background: `bg-input` (#D6DEE7 light mode, rgba(255,255,255,0.15) dark mode)
- Border: `border-input` (same as background)
- Ring (focus): `ring-brand` (#7148FC)
- Text: `text-foreground`

### Navigation & Sidebar

- Background: `bg-sidebar` (white in light mode, #1E293B in dark mode)
- Text: `text-sidebar-foreground`
- Active/Hover: `bg-sidebar-primary` (#7148FC)

### Text Elements

**Primary Text:**
```html
<p class="text-foreground">Main content text</p>
```

**Secondary Text:**
```html
<p class="text-muted-foreground">Supporting text or labels</p>
```

**Accent Text:**
```html
<span class="text-accent">Important or highlighted text</span>
```

---

## Light Mode vs Dark Mode

### Light Mode (Default)

| Element | Color | Hex |
|---------|-------|-----|
| Background | LIGHTEST | #FFFFFF |
| Text | DARKEST | #0C121C |
| Cards | LIGHTEST | #FFFFFF |
| Borders | LIGHT | #D6DEE7 |
| Primary Actions | BRAND | #7148FC |

### Dark Mode

Automatically applied when the `.dark` class is present on the root element.

| Element | Color | Hex |
|---------|-------|-----|
| Background | DARKEST | #0C121C |
| Text | LIGHTEST | #FFFFFF |
| Cards | DARK | #1E293B |
| Borders | rgba(255,255,255,0.1) | Translucent white |
| Primary Actions | BRAND | #7148FC |

---

## Practical Examples

### Example 1: Sign Up Form

```tsx
export function SignUpForm() {
  return (
    <Card className="bg-card border border-border">
      <div className="space-y-4">
        <h2 className="text-foreground font-bold text-2xl">Create Account</h2>
        <p className="text-muted-foreground">Join Tatenda today</p>
        
        <Input 
          className="bg-input border-border text-foreground"
          placeholder="Enter your email"
        />
        
        <Button className="w-full bg-primary text-primary-foreground">
          Sign Up
        </Button>
        
        <p className="text-sm text-muted-foreground">
          Already have an account? <a href="#" className="text-accent">Log in</a>
        </p>
      </div>
    </Card>
  );
}
```

### Example 2: Dashboard Header

```tsx
export function DashboardHeader() {
  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between p-6">
        <h1 className="text-foreground text-2xl font-bold">Dashboard</h1>
        <button className="px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90">
          Export
        </button>
      </div>
    </header>
  );
}
```

### Example 3: Alert/Notification

```tsx
export function Alert() {
  return (
    <div className="bg-secondary border border-border rounded-lg p-4">
      <p className="text-foreground font-semibold">Info</p>
      <p className="text-muted-foreground text-sm mt-1">
        Your project has been saved successfully
      </p>
    </div>
  );
}
```

---

## Best Practices

1. **Use CSS Variables**: Always use the CSS variables or TailwindCSS utility classes instead of hardcoding hex values. This ensures consistency and makes theme updates easier.

2. **Respect Contrast**: Ensure sufficient contrast between text and background colors for accessibility (WCAG AA standard minimum).

3. **Dark Mode Ready**: When adding custom styles, always consider how they will appear in dark mode. Test both modes.

4. **Semantic Color Usage**:
   - Use `primary` for main actions and CTAs
   - Use `secondary` for alternative actions
   - Use `muted` for less important elements
   - Use `destructive` for delete/warning actions

5. **Spacing & Colors**: Combine colors with proper spacing to create visual hierarchy. Don't rely solely on color to distinguish elements.

6. **Accessibility**: 
   - Avoid using color alone to convey information
   - Ensure text has sufficient contrast with its background
   - Test with accessibility tools

---

## Modifying the Design System

If you need to update colors, fonts, or other design tokens:

1. Edit `src/index.css` in the web app
2. Update the CSS variables in the `:root` and `.dark` selectors
3. Test both light and dark modes thoroughly
4. Update this documentation

For major changes, consider creating a new design token file and importing it separately to maintain organization.

---

## Resources

- [TailwindCSS Documentation](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)
- [WCAG Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum)
