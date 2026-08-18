---
name: Ethos & Artistry
colors:
  surface: '#3C1B69'
  surface-dim: '#2A1350'
  surface-bright: '#4E2B8F'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#35175F'
  surface-container: '#402070'
  surface-container-high: '#5A349F'
  surface-container-highest: '#6B44B8'
  on-surface: '#EDE4F7'
  on-surface-variant: '#CBBBE0'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#A98FD4'
  outline-variant: '#8A75A8'
  surface-tint: '#C9A227'
  primary: '#C9A227'
  on-primary: '#ffffff'
  primary-container: '#4A2382'
  on-primary-container: '#EDE4F7'
  inverse-primary: '#E4C65B'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#53482c'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b5f42'
  on-tertiary-container: '#ebdab5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9ff4cc'
  primary-fixed-dim: '#83d7b1'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#005139'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#f2e1bb'
  tertiary-fixed-dim: '#d5c5a1'
  on-tertiary-fixed: '#231b04'
  on-tertiary-fixed-variant: '#51462a'
  background: '#3C1B69'
  on-background: '#EDE4F7'
  surface-variant: '#C6CEC8'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.7'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  section-padding-desktop: 120px
  section-padding-mobile: 64px
---

## Brand & Style
The design system embodies a synthesis of academic rigor and creative digital mastery. It is tailored for a dual-persona professional: an educator of Islamic sciences and a modern web designer. The aesthetic is **Sophisticated Modernism** with **Islamic Geometric influences**, prioritizing clarity, reverence, and premium craftsmanship.

The visual language balances the stability of tradition with the fluidity of modern web technology. Key stylistic pillars include:
- **Academic Elegance:** High-contrast serif typography and generous white space evoke the feeling of a premium publication or a curated gallery.
- **Glassmorphism:** Subtle translucent layers are used to represent the "digital" side of the portfolio, providing depth without clutter.
- **Geometric Precision:** Use of 8-point grids and subtle pattern overlays to nod to Islamic art's mathematical beauty.
- **Tactile Refinement:** Interactive elements utilize soft transitions and gold accents to signify "Excellence" (Ihsan).

## Colors
The palette is grounded in a scholarly "Deep Royal Purple" and accented with "Imperial Gold."

- **Primary (Brass Gold):** Reserved for primary branding, navigation headers, and authoritative UI elements. It signals premium quality and pairs naturally with the deep purple backdrop.
- **Gold & Dark Gold:** Used sparingly for calls to action, highlights, and active states to signal premium quality.
- **Background & Accents:** The deep royal purple `#3C1B69` background provides a rich, editorial backdrop that makes white cards and gold accents stand out. Deeper purple surface levels (`#2A1350`–`#35175F`) are used for headers, footers, and chips; the warm beige is used for subtle section separators or secondary container backgrounds.
- **Text:** Soft lavender `#EDE4F7` on dark purple surfaces ensures high legibility; inside white cards, dark text remains the standard.

## Typography
The typography strategy creates a clear hierarchy between the "Narrative" (Headings) and the "Information" (Body).

- **Headings:** `Playfair Display` provides an editorial, authoritative look. Use it for storytelling, section titles, and quotes.
- **Body & UI:** `Inter` is used for its exceptional legibility and neutral character, ensuring that dense educational content remains accessible.
- **Labels:** Small caps or increased letter spacing should be applied to labels to provide a sophisticated, architectural feel to the interface.

## Layout & Spacing
This design system utilizes a **Fixed Grid** approach for desktop to maintain a premium, composed look, transitioning to a fluid model for mobile.

- **Rhythm:** A strict 8px baseline grid governs all vertical spacing.
- **Sections:** Large vertical gaps (120px+) between major sections emphasize the "Generous Spacing" requirement, allowing content to breathe and commanding the user's focus.
- **Grid:** A 12-column grid on desktop with wide 24px gutters. For portfolio pieces, content should often be centered in an 8-column span to increase readability and perceived luxury.

## Elevation & Depth
Depth is handled through **Tonal Layers** and **Glassmorphism** rather than heavy shadows.

- **Surface Levels:** The primary background is the lowest level. Cards and containers sit on top with a very subtle, diffused shadow (Blur: 20px, Opacity: 4%, Color: Deep Purple).
- **Glassmorphism:** For navigation bars and overlay modals, use a backdrop blur of `12px` and a semi-transparent white fill (`rgba(255, 255, 255, 0.7)`).
- **Geometric Patterns:** Subtle SVG patterns of 8-point stars (Khatim) should be used as low-opacity watermarks (2-3% opacity) in the background of primary sections to provide texture without distracting from text.

## Shapes
The shape language is **Soft (0.25rem)**. While modern, the roundedness is kept minimal to maintain a sense of professional discipline and architectural structure. 

- **Cards & Inputs:** 4px (Soft) corner radius.
- **Buttons:** May use the same 4px radius or 8px (Large) to differentiate them from static containers.
- **Images:** Should feature sharp or very slightly softened corners to maintain the "Academic" feel of a printed book or portfolio.

## Components
- **Buttons:** 
  - *Primary:* Solid Brass Gold fill, white text. On hover, the background shifts to a deeper gold and a 2px bottom border in Gold appears.
  - *Secondary:* Transparent background, Gold border. On hover, fills with a light tint of Gold (`#EAD9B4`).
- **Cards:** 
  - Pure white background, 1px border in `#EAD9B4`.
  - Hover state: The border transitions to Gold, and the subtle shadow deepens slightly.
- **Input Fields:** 
  - Minimalist style. Underline-only or subtle 1px gray border. Focus state uses a Gold border and a faint Gold glow.
- **Chips/Tags:** 
  - Used for "Services" or "Subject Areas." Rounded-full (pill) with the Warm Beige background and Dark Purple text.
- **Interactive Patterns:**
  - Incorporate "Scroll-triggered" fade-ins for portfolio images to emphasize the "Smooth Animations" requirement.
  - Navigation links should have a subtle Gold underline that expands from the center on hover.