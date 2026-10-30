# Finance anatomy visual system

Optimize for a 3840 × 2160 desktop display. Preserve the existing anatomy composition, card layout, source content and navigation.

## Colour

Retain the original purple interface, including the purple astral process-map background, activity colours, surfaces, borders and scrollbars. The user reverted the Mulberry theme. Keep colour definitions in the existing component styles and renderer modules; do not introduce a replacement palette.

## Typography

Use the bundled Inter variable font for functional UI. At 4K, the KPI card's effective title is 40px Bold; section headings are 24px Regular; project names 22px Semibold; descriptions 20px with 30px leading; controls and legends 18px; KPI values 48px Bold with tabular numerals. These sizes account for the existing card scale. Keep existing process-map text fitting and geometry intact. Typography refinements live in `dist/typography.css`.

The overview has a centered “Demand to Profit” heading in locally hosted Lora Medium, with an italic “to,” and a short Inter description. At 4K the assembled title is 64px and the description is 22px. As disassembly begins, reduce them to 44px and 18px and constrain the text block to the measured space between the organs and cards, including movement clearance. The 3D canvas, organs and KPI cards always render above the title. Hide the introduction in organ detail, process maps and the open helpdesk view.

The title has a diagnostic scan treatment: subtle registration brackets, a narrow exposure beam and an outlined copy of the letters. Each 12-second cycle has a roughly 2-second pass followed by a quiet hold. Only transforms and opacity animate; the underlying text stays stationary and readable. The duplicate is hidden from assistive technology. Pause the effect while the page is hidden or anatomy is loading, and use the static title for reduced motion and keyboard interaction.

## Logo

Keep the user-supplied `dist/assets/astrazeneca-logo.png` unchanged, in its original colours with a transparent background. Do not add a backing panel or apply the previous white logo filter.

Align the logo at the top left with 10px padding. Keep its layer behind the anatomy interface and all KPI cards.
