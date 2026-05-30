# Retouch Studio AI Product Direction

Retouch Studio AI repositions the original image playground as an AI native production workspace for commercial retouchers, photographers, art directors, and visual designers.

## Target users

- Commercial retouchers handling product, beauty, fashion, and campaign imagery.
- Designers who need controlled variants for e-commerce, social, packaging, and brand review.
- Art directors who review before/after proofs, style consistency, and client-safe exports.

## Pain points

- Prompt-only generation loses professional context: mask intent, protected areas, references, and client notes are scattered.
- Traditional image editors are precise but slow for repetitive cleanup, fill, shadow, background, and color-match work.
- AI tools often overwrite identity, product geometry, labels, texture, or lighting unless constraints are visible and reusable.
- Batch variants are hard to compare, name, and hand off with enough provenance.
- Review cycles require before/after proofing, prompt history, export presets, and stable client-ready outputs.

## Product principles

- Canvas first: the central object is always the image, before/after compare, mask overlay, crop guides, and zoom.
- Non-destructive by default: AI actions appear as reviewable layers or edit passes, not anonymous one-off outputs.
- Brief-driven: the bottom composer is an AI edit brief with reference mentions, not a generic chat box.
- Production metadata matters: model, size, quality, output format, prompt revisions, and export proof state remain visible.
- Fast variant work: users can stage batch variants, reuse prompts, and compare outputs without leaving the workspace.

## Core workflow

1. Import or paste references into the reference board.
2. Mark a mask or select a protected object/area.
3. Write an AI edit brief or choose a preset such as cleanup, generative fill, shadow, or color match.
4. Generate one or several variants.
5. Review before/after split, inspect the edit stack, and compare proof states.
6. Export master files, review images, and the prompt/edit log.

## UI changes in this prototype

- Renamed the app surface to `Retouch Studio AI`.
- Added a professional dark editor workspace with tool rail, reference board, canvas, right inspector, and bottom AI edit brief.
- Added before/after split preview, mask overlay, safe crop guide, compare and zoom sliders.
- Added inspector tabs for `Retouch`, `AI Brief`, `Layers`, and `Export`.
- Added prompt presets that write into the existing input composer.
- Added a batch variant action that stages high quality PNG output with `n=4`.
- Kept the original API configuration, image upload, mask editor, history grid, Agent mode, local IndexedDB storage, and export behavior intact.

## Next implementation priorities

- Bind the reference board to real `inputImages` and recent gallery outputs.
- Promote generated tasks into explicit edit passes with layer names, status, and before/after pairing.
- Add mask-aware controls for protected area, edge guard, texture retention, and object lock.
- Add client proof export bundles: final image, before/after sheet, prompt log, API parameters, and revision notes.
- Add keyboard workflows for professional use: quick compare, next variant, toggle mask, reject/approve, and export.
