import { bound } from '@aryth/bound-matrix';
import { abbr } from '@aryth/math';
import { niceScale } from '@aryth/nice-scale';
import { OBJECT } from '@typen/enum-object-types';

const boundMatrix = bound.bind({
  dif: false
});
class Ticks {
  // to fit niceScale api
  constructor(options) {
    this.mode = OBJECT;
    this.max = 100;
    this.min = 0;
    this.step = 10;
    this.ticks = options.tickCount ?? 6;
    this.prev = {
      max: options.maxY,
      min: options.minY
    };
    this.abbr = options.abbr;
  }

  static build(options) {
    return new Ticks(options);
  }

  get incre() {
    return this.step;
  }

  get dif() {
    return this.max - this.min;
  }

  get tickWidth() {
    return this.formatTick(this.max).length * 2;
  }

  formatTick(v) {
    return this.abbr ? abbr(v) : String(v);
  }

  setTicks(seriesCollection) {
    const prev = this.prev,
          next = boundMatrix(seriesCollection.map(({
      y
    }) => y));
    const {
      max,
      min,
      step
    } = niceScale.call(this, {
      max: prev.max ?? next.max,
      min: prev.min ?? next.min
    });
    this.max = this.prev.max ?? max;
    this.min = this.prev.min ?? min;
    this.step = step;
    return this;
  }

}

export { Ticks };
