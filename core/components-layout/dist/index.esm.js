import { Box } from '@pres/components-core';
import { ATTACH } from '@pres/enum-events';
import { Context } from '@pres/util-drawille-canvas';
import { roundD4, roundD2 } from '@aryth/math';
import { NUM, OBJ } from '@typen/enum-data-types';
import { assignDeep } from '@pres/util-helpers';
import '@typen/nullish';

class Canvas extends Box {
  constructor(options = {}, canvasType) {
    if (!options.sku) options.sku = 'canvas'; // if (!(this instanceof Node)) return new Canvas(options)
    // this.options = options

    super(options); // Mixin.assign(this, new Box(options)) // Box.call(this, options)

    this.on(ATTACH, () => {
      this.context = new Context(this.canvW, this.canvH, canvasType);
      if (this.options.data) this.setData(this.options.data);
    });
    this.type = 'canvas';
  }

  static build(options) {
    return new Canvas(options);
  }

  get drawille() {
    return this.context.drawille;
  }

  get canvH() {
    return this.height << 2;
  }

  get canvW() {
    return (this.width << 1) - 12;
  }

  clear() {
    this.context.clearRect(0, 0, this.canvW, this.canvH);
  }

  render() {
    this.clearPos(true);
    const inner = this.drawille.frame();
    this.setContent(inner);
    return this._render();
  }

}

class Carousel {
  constructor(pages, options) {
    this.currPage = 0;
    this.pages = pages;
    this.options = options;
    this.screen = this.options.screen;
  }

  static build(options) {
    return new Carousel(options);
  }

  move() {
    let i = this.screen.sub.length;

    while (i--) this.screen.sub[i].detach();

    this.pages[this.currPage](this.screen, this.currPage);
    this.screen.render();
  }

  next() {
    this.currPage++;

    if (this.currPage === this.pages.length) {
      if (this.options.rotate) {
        this.currPage = 0;
      } else {
        return void this.currPage--;
      }
    }

    this.move();
  }

  prev() {
    this.currPage--;

    if (this.currPage < 0) {
      if (this.options.rotate) {
        this.currPage = this.pages.length - 1;
      } else {
        return void this.currPage++;
      }
    }

    this.move();
  }

  home() {
    this.currPage = 0;
    this.move();
  }

  end() {
    this.currPage = this.pages.length - 1;
    this.move();
  }

  start() {
    const self = this;
    this.move();
    if (this.options.interval) setInterval(this.next.bind(this), this.options.interval);

    if (this.options.controlKeys) {
      this.screen.key(['right', 'left', 'home', 'end'], (ch, key) => {
        if (key.name === 'right') self.next();
        if (key.name === 'left') self.prev();
        if (key.name === 'home') self.home();
        if (key.name === 'end') self.end();
      });
    }
  }

}

class Cadre {
  constructor(t = 0, b = 0, l = 0, r = 0) {
    this.t = t;
    this.b = b;
    this.l = l;
    this.r = r;
  }

  static build(o) {
    const t = typeof o;
    if (!o || t === NUM) return new Cadre(o, o, o, o);
    if (t === OBJ) return new Cadre(o.t ?? o.top, o.b ?? o.bottom, o.l ?? o.left, o.r ?? o.right);
    return new Cadre(0, 0, 0, 0);
  }

  get any() {
    return this.t || this.b || this.l || this.r;
  }

  get top() {
    return this.t;
  }

  get bottom() {
    return this.b;
  }

  get left() {
    return this.l;
  }

  get right() {
    return this.r;
  }

  set top(val) {
    return this.t = val;
  }

  set bottom(val) {
    return this.b = val;
  }

  set left(val) {
    return this.l = val;
  }

  set right(val) {
    return this.r = val;
  }

  get vert() {
    return this.t + this.b;
  }

  get hori() {
    return this.l + this.r;
  }

}

const SPACING = 0;
class Grid {
  constructor(options) {
    if (!options.screen) throw 'Error: A screen property must be specified in the grid options.\r\n' + 'Note: Release 2.0.0 has breaking changes. Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39';
    this.screen = options.screen;
    this.colNo = options.cols ?? 12;
    this.rowNo = options.rows ?? 12;
    this.margin = Cadre.build(options.margin);
    this.unit = {
      h: roundD4((100 - this.margin.vert) / this.rowNo),
      // roundD2(( 100 - this.margin * 2 ) / this.rowNo),
      w: roundD4((100 - this.margin.hori) / this.colNo),
      // roundD2(( 100 - this.margin * 2 ) / this.colNo),
      border: {
        type: 'line',
        fg: options.color ?? 'cyan'
      }
    };
    this.hideBorder = options.hideBorder;
  }

  static build(options) {
    return new Grid(options);
  }

  set(t, l, h, w, component, options) {
    if (component instanceof Grid) {
      throw 'Error: A Grid is not allowed to be nested inside another grid.\r\n' + 'Note: Release 2.0.0 has breaking changes. Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39';
    } //var options = JSON.parse(JSON.stringify(opts));


    let p = {};
    p = assignDeep(p, options);
    p.top = options.t ?? roundD2(t * this.unit.h) + '%' + (this.margin.t ? '+' + this.margin.t : ''); // ( t * this.unit.h + this.margin ) + '%'

    p.left = options.l ?? roundD2(l * this.unit.w) + '%' + (this.margin.l ? '+' + this.margin.l : ''); // ( l * this.unit.w + this.margin ) + '%'

    p.height = options.h ?? roundD2(this.unit.h * h - SPACING) + '%'; // + '-' + this.margin.t

    p.width = options.w ?? roundD2(this.unit.w * w - SPACING) + '%'; // console.log('[coord]', `(${ p.top },${ p.left })`, '[size]', `(${ p.height },${ p.width })`)

    p.border = options.hideBorder ?? this.hideBorder ? null : p.border ?? this.unit.border;
    p.inGrid = true;
    const instance = component(p);
    if (!options.sup) this.screen.append(instance);
    return instance;
  }

}

const canvas = (options, canvasType) => new Canvas(options, canvasType);

const carousel = (pages, options) => new Carousel(pages, options);

const grid = options => new Grid(options);

export { Canvas, Carousel, Grid, canvas, carousel, grid };
