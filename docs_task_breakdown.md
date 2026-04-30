# Implementation Task Breakdown (v0.3)

## P0 Scope (Completed)
- [x] Replace key-shape heuristic with pattern overlap matcher and threshold score.
- [x] Add fail-state traps (spike collision death).
- [x] Improve Stage 3 progression readability (hint + shape score HUD).

## Milestone 1: Core Loop
- [x] T1 Create render/update loop (60fps target)
- [x] T2 Implement player movement + gravity + jump
- [x] T3 Implement tile collisions and floor detection
- [x] T4 Add HUD baseline

## Milestone 2: Light & Shadow
- [x] T5 Implement controllable spotlight parameters (angle/range)
- [x] T6 Add lock/unlock state and lock-limit behavior
- [x] T7 Implement shadow projection to grid
- [x] T8 Convert projected shadow cells into temporary solid cells

## Milestone 3: Puzzle Elements
- [x] T9 Add key pickup and goal door unlock
- [x] T10 Add shadow switch sensor with threshold timer
- [x] T11 Add Stage 3 key-shape gate (pattern threshold)
- [x] T12 Add checkpoint respawn system
- [x] T13 Add trap collision fail-state

## Milestone 4: Stage Content
- [x] T14 Build Stage 1 tutorial path
- [x] T15 Build Stage 2 lock-order puzzle
- [x] T16 Build Stage 3 advanced puzzle shell
- [x] T17 Stage-level hints in HUD

## Milestone 5: QA / Tuning
- [x] T18 Add automated smoke tests (Playwright)
- [x] T19 Add reset regression smoke test
- [x] T20 Re-run test-play workflow after gameplay updates

## Immediate Next Tasks
1. Replace brute-force shadow overlap checks with cached grid lookups.
2. Add checkpoint activation VFX/SE and trap animation.
3. Add stage clear metrics per-stage (time/deaths) and summary screen.
