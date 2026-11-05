# Finance anatomy visual system

Optimize for a 3840 × 2160 desktop display. Preserve the existing anatomy composition, card layout, source content and navigation.

Desktop sizing follow-up: preserve the 3840 × 2160 composition while fitting the anatomy's 2560 × 1440 logical stage continuously across desktop viewports at least 1024px wide. At 3840 × 2160 the anatomy scale is 1.5. Center spare aspect-ratio space over the full-bleed background. Compact desktop typography has a 9px displayed floor and tighter card spacing. Process-map controls use fluid dimensions with readable minimums; SVG geometry and labels retain their shared zoom. `docs/anatomy-layout.md` records the embedded sizing, coordinate-space handling and browser verification. This supersedes the earlier large-screen-only sizing and monitor-specific zoom exception.

The top-right icon-only button toggles document fullscreen. The overview uses CAPEX, Controlling, FP&A Commercial and FP&A Operations; expanded names remain in Executive Summary. Give Manual Processes and Pain Points identical label, As Is subtitle and value styling, without the pain dot. Their overview typography also matches. These requests supersede the earlier expanded overview naming and pain treatment below.

## Colour

Retain the original purple interface, including the purple astral process-map background, surfaces, borders and scrollbars. The user reverted the Mulberry theme. Activity colors in the KPI cards and all process maps use Automated AZ Light Blue `#68d2df`, Semi AZ Gold `#f0ab00`, and Manual AZ Mulberry `#830051`. Apply the process-map palette to high-level bars, detailed activity markers, stage summaries and legends across all eight towers in both As Is and AI Suggested modes.

## Executive Summary cards — 2 November 2026

The expanded KPI card starts with Executive Summary at 24px effective size, the full tower name at 40px Bold, and the source acronym at 18px Semibold. The full-width title has room for both FP&A names; the acronym sits directly beneath the name, followed by the flow controls in a left-aligned row. Preserve the card width, position, background, scrolling behavior, process data, anatomy and navigation.

The visible acronym labels for the two FP&A towers read **FP&A Operations** and **FP&A Commercial** in the summary and insights navigation. Internal source keys and process identifiers remain `FPAO` and `FPAC` so source references stay intact.

Both overview cards and the expanded summary display the documented As Is pain-point count from `REAL[id].counts.pain`. The overview places `| Pain Points · count` after As Is; the expanded summary places it beside the manual percentage. Zero remains a numeric zero. Accessible card descriptions also include the count. All 2027 project labels read “2027 AI Suggested TPI.”

KPI legends align left with 7px padding and 7px between items at the 3840 × 2160 target. The expanded card compensates for its existing 1.5× zoom. Automated uses AZ Light Blue `#68d2df`, Semi uses AZ Gold `#f0ab00`, and Manual uses AZ Mulberry `#830051`, matching the supplied October 2024 brand palette. Legend dots and stack segments agree. Mulberry dots and bars have no white keyline, as requested.

Verified all eight overview counts against the source register, 4K viewport geometry, exact rendered legend gaps, the Order to Cash summary and 2027 tab, and the full FP&A Commercial name. No horizontal card overflow was found. The anatomy rendering modules remain unchanged.

Overview cards retain CAPEX, Controlling, FP&A Commercial and FP&A Operations; expanded names appear in Executive Summary. As Is and To Be remain on one line with aligned bars. The support companion is named “GFS Finance Operations Support,” and the summary dependency heading is “Key Inter Dependencies.”

## Anatomy materials — 2 November 2026

The user approved an interactive 3D interpretation of the astral concept images, then restricted the change to the organ models, connecting veins, and anatomy body. Preserve the original background, all interface styling, sizing, alignment, camera and interaction behavior. Do not apply the concept's mulberry background or recolor the cards and controls.

The anatomy uses transparent glass-like membranes, platinum skeletal highlights, bright branching signals and fine heart-to-organ connections. The material palette uses AZ Gold `#f0ab00`, Magenta `#d0006f`, Light Blue `#68d2df`, Lime `#c4d600`, platinum and violet highlights. Preserve the source mesh silhouettes and process anchors. These are interactive procedural interpretations, not pixel-identical copies of the generated images or new medical atlas data.

The original page markup and every existing stylesheet were restored byte-for-byte from `archives/backups/before-astral-20261102-084742/site.tar.gz`. The additional appearance control was removed to restore the original interface. The local source backup remains available. Material changes live in `dist/astral-anatomy.js`; the existing renderer retains its original canvas sizing and pixel ratio.

## Typography

Use the bundled Inter variable font for functional UI. At 4K, the KPI card's effective title is 40px Bold; section headings are 24px Regular; project names 22px Semibold; descriptions 20px with 30px leading; controls and legends 18px; KPI values 48px Bold with tabular numerals. These sizes account for the existing card scale. Keep existing process-map text fitting and geometry intact. Typography refinements live in `dist/typography.css`.

The overview has a centered “Demand to Profit” heading in locally hosted Lora Medium, with an italic “to,” and a short description in the same font. At 4K the assembled title is 64px and the description is 18px. As disassembly begins, reduce them to 44px and 16px, and constrain the text block to the measured space between the organs and cards, including movement clearance. Keep the description on one line directly below the title, with no added margin and tight line heights, so the entire introduction clears the skeleton. The 3D canvas, organs and KPI cards always render above the title. Hide the introduction in organ detail, process maps and the open helpdesk view.

The title has a diagnostic scan treatment: subtle registration brackets, a narrow exposure beam and an outlined copy of the letters. Each 4-second cycle has a roughly 2-second pass followed by a quiet hold. Only transforms and opacity animate; the underlying text stays stationary and readable. The duplicate is hidden from assistive technology. Pause the effect while the page is hidden or anatomy is loading, and use the static title for reduced motion and keyboard interaction.

When switching between assembled and disassembled title sizes, fade the title and description to 35% opacity over 80ms, swap sizes, then restore opacity over 160ms. Use interruptible opacity transitions; rapid reversals cancel a pending size swap. Keyboard input and reduced motion switch sizes immediately without this fade.

## Logo

Keep the user-supplied `dist/assets/astrazeneca-logo.png` unchanged, in its original colours with a transparent background. Do not add a backing panel or apply the previous white logo filter.

Align the logo at the top left with 10px padding. Keep its layer behind the anatomy interface and all KPI cards.

## Overview spacing and fullscreen refinement

The scaled desktop cards retain their 440px logical width with 24px padding. Use 12px between the title, metrics, activity mix and TPI group; 8px around comparison rows; and 4px between TPI rows. The project tabs read “2026 TPI” and “2027 AI Suggested TPI.” The fullscreen control has no visible container and retains its hit area and keyboard focus indicator.

## As Is organ colours and dashboard archive — 5 November 2026

This refinement supersedes fixed organ signal colours. Preserve the existing glass membranes, mesh silhouettes, branching geometry, glow, lighting, movement and interface. O2C uses the existing liver model; CAPEX uses the existing intestines model. All other organ designs stay the same.

Use the As Is activity bar palette for neurons: Automated `#68d2df`, Semi `#f0ab00`, Manual `#830051` (manual red/mulberry). Allocate neuron colours proportionally from each tower's As Is counts, including the larger process-neuron connections. Use the manual proportion to cover the membrane in mulberry, blending over a narrow boundary into a white base. Calibrate the boundary against surface area rather than bounding-box height. A 12/14 manual Controlling mix therefore yields approximately 86% manual-coloured membrane and 14% white. Keep the colour field attached to the organ during rotation. As Is remains authoritative even when a process map switches to AI Suggested.

The full tower dashboard and every navigation section, including AI Suggestions, are archived beside the existing chatbot archive and removed locally. Dependencies stay as non-interactive text in the summary. Retain the high-level/detailed process maps, their scenarios and annual project summaries. Verification targets the existing 3840 × 2160 desktop display.

Latest colour follow-up: all eight tower organs use a white `#ffffff` base membrane with the existing As Is manual-mulberry gradient and proportional neuron colours. This supersedes the earlier individual organ base colours, including Controlling's purple. All glass materials, geometry, lighting and interface styling remain unchanged.
