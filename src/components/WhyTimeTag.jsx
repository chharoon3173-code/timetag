import Reveal from './Reveal.jsx';
import './WhyTimeTag.css';

const BENEFITS = [
  { n: 'I.', title: 'Authentic Timepieces', text: 'Every watch is verified genuine and arrives with its warranty card.' },
  { n: 'II.', title: 'Premium Packaging', text: 'Presented in a signature box, ready to keep or to give.' },
  { n: 'III.', title: 'Fast Delivery', text: 'Dispatched promptly, insured and tracked to your door.' },
  { n: 'IV.', title: 'Dedicated Support', text: 'Real people to help with sizing, care and after-sales service.' },
];

export default function WhyTimeTag() {
  // id="story": the header's "About" and footer's "Our Story" links land here
  return (
    <section className="section why" id="story" aria-labelledby="why-title">
      <div className="container">
        <Reveal className="section-head">
          <div>
            <p className="eyebrow">The TimeTag Promise</p>
            <h2 id="why-title" className="display">Why <em>TimeTag</em></h2>
          </div>
        </Reveal>
        <div className="why__grid">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 90} className="why__item">
              <span className="why__num">{b.n}</span>
              <h3>{b.title}</h3>
              <p>{b.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
