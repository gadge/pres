import { Node } from '@pres/components-node';
export { Node } from '@pres/components-node';
import * as mixin from '@ject/mixin';
import { LF, ESC, TAB, CSI } from '@pres/enum-control-chars';
import { LEFT, RIGHT, TOP, BOTTOM, WIDTH, HEIGHT, SHRINK, CENTER, HALF, MIDDLE } from '@pres/enum-coord-infos';
import { NEW_LISTENER, CLICK, MOUSE, MOUSEDOWN, MOUSEUP, MOUSEMOVE, MOUSEOVER, MOUSEOUT, MOUSEWHEEL, WHEELDOWN, WHEELUP, KEYPRESS, KEY, RESIZE, ATTACH, DETACH, MOVE, PARSED_CONTENT, PRERENDER, RENDER, HIDE as HIDE$1, SHOW, SET_CONTENT, SCROLL, LOG, FOCUS, BLUR, WARNING, DESTROY, ELEMENT_CLICK, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, DATA, TITLE, PASSTHROUGH } from '@pres/enum-events';
import * as colors from '@pres/util-blessed-colors';
import * as helpers from '@pres/util-helpers';
import { nextTick, stripTags, dropUnicode, Logger } from '@pres/util-helpers';
import { styleToAttr, sgraToAttr, attrToSgra } from '@pres/util-sgr-attr';
import * as unicode from '@pres/util-unicode';
import { SP } from '@texting/enum-chars';
import { NUM, OBJ, STR, FUN } from '@typen/enum-data-types';
import { nullish, valid } from '@typen/nullish';
import { select } from '@vect/object-select';
import { last } from '@vect/vector-index';
import assert from 'assert';
import { FORE, FG, BACK, BG, BOLD, ITALIC, UNDERLINE, BLINK, REVERSE, INVERSE, HIDE, INVISIBLE, TRANSPARENT } from '@pres/enum-sgr-attrs';
import { UP, DOWN } from '@pres/enum-key-names';
import { ANGLES, ANGLES_L, ANGLES_U, ANGLES_R, ANGLES_D, ANGLE_TABLE } from '@pres/enum-angle-table';
import { SGR } from '@pres/enum-csi-codes';
import { GlobalScreen } from '@pres/global-screen';
import { Program } from '@pres/program';
import { degrade } from '@pres/util-byte-colors';
import { Mor } from '@pres/util-morisot';
import cp, { spawn } from 'child_process';
import util from 'util';
import term from 'term.js';

const REGEX_SGR_G = /\x1b\[[\d;]*m/g;
const REGEX_INIT_SGR = /^\x1b\[[\d;]*m/;
const SGR_ATTRS = [FORE, FG, BACK, BG, BOLD, ITALIC, UNDERLINE, BLINK, REVERSE, INVERSE, HIDE, INVISIBLE, TRANSPARENT];
const COORD_INFOS = [LEFT, RIGHT, TOP, BOTTOM, WIDTH, HEIGHT];
const UI_EVENT_TODOS = [['hoverEffects', 'mouseover', 'mouseout', '_htemp'], ['focusEffects', 'focus', 'blur', '_ftemp']];

class Cadre {
  constructor(t, b, l, r) {
    this.t = t;
    this.b = b;
    this.l = l;
    this.r = r;
  }

  static build(o) {
    const t = typeof o;
    if (!o || t === NUM) return o = o ?? 0, new Cadre(o, o, o, o);
    if (t === OBJ) return new Cadre(o.t ?? o.top ?? 0, o.b ?? o.bottom ?? 0, o.l ?? o.left ?? 0, o.r ?? o.right ?? 0);
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

  get dVert() {
    return this.b - this.t;
  }

  get dHori() {
    return this.r - this.l;
  }

}

class Coord extends Cadre {
  constructor(t, b, l, r) {
    super(t, b, l, r);
  }
  /** @returns {Coord} */


  static build(t, b, l, r, nT, nB, nL, nR, base, renders) {
    return new Coord(t, b, l, r).assignData(nT, nB, nL, nR, base, renders);
  }

  assignPos(t, b, l, r) {
    this.t = t;
    this.b = b;
    this.l = l;
    this.r = r;
    return this;
  }

  assignData(nT, nB, nL, nR, base, renders) {
    this.negT = nT;
    this.negB = nB;
    this.negL = nL;
    this.negR = nR;
    this.base = base;
    this.renders = renders;
    return this;
  }

  get yLo() {
    return this.t;
  }

  get yHi() {
    return this.b;
  }

  get xLo() {
    return this.l;
  }

  get xHi() {
    return this.r;
  }

  set yLo(val) {
    return this.t = val;
  }

  set yHi(val) {
    return this.b = val;
  }

  set xLo(val) {
    return this.l = val;
  }

  set xHi(val) {
    return this.r = val;
  }

}

class Detic {
  constructor(t, b, l, r, h, w) {
    this.t = t;
    this.b = b;
    this.l = l;
    this.r = r;
    this.h = h;
    this.w = w;
  }

  static build(o) {
    return new Detic(o.top ?? o.t, o.bottom ?? o.b, o.left ?? o.l, o.right ?? o.r, o.height ?? o.h, o.width ?? o.w);
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

  get height() {
    return this.h;
  }

  get width() {
    return this.w;
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

  set height(val) {
    return this.h = val;
  }

  set width(val) {
    return this.w = val;
  }

  delete(key) {
    if (key in this) this[key] = null;
  }

}

const percentToNum = percent => +percent.slice(0, -1) / 100;
const scaler = (tx, base) => {
  let [percent, residual] = tx.split(/(?=[+-])/);
  const n = base * percentToNum(percent) | 0;
  return n + +(residual || 0);
};

/**
 * element.js - base element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

class Element extends Node {
  #parsedContent;
  type = 'element';
  /**
   * Element
   */

  constructor(options = {}, lazy) {
    options.sku = options.sku ?? 'element';
    super(options);
    if (lazy) return this;
    Element.prototype.config.call(this, options);
  }

  static build(options) {
    return new Element(options);
  }

  config(options) {
    const self = this;
    this.type = this.type ?? 'element'; // console.log('>> [Element.prototype.config]', this.codename)

    this.noOverflow = options.noOverflow;
    this.dockBorders = options.dockBorders;
    this.shadow = options.shadow;
    this.style = options.style ?? select.call(SGR_ATTRS, options);
    this.hidden = options.hidden || false;
    this.fixed = options.fixed || false;
    this.align = options.align || LEFT;
    this.valign = options.valign || TOP;
    this.wrap = options.wrap !== false;
    this.shrink = options.shrink;
    this.inGrid = options.inGrid;
    this.fixed = options.fixed;
    this.ch = options.ch || ' ';
    const pos = this.pos = Detic.build(options.pos ?? (options.pos = select.call(COORD_INFOS, options)));
    const widthShrink = pos.width === SHRINK,
          heightShrink = pos.height === SHRINK;

    if (widthShrink || heightShrink) {
      if (widthShrink) pos.delete(WIDTH); //pos.width = null // delete pos.width

      if (heightShrink) pos.delete(HEIGHT); // pos.height = null // delete pos.height

      options.shrink = true;
    } // this.pos = pos


    this.padding = Cadre.build(options.padding);
    this.border = options.border;

    if (this.border) {
      if (typeof this.border === STR) this.border = {
        type: this.border
      };
      this.border.type = this.border.type || 'bg';
      if (this.border.type === 'ascii') this.border.type = 'line';
      this.border.ch = this.border.ch || ' ';
      this.style.border = this.style.border || this.border.style;

      if (!this.style.border) {
        this.style.border = {};
        this.style.border.fg = this.border.fg;
        this.style.border.bg = this.border.bg;
      } //this.border.style = this.style.border;


      if (nullish(this.border.left)) this.border.left = true;
      if (nullish(this.border.top)) this.border.top = true;
      if (nullish(this.border.right)) this.border.right = true;
      if (nullish(this.border.bottom)) this.border.bottom = true;
    } // if (options.mouse || options.clickable) {


    if (options.clickable) {
      this.screen._listenMouse(this);
    }

    if (options.input || options.keyable) {
      this.screen._listenKeys(this);
    }

    this.parseTags = options.parseTags || options.tags;
    this.setContent(options.content || '', true);

    if (options.label) {
      this.setLabel(options.label);
    }

    if (options.hoverText) {
      this.setHover(options.hoverText);
    } // TODO: Possibly move this to Node for onScreenEvent(MOUSE, ...).


    this.on(NEW_LISTENER, type => {
      // type = type.split(' ').slice(1).join(' ');
      if (type === CLICK || type === MOUSE || type === MOUSEDOWN || type === MOUSEUP || type === MOUSEMOVE || type === MOUSEOVER || type === MOUSEOUT || type === MOUSEWHEEL || type === WHEELDOWN || type === WHEELUP) {
        self.screen._listenMouse(self);
      } else if (type === KEYPRESS || type.indexOf(KEY + SP) === 0) {
        self.screen._listenKeys(self);
      }
    });
    this.on(RESIZE, () => self.parseContent());
    this.on(ATTACH, () => self.parseContent());
    this.on(DETACH, () => delete self.prevPos);

    if (!nullish(options.hoverBg)) {
      if (nullish(options.hoverEffects)) options.hoverEffects = {};
      options.hoverEffects.bg = options.hoverBg;
    }

    if (this.style.hover) {
      options.hoverEffects = this.style.hover;
    }

    if (this.style.focus) {
      options.focusEffects = this.style.focus;
    }

    if (options.effects) {
      if (options.effects.hover) options.hoverEffects = options.effects.hover;
      if (options.effects.focus) options.focusEffects = options.effects.focus;
    }

    for (const [key, over, out, temp] of UI_EVENT_TODOS) {
      self.screen.setEffects(self, self, over, out, self.options[key], temp);
    }

    if (this.options.draggable) {
      this.draggable = true;
    }

    if (options.focused) this.focus();
  }

  get focused() {
    return this.screen.focused === this;
  }

  get visible() {
    let node = this;

    do {
      if (node.detached) return false;
      if (node.hidden) return false; // if (!el.prevPos) return false;
      // if (el.pos.width === 0 || el.pos.height === 0) return false;
    } while (node = node.sup);

    return true;
  }

  get _detached() {
    let node = this;

    do {
      if (node.type === 'screen') return false;
      if (!node.sup) return true;
    } while (node = node.sup);

    return false;
  }

  get draggable() {
    return this._draggable === true;
  }

  set draggable(draggable) {
    return draggable ? this.enableDrag(draggable) : this.disableDrag();
  }
  /**
   * Positioning
   */

  /**
   * Position Getters and Setters
   */
  // NOTE:
  // For absR, absB, right, and bottom:
  // If position.bottom is null, we could simply set top instead.
  // But it wouldn't replicate bottom behavior appropriately if
  // the sup was resized, etc.


  get position() {
    return this.pos;
  }

  get scaler() {
    return this.screen.gridScale;
  }
  /**
   * Relative coordinates as default properties
   */


  get left() {
    return this.relL;
  }

  get right() {
    return this.relR;
  }

  get top() {
    return this.relT;
  }

  get bottom() {
    return this.relB;
  }

  get width() {
    return this.calcW(false);
  }

  get height() {
    return this.calcH(false);
  }

  set left(val) {
    return this.relL = val;
  }

  set right(val) {
    return this.relR = val;
  }

  set top(val) {
    return this.relT = val;
  }

  set bottom(val) {
    return this.relB = val;
  }

  set width(val) {
    if (this.pos.width === val) return val;
    if (/^\d+$/.test(val)) val = +val;
    this.emit(RESIZE), this.clearPos();
    return this.pos.width = val;
  }

  set height(val) {
    if (this.pos.height === val) return val;
    if (/^\d+$/.test(val)) val = +val;
    this.emit(RESIZE), this.clearPos();
    return this.pos.height = val;
  }

  get absT() {
    return this.calcT(false);
  }

  get absB() {
    return this.calcB(false);
  }

  get absL() {
    return this.calcL(false);
  }

  get absR() {
    return this.calcR(false);
  }

  get relT() {
    return this.absT - this.sup.absT;
  }

  get relB() {
    return this.absB - this.sup.absB;
  }

  get relL() {
    return this.absL - this.sup.absL;
  }

  get relR() {
    return this.absR - this.sup.absR;
  }

  get intT() {
    return (this.border ? 1 : 0) + this.padding.t;
  }

  get intB() {
    return (this.border ? 1 : 0) + this.padding.b;
  }

  get intL() {
    return (this.border ? 1 : 0) + this.padding.l;
  }

  get intR() {
    return (this.border ? 1 : 0) + this.padding.r;
  }

  get intH() {
    return (this.border ? 2 : 0) + this.padding.vert;
  }

  get intW() {
    return (this.border ? 2 : 0) + this.padding.hori;
  }

  set absT(val) {
    if (typeof val === STR) if (val === CENTER) {
      val = (this.screen.height / 2 | 0) - (this.height / 2 | 0);
    } else {
      val = this.inGrid ? this.scaler.scaleT(val, this.screen.height) : scaler(val, this.screen.height);
    }
    val -= this.sup.absT;
    if (this.pos.top === val) return val;
    this.emit(MOVE), this.clearPos();
    return this.pos.top = val;
  }

  set absB(val) {
    val -= this.sup.absB;
    if (this.pos.bottom === val) return val;
    this.emit(MOVE), this.clearPos();
    return this.pos.bottom = val;
  }

  set absL(val) {
    if (typeof val === STR) if (val === CENTER) {
      val = (this.screen.width / 2 | 0) - (this.width / 2 | 0);
    } else {
      val = this.inGrid ? this.scaler.scaleL(val, this.screen.width) : scaler(val, this.screen.width);
    }
    val -= this.sup.absL;
    if (this.pos.left === val) return val;
    this.emit(MOVE), this.clearPos();
    return this.pos.left = val;
  }

  set absR(val) {
    val -= this.sup.absR;
    if (this.pos.right === val) return val;
    this.emit(MOVE), this.clearPos();
    return this.pos.right = val;
  }

  set relT(val) {
    if (this.pos.top === val) return val;
    if (/^\d+$/.test(val)) val = +val;
    this.emit(MOVE), this.clearPos();
    return this.pos.top = val;
  }

  set relB(val) {
    if (this.pos.bottom === val) return val;
    this.emit(MOVE), this.clearPos();
    return this.pos.bottom = val;
  }

  set relL(val) {
    if (this.pos.left === val) return val;
    if (/^\d+$/.test(val)) val = +val;
    this.emit(MOVE), this.clearPos();
    return this.pos.left = val;
  }

  set relR(val) {
    if (this.pos.right === val) return val;
    this.emit(MOVE), this.clearPos();
    return this.pos.right = val;
  }

  get paddingSum() {
    return this.padding.t + this.padding.b + this.padding.l + this.padding.r;
  }
  /**
   * Position Getters
   */


  calcT(get) {
    const supPos = get ? this.sup.calcPos() : this.sup;
    let top = this.pos.top || 0;

    if (typeof top === STR) {
      if (top === CENTER) {
        top = '50%';
      }

      top = this.inGrid ? this.scaler.scaleT(top, supPos.height) : scaler(top, supPos.height);
      if (this.pos.top === CENTER) top -= this.calcH(get) / 2 | 0;
    }

    if (nullish(this.pos.top) && valid(this.pos.bottom)) {
      return this.screen.rows - this.calcH(get) - this.calcB(get);
    }

    if (this.screen.autoPadding && (valid(this.pos.top) || nullish(this.pos.bottom)) && this.pos.top !== CENTER) {
      top += this.sup.intT;
    }

    return (supPos.t || 0) + top;
  }

  calcB(get) {
    const supPos = get ? this.sup.calcPos() : this.sup;
    const bottom = nullish(this.pos.bottom) && valid(this.pos.top) ? this.screen.rows - (this.calcT(get) + this.calcH(get)) : (supPos.b || 0) + (this.pos.bottom || 0);
    return this.screen.autoPadding ? bottom + this.sup.intB : bottom;
  }

  calcL(get) {
    const supPos = get ? this.sup.calcPos() : this.sup;
    let left = this.pos.left || 0;

    if (typeof left === STR) {
      if (left === CENTER) {
        left = '50%';
      }

      left = this.inGrid ? this.scaler.scaleL(left, supPos.width) : scaler(left, supPos.width);

      if (this.pos.left === CENTER) {
        left -= this.calcW(get) / 2 | 0;
      }
    }

    if (nullish(this.pos.left) && valid(this.pos.right)) {
      return this.screen.cols - this.calcW(get) - this.calcR(get);
    }

    if (this.screen.autoPadding && (valid(this.pos.left) || nullish(this.pos.right)) && this.pos.left !== CENTER) {
      left += this.sup.intL;
    }

    return (supPos.l || 0) + left;
  }

  calcR(get) {
    const supPos = get ? this.sup.calcPos() : this.sup;
    const right = this.pos.right == null && this.pos.left != null ? this.screen.cols - (this.calcL(get) + this.calcW(get)) : (supPos.r || 0) + (this.pos.right || 0);
    return this.screen.autoPadding ? right + this.sup.intR : right;
  }

  calcW(get) {
    const supPos = get ? this.sup.calcPos() : this.sup;
    let width = this.pos.width,
        left;

    if (typeof width === STR) {
      if (width === HALF) {
        width = '50%';
      }

      width = this.inGrid ? this.scaler.scaleW(width, supPos.width) : scaler(width, supPos.width);
      return width;
    } // This is for if the element is being streched or shrunken.
    // Although the width for shrunken elements is calculated
    // in the render function, it may be calculated based on
    // the content width, and the content width is initially
    // decided by the width the element, so it needs to be
    // calculated here.


    if (width == null) {
      left = this.pos.left || 0;

      if (typeof left === STR) {
        if (left === CENTER) {
          left = '50%';
        }

        left = this.inGrid ? this.scaler.scaleL(left, supPos.width) : scaler(left, supPos.width);
      }

      width = supPos.width - (this.pos.right || 0) - left;

      if (this.screen.autoPadding) {
        if ((this.pos.left != null || this.pos.right == null) && this.pos.left !== CENTER) width -= this.sup.intL;
        width -= this.sup.intR;
      }
    }

    return width;
  }

  calcH(get) {
    const supPos = get ? this.sup.calcPos() : this.sup;
    let height = this.pos.height,
        top;

    if (typeof height === STR) {
      if (height === HALF) {
        height = '50%';
      }

      height = this.inGrid ? this.scaler.scaleH(height, supPos.height) : scaler(height, supPos.height);
      return height;
    } // This is for if the element is being streched or shrunken.
    // Although the width for shrunken elements is calculated
    // in the render function, it may be calculated based on
    // the content width, and the content width is initially
    // decided by the width the element, so it needs to be
    // calculated here.


    if (height == null) {
      top = this.pos.top || 0;

      if (typeof top === STR) {
        if (top === CENTER) {
          top = '50%';
        }

        top = this.inGrid ? this.scaler.scaleT(top, supPos.height) : scaler(top, supPos.height);
      }

      height = supPos.height - (this.pos.bottom || 0) - top;

      if (this.screen.autoPadding) {
        if ((this.pos.top != null || this.pos.bottom == null) && this.pos.top !== CENTER) height -= this.sup.intT;
        height -= this.sup.intB;
      }
    }

    return height;
  }

  calcPos() {
    const pos = this.prevPos;
    assert.ok(pos);
    if (!nullish(pos.absL)) return pos;
    const t = pos.t;
    const b = this.screen.rows - pos.b;
    const l = pos.l;
    const r = this.screen.cols - pos.r;
    const h = pos.b - pos.t;
    const w = pos.r - pos.l;
    return new Detic(t, b, l, r, h, w);
  }

  calcCoord(get, noScroll) {
    if (this.hidden) return void 0; // if (this.sup._rendering) { get = true }

    let t = this.calcT(get),
        b = t + this.calcH(get),
        l = this.calcL(get),
        r = l + this.calcW(get),
        negT,
        negB,
        negL,
        negR,
        base = this.subBase || 0,
        fixed = this.fixed; // Attempt to shrink the element base on the size of the content and child elements.

    if (this.shrink) {
      ({
        xLo: l,
        xHi: r,
        yLo: t,
        yHi: b
      } = this.calcShrink(l, r, t, b, get));
    } // Find a scrollable ancestor if we have one.


    let node = this;

    while (node = node.sup) {
      if (node.scrollable) {
        if (fixed) {
          fixed = false;
          continue;
        }

        break;
      }
    } // Check to make sure we're visible and inside of the visible scroll area.
    // NOTE: Lists have a property where only the list items are obfuscated.
    // Old way of doing things, this would not render right if a shrunken element with lots of boxes in it was within a scrollable element.
    // See: $ node test/widget-shrink-fail.js


    const sup = node;

    if (node && !noScroll) {
      const supPos = sup.prevPos; // The shrink option can cause a stack overflow by calling calcCoord on the child again.
      // if (!get && !sup.shrink) { supPos = sup.calcCoord() }

      if (!supPos) return void 0; // TODO: Figure out how to fix base (and cbase to only take into account the *sup's* padding.

      t -= supPos.base;
      b -= supPos.base;
      let border = sup.border ? 1 : 0; // XXX
      // Fixes non-`fixed` labels to work with scrolling (they're ON the border):
      // if (this.pos.left < 0 || this.pos.right < 0 || this.pos.top < 0 || this.pos.bottom < 0) {

      if (this._isLabel) {
        border = 0;
      }

      if (t < supPos.yLo + border) {
        if (b < supPos.yLo + border + 1) {
          return void 0;
        } // Is above.
        else {
          negT = true;
          let v = supPos.yLo - t;
          if (this.border) v--;
          if (sup.border) v++;
          base += v;
          t += v;
        } // Is partially covered above.

      } else if (b > supPos.yHi - border) {
        if (t > supPos.yHi - 1 - border) {
          return void 0;
        } // Is below.
        else {
          negB = true;
          let v = b - supPos.yHi;
          if (this.border) v--;
          if (sup.border) v++;
          b -= v;
        } // Is partially covered below.

      } // Shouldn't be necessary.
      // assert.ok(t < b);


      if (t >= b) return void 0; // Could allow overlapping stuff in scrolling elements if we cleared the pending buffer before every draw.

      if (l < node.prevPos.xLo) {
        l = node.prevPos.xLo;
        negL = true;
        if (this.border) l--;
        if (sup.border) l++;
      }

      if (node.prevPos.xHi < r) {
        r = node.prevPos.xHi;
        negR = true;
        if (this.border) r++;
        if (sup.border) r--;
      }

      if (l >= r) return void 0; //if (l > r) return;
    }

    if (this.noOverflow && this.sup.prevPos) {
      const {
        xLo: xLoSup,
        xHi: xHiSup,
        yLo: yLoSup,
        yHi: yHiSup
      } = this.sup.prevPos;
      const {
        intT,
        intB,
        intL,
        intR
      } = this.sup;

      if (t < yLoSup + intT) {
        t = yLoSup + intT;
      }

      if (b > yHiSup - intB) {
        b = yHiSup - intB;
      }

      if (l < xLoSup + intL) {
        l = xLoSup + intL;
      }

      if (r > xHiSup - intR) {
        r = xHiSup - intR;
      }
    } // if (this.sup.prevPos) { this.sup.prevPos._scrollBottom = Math.max(this.sup.prevPos._scrollBottom, b) }


    return Coord.build(t, b, l, r, negT, negB, negL, negR, base, this.screen.renders);
  }

  calcShrinkBox(xLo, xHi, yLo, yHi, get) {
    if (!this.sub.length) return {
      xLo,
      xHi: xLo + 1,
      yLo,
      yHi: yLo + 1
    };
    let i,
        el,
        ret,
        mxi = xLo,
        mxl = xLo + 1,
        myi = yLo,
        myl = yLo + 1; // This is a chicken and egg problem. We need to determine how the sub
    // will render in order to determine how this element renders, but it in
    // order to figure out how the sub will render, they need to know
    // exactly how their sup renders, so, we can give them what we have so
    // far.

    let prevPos;

    if (get) {
      prevPos = this.prevPos;
      this.prevPos = new Coord(yLo, yHi, xLo, xHi); // { xLo, xHi, yLo, yHi }
      //this.shrink = false;
    }

    for (i = 0; i < this.sub.length; i++) {
      el = this.sub[i];
      ret = el.calcCoord(get); // Or just (seemed to work, but probably not good):
      // ret = el.prevPos || this.prevPos;

      if (!ret) continue; // Since the sup element is shrunk, and the child elements think it's
      // going to take up as much space as possible, an element anchored to the
      // right or bottom will inadvertantly make the sup's shrunken size as
      // large as possible. So, we can just use the height and/or width the of
      // element.
      // if (get) {

      if (el.pos.left == null && el.pos.right != null) {
        ret.xHi = xLo + (ret.xHi - ret.xLo);
        ret.xLo = xLo;

        if (this.screen.autoPadding) {
          // Maybe just do this no matter what.
          ret.xHi += this.intL;
          ret.xLo += this.intL;
        }
      }

      if (el.pos.top == null && el.pos.bottom != null) {
        ret.yHi = yLo + (ret.yHi - ret.yLo);
        ret.yLo = yLo;

        if (this.screen.autoPadding) {
          // Maybe just do this no matter what.
          ret.yHi += this.intT;
          ret.yLo += this.intT;
        }
      }

      if (ret.xLo < mxi) mxi = ret.xLo;
      if (ret.xHi > mxl) mxl = ret.xHi;
      if (ret.yLo < myi) myi = ret.yLo;
      if (ret.yHi > myl) myl = ret.yHi;
    }

    if (get) {
      this.prevPos = prevPos; //this.shrink = true;
    }

    if (this.pos.width == null && (this.pos.left == null || this.pos.right == null)) {
      if (this.pos.left == null && this.pos.right != null) {
        xLo = xHi - (mxl - mxi);
        xLo -= !this.screen.autoPadding ? this.padding.hori : this.intL;
      } else {
        xHi = mxl;

        if (!this.screen.autoPadding) {
          xHi += this.padding.hori; // XXX Temporary workaround until we decide to make autoPadding default.
          // See widget-listtable.js for an example of why this is necessary.
          // XXX Maybe just to this for all this being that this would affect
          // width shrunken normal shrunken lists as well.
          // if (this._isList) {

          if (this.type === 'list-table') {
            xHi -= this.padding.hori;
            xHi += this.intR;
          }
        } else {
          //xHi += this.padding.right;
          xHi += this.intR;
        }
      }
    }

    if (this.pos.height == null && (this.pos.top == null || this.pos.bottom == null) && (!this.scrollable || this._isList)) {
      // NOTE: Lists get special treatment if they are shrunken - assume they
      // want all list items showing. This is one case we can calculate the
      // height based on items/boxes.
      if (this._isList) {
        myi = 0 - this.intT;
        myl = this.items.length + this.intB;
      }

      if (this.pos.top == null && this.pos.bottom != null) {
        yLo = yHi - (myl - myi);
        yLo -= !this.screen.autoPadding ? this.padding.vert : this.intT;
      } else {
        yHi = myl;
        yHi += !this.screen.autoPadding ? this.padding.vert : this.intB;
      }
    }

    return {
      xLo,
      xHi,
      yLo,
      yHi
    };
  }

  calcShrinkContent(xLo, xHi, yLo, yHi) {
    const h = this.contLines.length,
          w = this.contLines.mwidth || 1;

    if (this.pos.width == null && (this.pos.left == null || this.pos.right == null)) {
      if (this.pos.left == null && this.pos.right != null) {
        xLo = xHi - w - this.intW;
      } else {
        xHi = xLo + w + this.intW;
      }
    }

    if (this.pos.height == null && (this.pos.top == null || this.pos.bottom == null) && (!this.scrollable || this._isList)) {
      if (this.pos.top == null && this.pos.bottom != null) {
        yLo = yHi - h - this.intH;
      } else {
        yHi = yLo + h + this.intH;
      }
    }

    return new Coord(yLo, yHi, xLo, xHi); // { yLo, yHi, xLo, xHi }
  }

  calcShrink(xLo, xHi, yLo, yHi, get) {
    const shrinkBox = this.calcShrinkBox(xLo, xHi, yLo, yHi, get),
          shrinkContent = this.calcShrinkContent(xLo, xHi, yLo, yHi, get);
    let xll = xHi,
        yll = yHi; // Figure out which one is bigger and use it.

    if (shrinkBox.xHi - shrinkBox.xLo > shrinkContent.xHi - shrinkContent.xLo) {
      xLo = shrinkBox.xLo, xHi = shrinkBox.xHi;
    } else {
      xLo = shrinkContent.xLo, xHi = shrinkContent.xHi;
    }

    if (shrinkBox.yHi - shrinkBox.yLo > shrinkContent.yHi - shrinkContent.yLo) {
      yLo = shrinkBox.yLo, yHi = shrinkBox.yHi;
    } else {
      yLo = shrinkContent.yLo, yHi = shrinkContent.yHi;
    } // Recenter shrunken elements.


    if (xHi < xll && this.pos.left === CENTER) {
      xll = (xll - xHi) / 2 | 0;
      xLo += xll;
      xHi += xll;
    }

    if (yHi < yll && this.pos.top === CENTER) {
      yll = (yll - yHi) / 2 | 0;
      yLo += yll;
      yHi += yll;
    }

    return new Coord(yLo, yHi, xLo, xHi); // { yLo, yHi, xLo, xHi }
  }

  clearPos(get, override) {
    if (this.detached) return;
    const coord = this.calcCoord(get);
    if (!coord) return;
    const {
      xLo,
      xHi,
      yLo,
      yHi
    } = coord;
    this.screen.clearRegion(xLo, xHi, yLo, yHi, override);
  }

  sattr(style, fg, bg) {
    return styleToAttr(style, fg, bg);
  } // Convert `{red-fg}foo{/red-fg}` to `\x1b[31mfoo\x1b[39m`.


  get _clines() {
    return this.contLines;
  }

  parseContent(noTags) {
    if (this.detached) return false;
    const width = this.width - this.intW;

    if (this.contLines == null || this.contLines.width !== width || this.contLines.content !== this.content) {
      let content = this.content.replace(/[\x00-\x08\x0b-\x0c\x0e-\x1a\x1c-\x1f\x7f]/g, '').replace(/\x1b(?!\[[\d;]*m)/g, '').replace(/\r\n|\r/g, LF).replace(/\t/g, this.screen.tabc);

      if (this.screen.fullUnicode) {
        // double-width chars will eat the next char after render. create a
        // blank character after it so it doesn't eat the real next char.
        content = content.replace(unicode.chars.all, '$1\x03'); // iTerm2 cannot render combining characters properly.

        if (this.screen.program.isiTerm2) content = content.replace(unicode.chars.combining, '');
      } else {
        // no double-width: replace them with question-marks.
        content = content.replace(unicode.chars.all, '??'); // delete combining characters since they're 0-width anyway.
        // NOTE: We could drop this, the non-surrogates would get changed to ? by
        // the unicode filter, and surrogates changed to ? by the surrogate
        // regex. however, the user might expect them to be 0-width.
        // NOTE: Might be better for performance to drop!

        content = content.replace(unicode.chars.combining, ''); // no surrogate pairs: replace them with question-marks.

        content = content.replace(unicode.chars.surrogate, '?'); // XXX Deduplicate code here:
        // content = helpers.dropUnicode(content);
      }

      if (!noTags) {
        content = this.#parseTags(content);
      }

      this.contLines = this.#wrapContent(content, width); // console.log(`>> [{${ this.codename }}.contLines]`, this.contLines)

      this.contLines.width = width;
      this.contLines.content = this.content;
      this.contLines.attr = this.#parseAttr(this.contLines);
      this.contLines.ci = [];
      this.contLines.reduce((total, line) => {
        this.contLines.ci.push(total);
        return total + line.length + 1;
      }, 0);
      this.#parsedContent = this.contLines.join(LF);
      this.emit(PARSED_CONTENT);
      return true;
    } // Need to calculate this every time because the default fg/bg may change.


    this.contLines.attr = this.#parseAttr(this.contLines) || this.contLines.attr;
    return false;
  }

  #wrapContent(content, width) {
    const tags = this.parseTags;
    let state = this.align;
    const wrap = this.wrap;
    let margin = 0;
    const rtof = [],
          ftor = [],
          out = [];
    let no = 0,
        line,
        align,
        total,
        i,
        part,
        j,
        lines,
        rest;
    lines = content.split(LF);

    if (!content) {
      out.push(content);
      out.rtof = [0];
      out.ftor = [[0]];
      out.fake = lines;
      out.real = out;
      out.mwidth = 0;
      return out;
    }

    if (this.scrollbar) margin++;
    if (this.type === 'textarea') margin++;
    if (width > margin) width -= margin;
    let matches, phrase, word;

    main: for (; no < lines.length; no++) {
      line = lines[no];
      align = state;
      ftor.push([]); // Handle alignment tags.

      if (tags) {
        if ((matches = /^{(left|center|right)}/.exec(line)) && ([phrase, word] = matches)) {
          line = line.slice(phrase.length);
          align = state = word !== LEFT ? word : null;
        }

        if ((matches = /{\/(left|center|right)}$/.exec(line)) && ([phrase] = matches)) {
          line = line.slice(0, -phrase.length); //state = null;

          state = this.align;
        }
      } // If the string is apparently too long, wrap it.


      while (line.length > width) {
        // Measure the real width of the string.
        for (i = 0, total = 0; i < line.length; i++) {
          while (line[i] === ESC) while (line[i] && line[i++] !== 'm') {}

          if (!line[i]) break;

          if (++total === width) {
            // If we're not wrapping the text, we have to finish up the rest of
            // the control sequences before cutting off the line.
            i++;

            if (!wrap) {
              rest = line.slice(i).match(/\x1b\[[^m]*m/g);
              rest = rest ? rest.join('') : '';
              out.push(this._align(line.slice(0, i) + rest, width, align));
              ftor[no].push(out.length - 1);
              rtof.push(no);
              continue main;
            }

            if (!this.screen.fullUnicode) {
              // Try to find a space to break on.
              if (i !== line.length) {
                j = i;

                while (j > i - 10 && j > 0 && line[--j] !== ' ') if (line[j] === ' ') i = j + 1;
              }
            } else {
              // Try to find a character to break on.
              if (i !== line.length) {
                // <XXX>
                // Compensate for surrogate length counts on wrapping (experimental):
                // NOTE: Could optimize this by putting it in the sup for loop.
                if (unicode.isSurrogate(line, i)) i--;
                let s = 0,
                    n = 0;

                for (; n < i; n++) {
                  if (unicode.isSurrogate(line, n)) s++, n++;
                }

                i += s; // </XXX>

                j = i; // Break _past_ space.
                // Break _past_ double-width chars.
                // Break _past_ surrogate pairs.
                // Break _past_ combining chars.

                while (j > i - 10 && j > 0) {
                  j--;

                  if (line[j] === ' ' || line[j] === '\x03' || unicode.isSurrogate(line, j - 1) && line[j + 1] !== '\x03' || unicode.isCombining(line, j)) {
                    break;
                  }
                }

                if (line[j] === ' ' || line[j] === '\x03' || unicode.isSurrogate(line, j - 1) && line[j + 1] !== '\x03' || unicode.isCombining(line, j)) {
                  i = j + 1;
                }
              }
            }

            break;
          }
        }

        part = line.slice(0, i);
        line = line.slice(i);
        out.push(this._align(part, width, align));
        ftor[no].push(out.length - 1);
        rtof.push(no); // Make sure we didn't wrap the line to the very end, otherwise we get a pointless empty line after a newline.

        if (line === '') continue main; // If only an escape code got cut off, at it to `part`.

        if (/^(?:\x1b[\[\d;]*m)+$/.test(line)) {
          out[out.length - 1] += line;
          continue main;
        }
      }

      out.push(this._align(line, width, align));
      ftor[no].push(out.length - 1);
      rtof.push(no);
    }

    out.rtof = rtof;
    out.ftor = ftor;
    out.fake = lines;
    out.real = out;
    out.mwidth = out.reduce((current, line) => {
      line = line.replace(REGEX_SGR_G, '');
      return line.length > current ? line.length : current;
    }, 0);
    return out;
  }

  #parseTags(text) {
    if (!this.parseTags) return text;
    if (!/{\/?[\w\-,;!#]*}/.test(text)) return text;
    const program = this.screen.program;
    let out = '',
        state;
    const bg = [],
          fg = [],
          flag = [];
    let cap, slash, param, attr, esc;

    while (true) {
      if (!esc && (cap = /^{escape}/.exec(text))) {
        text = text.slice(cap[0].length);
        esc = true;
        continue;
      }

      if (esc && (cap = /^([\s\S]+?){\/escape}/.exec(text))) {
        text = text.slice(cap[0].length);
        out += cap[1];
        esc = false;
        continue;
      }

      if (esc) {
        // throw new Error('Unterminated escape tag.');
        out += text;
        break;
      }

      if (cap = /^{(\/?)([\w\-,;!#]*)}/.exec(text)) {
        text = text.slice(cap[0].length);
        slash = cap[1] === '/';
        param = cap[2].replace(/-/g, ' ');

        if (param === 'open') {
          out += '{';
          continue;
        } else if (param === 'close') {
          out += '}';
          continue;
        }

        state = param.slice(-3) === ' bg' ? bg : param.slice(-3) === ' fg' ? fg : flag; // console.log('>> [element.#parseTags]', param, state)

        if (slash) {
          if (!param) {
            out += program.parseAttr('normal');
            bg.length = 0;
            fg.length = 0;
            flag.length = 0;
          } else {
            attr = program.parseAttr(param, false);

            if (!nullish(attr)) {
              state.pop();
              out += state.length ? program.parseAttr(last(state)) : attr;
            } else {
              out += cap[0];
            }
          }
        } else {
          if (!param) {
            out += cap[0];
          } else {
            attr = program.parseAttr(param);

            if (!nullish(attr)) {
              state.push(param);
              out += attr;
            } else {
              out += cap[0];
            }
          }
        }

        continue;
      }

      if (cap = /^[\s\S]+?(?={\/?[\w\-,;!#]*})/.exec(text)) {
        text = text.slice(cap[0].length);
        out += cap[0];
        continue;
      }

      out += text;
      break;
    }

    return out;
  }

  #parseAttr(lines) {
    const normAttr = styleToAttr(this.style);
    let baseAttr = normAttr;
    const attrList = [];
    if (lines[0].attr === baseAttr) return void 0;

    for (let j = 0, line; j < lines.length; j++) {
      line = lines[j];
      attrList[j] = baseAttr;

      for (let i = 0, matches, sgra; i < line.length; i++) {
        if (line[i] === ESC) {
          if ((matches = REGEX_INIT_SGR.exec(line.slice(i))) && ([sgra] = matches)) {
            baseAttr = sgraToAttr(sgra, baseAttr, normAttr);
            i += sgra.length - 1;
          }
        }
      }
    }

    return attrList;
  }

  renderElement = Element.prototype.render;

  render() {
    var _this$border;

    this.nodeEmit(PRERENDER);
    this.parseContent();
    const coord = this.calcCoord(true);
    if (!coord) return void delete this.prevPos;
    if (coord.dHori <= 0) return void (coord.xHi = Math.max(coord.xHi, coord.xLo));
    if (coord.dVert <= 0) return void (coord.yHi = Math.max(coord.yHi, coord.yLo));
    const lines = this.screen.lines; // console.log(`>> [{${ this.codename }}.render]`, lines[0][0],lines[0][0].modeSign)

    let {
      xLo,
      xHi,
      yLo,
      yHi
    } = coord,
        currAttr,
        ch;
    const content = this.#parsedContent; // if (this.codename === 'box.24') console.log('box.24', 'this.content', `[ ${ this.content } ]`)
    // if (this.codename === 'box.24') console.log('box.24', 'content', `[ ${ content } ]`)
    // if (this.codename === 'box.24') console.log('box.24', 'this.contLines', `[ ${ this.contLines } ]`)
    // if (this.codename === 'box.24') console.log('box.24', 'this.#parsedContent', `[ ${ this.#parsedContent } ]`)

    let ci = this.contLines.ci[coord.base],
        borderAttr,
        normAttr,
        visible,
        i;
    const bch = this.ch;
    if (coord.base >= this.contLines.ci.length) ci = this.#parsedContent.length;
    this.prevPos = coord;

    if (((_this$border = this.border) === null || _this$border === void 0 ? void 0 : _this$border.type) === 'line') {
      this.screen._borderStops[coord.yLo] = true;
      this.screen._borderStops[coord.yHi - 1] = true;
    }

    normAttr = styleToAttr(this.style); // console.log('>> [element.render] interim', dattr)

    currAttr = normAttr; // If we're in a scrollable text box, check to
    // see which attributes this line starts with.

    if (ci > 0) currAttr = this.contLines.attr[Math.min(coord.base, this.contLines.length - 1)];
    if (this.border) xLo++, xHi--, yLo++, yHi--; // If we have padding/valign, that means the
    // content-drawing loop will skip a few cells/lines.
    // To deal with this, we can just fill the whole thing
    // ahead of time. This could be optimized.

    if (this.padding.any || this.valign && this.valign !== TOP) {
      if (this.style.transparent) {
        for (let y = Math.max(yLo, 0), line, cell; y < yHi; y++) {
          if (!(line = lines[y])) break;

          for (let x = Math.max(xLo, 0); x < xHi; x++) {
            if (!(cell = line[x])) break;
            cell.at = colors.blend(currAttr, cell.at);
            line.dirty = true; // lines[y][x][1] = bch;
          }
        }
      } else {
        this.screen.fillRegion(normAttr, bch, xLo, xHi, yLo, yHi);
      }
    }

    if (this.padding.any) {
      const {
        t,
        b,
        l,
        r
      } = this.padding;
      xLo += l, xHi -= r, yLo += t, yHi -= b;
    } // Determine where to place the text if it's vertically aligned.


    if (this.valign === MIDDLE || this.valign === BOTTOM) {
      visible = yHi - yLo;

      if (this.contLines.length < visible) {
        if (this.valign === MIDDLE) {
          visible = visible / 2 | 0;
          visible -= this.contLines.length / 2 | 0;
        } else if (this.valign === BOTTOM) {
          visible -= this.contLines.length;
        }

        ci -= visible * (xHi - xLo);
      }
    } // Draw the content and background.


    for (let y = yLo, line; y < yHi; y++) {
      if (!(line = lines[y])) {
        if (y >= this.screen.height || yHi < this.intB) {
          break;
        } else {
          continue;
        }
      }

      for (let x = xLo, cell; x < xHi; x++) {
        if (!(cell = line[x])) {
          if (x >= this.screen.width || xHi < this.intR) {
            break;
          } else {
            continue;
          }
        }

        ch = content[ci++] || bch; // if (!content[ci] && !coords._contentEnd) {
        //   coords._contentEnd = { x: x - xLo, y: y - yLo };
        // }
        // Handle escape codes.

        let matches, sgra;

        while (ch === ESC) {
          if ((matches = REGEX_INIT_SGR.exec(content.slice(ci - 1))) && ([sgra] = matches)) {
            ci += sgra.length - 1;
            currAttr = sgraToAttr(sgra, currAttr, normAttr); // if (this.codename === 'box.25') console.log(
            //   '[box.25]', content, content.replace(/\s/g, '_').replace(/\x1b/g, '^'), tempCi,
            //   '[sgra]', '' + Mor.build(sgra |> sgraToAttr),
            //   '[currAttr]', '' + Mor.build(currAttr),
            // )
            // Ignore foreground changes for selected items.

            if (this.sup._isList && this.sup.interactive && this.sup.items[this.sup.selected] === this && this.sup.options.invertSelected !== false) {
              currAttr = currAttr & ~(0x1ff << 9) | normAttr & 0x1ff << 9;
            }

            ch = content[ci] || bch;
            ci++;
          } else {
            break;
          }
        } // Handle newlines.


        if (ch === TAB) ch = bch;

        if (ch === LF) {
          // If we're on the first cell and we find a newline and the last cell
          // of the last line was not a newline, let's just treat this like the
          // newline was already "counted".
          if (x === xLo && y !== yLo && content[ci - 2] !== LF) {
            x--;
            continue;
          } // We could use fillRegion here, name the
          // outer loop, and continue to it instead.


          ch = bch;

          for (; x < xHi; x++) {
            if (!(cell = line[x])) break;

            if (this.style.transparent) {
              cell.inject(colors.blend(currAttr, cell.at), content[ci] ? ch : null);
              line.dirty = true;
            } else if (cell.at !== currAttr || cell.ch !== ch) {
              cell.inject(currAttr, ch);
              line.dirty = true;
            }
          }

          continue;
        }

        if (this.screen.fullUnicode && content[ci - 1]) {
          const point = unicode.codePointAt(content, ci - 1); // Handle combining chars:
          // Make sure they get in the same cell and are counted as 0.

          if (unicode.combining[point]) {
            if (point > 0x00ffff) {
              ch = content[ci - 1] + content[ci];
              ci++;
            }

            if (x - 1 >= xLo) {
              line[x - 1].ch += ch;
            } else if (y - 1 >= yLo) {
              lines[y - 1][xHi - 1].ch += ch;
            }

            x--;
            continue;
          } // Handle surrogate pairs:
          // Make sure we put surrogate pair chars in one cell.


          if (point > 0x00ffff) {
            ch = content[ci - 1] + content[ci];
            ci++;
          }
        }

        if (this._noFill) continue;
        const nextCell = line[x];

        if (this.style.transparent) {
          nextCell.inject(colors.blend(currAttr, nextCell.at), content[ci] ? ch : null);
          line.dirty = true;
        } else {
          if (cell.at !== currAttr || cell.ch !== ch) {
            nextCell.inject(currAttr, ch);
            line.dirty = true;
          }
        }
      }
    } // Draw the scrollbar.
    // Could possibly draw this after all child elements.


    if (this.scrollbar) {
      // i = this.scrollHeight;
      i = Math.max(this.contLines.length, this._scrollBottom());
    }

    if (coord.negT || coord.negB) i = -Infinity;

    if (this.scrollbar && yHi - yLo < i) {
      let x = xHi - 1;
      if (this.scrollbar.ignoreBorder && this.border) x++;
      let y = this.alwaysScroll ? this.subBase / (i - (yHi - yLo)) : (this.subBase + this.subOffset) / (i - 1);
      y = yLo + ((yHi - yLo) * y | 0);
      if (y >= yHi) y = yHi - 1;
      let line = lines[y],
          cell = line && line[x];

      if (cell) {
        if (this.track) {
          ch = this.track.ch || ' ';
          currAttr = styleToAttr(this.style.track, this.style.track.fg || this.style.fg, this.style.track.bg || this.style.bg);
          this.screen.fillRegion(currAttr, ch, x, x + 1, yLo, yHi);
        }

        ch = this.scrollbar.ch || ' ';
        currAttr = styleToAttr(this.style.scrollbar, this.style.scrollbar.fg || this.style.fg, this.style.scrollbar.bg || this.style.bg);

        if (currAttr !== cell.at || ch !== cell.ch) {
          cell.inject(currAttr, ch);
          lines[y].dirty = true;
        }
      }
    }

    if (this.border) xLo--, xHi++, yLo--, yHi++;

    if (this.padding.any) {
      xLo -= this.padding.l, xHi += this.padding.r, yLo -= this.padding.t, yHi += this.padding.b;
    } // Draw the border.


    if (this.border) {
      borderAttr = styleToAttr(this.style.border);
      let y = yLo;
      if (coord.negT) y = -1;
      let line = lines[y];

      for (let x = xLo, cell; x < xHi; x++) {
        if (!line) break;
        if (coord.negL && x === xLo) continue;
        if (coord.negR && x === xHi - 1) continue;
        if (!(cell = line[x])) continue;

        if (this.border.type === 'line') {
          if (x === xLo) {
            ch = '\u250c'; // '┌'

            if (!this.border.left) {
              if (this.border.top) {
                ch = '\u2500';
              } // '─'
              else {
                continue;
              }
            } else {
              if (!this.border.top) {
                ch = '\u2502';
              } // '│'

            }
          } else if (x === xHi - 1) {
            ch = '\u2510'; // '┐'

            if (!this.border.right) {
              if (this.border.top) {
                ch = '\u2500';
              } // '─'
              else {
                continue;
              }
            } else {
              if (!this.border.top) {
                ch = '\u2502';
              } // '│'

            }
          } else {
            ch = '\u2500';
          } // '─'

        } else if (this.border.type === 'bg') {
          ch = this.border.ch;
        }

        if (!this.border.top && x !== xLo && x !== xHi - 1) {
          ch = ' ';

          if (cell.at !== normAttr || cell.ch !== ch) {
            cell.inject(normAttr, ch);
            lines[y].dirty = true;
            continue;
          }
        }

        if (cell.at !== borderAttr || cell.ch !== ch) {
          cell.inject(borderAttr, ch);
          line.dirty = true;
        }
      }

      for (let y = yLo + 1, line, cell; y < yHi - 1; y++) {
        if (!(line = lines[y])) continue;

        if (cell = line[xLo]) {
          if (this.border.left) {
            if (this.border.type === 'line') {
              ch = '\u2502';
            } // '│'
            else if (this.border.type === 'bg') {
              ch = this.border.ch;
            }

            if (!coord.negL) if (cell.at !== borderAttr || cell.ch !== ch) {
              cell.inject(borderAttr, ch);
              line.dirty = true;
            }
          } else {
            ch = ' ';

            if (cell.at !== normAttr || cell.ch !== ch) {
              cell.inject(normAttr, ch);
              line.dirty = true;
            }
          }
        }

        if (cell = line[xHi - 1]) {
          if (this.border.right) {
            if (this.border.type === 'line') {
              ch = '\u2502';
            } // '│'
            else if (this.border.type === 'bg') {
              ch = this.border.ch;
            }

            if (!coord.negR) if (cell.at !== borderAttr || cell.ch !== ch) {
              cell.inject(borderAttr, ch);
              line.dirty = true;
            }
          } else {
            ch = ' ';

            if (cell.at !== normAttr || cell.ch !== ch) {
              cell.inject(normAttr, ch);
              line.dirty = true;
            }
          }
        }
      }

      y = yHi - 1;
      if (coord.negB) y = -1;

      for (let x = xLo, cell; x < xHi; x++) {
        if (!(line = lines[y])) break;
        if (coord.negL && x === xLo) continue;
        if (coord.negR && x === xHi - 1) continue;
        if (!(cell = line[x])) continue;

        if (this.border.type === 'line') {
          if (x === xLo) {
            ch = '\u2514'; // '└'

            if (!this.border.left) {
              if (this.border.bottom) {
                ch = '\u2500';
              } // '─'
              else {
                continue;
              }
            } else {
              if (!this.border.bottom) {
                ch = '\u2502';
              } // '│'

            }
          } else if (x === xHi - 1) {
            ch = '\u2518'; // '┘'

            if (!this.border.right) {
              if (this.border.bottom) {
                ch = '\u2500';
              } // '─'
              else {
                continue;
              }
            } else {
              if (!this.border.bottom) {
                ch = '\u2502';
              } // '│'

            }
          } else {
            ch = '\u2500';
          } // '─'

        } else if (this.border.type === 'bg') {
          ch = this.border.ch;
        }

        if (!this.border.bottom && x !== xLo && x !== xHi - 1) {
          ch = ' ';

          if (cell.at !== normAttr || cell.ch !== ch) {
            cell.inject(normAttr, ch);
            line.dirty = true;
          }

          continue;
        }

        if (cell.at !== borderAttr || cell.ch !== ch) {
          cell.inject(borderAttr, ch);
          line.dirty = true;
        }
      }
    }

    if (this.shadow) {
      // right
      for (let y = Math.max(yLo + 1, 0), line; y < yHi + 1; y++) {
        if (!(line = lines[y])) break;

        for (let x = xHi, cell; x < xHi + 2; x++) {
          if (!(cell = line[x])) break; // lines[y][x][0] = colors.blend(this.dattr, lines[y][x][0]);

          cell.at = colors.blend(cell.at);
          line.dirty = true;
        }
      } // bottom


      for (let y = yHi, line; y < yHi + 1; y++) {
        if (!(line = lines[y])) break;

        for (let x = Math.max(xLo + 1, 0), cell; x < xHi; x++) {
          if (!(cell = line[x])) break; // lines[y][x][0] = colors.blend(this.dattr, lines[y][x][0]);

          cell.at = colors.blend(cell.at);
          line.dirty = true;
        }
      }
    }

    this.sub.forEach(el => {
      if (el.screen._ci !== -1) el.index = el.screen._ci++; // if (el.screen._rendering) { el._rendering = true; }

      el.render(); // if (el.screen._rendering) { el._rendering = false; }
    });
    this.nodeEmit(RENDER, [coord]);
    return coord;
  }

  screenshot(xLo, xHi, yLo, yHi) {
    xLo = this.prevPos.xLo + this.intL + (xLo || 0);
    xHi = xHi != null ? this.prevPos.xLo + this.intL + (xHi || 0) : this.prevPos.xHi - this.intR;
    yLo = this.prevPos.yLo + this.intT + (yLo || 0);
    yHi = yHi != null ? this.prevPos.yLo + this.intT + (yHi || 0) : this.prevPos.yHi - this.intB;
    return this.screen.screenshot(xLo, xHi, yLo, yHi);
  }

  onScreenEvent(type, handler) {
    const listeners = this._slisteners ?? (this._slisteners = []);
    listeners.push({
      type,
      handler
    });
    this.screen.on(type, handler);
  }

  onceScreenEvent(type, handler) {
    const listeners = this._slisteners ?? (this._slisteners = []);
    const entry = {
      type,
      handler
    };
    listeners.push(entry);
    this.screen.once(type, function () {
      const i = listeners.indexOf(entry);
      if (~i) listeners.splice(i, 1);
      return handler.apply(this, arguments);
    });
  }

  removeScreenEvent(type, handler) {
    const listeners = this._slisteners ?? (this._slisteners = []);

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];

      if (listener.type === type && listener.handler === handler) {
        listeners.splice(i, 1);
        if (this._slisteners.length === 0) delete this._slisteners;
        break;
      }
    }

    this.screen.removeListener(type, handler);
  }

  free() {
    const listeners = this._slisteners ?? (this._slisteners = []);

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      this.screen.removeListener(listener.type, listener.handler);
    }

    delete this._slisteners;
  }

  hide() {
    if (this.hidden) return;
    this.clearPos();
    this.hidden = true;
    this.emit(HIDE$1);
    if (this.screen.focused === this) this.screen.rewindFocus();
  }

  show() {
    if (!this.hidden) return;
    this.hidden = false;
    this.emit(SHOW);
  }

  toggle() {
    return this.hidden ? this.show() : this.hide();
  }

  focus() {
    return this.screen.focused = this;
  }

  setContent(content, noClear, noTags) {
    if (!noClear) this.clearPos();
    this.content = content || '';
    this.parseContent(noTags);
    this.emit(SET_CONTENT);
  }

  getContent() {
    var _this$contLines;

    return ((_this$contLines = this.contLines) === null || _this$contLines === void 0 ? void 0 : _this$contLines.fake.join(LF)) ?? '';
  }

  setText(content, noClear) {
    content = content || '';
    content = content.replace(REGEX_SGR_G, '');
    return this.setContent(content, noClear, true);
  }

  getText() {
    return this.getContent().replace(REGEX_SGR_G, '');
  }

  _align(line, width, align) {
    if (!align) return line; //if (!align && !~line.indexOf('{|}')) return line;

    const contLine = line.replace(REGEX_SGR_G, ''),
          len = contLine.length;
    let s = width - len;

    if (this.shrink) {
      s = 0;
    }

    if (len === 0) return line;
    if (s < 0) return line;
    if (align === CENTER && (s = Array((s / 2 | 0) + 1).join(' '))) return s + line + s;else if (align === RIGHT && (s = Array(s + 1).join(' '))) return s + line;else if (this.parseTags && ~line.indexOf('{|}')) {
      const parts = line.split('{|}');
      const contParts = contLine.split('{|}');
      s = Math.max(width - contParts[0].length - contParts[1].length, 0);
      s = Array(s + 1).join(' ');
      return parts[0] + s + parts[1];
    }
    return line;
  }

  enableMouse() {
    this.screen._listenMouse(this);
  }

  enableKeys() {
    this.screen._listenKeys(this);
  }

  enableInput() {
    this.screen._listenMouse(this);

    this.screen._listenKeys(this);
  }

  enableDrag(verify) {
    const self = this;
    if (this._draggable) return true;
    if (typeof verify !== FUN) verify = () => true;
    this.enableMouse();
    this.on(MOUSEDOWN, this._dragMD = function (data) {
      if (self.screen._dragging) return;
      if (!verify(data)) return;
      self.screen._dragging = self;
      self._drag = {
        x: data.x - self.absL,
        y: data.y - self.absT
      };
      self.setFront();
    });
    this.onScreenEvent(MOUSE, this._dragM = function (data) {
      if (self.screen._dragging !== self) return;

      if (data.action !== MOUSEDOWN && data.action !== MOUSEMOVE) {
        delete self.screen._dragging;
        delete self._drag;
        return;
      } // This can happen in edge cases where the user is
      // already dragging and element when it is detached.


      if (!self.sup) return;
      const ox = self._drag.x,
            oy = self._drag.y,
            px = self.sup.absL,
            py = self.sup.absT,
            x = data.x - px - ox,
            y = data.y - py - oy;

      if (self.pos.right != null) {
        if (self.pos.left != null) self.width = '100%-' + (self.sup.width - self.width);
        self.pos.right = null;
      }

      if (self.pos.bottom != null) {
        if (self.pos.top != null) self.height = '100%-' + (self.sup.height - self.height);
        self.pos.bottom = null;
      }

      self.relL = x;
      self.relT = y;
      self.screen.render();
    });
    return this._draggable = true;
  }

  disableDrag() {
    if (!this._draggable) return false;
    delete this.screen._dragging;
    delete this._drag;
    this.removeListener(MOUSEDOWN, this._dragMD);
    this.removeScreenEvent(MOUSE, this._dragM);
    return this._draggable = false;
  }

  key() {
    return this.screen.program.key.apply(this, arguments);
  }

  onceKey() {
    return this.screen.program.onceKey.apply(this, arguments);
  }

  unkey() {
    return this.screen.program.unkey.apply(this, arguments);
  }

  removeKey() {
    return this.screen.program.unkey.apply(this, arguments);
  }

  setIndex(index) {
    if (!this.sup) return;

    if (index < 0) {
      index = this.sup.sub.length + index;
    }

    index = Math.max(index, 0);
    index = Math.min(index, this.sup.sub.length - 1);
    const i = this.sup.sub.indexOf(this);
    if (!~i) return;
    const item = this.sup.sub.splice(i, 1)[0];
    this.sup.sub.splice(index, 0, item);
  }

  setFront() {
    return this.setIndex(-1);
  }

  setBack() {
    return this.setIndex(0);
  }

  setLabel(options) {
    const self = this; // const Box = require('./box')

    if (typeof options === STR) options = {
      text: options
    };

    if (this._label) {
      this._label.setContent(options.text);

      if (options.side !== RIGHT) {
        this._label.relL = 2 + (this.border ? -1 : 0);
        this._label.pos.right = undefined;
        if (!this.screen.autoPadding) this._label.relL = 2;
      } else {
        this._label.relR = 2 + (this.border ? -1 : 0);
        this._label.pos.left = undefined;
        if (!this.screen.autoPadding) this._label.relR = 2;
      }

      return;
    }

    this._label = new Box({
      screen: this.screen,
      sup: this,
      content: options.text,
      top: -this.intT,
      tags: this.parseTags,
      shrink: true,
      style: this.style.label
    });

    if (options.side !== RIGHT) {
      this._label.relL = 2 - this.intL;
    } else {
      this._label.relR = 2 - this.intR;
    }

    this._label._isLabel = true;

    if (!this.screen.autoPadding) {
      if (options.side !== RIGHT) {
        this._label.relL = 2;
      } else {
        this._label.relR = 2;
      }

      this._label.relT = 0;
    }

    const reposition = () => {
      self._label.relT = (self.subBase || 0) - self.intT;

      if (!self.screen.autoPadding) {
        self._label.relT = self.subBase || 0;
      }

      self.screen.render();
    };

    this.on(SCROLL, this._labelScroll = () => reposition());
    this.on(RESIZE, this._labelResize = () => nextTick(() => reposition()));
  }

  removeLabel() {
    if (!this._label) return;
    this.removeListener(SCROLL, this._labelScroll);
    this.removeListener(RESIZE, this._labelResize);

    this._label.detach();

    delete this._labelScroll;
    delete this._labelResize;
    delete this._label;
  }

  setHover(options) {
    if (typeof options === STR) options = {
      text: options
    };
    this._hoverOptions = options;
    this.enableMouse();

    this.screen._initHover();
  } // The below methods are a bit confusing: basically
  // whenever Box.render is called `lpos` gets set on
  // the element, an object containing the rendered
  // coordinates. Since these don't update if the
  // element is moved somehow, they're unreliable in
  // that situation. However, if we can guarantee that
  // lpos is good and up to date, it can be more
  // accurate than the calculated positions below.
  // In this case, if the element is being rendered,
  // it's guaranteed that the sup will have been
  // rendered first, in which case we can use the
  // parant's lpos instead of recalculating it's
  // position (since that might be wrong because


  removeHover() {
    delete this._hoverOptions;
    if (!this.screen._hoverText || this.screen._hoverText.detached) return;

    this.screen._hoverText.detach();

    this.screen.render();
  } // it doesn't handle content shrinkage).

  /**
   * Content Methods
   */


  insertLine(i, line) {
    if (typeof line === STR) line = line.split(LF);
    if (i !== i || i == null) i = this.contLines.ftor.length;
    i = Math.max(i, 0);

    while (this.contLines.fake.length < i) {
      this.contLines.fake.push('');
      this.contLines.ftor.push([this.contLines.push('') - 1]);
      this.contLines.rtof(this.contLines.fake.length - 1);
    } // NOTE: Could possibly compare the first and last ftor line numbers to see
    // if they're the same, or if they fit in the visible region entirely.


    const start = this.contLines.length;
    let diff, real;

    if (i >= this.contLines.ftor.length) {
      real = last(this.contLines.ftor);
      real = last(real) + 1;
    } else {
      real = this.contLines.ftor[i][0];
    }

    for (let j = 0; j < line.length; j++) this.contLines.fake.splice(i + j, 0, line[j]);

    this.setContent(this.contLines.fake.join(LF), true);
    diff = this.contLines.length - start;

    if (diff > 0) {
      const pos = this.calcCoord();
      if (!pos) return;
      const ht = pos.yHi - pos.yLo - this.intH,
            base = this.subBase || 0,
            vis = base <= real && real < base + ht; // visible

      if (pos && vis && this.screen.cleanSides(this)) {
        this.screen.insertLine(diff, pos.yLo + this.intT + real - base, pos.yLo, pos.yHi - this.intB - 1);
      }
    }
  }

  deleteLine(i, n = 1) {
    if (i !== i || i == null) i = this.contLines.ftor.length - 1;
    i = Math.max(i, 0);
    i = Math.min(i, this.contLines.ftor.length - 1); // NOTE: Could possibly compare the first and last ftor line numbers to see
    // if they're the same, or if they fit in the visible region entirely.

    const start = this.contLines.length;
    let diff;
    const real = this.contLines.ftor[i][0];

    while (n--) this.contLines.fake.splice(i, 1);

    this.setContent(this.contLines.fake.join(LF), true);
    diff = start - this.contLines.length; // XXX clearPos() without diff statement?

    let height = 0;

    if (diff > 0) {
      const pos = this.calcCoord();
      if (!pos) return;
      height = pos.yHi - pos.yLo - this.intH;
      const base = this.subBase || 0,
            visible = real >= base && real - base < height;

      if (pos && visible && this.screen.cleanSides(this)) {
        this.screen.deleteLine(diff, pos.yLo + this.intT + real - base, pos.yLo, pos.yHi - this.intB - 1);
      }
    }

    if (this.contLines.length < height) this.clearPos();
  }

  insertTop(line) {
    const fake = this.contLines.rtof[this.subBase || 0];
    return this.insertLine(fake, line);
  }

  insertBottom(line) {
    const h = (this.subBase || 0) + this.height - this.intH,
          i = Math.min(h, this.contLines.length),
          fake = this.contLines.rtof[i - 1] + 1;
    return this.insertLine(fake, line);
  }

  deleteTop(n) {
    const fake = this.contLines.rtof[this.subBase || 0];
    return this.deleteLine(fake, n);
  }

  deleteBottom(n = 1) {
    const h = (this.subBase || 0) + this.height - 1 - this.intH,
          i = Math.min(h, this.contLines.length - 1),
          fake = this.contLines.rtof[i];
    return this.deleteLine(fake - (n - 1), n);
  }

  setLine(i, line) {
    i = Math.max(i, 0);

    while (this.contLines.fake.length < i) {
      this.contLines.fake.push('');
    }

    this.contLines.fake[i] = line;
    return this.setContent(this.contLines.fake.join(LF), true);
  }

  setBaseLine(i, line) {
    const fake = this.contLines.rtof[this.subBase || 0];
    return this.setLine(fake + i, line);
  }

  getLine(i) {
    i = Math.max(i, 0);
    i = Math.min(i, this.contLines.fake.length - 1);
    return this.contLines.fake[i];
  }

  getBaseLine(i) {
    const fake = this.contLines.rtof[this.subBase || 0];
    return this.getLine(fake + i);
  }

  clearLine(i) {
    i = Math.min(i, this.contLines.fake.length - 1);
    return this.setLine(i, '');
  }

  clearBaseLine(i) {
    const fake = this.contLines.rtof[this.subBase || 0];
    return this.clearLine(fake + i);
  }

  unshiftLine(line) {
    return this.insertLine(0, line);
  }

  shiftLine(n) {
    return this.deleteLine(0, n);
  }

  pushLine(line) {
    return !this.content ? this.setLine(0, line) : this.insertLine(this.contLines.fake.length, line);
  }

  popLine(n) {
    return this.deleteLine(this.contLines.fake.length - 1, n);
  }

  getLines() {
    return this.contLines.fake.slice();
  }

  getScreenLines() {
    return this.contLines.slice();
  }

  strWidth(text) {
    text = this.parseTags ? stripTags(text) : text;
    return this.screen.fullUnicode ? unicode.strWidth(text) : dropUnicode(text).length;
  }

}

/**
 * @extends {Element}
 */

class Scroll {
  constructor(options = {}, lazy) {
    if (lazy) return this;
    this.config(options);
  }

  config(options) {
    console.log('>> [set scroll]', this === null || this === void 0 ? void 0 : this.codename);
    const self = this; // if (options.scrollable === false) return this

    this.scrollable = true;
    this.subOffset = 0;
    this.subBase = 0;
    this.baseLimit = options.baseLimit || Infinity;
    this.alwaysScroll = options.alwaysScroll;
    this.scrollbar = options.scrollbar;

    if (this.scrollbar) {
      this.scrollbar.ch = this.scrollbar.ch || ' ';
      this.style.scrollbar = this.style.scrollbar ?? this.scrollbar.style ?? select.call(SGR_ATTRS, this.scrollbar);

      if (this.track || this.scrollbar.track) {
        this.track = this.scrollbar.track || this.track;
        this.style.track = this.style.scrollbar.track || this.style.track;
        this.track.ch = this.track.ch || ' ';
        this.style.track = this.style.track ?? this.track.style ?? select.call(SGR_ATTRS, this.track);
        this.track.style = this.style.track;
      } // Allow controlling of the scrollbar via the mouse:


      if (options.mouse) {
        this.on(MOUSEDOWN, data => {
          if (self._scrollingBar) {
            // Do not allow dragging on the scrollbar:
            delete self.screen._dragging;
            delete self._drag;
            return;
          }

          const x = data.x - self.absL;
          const y = data.y - self.absT;

          if (x === self.width - self.intR - 1) {
            // Do not allow dragging on the scrollbar:
            delete self.screen._dragging;
            delete self._drag;
            const ratio = (y - self.intT) / (self.height - self.intH);
            self.scrollPercent = ratio * 100 | 0;
            self.screen.render();
            let smd, smu;
            self._scrollingBar = true;
            self.onScreenEvent(MOUSEDOWN, smd = data => {
              const y = data.y - self.absT;
              const ratio = y / self.height;
              self.scrollPercent = ratio * 100 | 0;
              self.screen.render();
            }); // If mouseup occurs out of the window, no mouseup event fires, and
            // scrollbar will drag again on mousedown until another mouseup
            // occurs.

            self.onScreenEvent(MOUSEUP, smu = () => {
              self._scrollingBar = false;
              self.removeScreenEvent(MOUSEDOWN, smd);
              self.removeScreenEvent(MOUSEUP, smu);
            });
          }
        });
      }
    }

    if (options.mouse) {
      this.on(WHEELDOWN, () => {
        self.scroll(self.height / 2 | 0 || 1);
        self.screen.render();
      });
      this.on(WHEELUP, () => {
        self.scroll(-(self.height / 2 | 0) || -1);
        self.screen.render();
      });
    }

    if (options.keys && !options.ignoreKeys) {
      this.on(KEYPRESS, (ch, key) => {
        const {
          ctrl,
          name,
          shift
        } = key,
              {
          vi
        } = options;
        if (name === UP || vi && name === 'k') return void (self.scroll(-1), self.screen.render());
        if (name === DOWN || vi && name === 'j') return void (self.scroll(1), self.screen.render());
        if (vi && name === 'u' && ctrl) return void (self.scroll(-(self.height / 2 | 0) || -1), self.screen.render());
        if (vi && name === 'd' && ctrl) return void (self.scroll(self.height / 2 | 0 || 1), self.screen.render());
        if (vi && name === 'b' && ctrl) return void (self.scroll(-self.height || -1), self.screen.render());
        if (vi && name === 'f' && ctrl) return void (self.scroll(self.height || 1), self.screen.render());
        if (vi && name === 'g' && !shift) return void (self.scrollTo(0), self.screen.render());
        if (vi && name === 'g' && shift) return void (self.scrollTo(self.scrollHeight), self.screen.render());
      });
    }

    this.on(PARSED_CONTENT, () => self.recalcIndex());
    self.recalcIndex();
  }

  get reallyScrollable() {
    // XXX Potentially use this in place of scrollable checks elsewhere.
    if (this.shrink) return this.scrollable;
    return this.scrollHeight > this.height;
  }

  _scrollBottom() {
    if (!this.scrollable) return 0; // We could just calculate the sub, but we can
    // optimize for lists by just returning the items.length.

    if (this._isList) return this.items ? this.items.length : 0;
    if (this.prevPos && this.prevPos._scrollBottom) return this.prevPos._scrollBottom;
    const bottom = this.sub.reduce((current, el) => {
      // el.height alone does not calculate the shrunken height, we need to use
      // getCoords. A shrunken box inside a scrollable element will not grow any
      // larger than the scrollable element's context regardless of how much
      // content is in the shrunken box, unless we do this (call getCoords
      // without the scrollable calculation):
      // See: $ node test/widget-shrink-fail-2.js
      if (!el.detached) {
        const prevPos = el.calcCoord(false, true);
        if (prevPos) return Math.max(current, el.relT + (prevPos.yHi - prevPos.yLo));
      }

      return Math.max(current, el.relT + el.height);
    }, 0); // XXX Use this? Makes .scrollHeight useless!
    // if (bottom < this._clines.length) bottom = this._clines.length;

    if (this.prevPos) this.prevPos._scrollBottom = bottom;
    return bottom;
  }

  setScroll(offset, always) {
    return this.scrollTo(offset, always);
  }

  scrollTo(offset, always) {
    // XXX
    // At first, this appeared to account for the first new calculation of subBase:
    this.scroll(0);
    return this.scroll(offset - (this.subBase + this.subOffset), always);
  }

  getScroll() {
    return this.subBase + this.subOffset;
  }

  scroll(offset, always) {
    if (!this.scrollable) return;
    if (this.detached) return; // Handle scrolling.

    const visible = this.height - this.intH,
          base = this.subBase;
    let d, p, t, b, max, emax;

    if (this.alwaysScroll || always) {
      // Semi-workaround
      this.subOffset = offset > 0 ? visible - 1 + offset : offset;
    } else {
      this.subOffset += offset;
    }

    if (this.subOffset > visible - 1) {
      d = this.subOffset - (visible - 1);
      this.subOffset -= d;
      this.subBase += d;
    } else if (this.subOffset < 0) {
      d = this.subOffset;
      this.subOffset += -d;
      this.subBase += d;
    }

    this.subBase = this.subBase < 0 ? 0 : this.subBase > this.baseLimit ? this.baseLimit : this.subBase; // Find max "bottom" value for
    // content and descendant elements.
    // Scroll the content if necessary.

    if (this.subBase === base) return this.emit(SCROLL); // When scrolling text, we want to be able to handle SGR codes as well as line
    // feeds. This allows us to take preformatted text output from other programs
    // and put it in a scrollable text box.

    this.parseContent(); // XXX
    // max = this.scrollHeight - (this.height - this.intH);

    max = this._clines.length - (this.height - this.intH);
    if (max < 0) max = 0;
    emax = this._scrollBottom() - (this.height - this.intH);
    if (emax < 0) emax = 0;
    this.subBase = Math.min(this.subBase, Math.max(emax, max));
    this.subBase = this.subBase < 0 ? 0 : this.subBase > this.baseLimit ? this.baseLimit : this.subBase; // Optimize scrolling with CSR + IL/DL.

    p = this.prevPos; // Only really need calcCoord() if we want
    // to allow nestable scrolling elements...
    // or if we **really** want shrinkable
    // scrolling elements.
    // p = this.calcCoord();

    if (p && this.subBase !== base && this.screen.cleanSides(this)) {
      t = p.yLo + this.intT;
      b = p.yHi - this.intB - 1;
      d = this.subBase - base;

      if (d > 0 && d < visible) {
        this.screen.deleteLine(d, t, t, b); // scrolled down
      } else if (d < 0 && -d < visible) {
        d = -d;
        this.screen.insertLine(d, t, t, b); // scrolled up
      }
    }

    return this.emit(SCROLL);
  }

  recalcIndex() {
    let max, emax;
    if (this.detached || !this.scrollable) return 0; // XXX
    // max = this.scrollHeight - (this.height - this.intH);

    max = this._clines.length - (this.height - this.intH);
    if (max < 0) max = 0;
    emax = this._scrollBottom() - (this.height - this.intH);
    if (emax < 0) emax = 0;
    this.subBase = Math.min(this.subBase, Math.max(emax, max));
    this.subBase = this.subBase < 0 ? 0 : this.subBase > this.baseLimit ? this.baseLimit : this.subBase;
  }

  resetScroll() {
    if (!this.scrollable) return;
    this.subOffset = 0;
    this.subBase = 0;
    return this.emit(SCROLL);
  }

  get scrollHeight() {
    return Math.max(this._clines.length, this._scrollBottom());
  }

  get scrollPercent() {
    const pos = this.prevPos || this.calcCoord();
    const s = false; // s is first arg of serScrollPerc in previous version

    if (!pos) return s ? -1 : 0;
    const height = pos.yHi - pos.yLo - this.intH,
          i = this.scrollHeight;
    let p;

    if (height < i) {
      p = this.alwaysScroll ? this.subBase / (i - height) : (this.subBase + this.subOffset) / (i - 1);
      return p * 100;
    }

    return s ? -1 : 0;
  }

  set scrollPercent(i) {
    // XXX
    // var m = this.scrollHeight;
    const m = Math.max(this._clines.length, this._scrollBottom());
    return this.scrollTo(i / 100 * m | 0);
  }

}

/**
 * box.js - box element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
/**
 * Box
 */

class Box extends Element {
  type = 'box';

  constructor(options = {}) {
    options.sku = options.sku ?? 'box';
    super(options); // // if (!(this instanceof Node)) return new Box(options)

    if (options.scrollable) {
      // console.log(Reflect.ownKeys(Scrollable.prototype))
      mixin.assign(this, Scroll.prototype);
      Scroll.prototype.config.call(this, options);
    }
  }

  static build(options) {
    return new Box(options);
  }

}

/**
 * scrollablebox.js - scrollable box element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class ScrollableBox extends Box {
  type = 'scrollable-box';
  /**
   * ScrollableBox
   */

  constructor(options = {}) {
    if (!options.sku) options.sku = 'scrollable-box';
    options.scrollable = true;
    super(options); // console.log(this.type, Reflect.ownKeys(this))
    // const self = this
    // // if (!(this instanceof Node)) return new ScrollableBox(options)
    // if (options.scrollable === false) return this
    // this.scrollable = true
    // this.subOffset = 0
    // this.subBase = 0
    // this.baseLimit = options.baseLimit || Infinity
    // this.alwaysScroll = options.alwaysScroll
    // const scrollbar = this.scrollbar = options.scrollbar
    // if (scrollbar) {
    //   if (!scrollbar.ch) scrollbar.ch = ' '
    //   this.style.scrollbar = this.style.scrollbar ?? scrollbar.style ?? {
    //     fg: scrollbar.fg,
    //     bg: scrollbar.bg,
    //     bold: scrollbar.bold,
    //     underline: scrollbar.underline,
    //     inverse: scrollbar.inverse,
    //     invisible: scrollbar.invisible,
    //   }
    //   if (this.track || scrollbar.track) {
    //     this.track = scrollbar.track || this.track
    //     this.style.track = this.style.scrollbar.track || this.style.track
    //     this.track.ch = this.track.ch || ' '
    //     this.style.track = this.style.track ?? this.track.style ?? {
    //       fg: this.track.fg,
    //       bg: this.track.bg,
    //       bold: this.track.bold,
    //       underline: this.track.underline,
    //       inverse: this.track.inverse,
    //       invisible: this.track.invisible,
    //     }
    //     this.track.style = this.style.track
    //   }
    //   // Allow controlling of the scrollbar via the mouse:
    //   if (options.mouse) {
    //     this.on(MOUSEDOWN, function (data) {
    //       if (self._scrollingBar) {
    //         // Do not allow dragging on the scrollbar:
    //         delete self.screen._dragging
    //         delete self._drag
    //         return
    //       }
    //       const x = data.x - self.absL
    //       const y = data.y - self.absT
    //       if (x === self.width - self.intR - 1) {
    //         // Do not allow dragging on the scrollbar:
    //         delete self.screen._dragging
    //         delete self._drag
    //         const perc = (y - self.intT) / (self.height - self.intH)
    //         self.scrollPercent = (perc * 100 | 0)
    //         self.screen.render()
    //         let smd, smu
    //         self._scrollingBar = true
    //         self.onScreenEvent(MOUSEDOWN, smd = function (data) {
    //           const y = data.y - self.absT
    //           const perc = y / self.height
    //           self.scrollPercent = (perc * 100 | 0)
    //           self.screen.render()
    //         })
    //         // If mouseup occurs out of the window, no mouseup event fires, and
    //         // scrollbar will drag again on mousedown until another mouseup
    //         // occurs.
    //         self.onScreenEvent(MOUSEUP, smu = function () {
    //           self._scrollingBar = false
    //           self.removeScreenEvent(MOUSEDOWN, smd)
    //           self.removeScreenEvent(MOUSEUP, smu)
    //         })
    //       }
    //     })
    //   }
    // }
    // if (options.mouse) {
    //   this.on(WHEELDOWN, () => {
    //     self.scroll(self.height / 2 | 0 || 1)
    //     self.screen.render()
    //   })
    //   this.on(WHEELUP, () => {
    //     self.scroll(-(self.height / 2 | 0) || -1)
    //     self.screen.render()
    //   })
    // }
    // if (options.keys && !options.ignoreKeys) {
    //   this.on(KEYPRESS, (ch, key) => {
    //     if (key.name === 'up' || (options.vi && key.name === 'k')) {
    //       self.scroll(-1)
    //       self.screen.render()
    //       return
    //     }
    //     if (key.name === 'down' || (options.vi && key.name === 'j')) {
    //       self.scroll(1)
    //       self.screen.render()
    //       return
    //     }
    //     if (options.vi && key.name === 'u' && key.ctrl) {
    //       self.scroll(-(self.height / 2 | 0) || -1)
    //       self.screen.render()
    //       return
    //     }
    //     if (options.vi && key.name === 'd' && key.ctrl) {
    //       self.scroll(self.height / 2 | 0 || 1)
    //       self.screen.render()
    //       return
    //     }
    //     if (options.vi && key.name === 'b' && key.ctrl) {
    //       self.scroll(-self.height || -1)
    //       self.screen.render()
    //       return
    //     }
    //     if (options.vi && key.name === 'f' && key.ctrl) {
    //       self.scroll(self.height || 1)
    //       self.screen.render()
    //       return
    //     }
    //     if (options.vi && key.name === 'g' && !key.shift) {
    //       self.scrollTo(0)
    //       self.screen.render()
    //       return
    //     }
    //     if (options.vi && key.name === 'g' && key.shift) {
    //       self.scrollTo(self.scrollHeight)
    //       self.screen.render()
    //     }
    //   })
    // }
    // this.on(PARSED_CONTENT, () => self.recalcIndex())
    // self.recalcIndex()
  }

  static build(options) {
    return new ScrollableBox(options);
  } // // XXX Potentially use this in place of scrollable checks elsewhere.
  // get reallyScrollable() {
  //   if (this.shrink) return this.scrollable
  //   return this.scrollHeight > this.height
  // }
  // _scrollBottom() {
  //   if (!this.scrollable) return 0
  //   // We could just calculate the sub, but we can
  //   // optimize for lists by just returning the items.length.
  //   if (this._isList) { return this.items ? this.items.length : 0 }
  //   if (this.lpos && this.lpos._scrollBottom) { return this.lpos._scrollBottom }
  //   const bottom = this.sub.reduce((current, el) => {
  //     // el.height alone does not calculate the shrunken height, we need to use
  //     // getCoords. A shrunken box inside a scrollable element will not grow any
  //     // larger than the scrollable element's context regardless of how much
  //     // content is in the shrunken box, unless we do this (call getCoords
  //     // without the scrollable calculation):
  //     // See: $ node test/widget-shrink-fail-2.js
  //     if (!el.detached) {
  //       const lpos = el.calcCoord(false, true)
  //       if (lpos) { return Math.max(current, el.relT + (lpos.yHi - lpos.yLo)) }
  //     }
  //     return Math.max(current, el.relT + el.height)
  //   }, 0)
  //   // XXX Use this? Makes .scrollHeight useless!
  //   // if (bottom < this._clines.length) bottom = this._clines.length;
  //   if (this.lpos) this.lpos._scrollBottom = bottom
  //   return bottom
  // }
  // setScroll(offset, always) {
  //   // XXX
  //   // At first, this appeared to account for the first new calculation of subBase:
  //   this.scroll(0)
  //   return this.scroll(offset - (this.subBase + this.subOffset), always)
  // }
  // scrollTo(offset, always) {
  //   // XXX
  //   // At first, this appeared to account for the first new calculation of subBase:
  //   this.scroll(0)
  //   return this.scroll(offset - (this.subBase + this.subOffset), always)
  // }
  // getScroll() { return this.subBase + this.subOffset }
  // scroll(offset, always) {
  //   if (!this.scrollable) return
  //   if (this.detached) return
  //   // Handle scrolling.
  //   const visible = this.height - this.intH,
  //         base    = this.subBase
  //   let d,
  //       p,
  //       t,
  //       b,
  //       max,
  //       emax
  //   if (this.alwaysScroll || always) {
  //     // Semi-workaround
  //     this.subOffset = offset > 0
  //       ? visible - 1 + offset
  //       : offset
  //   }
  //   else {
  //     this.subOffset += offset
  //   }
  //   if (this.subOffset > visible - 1) {
  //     d = this.subOffset - (visible - 1)
  //     this.subOffset -= d
  //     this.subBase += d
  //   }
  //   else if (this.subOffset < 0) {
  //     d = this.subOffset
  //     this.subOffset += -d
  //     this.subBase += d
  //   }
  //   if (this.subBase < 0) {
  //     this.subBase = 0
  //   }
  //   else if (this.subBase > this.baseLimit) {
  //     this.subBase = this.baseLimit
  //   }
  //   // Find max "bottom" value for
  //   // content and descendant elements.
  //   // Scroll the content if necessary.
  //   if (this.subBase === base) { return this.emit(SCROLL) }
  //   // When scrolling text, we want to be able to handle SGR codes as well as line
  //   // feeds. This allows us to take preformatted text output from other programs
  //   // and put it in a scrollable text box.
  //   this.parseContent()
  //   // XXX
  //   // max = this.scrollHeight - (this.height - this.intH);
  //   max = this._clines.length - (this.height - this.intH)
  //   if (max < 0) max = 0
  //   emax = this._scrollBottom() - (this.height - this.intH)
  //   if (emax < 0) emax = 0
  //   this.subBase = Math.min(this.subBase, Math.max(emax, max))
  //   if (this.subBase < 0) { this.subBase = 0 }
  //   else if (this.subBase > this.baseLimit) { this.subBase = this.baseLimit }
  //   // Optimize scrolling with CSR + IL/DL.
  //   p = this.lpos
  //   // Only really need calcCoord() if we want
  //   // to allow nestable scrolling elements...
  //   // or if we **really** want shrinkable
  //   // scrolling elements.
  //   // p = this.calcCoord();
  //   if (p && this.subBase !== base && this.screen.cleanSides(this)) {
  //     t = p.yLo + this.intT
  //     b = p.yHi - this.intB - 1
  //     d = this.subBase - base
  //     // scrolled down
  //     if (d > 0 && d < visible) {
  //       this.screen.deleteLine(d, t, t, b)
  //     }
  //     // scrolled up
  //     else if (d < 0 && -d < visible) {
  //       d = -d
  //       this.screen.insertLine(d, t, t, b)
  //     }
  //   }
  //   return this.emit(SCROLL)
  // }
  // recalcIndex() {
  //   let max, emax
  //   if (this.detached || !this.scrollable) { return 0 }
  //   // XXX
  //   // max = this.scrollHeight - (this.height - this.intH);
  //
  //   max = this._clines.length - (this.height - this.intH)
  //   if (max < 0) max = 0
  //   emax = this._scrollBottom() - (this.height - this.intH)
  //   if (emax < 0) emax = 0
  //   this.subBase = Math.min(this.subBase, Math.max(emax, max))
  //   if (this.subBase < 0) { this.subBase = 0 }
  //   else if (this.subBase > this.baseLimit) { this.subBase = this.baseLimit }
  // }
  // resetScroll() {
  //   if (!this.scrollable) return
  //   this.subOffset = 0
  //   this.subBase = 0
  //   return this.emit(SCROLL)
  // }
  // scrollHeight { return Math.max(this._clines.length, this._scrollBottom()) }
  // scrollPercent(s) {
  //   const pos = this.lpos || this.calcCoord()
  //   if (!pos) return s ? -1 : 0
  //   const height = (pos.yHi - pos.yLo) - this.intH,
  //         i      = this.scrollHeight
  //   let p
  //   if (height < i) {
  //     if (this.alwaysScroll) { p = this.subBase / (i - height) }
  //     else { p = (this.subBase + this.subOffset) / (i - 1) }
  //     return p * 100
  //   }
  //   return s ? -1 : 0
  // }
  // scrollPercent = (i) {
  //   // XXX
  //   // var m = this.scrollHeight;
  //   const m = Math.max(this._clines.length, this._scrollBottom())
  //   return this.scrollTo((i / 100) * m | 0)
  // }


}

/**
 * scrollabletext.js - scrollable text element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class ScrollableText extends ScrollableBox {
  type = 'scrollable-text';
  /**
   * ScrollableText
   */

  constructor(options = {}) {
    if (!options.sku) options.sku = 'scrollable-text';
    options.alwaysScroll = true;
    super(options); // if (!(this instanceof Node)) return new ScrollableText(options)
  }

  static build(options) {
    return new ScrollableBox(options);
  }

}

/**
 * log.js - log element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Log extends ScrollableText {
  type = 'log';
  /**
   * Log
   */

  constructor(options = {}) {
    if (!options.sku) options.sku = 'log';
    super(options);
    const self = this; // if (!(this instanceof Node)) return new Log(options)

    this.scrollback = options.scrollback ?? Infinity;
    this.scrollOnInput = options.scrollOnInput;
    this.on(SET_CONTENT, () => {
      if (!self._userScrolled || self.scrollOnInput) nextTick(() => {
        self.scrollPercent = 100;
        self._userScrolled = false;
        self.screen.render();
      });
    });
  }

  static build(options) {
    return new Log(options);
  }

  log = this.add; // log() { return this.add() }

  add(...args) {
    if (typeof args[0] === OBJ) {
      args[0] = util.inspect(args[0], true, 20, true);
    }

    const text = util.format.apply(util, args);
    this.emit(LOG, text);
    const ret = this.pushLine(text);
    if (this._clines.fake.length > this.scrollback) this.shiftLine(0, this.scrollback / 3 | 0);
    return ret;
  }

  _scroll = ScrollableBox.prototype.scroll;

  scroll(offset, always) {
    if (offset === 0) return this._scroll(offset, always);
    this._userScrolled = true;

    const ret = this._scroll(offset, always);

    if (this.scrollPercent === 100) this._userScrolled = false;
    return ret;
  }

}

class GridScale {
  constructor(cadre) {
    this.pad = cadre;
  }

  static build(o) {
    return new GridScale(Cadre.build(o));
  }

  scaleT(val, base) {
    return this.pad.t + scaler(val, base - this.pad.vert);
  }

  scaleL(val, base) {
    return this.pad.l + scaler(val, base - this.pad.hori);
  }

  scaleH(val, base) {
    return scaler(val, base - this.pad.vert);
  }

  scaleW(val, base) {
    return scaler(val, base - this.pad.hori);
  }

}

/**
 * screen.js - screen node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Screen extends Node {
  type = 'screen';

  constructor(options = {}) {
    options.sku = options.sku ?? 'screen';
    super(options, true);
    GlobalScreen.initialize(this);
    this.setupProgram(options);
    Node.prototype.setup.call(this, options); // super(options) // Node.call(this, options)

    Screen.prototype.config.call(this, options);
  }

  static build(options) {
    return new Screen(options);
  }

  config(options) {
    const self = this; // this.type = this.type ?? 'screen'

    this.autoPadding = options.autoPadding !== false;
    this.tabc = Array((options.tabSize || 4) + 1).join(' ');
    this.dockBorders = options.dockBorders;
    this.ignoreLocked = options.ignoreLocked || [];
    this._unicode = this.tput.unicode || this.tput.numerics.U8 === 1;
    this.fullUnicode = this.options.fullUnicode && this._unicode;
    this.dattr = 0 << 18 | 0x1ff << 9 | 0x1ff;
    this.renders = 0;
    this.setupPos();
    this.padding = Cadre.build(options.padding); // { left: 0, top: 0, right: 0, bottom: 0 }

    this.gridScale = new GridScale(this.padding);
    this.hover = null;
    this.history = [];
    this.clickable = [];
    this.keyable = [];
    this.grabKeys = false;
    this.lockKeys = false;
    this.focused;
    this._buf = '';
    this._ci = -1;
    if (options.title) this.title = options.title;
    const cursor = options.cursor ?? (options.cursor = {
      artificial: options.artificialCursor,
      shape: options.cursorShape,
      blink: options.cursorBlink,
      color: options.cursorColor
    });
    this.cursor = {
      artificial: cursor.artificial || false,
      shape: cursor.shape || 'block',
      blink: cursor.blink || false,
      color: cursor.color || null,
      _set: false,
      _state: 1,
      _hidden: true
    };
    this.program.on(RESIZE, () => {
      self.alloc();
      self.render();

      function resizeEmitter(node) {
        node.emit(RESIZE);
        node.sub.forEach(resizeEmitter);
      }

      resizeEmitter(self);
    });
    this.program.on(FOCUS, () => self.emit(FOCUS));
    this.program.on(BLUR, () => self.emit(BLUR));
    this.program.on(WARNING, text => self.emit(WARNING, text));
    this.on(NEW_LISTENER, type => {
      const pressListen = type === KEYPRESS || type.indexOf('key ') === 0;
      const mouseListen = type === MOUSE;

      if (pressListen || mouseListen) {
        if (pressListen) self._listenKeys();
        if (mouseListen) self._listenMouse();
      }

      if (type === MOUSE || type === CLICK || type === MOUSEOVER || type === MOUSEOUT || type === MOUSEDOWN || type === MOUSEUP || type === MOUSEWHEEL || type === WHEELDOWN || type === WHEELUP || type === MOUSEMOVE) self._listenMouse();
    });
    this.setMaxListeners(Infinity);
    this.enter();
    this.postEnter();
    this.on('adjourn', () => GlobalScreen.journal = false);
  }

  setupPos() {
    const t = this.t = this.top = this.absT = this.relT = this.intT = 0;
    const b = this.b = this.bottom = this.absB = this.relB = this.intB = 0;
    const l = this.l = this.left = this.absL = this.relL = this.intL = 0;
    const r = this.r = this.right = this.absR = this.relR = this.intR = 0;
    const h = this.h = this.height;
    const w = this.w = this.width;
    this.intH = 0;
    this.intW = 0;
    this.pos = new Detic(t, b, l, r, w, h);
  }

  setupProgram(options) {
    if (options.rsety && options.listen) options = {
      program: options
    };
    this.program = options.program;

    if (!this.program) {
      this.program = Program.build({
        input: options.input,
        output: options.output,
        log: options.log,
        debug: options.debug,
        dump: options.dump,
        terminal: options.terminal || options.term,
        resizeTimeout: options.resizeTimeout,
        forceUnicode: options.forceUnicode,
        tput: true,
        buffer: true,
        zero: true
      });
    } else {
      this.program.setupTput();
      this.program.useBuffer = true;
      this.program.zero = true;
      this.program.options.resizeTimeout = options.resizeTimeout;

      if (options.forceUnicode != null) {
        this.program.tput.features.unicode = options.forceUnicode;
        this.program.tput.unicode = options.forceUnicode;
      }
    }

    this.tput = this.program.tput;
    Logger.log('screen', 'setup-program', 'this.program.type', this.program.type);
  }

  get title() {
    return this.program.title;
  }

  set title(title) {
    return this.program.title = title;
  }

  get terminal() {
    return this.program.terminal;
  }

  set terminal(terminal) {
    return this.setTerminal(terminal), this.program.terminal;
  }

  get cols() {
    return this.program.cols;
  }

  get rows() {
    return this.program.rows;
  }

  get width() {
    return this.program.cols;
  }

  get height() {
    return this.program.rows;
  }

  get focused() {
    return this.history[this.history.length - 1];
  }

  set focused(el) {
    return this.focusPush(el);
  }

  get lines() {
    return this.currLines;
  }

  get olines() {
    return this.prevLines;
  }

  get position() {
    return this.pos;
  }

  set position(val) {
    this.pos = val;
  }

  alloc(dirty) {
    this.currLines = [];
    this.prevLines = [];

    for (let y = 0, normCell = Mor.build(this.dattr, SP); y < this.rows; y++) {
      const currLine = this.currLines[y] = [],
            prevLine = this.prevLines[y] = [];
      currLine.dirty = !!dirty;

      for (let x = 0; x < this.cols; x++) {
        currLine[x] = normCell.copy(); // [ this.dattr, ' ' ]

        prevLine[x] = normCell.copy();
      }
    }

    this.program.clear();
  }

  realloc() {
    return this.alloc(true);
  }

  clearRegion(xLo, xHi, yLo, yHi, override) {
    return this.fillRegion(this.dattr, ' ', xLo, xHi, yLo, yHi, override);
  }

  fillRegion(at, ch, xLo, xHi, yLo, yHi, override) {
    const lines = this.currLines;
    if (xLo < 0) xLo = 0;
    if (yLo < 0) yLo = 0;

    for (let line, temp = Mor.build(at, ch); yLo < yHi; yLo++) {
      if (!(line = lines[yLo])) break;

      for (let i = xLo, cell; i < xHi; i++) {
        if (!(cell = line[i])) break;

        if (override || !cell.eq(temp)) {
          cell.assign(temp), line.dirty = true;
        }
      }
    }
  }

  #reduceColor(color) {
    return degrade(color, this.tput.colors);
  }

  #cursorAttr(cursor, normAttr) {
    const {
      shape
    } = cursor;
    let at = normAttr || this.dattr,
        cursorAttr,
        ch;

    if (shape === 'line') {
      at &= ~(0x1ff << 9);
      at |= 7 << 9;
      ch = '\u2502';
    } else if (shape === 'underline') {
      at &= ~(0x1ff << 9);
      at |= 7 << 9;
      at |= 2 << 18;
    } else if (shape === 'block') {
      at &= ~(0x1ff << 9);
      at |= 7 << 9;
      at |= 8 << 18;
    } else if (typeof shape === OBJ && shape) {
      cursorAttr = styleToAttr(cursor, shape);

      if (shape.bold || shape.underline || shape.blink || shape.inverse || shape.invisible) {
        at &= ~(0x1ff << 18);
        at |= (cursorAttr >> 18 & 0x1ff) << 18;
      }

      if (shape.fg) {
        at &= ~(0x1ff << 9);
        at |= (cursorAttr >> 9 & 0x1ff) << 9; // paste cursorAttr's
      }

      if (shape.bg) {
        at &= ~(0x1ff << 0);
        at |= cursorAttr & 0x1ff;
      }

      if (shape.ch) {
        ch = shape.ch;
      }
    }

    if (cursor.color != null) {
      at &= ~(0x1ff << 9);
      at |= cursor.color << 9;
    }

    return Mor.build(at, ch);
  }

  screenshot(xLo, xHi, yLo, yHi, term) {
    if (xLo == null) xLo = 0;
    if (xHi == null) xHi = this.cols;
    if (yLo == null) yLo = 0;
    if (yHi == null) yHi = this.rows;
    if (xLo < 0) xLo = 0;
    if (yLo < 0) yLo = 0;
    const tempAttr = this.dattr;

    if (term) {
      this.dattr = term.defAttr;
    }

    let main = '';
    const normAttr = this.dattr;

    for (let y = yLo, line; y < yHi; y++) {
      if (!(line = (term === null || term === void 0 ? void 0 : term.lines[y]) ?? this.currLines[y])) break;
      let out = '',
          currAttr = this.dattr;

      for (let x = xLo, cell; x < xHi; x++) {
        if (!(cell = line[x])) break;
        let at = cell.at,
            ch = cell.ch;

        if (at !== currAttr) {
          if (currAttr !== normAttr) {
            out += CSI + SGR;
          }

          if (at !== normAttr) {
            let nextAttr = at;

            if (term) {
              if ((nextAttr >> 9 & 0x1ff) === 257) nextAttr |= 0x1ff << 9;
              if ((nextAttr & 0x1ff) === 256) nextAttr |= 0x1ff;
            }

            out += attrToSgra(nextAttr, this.tput.colors);
          }
        }

        if (this.fullUnicode && unicode.charWidth(cell.ch) === 2) {
          x === xHi - 1 ? ch = ' ' : x++;
        }

        out += ch;
        currAttr = at;
      }

      if (currAttr !== normAttr) {
        out += CSI + SGR;
      }

      if (out) {
        main += (y > 0 ? LF : '') + out;
      }
    }

    main = main.replace(/(?:\s*\x1b\[40m\s*\x1b\[m\s*)*$/, '') + LF;

    if (term) {
      this.dattr = tempAttr;
    }

    return main;
  }

  attrCode(sgra, baseAttr, normAttr) {
    return sgraToAttr(sgra, baseAttr, normAttr);
  } // sgra to blessed attr


  codeAttr(attr) {
    return attrToSgra(attr, this.tput.colors);
  } // blessed attr to sgra


  render() {
    var _this$focused;

    // const [ h, w ] = size(this.currLines)
    // console.log('>> [screen.render]', this.currLines)
    // console.log('>> [screen.render]', h, w)
    const self = this;
    if (this.destroyed) return void 0;
    this.emit(PRERENDER);
    this._borderStops = {}; // TODO: Possibly get rid of .dirty altogether.
    // TODO: Could possibly drop .dirty and just clear the `lines` buffer every
    // time before a screen.render. This way clearRegion doesn't have to be
    // called in arbitrary places for the sake of clearing a spot where an
    // element used to be (e.g. when an element moves or is hidden). There could
    // be some overhead though.
    // this.screen.clearRegion(0, this.cols, 0, this.rows);

    this._ci = 0;
    this.sub.forEach(node => {
      node.index = self._ci++, node.render();
    });
    this._ci = -1;

    if (this.screen.dockBorders) {
      this.#dockBorders();
    }

    this.draw(0, this.currLines.length - 1); // XXX Workaround to deal with cursor pos before the screen has rendered and
    // prevPos is not reliable (stale).

    if ((_this$focused = this.focused) !== null && _this$focused !== void 0 && _this$focused._updateCursor) {
      this.focused._updateCursor(true);
    }

    this.renders++;
    this.emit(RENDER);
  }

  draw(start, end) {
    let main = '';
    let clr, neq;
    let lx = -1,
        ly = -1;
    let acs;

    if (this._buf) {
      main += this._buf, this._buf = '';
    }

    const {
      cursor,
      program,
      tput,
      options
    } = this;

    for (let y = start; y <= end; y++) {
      let currLine = this.currLines[y],
          prevLine = this.prevLines[y];
      if (!currLine.dirty && !(cursor.artificial && y === program.y)) continue;
      currLine.dirty = false;
      let out = '';
      let currAttr = this.dattr;

      for (let x = 0, currCell, prevCell; x < currLine.length && (currCell = currLine[x]); x++) {
        /** @type {Mor} */
        let nextCell = currCell.copy();
        let at = nextCell.at; // let at = currCell.at

        let ch = nextCell.ch; // let ch = currCell.ch
        // Render the artificial cursor.

        if (cursor.artificial && !cursor._hidden && cursor._state && x === program.x && y === program.y) {
          const cursorAttr = this.#cursorAttr(this.cursor, nextCell.at);
          nextCell.assign(cursorAttr);
          if (cursorAttr.ch) ch = cursorAttr.ch;
          at = cursorAttr.at;
        } // Take advantage of xterm's back_color_erase feature by using a
        // lookahead. Stop spitting out so many damn spaces. NOTE: Is checking
        // the bg for non BCE terminals worth the overhead?


        if (options.useBCE && ch === ' ' && (tput.booleans.back_color_erase || (at & 0x1ff) === (this.dattr & 0x1ff)) && (at >> 18 & 8) === (this.dattr >> 18 & 8)) {
          clr = true;
          neq = false;

          for (let i = x, currCell, prevCell; i < currLine.length && (currCell = currLine[i]); i++) {
            if (currCell.at !== at || currCell.ch !== ' ') {
              clr = false;
              break;
            }

            if ((prevCell = prevLine[i]) && !currCell.eq(prevCell)) {
              neq = true;
            }
          }

          if (clr && neq) {
            lx = -1, ly = -1;

            if (at !== currAttr) {
              out += attrToSgra(at, this.tput.colors), currAttr = at;
            }

            out += this.tput.cup(y, x), out += this.tput.el();

            for (let i = x, prevCell; i < currLine.length && (prevCell = prevLine[i]); i++) {
              prevCell.inject(at, ' ');
            }

            break;
          }
        } // Optimize by comparing the real output
        // buffer to the pending output buffer.


        prevCell = prevLine[x];

        if (at === prevCell.at && ch === prevCell.ch) {
          if (lx === -1) {
            lx = x, ly = y;
          }

          continue;
        } else if (lx !== -1) {
          if (this.tput.literals.parm_right_cursor) {
            out += y === ly ? this.tput.cuf(x - lx) : this.tput.cup(y, x);
          } else {
            out += this.tput.cup(y, x);
          }

          lx = -1, ly = -1;
        }

        prevCell.inject(at, ch);

        if (at !== currAttr) {
          if (currAttr !== this.dattr) {
            out += CSI + SGR;
          }

          if (at !== this.dattr) {
            // console.log(`>> [{${ this.codename }}.draw()]`, `out += attrToSgra(${ at }, ${ this.tput.colors })`)
            out += attrToSgra(at, this.tput.colors);
          }
        } // If we find a double-width char, eat the next character which should be
        // a space due to parseContent's behavior.


        if (this.fullUnicode) {
          // If this is a surrogate pair double-width char, we can ignore it
          // because parseContent already counted it as length=2.
          if (unicode.charWidth(currLine[x].ch) === 2) {
            // NOTE: At cols=44, the bug that is avoided
            // by the angles check occurs in widget-unicode:
            // Might also need: `line[x + 1][0] !== line[x][0]`
            // for borderless boxes?
            if (x === currLine.length - 1 || ANGLES[currLine[x + 1].ch]) {
              // If we're at the end, we don't have enough space for a
              // double-width. Overwrite it with a space and ignore.
              ch = ' ';
              prevCell.ch = '\0';
            } else {
              // ALWAYS refresh double-width chars because this special cursor
              // behavior is needed. There may be a more efficient way of doing
              // this. See above.
              prevCell.ch = '\0'; // Eat the next character by moving forward and marking as a
              // space (which it is).

              prevLine[++x].ch = '\0';
            }
          }
        } // Attempt to use ACS for supported characters.
        // This is not ideal, but it's how ncurses works.
        // There are a lot of terminals that support ACS
        // *and UTF8, but do not declare U8. So ACS ends
        // up being used (slower than utf8). Terminals
        // that do not support ACS and do not explicitly
        // support UTF8 get their unicode characters
        // replaced with really ugly ascii characters.
        // It is possible there is a terminal out there
        // somewhere that does not support ACS, but
        // supports UTF8, but I imagine it's unlikely.
        // Maybe remove !this.tput.unicode check, however,
        // this seems to be the way ncurses does it.


        if (this.tput.literals.enter_alt_charset_mode && !this.tput.brokenACS && (this.tput.acscr[ch] || acs)) {
          // Fun fact: even if this.tput.brokenACS wasn't checked here,
          // the linux console would still work fine because the acs
          // table would fail the check of: this.tput.acscr[ch]
          if (this.tput.acscr[ch]) {
            if (acs) {
              ch = this.tput.acscr[ch];
            } else {
              ch = this.tput.smacs() + this.tput.acscr[ch];
              acs = true;
            }
          } else if (acs) {
            ch = this.tput.rmacs() + ch;
            acs = false;
          }
        } else {
          // U8 is not consistently correct. Some terminfo's
          // terminals that do not declare it may actually
          // support utf8 (e.g. urxvt), but if the terminal
          // does not declare support for ACS (and U8), chances
          // are it does not support UTF8. This is probably
          // the "safest" way to do this. Should fix things
          // like sun-color.
          // NOTE: It could be the case that the $LANG
          // is all that matters in some cases:
          // if (!this.tput.unicode && ch > '~') {
          if (!this.tput.unicode && this.tput.numerics.U8 !== 1 && ch > '~') ch = this.tput.utoa[ch] || '?';
        }

        out += ch;
        currAttr = at;
      }

      if (currAttr !== this.dattr) {
        out += CSI + SGR;
      }

      if (out) {
        main += this.tput.cup(y, 0) + out;
      }
    }

    if (acs) {
      main += this.tput.rmacs();
      acs = false;
    }

    if (main) {
      let pre = '',
          post = '';
      pre += this.tput.sc(), post += this.tput.rc();

      if (!this.program.cursorHidden) {
        pre += this.tput.civis(), post += this.tput.cnorm();
      } // this.program.flush();
      // this.program.write(pre + main + post);


      this.program.writeOff(pre + main + post);
    } // this.emit('draw');

  } // This is how ncurses does it.
  // Scroll down (up cursor-wise).


  blankLine(ch, dirty) {
    const out = [];
    const tempCell = Mor.build(this.dattr, ch || ' ');

    for (let x = 0; x < this.cols; x++) {
      out[x] = tempCell.copy(); // out[x] = [ this.dattr, ch || ' ' ]
    }

    out.dirty = dirty;
    return out;
  } // boxes with clean sides?


  cleanSides(node) {
    const pos = node.prevPos;

    if (!pos) {
      return false;
    }

    if (pos._cleanSides != null) {
      return pos._cleanSides;
    }

    if (pos.xLo <= 0 && pos.xHi >= this.width) {
      return pos._cleanSides = true;
    }

    if (this.options.fastCSR) {
      // Maybe just do this instead of parsing.
      if (pos.yLo < 0) return pos._cleanSides = false;
      if (pos.yHi > this.height) return pos._cleanSides = false;
      return this.width - pos.dHori < 40 ? pos._cleanSides = true : pos._cleanSides = false;
    }

    if (!this.options.smartCSR) {
      return false;
    } // The scrollbar can't update properly, and there's also a
    // chance that the scrollbar may get moved around senselessly.
    // NOTE: In pratice, this doesn't seem to be the case.
    // if (this.scrollbar) {
    //   return pos._cleanSides = false;
    // }
    // Doesn't matter if we're only a height of 1.
    // if ((pos.yHi - el.intB) - (pos.yLo + el.intT) <= 1) {
    //   return pos._cleanSides = false;
    // }


    const yLo = pos.yLo + node.intT,
          yHi = pos.yHi - node.intB;
    if (pos.yLo < 0) return pos._cleanSides = false;
    if (pos.yHi > this.height) return pos._cleanSides = false;
    if (pos.xLo - 1 < 0) return pos._cleanSides = true;
    if (pos.xHi > this.width) return pos._cleanSides = true;

    for (let x = pos.xLo - 1, line, cell; x >= 0; x--) {
      if (!(line = this.prevLines[yLo])) break;
      const initCell = line[x];

      for (let y = yLo; y < yHi; y++) {
        if (!(line = this.prevLines[y]) || !(cell = line[x])) break;
        cell = line[x];
        if (!cell.eq(initCell)) return pos._cleanSides = false;
      }
    }

    for (let x = pos.xHi, line, cell; x < this.width; x++) {
      if (!(line = this.prevLines[yLo])) break;
      const initCell = line[x];

      for (let y = yLo; y < yHi; y++) {
        if (!(line = this.prevLines[y]) || !(cell = line[x])) break;
        if (!cell.eq(initCell)) return pos._cleanSides = false;
      }
    }

    return pos._cleanSides = true;
  }

  #dockBorders() {
    const lines = this.currLines;
    let stops = this._borderStops; // var keys, stop;
    //
    // keys = Object.keys(this._borderStops)
    //   .map(function(k) { return +k; })
    //   .sort(function(a, b) { return a - b; });
    //
    // for (i = 0; i < keys.length; i++) {
    //   y = keys[i];
    //   if (!lines[y]) continue;
    //   stop = this._borderStops[y];
    //   for (x = stop.xLo; x < stop.xHi; x++) {

    stops = Object.keys(stops).map(k => +k).sort((a, b) => a - b);

    for (let i = 0, y, line, cell; i < stops.length; i++) {
      y = stops[i];
      if (!(line = lines[y])) continue;

      for (let x = 0; x < this.width; x++) {
        cell = line[x];

        if (ANGLES[cell.ch]) {
          cell.ch = this.#getAngle(lines, x, y);
          line.dirty = true;
        }
      }
    }
  }

  setTerminal(terminal) {
    const entered = !!this.program.isAlt;

    if (entered) {
      this._buf = '';
      this.program._buf = '';
      this.leave();
    }

    this.program.setTerminal(terminal);
    this.tput = this.program.tput;
    if (entered) this.enter();
  }

  enter() {
    if (this.program.isAlt) return;

    if (!this.cursor._set) {
      if (this.options.cursor.shape) {
        this.cursorShape(this.cursor.shape, this.cursor.blink);
      }

      if (this.options.cursor.color) {
        this.cursorColor(this.cursor.color);
      }
    }

    if (process.platform === 'win32') try {
      cp.execSync('cls', {
        stdio: 'ignore',
        timeout: 1000
      });
    } catch (e) {}
    this.program.alternateBuffer();
    this.program.put.keypad_xmit();
    this.program.csr(0, this.height - 1);
    this.program.hideCursor();
    this.program.cup(0, 0); // We need this for tmux now:

    if (this.tput.literals.ena_acs) {
      this.program.writeOff(this.tput.enacs());
    }

    this.alloc();
  }

  leave() {
    if (!this.program.isAlt) return;
    this.program.put.keypad_local();
    if (this.program.scrollTop !== 0 || this.program.scrollBottom !== this.rows - 1) this.program.csr(0, this.height - 1); // XXX For some reason if alloc/clear() is before this
    // line, it doesn't work on linux console.

    this.program.showCursor();
    this.alloc();

    if (this._listenedMouse) {
      this.program.disableMouse();
    }

    this.program.normalBuffer();
    if (this.cursor._set) this.cursorReset();
    this.program.flush();
    if (process.platform === 'win32') try {
      cp.execSync('cls', {
        stdio: 'ignore',
        timeout: 1000
      });
    } catch (e) {}
  }

  postEnter() {
    const self = this;

    if (this.options.debug) {
      this.debugLog = new Log({
        screen: this,
        sup: this,
        hidden: true,
        draggable: true,
        left: 'center',
        top: 'center',
        width: '30%',
        height: '30%',
        border: 'line',
        label: ' {bold}Debug Log{/bold} ',
        tags: true,
        keys: true,
        vi: true,
        mouse: true,
        scrollbar: {
          ch: ' ',
          track: {
            bg: 'yellow'
          },
          style: {
            inverse: true
          }
        }
      });

      this.debugLog.toggle = function () {
        if (self.debugLog.hidden) {
          self.saveFocus();
          self.debugLog.show();
          self.debugLog.setFront();
          self.debugLog.focus();
        } else {
          self.debugLog.hide();
          self.restoreFocus();
        }

        self.render();
      };

      this.debugLog.key(['q', 'escape'], self.debugLog.toggle);
      this.key('f12', self.debugLog.toggle);
    }

    if (this.options.warnings) {
      this.on(WARNING, text => {
        const warning = new Box({
          screen: self,
          sup: self,
          left: 'center',
          top: 'center',
          width: 'shrink',
          padding: 1,
          height: 'shrink',
          align: 'center',
          valign: 'middle',
          border: 'line',
          label: ' {red-fg}{bold}WARNING{/} ',
          content: '{bold}' + text + '{/bold}',
          tags: true
        });
        self.render();
        const timeout = setTimeout(function () {
          warning.destroy(), self.render();
        }, 1500);

        if (timeout.unref) {
          timeout.unref();
        }
      });
    }
  }

  destroy = this._destroy;

  _destroy() {
    this.leave();
    const index = GlobalScreen.instances.indexOf(this);
    Logger.log('screen', 'destroy', index);

    if (~index) {
      GlobalScreen.removeInstanceAt(index); // GlobalScreen.instances.splice(index, 1)
      // GlobalScreen.total--
      // GlobalScreen.global = GlobalScreen.instances[0]
      // if (GlobalScreen.total === 0) {
      //   GlobalScreen.global = null
      //   for (const [ signal, handler ] of Object.entries(GlobalScreen.handlers)) {
      //     process.off(signal, GlobalScreen[handler])
      //     delete GlobalScreen[handler]
      //   }
      //   delete GlobalScreen._bound
      // }

      this.destroyed = true;
      this.emit(DESTROY);

      this._destroy();
    }

    this.program.destroy();
  }

  log() {
    return this.program.log.apply(this.program, arguments);
  }

  debug() {
    if (this.debugLog) {
      this.debugLog.log.apply(this.debugLog, arguments);
    }

    return this.program.debug.apply(this.program, arguments);
  }

  _listenMouse(el) {
    const self = this;

    if (el && !~this.clickable.indexOf(el)) {
      el.clickable = true;
      this.clickable.push(el);
    }

    if (this._listenedMouse) return;
    this._listenedMouse = true;
    this.program.enableMouse();
    if (this.options.sendFocus) this.program.setMouse({
      sendFocus: true
    }, true);
    this.on(RENDER, function () {
      self._needsClickableSort = true;
    });
    this.program.on(MOUSE, function (data) {
      if (self.lockKeys) return;

      if (self._needsClickableSort) {
        self.clickable = helpers.hsort(self.clickable);
        self._needsClickableSort = false;
      }

      let set;

      for (let i = 0, node, pos; i < self.clickable.length && (node = self.clickable[i]); i++) {
        if (node.detached || !node.visible) continue; // if (self.grabMouse && self.focused !== el
        //     && !el.hasAncestor(self.focused)) continue;

        pos = node.prevPos;
        if (!pos) continue;

        if (pos.xLo <= data.x && data.x < pos.xHi && pos.yLo <= data.y && data.y < pos.yHi) {
          node.emit(MOUSE, data);

          if (data.action === MOUSEDOWN) {
            self.mouseDown = node;
          } else if (data.action === MOUSEUP) {
            (self.mouseDown || node).emit(CLICK, data);
            self.mouseDown = null;
          } else if (data.action === MOUSEMOVE) {
            if (self.hover && node.index > self.hover.index) {
              set = false;
            }

            if (self.hover !== node && !set) {
              if (self.hover) {
                self.hover.emit(MOUSEOUT, data);
              }

              node.emit(MOUSEOVER, data);
              self.hover = node;
            }

            set = true;
          }

          node.emit(data.action, data);
          break;
        }
      } // Just mouseover?


      if ((data.action === MOUSEMOVE || data.action === MOUSEDOWN || data.action === MOUSEUP) && self.hover && !set) {
        self.hover.emit(MOUSEOUT, data);
        self.hover = null;
      }

      self.emit(MOUSE, data);
      self.emit(data.action, data);
    }); // Autofocus highest element.
    // this.on(ELEMENT_CLICK, function(el, data) {
    //   var target;
    //   do {
    //     if (el.clickable === true && el.options.autoFocus !== false) {
    //       target = el;
    //     }
    //   } while ((el = el.sup));
    //   if (target) target.focus();
    // });
    // Autofocus elements with the appropriate option.

    this.on(ELEMENT_CLICK, el => {
      if (el.clickable === true && el.options.autoFocus !== false) el.focus();
    });
  }

  enableMouse(el) {
    this._listenMouse(el);
  }

  _listenKeys(el) {
    const self = this;

    if (el && !~this.keyable.indexOf(el)) {
      el.keyable = true;
      this.keyable.push(el);
    }

    if (this._listenedKeys) return;
    this._listenedKeys = true; // NOTE: The event emissions used to be reversed:
    // element + screen
    // They are now:
    // screen + element
    // After the first keypress emitted, the handler
    // checks to make sure grabKeys, lockKeys, and focused
    // weren't changed, and handles those situations appropriately.

    this.program.on(KEYPRESS, function (ch, key) {
      if (self.lockKeys && !~self.ignoreLocked.indexOf(key.full)) {
        return;
      }

      const focused = self.focused,
            grabKeys = self.grabKeys;

      if (!grabKeys || ~self.ignoreLocked.indexOf(key.full)) {
        self.emit(KEYPRESS, ch, key);
        self.emit('key ' + key.full, ch, key);
      } // If something changed from the screen key handler, stop.


      if (self.grabKeys !== grabKeys || self.lockKeys) {
        return;
      }

      if (focused && focused.keyable) {
        focused.emit(KEYPRESS, ch, key);
        focused.emit('key ' + key.full, ch, key);
      }
    });
  }

  enableKeys(el) {
    this._listenKeys(el);
  }

  enableInput(el) {
    this._listenMouse(el);

    this._listenKeys(el);
  }

  _initHover() {
    const self = this;

    if (this._hoverText) {
      return;
    }

    this._hoverText = new Box({
      screen: this,
      left: 0,
      top: 0,
      tags: false,
      height: 'shrink',
      width: 'shrink',
      border: 'line',
      style: {
        border: {
          fg: 'default'
        },
        bg: 'default',
        fg: 'default'
      }
    });
    this.on(MOUSEMOVE, function (data) {
      if (self._hoverText.detached) return;
      self._hoverText.relL = data.x + 1;
      self._hoverText.relT = data.y;
      self.render();
    });
    this.on(ELEMENT_MOUSEOVER, function (el, data) {
      if (!el._hoverOptions) return;
      self._hoverText.parseTags = el.parseTags;

      self._hoverText.setContent(el._hoverOptions.text);

      self.append(self._hoverText);
      self._hoverText.relL = data.x + 1;
      self._hoverText.relT = data.y;
      self.render();
    });
    this.on(ELEMENT_MOUSEOUT, function () {
      if (self._hoverText.detached) return;

      self._hoverText.detach();

      self.render();
    }); // XXX This can cause problems if the
    // terminal does not support allMotion.
    // Workaround: check to see if content is set.

    this.on(ELEMENT_MOUSEUP, function (el) {
      if (!self._hoverText.getContent()) return;
      if (!el._hoverOptions) return;
      self.append(self._hoverText);
      self.render();
    });
  } // This is how ncurses does it.
  // Scroll up (down cursor-wise).


  insertLine(n, y, top, bottom) {
    // if (y === top) return this.insertLineNC(n, y, top, bottom);
    if (!this.tput.literals.change_scroll_region || !this.tput.literals.delete_line || !this.tput.literals.insert_line) return;
    this._buf += this.tput.csr(top, bottom);
    this._buf += this.tput.cup(y, 0);
    this._buf += this.tput.il(n);
    this._buf += this.tput.csr(0, this.height - 1);
    const j = bottom + 1;

    while (n--) {
      this.currLines.splice(y, 0, this.blankLine());
      this.currLines.splice(j, 1);
      this.prevLines.splice(y, 0, this.blankLine());
      this.prevLines.splice(j, 1);
    }
  }

  deleteLine(n, y, top, bottom) {
    // if (y === top) return this.deleteLineNC(n, y, top, bottom);
    if (!this.tput.literals.change_scroll_region || !this.tput.literals.delete_line || !this.tput.literals.insert_line) return;
    this._buf += this.tput.csr(top, bottom);
    this._buf += this.tput.cup(y, 0);
    this._buf += this.tput.dl(n);
    this._buf += this.tput.csr(0, this.height - 1);
    const j = bottom + 1;

    while (n--) {
      this.currLines.splice(j, 0, this.blankLine());
      this.currLines.splice(y, 1);
      this.prevLines.splice(j, 0, this.blankLine());
      this.prevLines.splice(y, 1);
    }
  } // This will only work for top line deletion as opposed to arbitrary lines.


  insertLineNC(n, y, top, bottom) {
    if (!this.tput.literals.change_scroll_region || !this.tput.literals.delete_line) return;
    this._buf += this.tput.csr(top, bottom);
    this._buf += this.tput.cup(top, 0);
    this._buf += this.tput.dl(n);
    this._buf += this.tput.csr(0, this.height - 1);
    const j = bottom + 1;

    while (n--) {
      this.currLines.splice(j, 0, this.blankLine());
      this.currLines.splice(y, 1);
      this.prevLines.splice(j, 0, this.blankLine());
      this.prevLines.splice(y, 1);
    }
  } // This will only work for bottom line deletion as opposed to arbitrary lines.


  deleteLineNC(n, y, top, bottom) {
    if (!this.tput.literals.change_scroll_region || !this.tput.literals.delete_line) return;
    this._buf += this.tput.csr(top, bottom);
    this._buf += this.tput.cup(bottom, 0);
    this._buf += Array(n + 1).join(LF);
    this._buf += this.tput.csr(0, this.height - 1);
    const j = bottom + 1;

    while (n--) {
      this.currLines.splice(j, 0, this.blankLine());
      this.currLines.splice(y, 1);
      this.prevLines.splice(j, 0, this.blankLine());
      this.prevLines.splice(y, 1);
    }
  }

  insertBottom(top, bottom) {
    return this.deleteLine(1, top, top, bottom);
  } // Parse the sides of an element to determine
  // whether an element has uniform cells on
  // both sides. If it does, we can use CSR to
  // optimize scrolling on a scrollable element.
  // Not exactly sure how worthwile this is.
  // This will cause a performance/cpu-usage hit,
  // but will it be less or greater than the
  // performance hit of slow-rendering scrollable


  insertTop(top, bottom) {
    return this.insertLine(1, top, top, bottom);
  }

  deleteBottom(top, bottom) {
    return this.clearRegion(0, this.width, bottom, bottom);
  } // Same as: return this.insertBottom(top, bottom);


  deleteTop(top, bottom) {
    return this.deleteLine(1, top, top, bottom);
  }

  #getAngle(lines, x, y) {
    let angle = 0;
    const attr = lines[y][x][0],
          ch = lines[y][x].ch;

    if (lines[y][x - 1] && ANGLES_L[lines[y][x - 1].ch]) {
      if (!this.options.ignoreDockContrast) {
        if (lines[y][x - 1][0] !== attr) return ch;
      }

      angle |= 1 << 3;
    }

    if (lines[y - 1] && ANGLES_U[lines[y - 1][x].ch]) {
      if (!this.options.ignoreDockContrast) {
        if (lines[y - 1][x][0] !== attr) return ch;
      }

      angle |= 1 << 2;
    }

    if (lines[y][x + 1] && ANGLES_R[lines[y][x + 1].ch]) {
      if (!this.options.ignoreDockContrast) {
        if (lines[y][x + 1][0] !== attr) return ch;
      }

      angle |= 1 << 1;
    }

    if (lines[y + 1] && ANGLES_D[lines[y + 1][x].ch]) {
      if (!this.options.ignoreDockContrast) {
        if (lines[y + 1][x][0] !== attr) return ch;
      }

      angle |= 1 << 0;
    } // Experimental: fixes this situation:
    // +----------+
    //            | <-- empty space here, should be a T angle
    // +-------+  |
    // |       |  |
    // +-------+  |
    // |          |
    // +----------+
    // if (uangles[lines[y][x].ch]) {
    //   if (lines[y + 1] && cdangles[lines[y + 1][x].ch]) {
    //     if (!this.options.ignoreDockContrast) {
    //       if (lines[y + 1][x][0] !== attr) return ch;
    //     }
    //     angle |= 1 << 0;
    //   }
    // }


    return ANGLE_TABLE[angle] || ch;
  }

  focusOffset(offset) {
    const shown = this.keyable.filter(el => !el.detached && el.visible).length;

    if (!shown || !offset) {
      return;
    }

    let i = this.keyable.indexOf(this.focused);
    if (!~i) return;

    if (offset > 0) {
      while (offset--) {
        if (++i > this.keyable.length - 1) i = 0;
        if (this.keyable[i].detached || !this.keyable[i].visible) offset++;
      }
    } else {
      offset = -offset;

      while (offset--) {
        if (--i < 0) i = this.keyable.length - 1;
        if (this.keyable[i].detached || !this.keyable[i].visible) offset++;
      }
    }

    return this.keyable[i].focus();
  }

  focusPrev = this.focusPrevious;

  focusPrevious() {
    return this.focusOffset(-1);
  }

  focusNext() {
    return this.focusOffset(1);
  }

  focusPush(el) {
    if (!el) return;
    const old = this.history[this.history.length - 1];
    if (this.history.length === 10) this.history.shift();
    this.history.push(el);

    this._focus(el, old);
  }

  focusPop() {
    const old = this.history.pop();
    if (this.history.length) this._focus(this.history[this.history.length - 1], old);
    return old;
  }

  saveFocus() {
    return this._savedFocus = this.focused;
  }

  restoreFocus() {
    if (!this._savedFocus) return;

    this._savedFocus.focus();

    delete this._savedFocus;
    return this.focused;
  }

  rewindFocus() {
    const old = this.history.pop();
    let el;

    while (this.history.length) {
      el = this.history.pop();

      if (!el.detached && el.visible) {
        this.history.push(el);

        this._focus(el, old);

        return el;
      }
    }

    if (old) {
      old.emit(BLUR);
    }
  }

  _focus(self, old) {
    // Find a scrollable ancestor if we have one.
    let el = self;

    while (el = el.sup) if (el.scrollable) break; // If we're in a scrollable element,
    // automatically scroll to the focused element.


    if (el && !el.detached) {
      // NOTE: This is different from the other "visible" values - it needs the
      // visible height of the scrolling element itself, not the element within
      // it.
      const visible = self.screen.height - el.absT - el.intT - el.absB - el.intB;

      if (self.relT < el.subBase) {
        el.scrollTo(self.relT);
        self.screen.render();
      } else if (self.relT + self.height - self.intB > el.subBase + visible) {
        // Explanation for el.intT here: takes into account scrollable elements
        // with borders otherwise the element gets covered by the bottom border:
        el.scrollTo(self.relT - (el.height - self.height) + el.intT, true);
        self.screen.render();
      }
    }

    if (old) {
      old.emit(BLUR, self);
    }

    self.emit(FOCUS, old);
  }

  key(...args) {
    return this.program.key.apply(this, args);
  }

  onceKey(...args) {
    return this.program.onceKey.apply(this, args);
  }

  unkey = this.removeKey;

  removeKey(...args) {
    return this.program.unkey.apply(this, args);
  }

  spawn(file, args, options) {
    if (!Array.isArray(args)) {
      options = args;
      args = [];
    }

    const screen = this,
          program = screen.program,
          mouse = program.mouseEnabled;
    let ps;
    options = options || {};
    options.stdio = options.stdio || 'inherit';
    program.lsaveCursor('spawn'); // program.csr(0, program.rows - 1);

    program.normalBuffer();
    program.showCursor();
    if (mouse) program.disableMouse();
    const write = program.output.write;

    program.output.write = function () {};

    program.input.pause();

    if (program.input.setRawMode) {
      program.input.setRawMode(false);
    }

    const resume = function () {
      if (resume.done) return;
      resume.done = true;

      if (program.input.setRawMode) {
        program.input.setRawMode(true);
      }

      program.input.resume();
      program.output.write = write;
      program.alternateBuffer(); // program.csr(0, program.rows - 1);

      if (mouse) {
        program.enableMouse();

        if (screen.options.sendFocus) {
          screen.program.setMouse({
            sendFocus: true
          }, true);
        }
      }

      screen.alloc();
      screen.render();
      screen.program.lrestoreCursor('spawn', true);
    };

    ps = spawn(file, args, options);
    ps.on(ERROR, resume);
    ps.on(EXIT, resume);
    return ps;
  }

  exec(file, args, options, callback) {
    const ps = this.spawn(file, args, options);
    ps.on(ERROR, err => callback ? callback(err, false) : void 0);
    ps.on(EXIT, code => callback ? callback(null, code === 0) : void 0);
    return ps;
  }

  readEditor(options, callback) {
    if (typeof options === STR) {
      options = {
        editor: options
      };
    }

    if (!callback) {
      callback = options, options = null;
    }

    if (!callback) {
      callback = function () {};
    }

    options = options || {};
    const self = this,
          editor = options.editor || process.env.EDITOR || 'vi',
          name = options.name || process.title || 'blessed',
          rnd = Math.random().toString(36).split('.').pop(),
          file = '/tmp/' + name + '.' + rnd,
          args = [file];
    let opt;
    opt = {
      stdio: 'inherit',
      env: process.env,
      cwd: process.env.HOME
    };

    function writeFile(callback) {
      if (!options.value) return callback();
      return fs.writeFile(file, options.value, callback);
    }

    return writeFile(function (err) {
      if (err) return callback(err);
      return self.exec(editor, args, opt, function (err, success) {
        if (err) return callback(err);
        return fs.readFile(file, 'utf8', (err, data) => fs.unlink(file, () => {
          if (!success) return callback(new Error('Unsuccessful.'));
          if (err) return callback(err);
          return callback(null, data);
        }));
      });
    });
  }

  displayImage(file, callback) {
    if (!file) {
      if (!callback) return;
      return callback(new Error('No image.'));
    }

    file = path.resolve(process.cwd(), file);
    if (!~file.indexOf('://')) file = 'file://' + file;
    const args = ['w3m', '-T', 'text/html'];
    const input = '<title>press q to exit</title>' + '<img align="center" src="' + file + '">';
    const opt = {
      stdio: ['pipe', 1, 2],
      env: process.env,
      cwd: process.env.HOME
    };
    const ps = this.spawn(args[0], args.slice(1), opt);
    ps.on(ERROR, err => callback ? callback(err) : void 0);
    ps.on(EXIT, code => callback ? code !== 0 ? callback(new Error('Exit Code: ' + code)) : callback(null, code === 0) : void 0);
    ps.stdin.write(input + LF);
    ps.stdin.end();
  }

  setEffects(el, fel, over, out, effects, temp) {
    if (!effects) return;
    const tmp = {};
    if (temp) el[temp] = tmp;

    if (typeof el !== FUN) {
      const _el = el;

      el = function () {
        return _el;
      };
    }

    fel.on(over, function () {
      const element = el();
      Object.keys(effects).forEach(key => {
        const val = effects[key];

        if (val !== null && typeof val === OBJ) {
          tmp[key] = tmp[key] || {}; // element.style[key] = element.style[key] || {};

          Object.keys(val).forEach(k => {
            const v = val[k];
            tmp[key][k] = element.style[key][k];
            element.style[key][k] = v;
          });
          return;
        }

        tmp[key] = element.style[key];
        element.style[key] = val;
      });
      element.screen.render();
    });
    fel.on(out, () => {
      const element = el();
      Object.keys(effects).forEach(key => {
        const val = effects[key];

        if (val !== null && typeof val === OBJ) {
          tmp[key] = tmp[key] || {}; // element.style[key] = element.style[key] || {};

          Object.keys(val).forEach(k => {
            if (tmp[key].hasOwnProperty(k)) element.style[key][k] = tmp[key][k];
          });
          return;
        }

        if (tmp.hasOwnProperty(key)) element.style[key] = tmp[key];
      });
      element.screen.render();
    });
  }

  sigtstp(callback) {
    const self = this;
    this.program.sigtstp(() => {
      self.alloc();
      self.render();
      self.program.lrestoreCursor('pause', true);
      if (callback) callback();
    });
  }

  copyToClipboard(text) {
    return this.program.copyToClipboard(text);
  }

  cursorShape(shape, blink) {
    const self = this;
    this.cursor.shape = shape || 'block';
    this.cursor.blink = blink || false;
    this.cursor._set = true;

    if (this.cursor.artificial) {
      if (!this.program.hideCursor_old) {
        const hideCursor = this.program.hideCursor;
        this.program.hideCursor_old = this.program.hideCursor;

        this.program.hideCursor = function () {
          hideCursor.call(self.program);
          self.cursor._hidden = true;
          if (self.renders) self.render();
        };
      }

      if (!this.program.showCursor_old) {
        const showCursor = this.program.showCursor;
        this.program.showCursor_old = this.program.showCursor;

        this.program.showCursor = function () {
          self.cursor._hidden = false;
          if (self.program.exiting) showCursor.call(self.program);
          if (self.renders) self.render();
        };
      }

      if (!this._cursorBlink) {
        this._cursorBlink = setInterval(() => {
          if (!self.cursor.blink) return;
          self.cursor._state ^= 1;
          if (self.renders) self.render();
        }, 500);

        if (this._cursorBlink.unref) {
          this._cursorBlink.unref();
        }
      }

      return true;
    }

    return this.program.cursorShape(this.cursor.shape, this.cursor.blink);
  }

  cursorColor(color) {
    this.cursor.color = color != null ? colors.convert(color) : null;
    this.cursor._set = true;

    if (this.cursor.artificial) {
      return true;
    }

    return this.program.cursorColor(colors.ncolors[this.cursor.color]);
  }

  cursorReset = this.resetCursor;

  resetCursor() {
    this.cursor.shape = 'block';
    this.cursor.blink = false;
    this.cursor.color = null;
    this.cursor._set = false;

    if (this.cursor.artificial) {
      this.cursor.artificial = false;

      if (this.program.hideCursor_old) {
        this.program.hideCursor = this.program.hideCursor_old;
        delete this.program.hideCursor_old;
      }

      if (this.program.showCursor_old) {
        this.program.showCursor = this.program.showCursor_old;
        delete this.program.showCursor_old;
      }

      if (this._cursorBlink) {
        clearInterval(this._cursorBlink);
        delete this._cursorBlink;
      }

      return true;
    }

    return this.program.cursorReset();
  }
  /**
   * Positioning
   */


  calcPos() {
    return this;
  }

}

/**
 * layout.js - layout element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Layout extends Element {
  /**
   * Layout
   */
  constructor(options = {}) {
    if (!options.sku) options.sku = 'layout';
    super(options); // if (!(this instanceof Node)) return new Layout(options)

    if (options.width == null && options.left == null && options.right == null || options.height == null && options.top == null && options.bottom == null) throw new Error('`Layout` must have a width and height!');
    options.layout = options.layout || 'inline';
    if (options.renderer) this.renderer = options.renderer;
    this.type = 'layout';
  }

  static build(options) {
    return new Layout(options);
  }

  isRendered(el) {
    return !el.prevPos ? false : el.prevPos.xHi - el.prevPos.xLo > 0 && el.prevPos.yHi - el.prevPos.yLo > 0;
  }

  getLast(i) {
    while (this.sub[--i]) {
      const el = this.sub[i];
      if (this.isRendered(el)) return el;
    }
  }

  getLastCoords(i) {
    const last = this.getLast(i);
    if (last) return last.prevPos;
  }

  _renderCoords() {
    const coords = this.calcCoord(true);
    const sub = this.sub;
    this.sub = [];
    this.renderElement();
    this.sub = sub;
    return coords;
  }

  renderer(coords) {
    const self = this; // The coordinates of the layout element

    const width = coords.xHi - coords.xLo,
          height = coords.yHi - coords.yLo,
          xLo = coords.xLo,
          yLo = coords.yLo; // The current row offset in cells (which row are we on?)

    let rowOffset = 0; // The index of the first child in the row

    let rowIndex = 0;
    let lastRowIndex = 0; // Figure out the highest width child

    let highWidth;

    if (this.options.layout === 'grid') {
      highWidth = this.sub.reduce((out, el) => Math.max(out, el.width), 0);
    }

    return function iterator(el, i) {
      // Make our sub shrinkable. If they don't have a height, for
      // example, calculate it for them.
      el.shrink = true; // Find the previous rendered child's coordinates

      const last = self.getLast(i); // If there is no previously rendered element, we are on the first child.

      if (!last) {
        el.pos.left = 0;
        el.pos.top = 0;
      } else {
        // Otherwise, figure out where to place this child. We'll start by
        // setting it's `left`/`x` coordinate to right after the previous
        // rendered element. This child will end up directly to the right of it.
        el.pos.left = last.prevPos.xHi - xLo; // Make sure the position matches the highest width element

        if (self.options.layout === 'grid') {
          // Compensate with width:
          // el.pos.width = el.width + (highWidth - el.width);
          // Compensate with position:
          el.pos.left += highWidth - (last.prevPos.xHi - last.prevPos.xLo);
        } // If our child does not overlap the right side of the Layout, set it's
        // `top`/`y` to the current `rowOffset` (the coordinate for the current
        // row).


        if (el.pos.left + el.width <= width) {
          el.pos.top = rowOffset;
        } else {
          // Otherwise we need to start a new row and calculate a new
          // `rowOffset` and `rowIndex` (the index of the child on the current
          // row).
          rowOffset += self.sub.slice(rowIndex, i).reduce(function (out, el) {
            if (!self.isRendered(el)) return out;
            out = Math.max(out, el.prevPos.yHi - el.prevPos.yLo);
            return out;
          }, 0);
          lastRowIndex = rowIndex;
          rowIndex = i;
          el.pos.left = 0;
          el.pos.top = rowOffset;
        }
      } // Make sure the elements on lower rows graviatate up as much as possible


      if (self.options.layout === 'inline') {
        let above = null;
        let abovea = Infinity;

        for (let j = lastRowIndex; j < rowIndex; j++) {
          const l = self.sub[j];
          if (!self.isRendered(l)) continue;
          const abs = Math.abs(el.pos.left - (l.prevPos.xLo - xLo)); // if (abs < abovea && (l.prevPos.xHi - l.prevPos.xLo) <= el.width) {

          if (abs < abovea) {
            above = l;
            abovea = abs;
          }
        }

        if (above) el.pos.top = above.prevPos.yHi - yLo;
      } // If our child overflows the Layout, do not render it!
      // Disable this feature for now.


      if (el.pos.top + el.height > height) ;
    };
  }

  render() {
    this.nodeEmit(PRERENDER);

    const coords = this._renderCoords();

    if (!coords) {
      delete this.prevPos;
      return;
    }

    if (coords.xHi - coords.xLo <= 0) return void (coords.xHi = Math.max(coords.xHi, coords.xLo));
    if (coords.yHi - coords.yLo <= 0) return void (coords.yHi = Math.max(coords.yHi, coords.yLo));
    this.prevPos = coords;
    if (this.border) coords.xLo++, coords.xHi--, coords.yLo++, coords.yHi--;

    if (this.padding.any) {
      coords.xLo += this.padding.left, coords.xHi -= this.padding.right;
      coords.yLo += this.padding.top, coords.yHi -= this.padding.bottom;
    }

    const iterator = this.renderer(coords);
    if (this.border) coords.xLo--, coords.xHi++, coords.yLo--, coords.yHi++;

    if (this.padding.any) {
      coords.xLo -= this.padding.left, coords.xHi += this.padding.right;
      coords.yLo -= this.padding.top, coords.yHi += this.padding.bottom;
    }

    this.sub.forEach((el, i) => {
      if (el.screen._ci !== -1) el.index = el.screen._ci++;
      const rendered = iterator(el, i);

      if (rendered === false) {
        delete el.prevPos;
        return;
      } // if (el.screen._rendering) {
      //   el._rendering = true;
      // }


      el.render(); // if (el.screen._rendering) {
      //   el._rendering = false;
      // }
    });
    this.nodeEmit(RENDER, [coords]);
    return coords;
  }

}

/**
 * line.js - line element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Line extends Box {
  /**
   * Line
   */
  constructor(options = {}) {
    if ((options.orientation || 'vertical') === 'vertical') {
      options.width = 1;
    } else {
      options.height = 1;
    }

    super(options); // if (!(this instanceof Node)) return new Line(options)

    const orientation = options.orientation || 'vertical';
    delete options.orientation;
    this.ch = !options.type || options.type === 'line' ? orientation === 'horizontal' ? '─' : '│' : options.ch || ' ';
    this.border = {
      type: 'bg',
      __proto__: this
    };
    this.style.border = this.style;
    this.type = 'line';
  }

  static build(options) {
    return new Line(options);
  }

}

/**
 * terminal.js - term.js terminal element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Terminal extends Box {
  setScroll = this.scrollTo;
  /**
   * Terminal
   */

  constructor(options = {}) {
    options.scrollable = false;
    super(options); // if (!(this instanceof Node)) return new Terminal(options)
    // XXX Workaround for all motion

    if (this.screen.program.tmux && this.screen.program.tmuxVersion >= 2) this.screen.program.enableMouse();
    this.handler = options.handler;
    this.shell = options.shell || process.env.SHELL || 'sh';
    this.args = options.args || [];
    this.cursor = this.options.cursor;
    this.cursorBlink = this.options.cursorBlink;
    this.screenKeys = this.options.screenKeys;
    this.style = this.style || {};
    this.style.bg = this.style.bg || 'default';
    this.style.fg = this.style.fg || 'default';
    this.termName = options.terminal || options.term || process.env.TERM || 'xterm';
    this.bootstrap();
    this.type = 'terminal';
  }

  static build(options) {
    return new Terminal(options);
  }

  bootstrap() {
    const self = this;
    const element = {
      // window
      get document() {
        return element;
      },

      navigator: {
        userAgent: 'node.js'
      },

      // document
      get defaultView() {
        return element;
      },

      get documentElement() {
        return element;
      },

      createElement: function () {
        return element;
      },

      // element
      get ownerDocument() {
        return element;
      },

      addEventListener: function () {},
      removeEventListener: function () {},
      getElementsByTagName: function () {
        return [element];
      },
      getElementById: function () {
        return element;
      },
      parentNode: null,
      offsetParent: null,
      appendChild: function () {},
      removeChild: function () {},
      setAttribute: function () {},
      getAttribute: function () {},
      style: {},
      focus: function () {},
      blur: function () {},
      console: console
    };
    element.parentNode = element;
    element.offsetParent = element;
    this.term = term({
      termName: this.termName,
      cols: this.width - this.intW,
      rows: this.height - this.intH,
      context: element,
      document: element,
      body: element,
      sup: element,
      cursorBlink: this.cursorBlink,
      screenKeys: this.screenKeys
    });

    this.term.refresh = function () {
      self.screen.render();
    };

    this.term.keyDown = function () {};

    this.term.keyPress = function () {};

    this.term.open(element); // Emits key sequences in html-land.
    // Technically not necessary here.
    // In reality if we wanted to be neat, we would overwrite the keyDown and
    // keyPress methods with our own node.js-keys->terminal-keys methods, but
    // since all the keys are already coming in as escape sequences, we can just
    // send the input directly to the handler/socket (see below).
    // this.term.on(DATA, function(data) {
    //   self.handler(data);
    // });
    // Incoming keys and mouse inputs.
    // NOTE: Cannot pass mouse events - coordinates will be off!

    this.screen.program.input.on(DATA, this._onData = function (data) {
      if (self.screen.focused === self && !self._isMouse(data)) {
        self.handler(data);
      }
    });
    this.onScreenEvent(MOUSE, function (data) {
      if (self.screen.focused !== self) return;
      if (data.x < self.absL + self.intL) return;
      if (data.y < self.absT + self.intT) return;
      if (data.x > self.absL - self.intL + self.width) return;
      if (data.y > self.absT - self.intT + self.height) return;

      if (self.term.x10Mouse || self.term.vt200Mouse || self.term.normalMouse || self.term.mouseEvents || self.term.utfMouse || self.term.sgrMouse || self.term.urxvtMouse) ; else {
        return;
      }

      let b = data.raw[0];
      const x = data.x - self.absL,
            y = data.y - self.absT;
      let s;

      if (self.term.urxvtMouse) {
        if (self.screen.program.sgrMouse) {
          b += 32;
        }

        s = '\x1b[' + b + ';' + (x + 32) + ';' + (y + 32) + 'M';
      } else if (self.term.sgrMouse) {
        if (!self.screen.program.sgrMouse) {
          b -= 32;
        }

        s = '\x1b[<' + b + ';' + x + ';' + y + (data.action === MOUSEDOWN ? 'M' : 'm');
      } else {
        if (self.screen.program.sgrMouse) {
          b += 32;
        }

        s = '\x1b[M' + String.fromCharCode(b) + String.fromCharCode(x + 32) + String.fromCharCode(y + 32);
      }

      self.handler(s);
    });
    this.on(FOCUS, () => {
      self.term.focus();
    });
    this.on(BLUR, () => {
      self.term.blur();
    });
    this.term.on(TITLE, title => {
      self.title = title, self.emit(TITLE, title);
    });
    this.term.on(PASSTHROUGH, data => {
      self.screen.program.flush(), self.screen.program.write(data);
    });
    this.on(RESIZE, () => nextTick(() => self.term.resize(self.width - self.intW, self.height - self.intH)));
    this.once(RENDER, () => self.term.resize(self.width - self.intW, self.height - self.intH));
    this.on(DESTROY, () => {
      self.kill(), self.screen.program.input.removeListener(DATA, self._onData);
    });

    if (this.handler) {
      return;
    } // this.pty = fork(this.shell, this.args, {
    //   name: this.termName,
    //   cols: this.width - this.intW,
    //   rows: this.height - this.intH,
    //   cwd: process.env.HOME,
    //   env: this.options.env || process.env
    // })


    this.on(RESIZE, () => nextTick(() => {
      try {
        self.pty.resize(self.width - self.intW, self.height - self.intH);
      } catch (e) {}
    }));

    this.handler = data => {
      self.pty.write(data), self.screen.render();
    }; // this.pty.on(DATA, data => { self.write(data), self.screen.render() })
    // this.pty.on(EXIT, code => { self.emit(EXIT, code || null) })


    this.onScreenEvent(KEYPRESS, () => self.screen.render());

    this.screen._listenKeys(this);
  }

  write(data) {
    return this.term.write(data);
  }

  render() {
    const ret = this.renderElement();
    if (!ret) return;
    this.dattr = this.sattr(this.style);
    const xLo = ret.xLo + this.intL,
          xHi = ret.xHi - this.intR,
          yLo = ret.yLo + this.intT,
          yHi = ret.yHi - this.intB;
    let cursor;
    const scrollBack = this.term.lines.length - (yHi - yLo);

    for (let y = Math.max(yLo, 0), currLine, backLine; y < yHi; y++) {
      if (!(currLine = this.screen.lines[y]) || !(backLine = this.term.lines[scrollBack + y - yLo])) {
        break;
      }

      if (y === yLo + this.term.y && this.term.cursorState && this.screen.focused === this && (this.term.ydisp === this.term.ybase || this.term.selectMode) && !this.term.cursorHidden) {
        cursor = xLo + this.term.x;
      } else {
        cursor = -1;
      }

      for (let x = Math.max(xLo, 0), currCell, backCell; x < xHi; x++) {
        if (!(currCell = currLine[x]) || !(backCell = backLine[x - xLo])) {
          break;
        }

        currCell[0] = backCell[0];

        if (x === cursor) {
          if (this.cursor === 'line') {
            currCell.inject(this.dattr, '\u2502');
            continue;
          } else if (this.cursor === 'underline') {
            currCell.at = this.dattr | 2 << 18;
          } else if (this.cursor === 'block' || !this.cursor) {
            currCell.at = this.dattr | 8 << 18;
          }
        }

        currCell.ch = backCell.ch; // default foreground = 257

        if ((currCell.at >> 9 & 0x1ff) === 257) {
          currCell.at &= ~(0x1ff << 9);
          currCell.at |= (this.dattr >> 9 & 0x1ff) << 9;
        } // default background = 256


        if ((currCell.at & 0x1ff) === 256) {
          currCell.at &= ~0x1ff;
          currCell.at |= this.dattr & 0x1ff;
        }
      }

      currLine.dirty = true;
    }

    return ret;
  }

  _isMouse(buf) {
    let s = buf;

    if (Buffer.isBuffer(s)) {
      if (s[0] > 127 && s[1] === undefined) {
        s[0] -= 128;
        s = '\x1b' + s.toString('utf-8');
      } else {
        s = s.toString('utf-8');
      }
    }

    return buf[0] === 0x1b && buf[1] === 0x5b && buf[2] === 0x4d || /^\x1b\[M([\x00\u0020-\uffff]{3})/.test(s) || /^\x1b\[(\d+;\d+;\d+)M/.test(s) || /^\x1b\[<(\d+;\d+;\d+)([mM])/.test(s) || /^\x1b\[<(\d+;\d+;\d+;\d+)&w/.test(s) || /^\x1b\[24([0135])~\[(\d+),(\d+)\]\r/.test(s) || /^\x1b\[(O|I)/.test(s);
  }

  scrollTo(offset) {
    this.term.ydisp = offset;
    return this.emit(SCROLL);
  }

  getScroll() {
    return this.term.ydisp;
  }

  scroll(offset) {
    this.term.scrollDisp(offset);
    return this.emit(SCROLL);
  }

  resetScroll() {
    this.term.ydisp = 0;
    this.term.ybase = 0;
    return this.emit(SCROLL);
  }

  get scrollHeight() {
    return this.term.rows - 1;
  }

  get scrollPercent() {
    return this.term.ydisp / this.term.ybase * 100;
  }

  set scrollPercent(i) {
    return this.setScroll(i / 100 * this.term.ybase | 0);
  }

  screenshot(xLo, xHi, yLo, yHi) {
    xLo = 0 + (xLo || 0);

    if (xHi != null) {
      xHi = 0 + (xHi || 0);
    } else {
      xHi = this.term.lines[0].length;
    }

    yLo = 0 + (yLo || 0);

    if (yHi != null) {
      yHi = 0 + (yHi || 0);
    } else {
      yHi = this.term.lines.length;
    }

    return this.screen.screenshot(xLo, xHi, yLo, yHi, this.term);
  }

  kill() {
    if (this.pty) {
      this.pty.destroy();
      this.pty.kill();
    }

    this.term.refresh = function () {};

    this.term.write('\x1b[H\x1b[J');

    if (this.term._blink) {
      clearInterval(this.term._blink);
    }

    this.term.destroy();
  }

}

export { Box, Cadre, Coord, Element, Layout, Line, Log, Screen, ScrollableBox, ScrollableText, Terminal };
