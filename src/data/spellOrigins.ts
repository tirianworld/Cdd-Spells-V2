import React from 'react';
import {
  Flame,
  Sun,
  Wind,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { SpellOrigin } from '../types';

export interface OriginInfo {
  id: SpellOrigin;
  name: SpellOrigin;
  nameEn: string;
  icon: LucideIcon;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  accentGlow: string;
  description: string;
  descriptionEn: string;
}

export const ALL_SPELL_ORIGINS: SpellOrigin[] = [
  'Infernal',
  'Celestial',
  'Elemental',
  'Feérica',
];

export const SPELL_ORIGIN_OPTIONS: OriginInfo[] = [
  {
    id: 'Infernal',
    name: 'Infernal',
    nameEn: 'Infernal',
    icon: Flame,
    color: '#ef4444',
    textColor: 'text-red-400',
    bgColor: 'bg-red-950/40',
    borderColor: 'border-red-500/40',
    accentGlow: 'rgba(239, 68, 68, 0.4)',
    description: 'Poderes de los Nueve Infiernos y el Abismo: fuego infernal, demonios, diablos, azufre, pactos oscuros y tormento.',
    descriptionEn: 'Powers of the Nine Hells and the Abyss: hellfire, fiends, brimstone, dark pacts and torment.',
  },
  {
    id: 'Celestial',
    name: 'Celestial',
    nameEn: 'Celestial',
    icon: Sun,
    color: '#facc15',
    textColor: 'text-yellow-300',
    bgColor: 'bg-yellow-950/40',
    borderColor: 'border-yellow-500/40',
    accentGlow: 'rgba(250, 204, 21, 0.4)',
    description: 'Luz sacra de los Planos Superiores: huestes celestiales, bendición divina, resplandor solar y milagros de curación.',
    descriptionEn: 'Sacred light of Upper Planes: celestial hosts, divine blessing, solar radiance and healing miracles.',
  },
  {
    id: 'Elemental',
    name: 'Elemental',
    nameEn: 'Elemental',
    icon: Wind,
    color: '#06b6d4',
    textColor: 'text-cyan-400',
    bgColor: 'bg-cyan-950/40',
    borderColor: 'border-cyan-500/40',
    accentGlow: 'rgba(6, 182, 212, 0.4)',
    description: 'Fuerzas puras de los Planos Elementales: fuego, frío/hielo, relámpagos, trueno, tierra/piedra, viento/aire y agua.',
    descriptionEn: 'Pure forces of Elemental Planes: fire, cold/ice, lightning, thunder, earth/stone, wind/air and water.',
  },
  {
    id: 'Feérica',
    name: 'Feérica',
    nameEn: 'Fey',
    icon: Sparkles,
    color: '#10b981',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/40',
    accentGlow: 'rgba(16, 185, 129, 0.4)',
    description: 'Magia salvaje y caprichosa del Feywild: encantos feéricos, hadas, naturaleza primordial, sueño, risa, metamorfosis y niebla.',
    descriptionEn: 'Wild and whimsical Feywild magic: faerie glamour, fey, primal nature, slumber, laughter, shapeshifting and mists.',
  },
];

export const SPELL_ORIGINS = SPELL_ORIGIN_OPTIONS;

export const ORIGIN_MAP: Record<string, OriginInfo> = {
  Infernal: SPELL_ORIGIN_OPTIONS[0],
  Celestial: SPELL_ORIGIN_OPTIONS[1],
  Elemental: SPELL_ORIGIN_OPTIONS[2],
  Feérica: SPELL_ORIGIN_OPTIONS[3],
  Feérico: SPELL_ORIGIN_OPTIONS[3], // Alias
};

// Verified canonical IDs from official compendium without cross-contamination
const INFERNAL_SPELL_IDS = new Set([
  'xphb-arms-of-hadar',
  'xphb-hunger-of-hadar',
  'hellish-rebuke',
  'xge-infernal-calling',
  'xge-summon-lesser-demons',
  'xge-summon-greater-demon',
  'finger-of-death',
  'vampiric-touch',
  'circle-of-death',
  'harm',
  'inflict-wounds',
  'bestow-curse',
  'hex',
  'xphb-crown-of-madness',
  'xge-soul-cage',
  'ray-of-sickness',
  'ray-of-enfeeblement',
  'blight',
  'eyebite',
  'xge-danse-macabre',
  'xge-negative-energy-flood',
  'xge-enervation',
  'xphb-summon-fiend',
  'planar-binding',
  'xge-maddening-darkness',
  'animate-dead',
  'create-undead',
]);

const CELESTIAL_SPELL_IDS = new Set([
  'bendicion-de-astraea',
  'sacred-flame',
  'xphb-word-of-radiance',
  'bless',
  'cure-wounds',
  'shield-of-faith',
  'divine-favor',
  'healing-word',
  'guiding-bolt',
  'sanctuary',
  'spiritual-weapon',
  'branding-smite',
  'xge-healing-spirit',
  'prayer-of-healing',
  'lesser-restoration',
  'warding-bond',
  'xphb-aura-of-vitality',
  'xphb-blinding-smite',
  'spirit-guardians',
  'mass-healing-word',
  'revivify',
  'beacon-of-hope',
  'aura-of-life',
  'xphb-aura-of-purity',
  'guardian-of-faith',
  'xphb-staggering-smite',
  'xge-dawn',
  'xge-holy-weapon',
  'xphb-banishing-smite',
  'commune',
  'hallow',
  'xphb-summon-celestial',
  'mass-cure-wounds',
  'greater-restoration',
  'raise-dead',
  'heal',
  'sunbeam',
  'conjure-celestial',
  'xge-crown-of-stars',
  'divine-word',
  'resurrection',
  'xge-temple-of-the-gods',
  'holy-aura',
  'sunburst',
  'mass-heal',
  'power-word-heal',
  'true-resurrection',
  'remove-curse',
]);

const ELEMENTAL_SPELL_IDS = new Set([
  'shocking-grasp',
  'xge-frostbite',
  'xge-control-flames',
  'xge-create-bonfire',
  'produce-flame',
  'fire-bolt',
  'tce-booming-blade',
  'tce-green-flame-blade',
  'tce-lightning-lure',
  'xge-shape-water',
  'xge-mold-earth',
  'xge-magic-stone',
  'xge-gust',
  'ray-of-frost',
  'acid-splash',
  'xphb-thunderclap',
  'xge-absorb-elements',
  'create-or-destroy-water',
  'ice-knife',
  'burning-hands',
  'thunderwave',
  'xge-earth-tremor',
  'xge-aganazzar-s-scorcher',
  'dragons-breath',
  'xge-dust-devil',
  'flaming-sphere',
  'xge-pyrotechnics',
  'gust-of-wind',
  'scorching-ray',
  'xphb-elemental-weapon',
  'fireball',
  'xphb-lightning-arrow',
  'xge-flame-arrows',
  'call-lightning',
  'xge-wall-of-water',
  'wind-wall',
  'xge-tidal-wave',
  'xge-thunder-step',
  'lightning-bolt',
  'xge-erupting-earth',
  'sleet-storm',
  'conjure-minor-elementals',
  'control-water',
  'xphb-summon-elemental',
  'xge-storm-sphere',
  'wall-of-fire',
  'ice-storm',
  'xge-watery-sphere',
  'conjure-elemental',
  'cone-of-cold',
  'flame-strike',
  'xge-immolation',
  'wall-of-stone',
  'freezing-sphere',
  'xge-investiture-of-ice',
  'xge-investiture-of-flame',
  'xge-investiture-of-wind',
  'xge-investiture-of-stone',
  'wall-of-ice',
  'chain-lightning',
  'delayed-blast-fireball',
  'xge-whirlwind',
  'fire-storm',
  'earthquake',
  'tsunami',
  'meteor-swarm',
]);

const FEERICA_SPELL_IDS = new Set([
  'vicious-mockery',
  'xphb-thorn-whip',
  'druidcraft',
  'xge-primal-savagery',
  'shillelagh',
  'goodberry',
  'disguise-self',
  'sleep',
  'animal-friendship',
  'entangle',
  'faerie-fire',
  'speak-with-animals',
  'hideous-laughter',
  'spike-growth',
  'locate-animals-or-plants',
  'pass-without-trace',
  'misty-step',
  'barkskin',
  'xphb-beast-sense',
  'suggestion',
  'xphb-summon-fey',
  'plant-growth',
  'speak-with-plants',
  'hypnotic-pattern',
  'confusion',
  'conjure-woodland-beings',
  'xphb-grasping-vine',
  'polymorph',
  'modify-memory',
  'awaken',
  'tree-stride',
  'irresistible-dance',
  'conjure-fey',
  'mass-suggestion',
  'wind-walk',
  'transport-via-plants',
  'animal-shapes',
  'xge-mass-polymorph',
  'true-polymorph',
  'charm-person',
  'charm-monster',
  'commune-with-nature',
]);

/**
 * Accurately determines if a spell has one of the 4 requested cosmic planar origins:
 * Infernal, Celestial, Elemental, Feérica.
 *
 * If the spell does not belong to any of these 4 planar origins (e.g., standard arcane spells
 * like Magic Missile, Shield, Counterspell, Alarm, Teleport, Wish, Mage Hand, etc.),
 * it returns `undefined` without forcing it into a wrong category.
 */
export function getSpellOrigin(spell: {
  id?: string;
  name?: string;
  nameEn?: string;
  origin?: SpellOrigin;
  description?: string;
}): SpellOrigin | undefined {
  // If explicitly assigned in user custom spell or edit modal
  if (spell.origin) {
    if (spell.origin === 'Feérico' || spell.origin === 'Feérica') return 'Feérica';
    if (spell.origin === 'Infernal') return 'Infernal';
    if (spell.origin === 'Celestial') return 'Celestial';
    if (spell.origin === 'Elemental') return 'Elemental';
    return undefined;
  }

  const id = (spell.id || '').toLowerCase().trim();

  // 1. Exact canonical ID matching (100% precision)
  if (INFERNAL_SPELL_IDS.has(id)) return 'Infernal';
  if (CELESTIAL_SPELL_IDS.has(id)) return 'Celestial';
  if (ELEMENTAL_SPELL_IDS.has(id)) return 'Elemental';
  if (FEERICA_SPELL_IDS.has(id)) return 'Feérica';

  // 2. Strict title matching for user-created custom spells (title only, never description body)
  const name = (spell.name || '').toLowerCase();
  const nameEn = (spell.nameEn || '').toLowerCase();
  const title = `${name} ${nameEn}`;

  if (title.includes('infernal') || title.includes('hadar') || title.includes('demoniac')) {
    return 'Infernal';
  }
  if (title.includes('celestial') || title.includes('astraea')) {
    return 'Celestial';
  }
  if (title.includes('elemental')) {
    return 'Elemental';
  }
  if (title.includes('feéric') || title.includes('feerico') || title.includes('faerie') || title.includes('fey')) {
    return 'Feérica';
  }

  // Pure arcane, martial or universal utility spells have no planar origin
  return undefined;
}
