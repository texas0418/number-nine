// site/clues/index.ts — the archive, in broadcast order.

import type { ArchiveSection } from '../types';
import { B1 } from './b1';
import { B2 } from './b2';
import { B3 } from './b3';
import { B4 } from './b4';
import { B5 } from './b5';
import { B6 } from './b6';

export const SECTIONS: ArchiveSection[] = [B1, B2, B3, B4, B5, B6];
