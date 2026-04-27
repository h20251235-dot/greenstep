/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransportType = 
  | 'airplane' 
  | 'car' 
  | 'hybrid' 
  | 'bus' 
  | 'electric_car' 
  | 'train' 
  | 'scooter' 
  | 'walking';

export interface TransportOption {
  id: TransportType;
  label: string;
  emoji: string;
  emission: number; // g per km
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export const TRANSPORT_OPTIONS: TransportOption[] = [
  { id: 'airplane', label: '비행기', emoji: '✈️', emission: 250, grade: 'F' },
  { id: 'car', label: '승용차', emoji: '🚗', emission: 210, grade: 'F' },
  { id: 'hybrid', label: '하이브리드', emoji: '🚙', emission: 135, grade: 'C' },
  { id: 'bus', label: '버스', emoji: '🚌', emission: 70, grade: 'B' },
  { id: 'electric_car', label: '전기 승용차', emoji: '🔋', emission: 55, grade: 'B' },
  { id: 'train', label: '철도/지하철', emoji: '🚃', emission: 15, grade: 'A' },
  { id: 'scooter', label: '전동 킥보드', emoji: '🛴', emission: 20, grade: 'A' },
  { id: 'walking', label: '자전거/도보', emoji: '🚲', emission: 0, grade: 'A' },
];

export type GardenItemType = 'flower' | 'tree';

export interface GardenItem {
  id: string;
  type: GardenItemType;
  stage: number; // 0: Sprout, 1: Bud/Sapling, 2: Mature
  experience: number; // 0 - 100 for growth
  position: { x: number; y: number };
}

export interface GardenState {
  items: GardenItem[];
  carbonTotal: number;
  sunlight: number;
  water: number;
  smogLevel: number; // 0 - 100
  fConsecutive: number; // Consecutive F grade choices
}
