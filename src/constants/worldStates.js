export const WORLD_STATES = {
  domesticated: {
    id: 'domesticated',
    name: 'DOMESTICATED',
    description: 'Modern life has caged you. The wild is forgotten. You move through concrete and noise, half-asleep.',
  },
  awakening: {
    id: 'awakening',
    name: 'AWAKENING',
    description: 'Something stirs beneath the surface. The first light of instinct returns. You remember what you were.',
  },
  primal: {
    id: 'primal',
    name: 'PRIMAL',
    description: 'You are becoming what you were. Fire in the chest. Strength in the limbs. The world responds to you.',
  },
  apex: {
    id: 'apex',
    name: 'APEX',
    description: 'Fully forged. Storms do not break you — they made you. This is the ancestral state. Hold it.',
  },
};

// Color per world state — used for progress bars and labels
export const STATE_COLORS = {
  domesticated: { fill: '#6B7280', dark: '#374151', border: 'rgba(107,114,128,0.4)' },
  awakening:    { fill: '#D97706', dark: '#92400E', border: 'rgba(217,119,6,0.4)'   },
  primal:       { fill: '#16A34A', dark: '#14532D', border: 'rgba(22,163,74,0.4)'   },
  apex:         { fill: '#0891B2', dark: '#164E63', border: 'rgba(8,145,178,0.4)'   },
};

// Progress band thresholds — mirrors getWorldState() in scoring.js
// nextKey is null for apex (max state); earlyUser cap is handled at call sites
export const STATE_BANDS = {
  domesticated: { min: 0,    max: 0.40, nextKey: 'awakening' },
  awakening:    { min: 0.40, max: 0.55, nextKey: 'primal'    },
  primal:       { min: 0.55, max: 0.80, nextKey: 'apex'      },
  apex:         { min: 0.80, max: 1.00, nextKey: null         },
};
