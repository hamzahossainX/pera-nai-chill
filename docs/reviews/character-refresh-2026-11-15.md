# Two-character visual review — 2026-11-15

Scope: chaser and default Phone Snatcher, layered SVG art and presentation-only rig changes.

Before: previous face-visibility captures and user screenshots show oversized limbs/hands, cramped torso, and mismatched artwork. Source inspection identified fallback texture precedence and missing logical display sizing.

Round 1: green/gold chaser and navy/amber villain kits plus normalized anchors eliminate the pile of overlapping body parts. Gameplay captures at desktop/tablet/landscape phone demonstrate connected arms/legs. Finding: default chaser face still lacks the new kit's visual detail.

Final: added a shaded haircut, eyebrows, nose and smile; captured six running frames per viewport plus desktop punch/kick/jump. Reviewed desktop full-health/kick and phone run images. Face upload remains readable on villain.

Fallback: blocked the two artwork directories in a separate browser context; all three viewports still launch using procedural textures with normalized sizing. Desktop fallback image inspected.

Evidence: docs/screens/character-refresh-2026-11-15/{round-1,final,fallback}/. These are live browser smoke/visual checks, not deterministic pose-sheet metrics. No FPS/independent numerical design score claimed. The large legacy HUD and missing full attack/death/trip pose review remain limitations; full V2-07/08/09 acceptance stays open.
