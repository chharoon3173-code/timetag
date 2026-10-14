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

/**
 * Layered waves: a solid wave in the neighbouring section's colour, with two see-through
 * layers peeking out underneath it. The bottom wave is the same drawing turned upside down.
 */
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
        <path className="wcu__layer wcu__layer--light" d="M0,0H1440V100C1250,82 1060,70 880,86C700,102 600,128 420,130C260,132 120,118 0,110Z" />
        <path className="wcu__layer wcu__layer--mid" d="M0,0H1440V86C1300,96 1120,116 900,124C700,132 520,124 380,112C250,102 120,104 0,104Z" />
        <path className="wcu__layer wcu__layer--solid" d="M0,0H1440V70C1320,62 1180,40 1020,48C820,58 560,96 300,104C190,108 90,106 0,104Z" />
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
