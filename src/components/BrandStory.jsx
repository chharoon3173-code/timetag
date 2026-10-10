import Watch from './Watch.jsx';
import Grain from './Grain.jsx';
import Reveal from './Reveal.jsx';
import { Arrow } from './Icons.jsx';
import { WATCH_STYLES } from '../data/products.js';
import './BrandStory.css';

export default function BrandStory() {
  return (
    <section className="story section" id="story" aria-labelledby="story-title">
      <Grain />
      <div className="story__monogram" aria-hidden="true">TT</div>
      <div className="container story__grid">
        <Reveal className="box" aria-hidden="true">
          <div className="box__lid">
            <div className="box__satin">
              <span className="box__name">TIMETAG</span>
              <span className="box__line">More than just time</span>
            </div>
          </div>
          <div className="box__base">
            <div className="box__cushion" />
            <div className="box__watch"><Watch style={WATCH_STYLES.heritageGold} /></div>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <p className="eyebrow">Our Philosophy</p>
          <h2 id="story-title" className="display">Built Around <em>Time</em></h2>
          <p className="story__lead">
            At TimeTag, we believe a watch is more than an accessory. It is a reflection of character, ambition
            and the moments that define us.
          </p>
          <a href="#story" className="text-link">Our Story <Arrow /></a>
        </Reveal>
      </div>
    </section>
  );
}
