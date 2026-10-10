import { useId } from 'react';

export default function Grain() {
  const id = `grain-${useId().replace(/:/g, '')}`;
  return (
    <svg className="grain" aria-hidden="true" focusable="false">
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}
