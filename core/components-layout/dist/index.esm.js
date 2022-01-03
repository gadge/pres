import { Box, Cadre } from '@pres/components-core';
import { ATTACH } from '@pres/enum-events';
import { Context } from '@pres/util-drawille-canvas';
import { roundD4, roundD2 } from '@aryth/math';
import { assignDeep } from '@pres/util-helpers';

class Canvas extends Box {
  constructor(options = {}, canvasType) {
    if (!options.sku) options.sku = 'canvas';
    super(options);
    this.on(ATTACH, () => {
      this.context = new Context(this.canvW, this.canvH, canvasType);
      if (this.options.data) this.setData(this.options.data);
    });
    this.type = 'canvas';
  }

  static build(options, canvasType) {
    return new Canvas(options, canvasType);
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
    return this.renderElement();
  }

}

class Carousel {
  constructor(pages, options) {
    this.currPage = 0;
    this.pages = pages;
    this.options = options;
    this.screen = this.options.screen;
  }

  static build(pages, options) {
    return new Carousel(pages, options);
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

  add = this.set;

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

class Page extends Box {
  elements = [];

  constructor(options) {
    options.sku = 'page';
    options.height = '100%';
    options.width = '100%';
    super(options);
    this.colNo = options.cols ?? 12;
    this.rowNo = options.rows ?? 12;
    this.hideBorder = options.hideBorder;
    this.unit = {
      h: roundD4(100 / this.rowNo),
      w: roundD4(100 / this.colNo),
      border: {
        type: 'line',
        fg: options.color ?? 'cyan'
      }
    };
    this.type = 'page';
  }

  static build(options) {
    return new Page(options);
  }

  add(t, l, h, w, component, options) {
    if (component instanceof Page) {
      throw 'Error: A Page is not allowed to be nested inside another page.\r\n' + 'Note: Release 2.0.0 has breaking changes. Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39';
    } //var options = JSON.parse(JSON.stringify(opts));


    let p = {};
    p = assignDeep(p, options);
    p.top = options.t ?? roundD2(t * this.unit.h) + '%';
    p.left = options.l ?? roundD2(l * this.unit.w) + '%';
    p.height = options.h ?? roundD2(this.unit.h * h) + '%'; // + '-' + this.margin.t

    p.width = options.w ?? roundD2(this.unit.w * w) + '%'; // console.log('[coord]', `(${ p.top },${ p.left })`, '[size]', `(${ p.height },${ p.width })`)

    p.border = options.hideBorder ?? this.hideBorder ? null : p.border ?? this.unit.border;
    p.inGrid = true; // p.sup = this

    this.elements.push({
      fn: component,
      arg: p
    }); // const element = component(p)
    // this.append(element)
    // return element
  }

  draw() {
    this.clear();

    for (let {
      fn,
      arg
    } of this.elements) this.append(fn(arg));
  }

  clear() {
    let i = this.sub.length;

    while (i--) this.sub[i].detach();
  }

}

export { Canvas, Carousel, Grid, Page };
