# Desktop anatomy sizing

Mode: Experience for the anatomy, Operate for the tower summaries and controls.

The approved desktop reference is 2560 × 1440. For viewports at least 2500px wide and 1200px tall, scale the entire anatomy composition proportionally to fit the available width and height. Center the remaining space over the existing full-bleed background. At 3840 × 2160 the scale is 1.5. On the requested 3180 × 2160 display, apply 75% application zoom after fitting: a 2385 × 1341.5625 composition, centered at 397.5px from the left and 409.21875px from the top. Detect either that viewport or that screen resolution, so browser chrome does not disable the preference. Preserve the user's browser zoom setting and existing smaller-screen fallbacks.

Cards, typography, process shortcuts, anatomy, veins and the support companion share the same logical coordinate space. Resolve their viewport-dependent dimensions against the reference stage. Convert measured DOM rectangles and pointer coordinates back to that space before positioning or interacting with the models. Render WebGL at the physical scaled resolution to preserve sharpness. The process-map workspace retains its existing layout.

This supersedes the earlier fixed 4K sizing for the anatomy view only. Preserve content, materials, colors, interactions and the local chatbot. Exclude chatbot files and entry points from publication.

Verified in Chrome at 2560 × 1440, 3180 × 2160 and 3840 × 2160: all eight overview cards and the Order to Cash summary match reference positions and dimensions after scale conversion within 0.01px, without horizontal overflow. Checked the nine-stage Commercial view, keyboard rotation, Billing shortcut, process-map return, support panel and overview return. Browser logs were clear. The chatbot, backend and anatomy material files remained unchanged.

Follow-up verification: confirmed the exact 75% stage dimensions at a 3180 × 2160 CSS viewport. The icon-only top-right button enters and exits document fullscreen from an active Chrome tab, updates its accessible name and pressed state, and provides a recoverable message if the browser rejects fullscreen. Return controls reserve its space. Existing process workspaces retain their layout apart from the button clearance.
