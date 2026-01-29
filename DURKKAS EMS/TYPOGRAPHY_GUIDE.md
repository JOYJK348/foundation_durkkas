# Premium Typography System

## Font Stack

### Primary Font: **Inter**
- **Usage**: Body text, UI elements, buttons, forms
- **Weights**: 300, 400, 500, 600, 700, 800
- **Characteristics**: Clean, professional, highly readable
- **Best for**: All body content, descriptions, paragraphs

### Display Font: **Plus Jakarta Sans**
- **Usage**: Headings (h1-h6), titles, hero text, brand names
- **Weights**: 400, 500, 600, 700, 800
- **Characteristics**: Modern, premium, geometric
- **Best for**: Headings, large text, CTAs, navigation

## Typography Scale

### Headings
- **H1**: `text-4xl md:text-5xl lg:text-6xl` | `font-display font-extrabold tracking-tight`
- **H2**: `text-3xl md:text-4xl` | `font-display font-bold tracking-tight`
- **H3**: `text-2xl md:text-3xl` | `font-display font-semibold tracking-tight`
- **H4**: `text-xl md:text-2xl` | `font-display font-semibold`
- **H5**: `text-lg md:text-xl` | `font-display font-semibold`
- **H6**: `text-base md:text-lg` | `font-display font-semibold`

### Body Text
- **Large**: `text-lg` | `leading-relaxed`
- **Base**: `text-base` | `leading-relaxed`
- **Small**: `text-sm` | `leading-relaxed`
- **Extra Small**: `text-xs` | `leading-normal`

## Font Weights

- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Extrabold**: 800

## Letter Spacing

- **Tighter**: -0.05em (for large headings)
- **Tight**: -0.025em (for headings)
- **Normal**: 0em (for body text)
- **Wide**: 0.025em (for small caps)
- **Wider**: 0.05em (for labels)

## Line Heights

- **Tight**: 1.25 (for headings)
- **Normal**: 1.5 (for body text)
- **Relaxed**: 1.625 (for comfortable reading)
- **Loose**: 2 (for large text blocks)

## Utility Classes

### Display Text
```tsx
className="font-display font-extrabold tracking-tight"
```

### Heading Text
```tsx
className="font-display font-bold tracking-tight"
```

### Body Text
```tsx
className="font-sans leading-relaxed"
```

### Caption Text
```tsx
className="text-sm font-medium tracking-wide"
```

## Best Practices

1. **Headings**: Always use `font-display` (Plus Jakarta Sans)
2. **Body**: Always use `font-sans` (Inter) - default
3. **Buttons**: Use `font-semibold` for better readability
4. **Line Height**: Use `leading-relaxed` for body text
5. **Letter Spacing**: Use negative tracking for large headings
6. **Mobile**: Ensure text scales properly with responsive classes

## Implementation

All typography is automatically applied through:
- Global CSS styles for h1-h6
- Tailwind config with custom font families
- Component-level classes for specific use cases

## Examples

### Hero Heading
```tsx
<h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight">
  Learn. Upgrade. Achieve
</h1>
```

### Section Heading
```tsx
<h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
  Our Courses
</h2>
```

### Body Text
```tsx
<p className="text-base leading-relaxed text-muted-foreground">
  Description text here
</p>
```

### Button Text
```tsx
<Button className="font-semibold tracking-wide">
  Click Me
</Button>
```

