export const PILLARS = [
  {
    key: 'sun',
    label: 'Sunlight',
    emoji: '☀️',
    unlockElement: 'golden_horizon',
    upgradeElement: 'sun_circle',
  },
  {
    key: 'nourishment',
    label: 'Nourishment',
    emoji: '🥩',
    unlockElement: 'fire_pit',
    upgradeElement: 'hunt_camp',
  },
  {
    key: 'movement',
    label: 'Movement',
    emoji: '💪',
    unlockElement: 'stone_grounds',
    upgradeElement: 'warrior_arena',
  },
  {
    key: 'sleep',
    label: 'Sleep',
    emoji: '😴',
    unlockElement: 'stars_full',
    upgradeElement: 'aurora',
  },
  {
    key: 'cold',
    label: 'Cold Exposure',
    emoji: '❄️',
    unlockElement: 'stream',
    upgradeElement: 'waterfall',
  },
  {
    key: 'grounding',
    label: 'Grounding',
    emoji: '🌿',
    unlockElement: 'soil_grass',
    upgradeElement: 'oak_tree',
  },
  {
    key: 'hydration',
    label: 'Hydration',
    emoji: '💧',
    unlockElement: 'morning_mist',
    upgradeElement: 'river',
  },
];

export const PILLAR_KEYS = PILLARS.map(p => p.key);

export const EMPTY_LOG = Object.fromEntries(PILLAR_KEYS.map(k => [k, 0]));
