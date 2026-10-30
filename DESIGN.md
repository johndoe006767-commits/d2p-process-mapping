# Finance anatomy visual system

Optimize for a 3840 × 2160 desktop display. Preserve the existing anatomy composition, card layout, source content and navigation.

## Colour

Retain the original purple interface, including the purple astral process-map background, activity colours, surfaces, borders and scrollbars. The user reverted the Mulberry theme. Keep colour definitions in the existing component styles and renderer modules; do not introduce a replacement palette.

## Typography

Use the bundled Inter variable font for functional UI. At 4K, the KPI card's effective title is 40px Bold; section headings are 24px Regular; project names 22px Semibold; descriptions 20px with 30px leading; controls and legends 18px; KPI values 48px Bold with tabular numerals. These sizes account for the existing card scale. Keep existing process-map text fitting and geometry intact. Typography refinements live in `dist/typography.css`.

## Logo

Keep the user-supplied `dist/assets/astrazeneca-logo.png` unchanged, in its original colours with a transparent background. Do not add a backing panel or apply the previous white logo filter.
