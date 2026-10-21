import React, { useState, useId } from 'react';
import { getSchoolTheme } from '../data/schools';

interface OfficialSpellLineIconProps {
  iconUrl: string;
  name?: string;
  school?: string | null;
  color?: string | null;
  className?: string;
  onError?: () => void;
}

interface SchoolGlowStyle {
  pale: string;       // Luminous, ultra-pale interior/core tint (whitish pastel)
  core: string;       // Vibrant stroke color
  mid: string;        // Saturated midtone
  saturated: string;  // Ultra-saturated, intense pure pigment for the outer lines
  rim: string;        // Deep, intense outline delineation
  bgPale: string;     // Soft pale ambient backlight for the interior
}

// Authentic Baldur's Gate 3 colored line-art palette: Pale luminous center + intensely saturated outer lines
const BG3_GLOW_STYLES: Record<string, SchoolGlowStyle> = {
  // Evocación (Fuego / Rayo solar / Destrucción - Tinte melocotón / ámbar cálido)
  'Evocación': {
    pale: '#ffd8b3',
    core: '#ffa31a',
    mid: '#ff5500',
    saturated: '#ff1f00',
    rim: '#b80f00',
    bgPale: 'rgba(255, 216, 179, 0.25)',
  },
  // Abjuración (Escudos / Rayo azul eléctrico / Campo de fuerza - Tinte azul cielo suave)
  'Abjuración': {
    pale: '#bae6fd',
    core: '#38bdf8',
    mid: '#0088ff',
    saturated: '#0055ff',
    rim: '#002699',
    bgPale: 'rgba(186, 230, 253, 0.25)',
  },
  // Adivinación (Oro solar / Visión / Ojo místico - Tinte oro suave / vainilla cálida)
  'Adivinación': {
    pale: '#fde68a',
    core: '#facc15',
    mid: '#ffaa00',
    saturated: '#ff8800',
    rim: '#b35900',
    bgPale: 'rgba(253, 230, 138, 0.25)',
  },
  // Conjuración (Esmeralda / Menta viva / Portales - Tinte menta verde suave)
  'Conjuración': {
    pale: '#bbf7d0',
    core: '#4ade80',
    mid: '#00c853',
    saturated: '#00e65b',
    rim: '#007a1d',
    bgPale: 'rgba(187, 247, 208, 0.25)',
  },
  // Encantamiento (Rosa fucsia místico / Hechizo mental - Tinte rosa pastel)
  'Encantamiento': {
    pale: '#fbcfe8',
    core: '#f472b6',
    mid: '#e11d48',
    saturated: '#ff0066',
    rim: '#990042',
    bgPale: 'rgba(251, 207, 232, 0.25)',
  },
  // Ilusión (Violeta etéreo / Sombras fantasmagóricas - Tinte lavanda suave)
  'Ilusión': {
    pale: '#e9d5ff',
    core: '#c084fc',
    mid: '#9333ea',
    saturated: '#8b00ff',
    rim: '#4d0099',
    bgPale: 'rgba(233, 213, 255, 0.25)',
  },
  // Nigromancia (Fucsia necrótico / Amatista oscuro - Tinte amatista rosado suave)
  'Nigromancia': {
    pale: '#f5d0fe',
    core: '#e879f9',
    mid: '#c026d3',
    saturated: '#d500f9',
    rim: '#801f94',
    bgPale: 'rgba(245, 208, 254, 0.25)',
  },
  // Transmutación (Jade alquímico / Metamorfosis - Tinte jade claro)
  'Transmutación': {
    pale: '#a7f3d0',
    core: '#34d399',
    mid: '#059669',
    saturated: '#00c896',
    rim: '#00664d',
    bgPale: 'rgba(167, 243, 208, 0.25)',
  },
  // Reflexión (Cian cristalino / Pluma caída - Tinte aguamarina / cian suave)
  'Reflexión': {
    pale: '#a5f3fc',
    core: '#22d3ee',
    mid: '#06b6d4',
    saturated: '#00d5ff',
    rim: '#006d80',
    bgPale: 'rgba(165, 243, 252, 0.25)',
  },
};

/**
 * Helper to check if an icon URL or spell should receive the authentic BG3 magical glow:
 * 1. Official D&D spellbook line icons (spellbookdnd.com)
 * 2. Custom created or homebrew spells (isCustom, isEdited, Homebrew, Grimorio)
 * 3. Custom uploaded images, data URLs, blob URLs, or custom gallery keys
 */
export function isOfficialDndLineIcon(
  url?: string | null,
  spell?: {
    id?: string;
    isCustom?: boolean;
    isEdited?: boolean;
    source?: string;
  } | null
): boolean {
  if (!url || typeof url !== 'string') return false;

  // 1. Data URLs or blob URLs (uploaded custom images/drawings)
  if (url.startsWith('data:') || url.startsWith('blob:') || url.includes('custom_')) {
    return true;
  }

  // 2. Official D&D spellbook line icons
  if (url.includes('spellbookdnd.com') || url.includes('/spell/')) {
    return true;
  }

  // 3. Spells created/edited by the user or custom homebrew spells
  if (
    spell?.isCustom ||
    spell?.isEdited ||
    spell?.source === 'Homebrew' ||
    (spell?.source && (spell.source.includes('Grimorio') || spell.source.includes('Dracopedia'))) ||
    spell?.id?.startsWith('custom_')
  ) {
    // If it is an authentic external full-color 3D illustration from bg3.wiki, keep full color
    if (url.includes('bg3.wiki/w/images/') && !url.includes('custom')) {
      return false;
    }
    return true;
  }

  // 4. Any other image that is not from official Baldur's Gate 3 (spellbook icons, line drawings, etc.)
  if (!url.includes('bg3.wiki/w/images/')) {
    return true;
  }

  return false;
}

/**
 * Renders spell icons with authentic Baldur's Gate 3 colored line-art style:
 * - Entire stroke filled with vibrant thematic magical color (electric blue, cyan, etc.)
 * - Deep, rich saturated outline delineation around the contours
 * - Soft diffuse ambient aura radiating into the dark background
 * - 100% original scale and proportions preserved
 */
export const OfficialSpellLineIcon: React.FC<OfficialSpellLineIconProps> = ({
  iconUrl,
  name = 'Hechizo',
  school,
  color,
  className = 'w-full h-full',
  onError,
}) => {
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const reactId = useId();
  const filterId = `bg3-stroke-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const theme = getSchoolTheme(school);
  const matchedGlow = school && BG3_GLOW_STYLES[school];
  const baseColor = color || theme.hexColor || '#38bdf8';
  const glow: SchoolGlowStyle = matchedGlow
    ? { ...matchedGlow }
    : {
        pale: '#bae6fd',
        core: baseColor,
        mid: baseColor,
        saturated: baseColor,
        rim: baseColor,
        bgPale: 'rgba(186, 230, 253, 0.25)',
      };

  if (color) {
    glow.core = color;
    glow.mid = color;
    glow.saturated = color;
    glow.rim = color;
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: glow.saturated }}>
          {school ? String(school).substring(0, 3) : 'D&D'}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center overflow-hidden select-none ${className}`}>
      {/* Hidden img to trigger onError waterfall if network fails */}
      <img
        src={iconUrl}
        alt={name}
        className="hidden"
        onError={() => {
          setHasError(true);
          onError?.();
        }}
      />

      {/* SVG Stroke Filter: Computes the centerline erosion and dilation per-stroke */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <defs>
          <filter
            id={filterId}
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
            colorInterpolationFilters="sRGB"
          >
            {/* 1. Subdued ambient aura - brillo mínimo de fondo */}
            <feMorphology in="SourceAlpha" operator="dilate" radius="0.3" result="auraDilate" />
            <feFlood floodColor={glow.saturated} floodOpacity="0.08" result="auraFlood" />
            <feComposite in="auraFlood" in2="auraDilate" operator="in" result="auraColor" />
            <feGaussianBlur in="auraColor" stdDeviation="0.8" result="auraBlur" />

            {/* 2. Outer saturated line: trazo de color intenso a 0.50px */}
            <feMorphology in="SourceAlpha" operator="dilate" radius="0.5" result="outerDilate" />
            <feFlood floodColor={glow.saturated} floodOpacity="1" result="outerFlood" />
            <feComposite in="outerFlood" in2="outerDilate" operator="in" result="outerRaw" />
            <feGaussianBlur in="outerRaw" stdDeviation="0.2" result="outerLines" />

            {/* 3. Deep tone rim for strong edge contrast and rich chromatic body */}
            <feMorphology in="SourceAlpha" operator="dilate" radius="0.3" result="rimDilate" />
            <feFlood floodColor={glow.rim} floodOpacity="0.9" result="rimFlood" />
            <feComposite in="rimFlood" in2="rimDilate" operator="in" result="rimBase" />

            {/* 4. Saturated midtone transition zone with smooth feathering */}
            <feMorphology in="SourceAlpha" operator="erode" radius="0.18" result="midAlpha" />
            <feFlood floodColor={glow.core} floodOpacity="0.85" result="midFlood" />
            <feComposite in="midFlood" in2="midAlpha" operator="in" result="midRaw" />
            <feGaussianBlur in="midRaw" stdDeviation="0.2" result="midStroke" />

            {/* 5. Pale center: concentrado en la médula interna con tinte suave de la escuela */}
            <feMorphology in="SourceAlpha" operator="erode" radius="0.45" result="paleAlpha" />
            <feFlood floodColor={glow.pale} floodOpacity="1" result="paleFlood" />
            <feComposite in="paleFlood" in2="paleAlpha" operator="in" result="paleRaw" />
            <feGaussianBlur in="paleRaw" stdDeviation="0.22" result="paleStroke" />

            {/* 6. Espina central interior tintada con el color mágico (sin blanco puro) */}
            <feMorphology in="SourceAlpha" operator="erode" radius="0.75" result="spineAlpha" />
            <feFlood floodColor={glow.pale} floodOpacity="0.8" result="spineFlood" />
            <feComposite in="spineFlood" in2="spineAlpha" operator="in" result="spineRaw" />
            <feGaussianBlur in="spineRaw" stdDeviation="0.2" result="spineStroke" />

            <feMerge>
              <feMergeNode in="auraBlur" />
              <feMergeNode in="outerLines" />
              <feMergeNode in="rimBase" />
              <feMergeNode in="midStroke" />
              <feMergeNode in="paleStroke" />
              <feMergeNode in="spineStroke" />
            </feMerge>
          </filter>
        </defs>

        {!useFallback && (
          <image
            href={iconUrl}
            xlinkHref={iconUrl}
            crossOrigin="anonymous"
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            filter={`url(#${filterId})`}
            onError={() => setUseFallback(true)}
          />
        )}
      </svg>

      {/* Dual CSS Mask Fallback: Uniform pale stroke center and fine, soft-feathered outer lines */}
      {useFallback && (
        <>
          {/* Layer 1: Ambient halo con dispersión mínima */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              maskImage: `url("${iconUrl}")`,
              WebkitMaskImage: `url("${iconUrl}")`,
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              backgroundColor: glow.saturated,
              filter: `drop-shadow(0 0 0.8px ${glow.saturated}44)`,
              opacity: 0.1,
            }}
          />

          {/* Layer 2: Outer saturated contour a 0.50px de ancho */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              maskImage: `url("${iconUrl}")`,
              WebkitMaskImage: `url("${iconUrl}")`,
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              backgroundColor: glow.saturated,
              filter: `drop-shadow(0 0 0.5px ${glow.saturated}) drop-shadow(0 0 0.25px ${glow.rim})`,
              opacity: 1,
            }}
          />

          {/* Layer 3: Pale interior nítido con tinte ligero de la escuela */}
          <div
            className="relative z-10 w-full h-full pointer-events-none flex items-center justify-center"
            style={{
              filter: 'blur(0.25px)',
              opacity: 0.98,
            }}
          >
            <div
              className="w-[96%] h-[96%]"
              style={{
                maskImage: `url("${iconUrl}")`,
                WebkitMaskImage: `url("${iconUrl}")`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                backgroundColor: glow.pale,
              }}
            />
          </div>

          {/* Layer 4: Spine central interior con tinte de color (sin blanco puro) */}
          <div
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
            style={{
              filter: 'blur(0.18px)',
              opacity: 0.7,
            }}
          >
            <div
              className="w-[94%] h-[94%]"
              style={{
                maskImage: `url("${iconUrl}")`,
                WebkitMaskImage: `url("${iconUrl}")`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                backgroundColor: glow.pale,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
