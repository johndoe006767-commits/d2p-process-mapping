# Desktop sizing

The primary visual target is **3840 × 2160**. Desktop sizing is embedded in the website through `dist/anatomy-layout.js` and `dist/desktop-sizing.css`; no conversion script or build step is needed. It uses the proportional sizing and font-floor idea from the supplied `make_sizes_dynamic.py`, adapted to the site's separate 3D and process-map coordinate systems.

For desktop viewports at least 1024 CSS pixels wide, fit the existing 2560 × 1440 logical anatomy stage to the usable browser width and height. The scale is the smaller of width / 2560 and height / 1440. Center any spare space over the full-bleed background. At 3840 × 2160 the stage scale is 1.5. The earlier 3180 × 2160 monitor-specific 75% zoom is superseded by this continuous fit. Browser zoom remains under the user's control; monitor resolution and device pixel ratio do not determine layout.

Cards, organs, veins, process shortcuts and the support companion share the stage. Convert measured DOM rectangles and pointer coordinates back to logical coordinates for positioning and rotation. Render WebGL at the scaled display resolution, including when returning from a process map after resizing the window.

Keep the approved 4K composition and typography. On compact desktops, the overview cards tighten their spacing and anatomy text has a 9px displayed minimum, matching the supplied script. Account separately for the Executive Summary's existing 1.5× zoom. Summary and support content can scroll when needed. Process labels can move to nearby free space to clear larger text and shortcut targets without moving their anatomical attachment points. Layouts below 1024px retain their existing fallback; mobile optimization is outside this change.

The process workspace uses fluid desktop typography and control dimensions derived from the smaller viewport-to-4K ratio, with readable minimum sizes. Navigation can wrap. Its SVG nodes, text, edges and anchors remain in their existing shared viewBox: Fit Width, Readable and zoom still control the whole map. Information cards remain within the viewport and scroll for longer records. Do not scale SVG text independently of node geometry or apply another scale to the anatomy's contents.

Verification covers 3840 × 2160, 3180 × 2160, 2560 × 1440, the supplied script's 2552 × 1250 reference, 1920 × 1080, 1536 × 864, 1440 × 900, 1366 × 768, 1280 × 720, 1024 × 768, 1024 × 600, 3440 × 1440, 5120 × 1440 and a 1080 × 1920 portrait desktop. `tests/desktop-sizing.mjs` checks bounds, readable text floors, label clearance, window resizing, map navigation and information cards. The existing source browser check covers every tower and both map scenarios at 4K.

Dashboard and chatbot archives remain local and outside the served site. Organ materials, source process records and the As Is colour proportions are retained.
