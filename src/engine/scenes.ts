// src/engine/scenes.ts
// Image registry. require() needs static literal paths, so every backdrop and
// object plate is listed here and referenced elsewhere by its SceneId key.
// All assets ship in the bundle (offline-first). PLACEHOLDER ART — real 1963
// grayscale interiors/objects are a pre-ship task; see scripts/gen-scenes-sfx.py.

import type { SceneId } from '../models';

export const SCENES: Record<SceneId, number> = {
  hall: require('../../assets/scenes/hall.jpg'),
  study: require('../../assets/scenes/study.jpg'),
  cellar: require('../../assets/scenes/cellar.jpg'),
  // B2 (placeholder-grade until real art lands; scripts/gen-b2-scenes.py)
  marsh: require('../../assets/scenes/marsh.jpg'),
  // B3 (placeholders; scripts/gen-b3-scenes.py)
  churchyard: require('../../assets/scenes/churchyard.jpg'),
  'obj-valve': require('../../assets/scenes/obj-valve.jpg'),
  'obj-grave': require('../../assets/scenes/obj-grave.jpg'),
  'obj-receiver': require('../../assets/scenes/obj-receiver.jpg'),
  'obj-telephone': require('../../assets/scenes/obj-telephone.jpg'),
  'obj-logbook': require('../../assets/scenes/obj-logbook.jpg'),
  'obj-safe': require('../../assets/scenes/obj-safe.jpg'),
  'obj-letter': require('../../assets/scenes/obj-letter.jpg'),
  'obj-cards': require('../../assets/scenes/obj-cards.jpg'),
  'obj-clock': require('../../assets/scenes/obj-clock.jpg'),
  'obj-compass': require('../../assets/scenes/obj-compass.jpg'),
  'obj-mast': require('../../assets/scenes/obj-mast.jpg'),
  'obj-key': require('../../assets/scenes/obj-key.jpg'),
};

/** Room backdrops (full-screen ambient), distinct from object plates. */
export const isBackdrop = (id: SceneId): boolean =>
  id === 'hall' || id === 'study' || id === 'cellar' || id === 'marsh' || id === 'churchyard';
