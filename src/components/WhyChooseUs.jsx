import Reveal from './Reveal.jsx';
import { GiftIcon, HeadsetIcon, ShieldIcon, TruckIcon } from './Icons.jsx';
import './WhyChooseUs.css';

// Edit the four promises here.
const POINTS = [
  { Icon: ShieldIcon, title: 'Authentic Timepieces', text: 'Every watch is verified genuine and arrives with its warranty card.' },
  { Icon: GiftIcon, title: 'Premium Packaging', text: 'Presented in a signature box, ready to keep or to give.' },
  { Icon: TruckIcon, title: 'Fast Delivery', text: 'Dispatched promptly, insured and tracked to your door.' },
  { Icon: HeadsetIcon, title: 'Dedicated Support', text: 'Real people to help with sizing, care and after-sales service.' },
];

/*
 * Layered waves: a solid wave in the neighbouring section's colour, with two see-through
 * layers peeking out underneath it. The bottom wave is the same drawing turned upside down.
 *
 * Animation: each layer flows between three slightly different curves (the heights below),
 * so the edge rises and falls like a slow wave. Each layer has its own speed, so they drift
 * against each other. This uses SVG's built-in <animate>, so no JavaScript runs for it.
 */
// `xs`: across the width, where each curve's control points sit. `shapes`: their heights (0 = top, 140 = bottom).
const LAYERS = [
  {
    name: 'light',
    seconds: 12,
    xs: [1250, 1060, 880, 700, 600, 420, 260, 120],
    shapes: [
      [100, 82, 70, 86, 102, 128, 130, 132, 118, 110],
      [112, 94, 78, 74, 92, 120, 136, 128, 124, 116],
      [92, 72, 64, 96, 114, 134, 124, 136, 112, 104],
    ],
  },
  {
    name: 'mid',
    seconds: 8,
    xs: [1300, 1120, 900, 700, 520, 380, 250, 120],
    shapes: [
      [86, 96, 116, 124, 132, 124, 112, 102, 104, 104],
      [98, 84, 100, 130, 136, 116, 102, 110, 112, 108],
      [78, 104, 124, 112, 120, 132, 120, 96, 98, 100],
    ],
  },
  {
    name: 'solid',
    seconds: 10,
    xs: [1320, 1180, 1020, 820, 560, 300, 190, 90],
    shapes: [
      [70, 62, 40, 48, 58, 96, 104, 108, 106, 104],
      [56, 74, 58, 40, 24, 84, 112, 96, 92, 96],
      [80, 52, 30, 60, 82, 104, 92, 100, 112, 110],
    ],
  },
];

/** Builds the SVG path for one wave shape: right edge height, three curves, left edge height. */
function wavePath(xs, [a, b, c, d, e, f, g, h, i, j]) {
  const [x1, x2, x3, x4, x5, x6, x7, x8] = xs;
  return `M0,0H1440V${a}C${x1},${b} ${x2},${c} ${x3},${d}C${x4},${e} ${x5},${f} ${x6},${g}C${x7},${h} ${x8},${i} 0,${j}Z`;
}

const EASE = '0.45 0 0.55 1'; // smooth in-and-out between shapes

function Wave({ position }) {
  return (
    <svg
      className={`wcu__wave wcu__wave--${position}`}
      viewBox="0 0 1440 140"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <g transform={position === 'bottom' ? 'rotate(180 720 70)' : undefined}>
        {LAYERS.map(({ name, seconds, xs, shapes }) => {
          const paths = shapes.map((s) => wavePath(xs, s));
          // the bottom edge starts half-way through, so the two edges don't move in sync
          const begin = position === 'bottom' ? `-${seconds / 2}s` : '0s';
          return (
            <path key={name} className={`wcu__layer wcu__layer--${name}`} d={paths[0]}>
              <animate
                attributeName="d"
                values={[...paths, paths[0]].join(';')}
                keyTimes="0;0.33;0.66;1"
                calcMode="spline"
                keySplines={`${EASE};${EASE};${EASE}`}
                dur={`${seconds}s`}
                begin={begin}
                repeatCount="indefinite"
              />
            </path>
          );
        })}
      </g>
    </svg>
  );
}

/** "Why Choose Us" — four promises between wave edges. id="story": the header's "About" link lands here. */
export default function WhyChooseUs() {
  return (
    <section className="wcu" id="story" aria-labelledby="wcu-title">
      <Wave position="top" />
      <div className="container wcu__inner">
        <Reveal className="wcu__head">
          <p className="eyebrow">The TimeTag Promise</p>
          <h2 id="wcu-title" className="display">Why Choose <em>Us</em></h2>
        </Reveal>
        <ul className="wcu__grid">
          {POINTS.map(({ Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={i * 90} className="wcu__item">
              <span className="wcu__icon"><Icon size={56} sw={1.1} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
      <Wave position="bottom" />
    </section>
  );
}
