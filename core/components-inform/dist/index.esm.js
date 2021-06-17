import { Canvas } from '@pres/components-layout';
import { ATTACH, KEYPRESS, MOUSE, MOUSEMOVE, CLICK, COMPLETE, RESET } from '@pres/enum-events';
import { Box } from '@pres/components-core';
import { Text } from '@pres/components-text';
import { Input } from '@pres/components-form';
import { styleToAttr } from '@pres/util-blessed-colors';
import { STR } from '@typen/enum-data-types';

class LCD extends Canvas {
  constructor(options = {}) {
    // if (!(this instanceof Node)) { return new LCD(options) }
    //these options need to be modified epending on the resulting positioning/size
    options.segmentWidth = options.segmentWidth || 0.06; // how wide are the segments in % so 50% = 0.5

    options.segmentInterval = options.segmentInterval || 0.11; // spacing between the segments in % so 50% = 0.5

    options.strokeWidth = options.strokeWidth || 0.11; // spacing between the segments in % so 50% = 0.5
    //default display settings

    options.elements = options.elements || 3; // how many elements in the display. or how many characters can be displayed.

    options.display = options.display || 321; // what should be displayed before anything is set

    options.elementSpacing = options.spacing || 4; // spacing between each element

    options.elemenpaddingSum = options.padding || 2; // how far away from the edges to put the elements
    //coloring

    options.color = options.color || 'white';
    super(options);
    const self = this;
    this.segment16 = null;
    this.on(ATTACH, () => {
      const display = self.options.display || 1234;
      if (!this.segment16) this.segment16 = new SixteenSegment(this.options.elements, this.context, this.canvW, this.canvH, 0, 0, this.options);
      this.setDisplay(display);
    });
    this.type = 'lcd';
  }

  static build(options) {
    return new LCD(options);
  }

  get canvH() {
    return (this.height << 2) - 12;
  }

  get canvW() {
    return (this.width << 1) - 8;
  }

  increaseWidth() {
    if (this.segment16) {
      this.segment16.SegmentWidth += 0.01;
    }
  }

  decreaseWidth() {
    if (this.segment16) {
      this.segment16.SegmentWidth -= 0.01;
    }
  }

  increaseInterval() {
    if (this.segment16) {
      this.segment16.SegmentInterval += 0.01;
    }
  }

  decreaseInterval() {
    if (this.segment16) {
      this.segment16.SegmentInterval -= 0.01;
    }
  }

  increaseStroke() {
    if (this.segment16) {
      this.segment16.StrokeWidth += 0.05;
    }
  }

  decreaseStroke() {
    if (this.segment16) {
      this.segment16.StrokeWidth -= 0.05;
    }
  }

  setOptions(options) {
    if (this.segment16) {
      this.segment16.setOptions(options);
    }
  }

  setData(data) {
    this.setDisplay(data.toString());
  }

  getOptionsPrototype() {
    return {
      label: 'LCD Test',
      segmentWidth: 0.06,
      segmentInterval: 0.11,
      strokeWidth: 0.1,
      elements: 5,
      display: 3210,
      elementSpacing: 4,
      elemenpaddingSum: 2
    };
  }

  setDisplay(display) {
    if (!this.context) throw 'error: canvas context does not exist. setData() for line charts must be called after the chart has been added to the screen via screen.append()';
    this.context.clearRect(0, 0, this.canvW, this.canvH);
    this.segment16.DisplayText(display);
  }

}

class ElementArray {
  constructor(count) {
    this.NullMask = 0x10;
    this.Elements = [];
    this.SetCount(count || 0);
  }

  SetCount(count) {
    const c = parseInt(count, 10);
    if (isNaN(c)) throw 'Invalid element count: ' + count;
    this.Elements = [c];

    for (let i = 0; i < c; i++) this.Elements[i] = 0;
  }

  SetText(value, charMaps) {
    // Get the string of the value passed in
    if (value === null) {
      value = '';
    }

    value = value.toString(); // Clear the elements

    for (let i = 0; i < this.Elements.length; i++) this.SetElementValue(i, 0);

    if (value.length === 0) return; // Set the bitmask to display the proper character for each element

    for (let e = 0; e < this.Elements.length && e < value.length; e++) {
      const c = value[e];
      let mask = charMaps[c]; // Use blank of there is no bitmask for this character

      if (mask === null || mask === undefined) mask = this.NullMask;
      this.SetElementValue(e, mask);
    }
  }

  SetElementValue(i, value) {
    if (i >= 0 && i < this.Elements.length) {
      this.Elements[i] = parseInt(value, 10);
    }
  }

} //thx to https://github.com/Enderer/sixteensegment!!!
//although it needed HEAVY rework since it was already somewhat busted ;-(


class SixteenSegment {
  constructor(count, canvas, width, height, x, y, options) {
    this.ElementArray = new ElementArray(count);
    this.SegmentWidth = options.segmentWidth; //(this.ElementWidth * 0.0015) * 5 //0.1;           // Width of segments (% of Element Width)

    this.SegmentInterval = options.segmentInterval; //(this.ElementWidth * 0.0015) * 10 // 0.20;        // Spacing between segments (% of Element Width)

    this.BevelWidth = 0.01; // Size of corner bevel (% of Element Width)

    this.SideBevelEnabled = true; // Should the sides be beveled

    this.StrokeLight = options.color; // Color of an on segment outline

    this.StrokeWidth = options.strokeWidth; // Width of segment outline

    this.Padding = options.elemenpaddingSum; // Padding around the display

    this.Spacing = options.elementSpacing; // Spacing between elements

    this.ElementWidth = (width - this.Spacing * count) / count;
    this.ElementHeight = height - this.Padding * 2; // console.error("w %s h %s", this.ElementWidth, this.ElementHeight);

    this.FillLight = 'red'; // Color of an on segment

    this.FillDark = 'cyan'; // Color of an off segment

    this.StrokeDark = 'black'; // Color of an off segment outline

    this.X = 0;
    this.Y = 0;
    this.ElementCount = count; // this.CalcElementDimensions = CalcElementDimensions
    // this.FlipVertical = FlipVertical
    // this.FlipHorizontal = FlipHorizontal
    // this.CalcPoints = CalcPoints
    // this.DisplayText = DisplayText
    // this.Draw = Draw
    // this.setOptions = setOptions

    this.Width = width || canvas.width;
    this.Height = height || canvas.height;
    this.Canvas = canvas;
    this.CalcPoints();
    this.ElementArray.SetCount(count);
    this.count = count;
  }

  setOptions(options) {
    if (options.elements) this.ElementArray.SetCount(options.elements);
    this.SegmentWidth = options.segmentWidth || this.SegmentWidth;
    this.SegmentInterval = options.segmentInterval || this.SegmentInterval;
    this.BevelWidth = 0.01;
    this.SideBevelEnabled = true;
    this.StrokeLight = options.color || this.StrokeLight;
    this.StrokeWidth = options.strokeWidth || this.StrokeWidth;
    this.Padding = options.elemenpaddingSum || this.Padding;
    this.Spacing = options.elementSpacing || this.Spacing;
    this.ElementWidth = (this.Width - this.Spacing * this.count) / this.count;
    this.ElementHeight = this.Height - this.Padding * 2;
  }

  DisplayText(value) {
    // Recalculate points in case any settings changed
    // console.error("si: %s, sw: %s", this.SegmentInterval, this.SegmentWidth);
    // console.error("st: %s", this.StrokeWidth);
    // Set the display patterns and draw the canvas
    this.ElementArray.SetText(value, CharacterMasks);
    this.CalcPoints();
    this.Draw(this.Canvas, this.ElementArray.Elements);
  }

  CalcElementDimensions() {
    const n = this.ElementCount;
    let h = this.ElementHeight;
    h -= this.Padding * 2;
    let w = this.Width;
    w -= this.Spacing * (n - 1);
    w -= this.Padding * 2;
    w /= n; // console.error(output);

    return {
      Width: w,
      Height: h
    };
  }

  FlipVertical(points, height) {
    const flipped = [];

    for (let i = 0; i < points.length; i++) {
      flipped[i] = {};
      flipped[i].x = points[i].x;
      flipped[i].y = height - points[i].y;
    }

    return flipped;
  }

  FlipHorizontal(points, width) {
    const flipped = [];

    for (let i = 0; i < points.length; i++) {
      flipped[i] = {};
      flipped[i].x = width - points[i].x;
      flipped[i].y = points[i].y;
    }

    return flipped;
  }

  Draw(context, elements) {
    // Get the context and clear the area
    context.clearRect(this.X, this.Y, this.Width, this.Height);
    context.save(); // Calculate the width and spacing of each element

    const elementWidth = this.CalcElementDimensions().Width; // console.error("width: %s", elementWidth);
    // Offset to adjust for starting point and padding

    context.translate(this.X, this.Y);
    context.translate(this.Padding, this.Padding); // Draw each segment of each element

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      for (let s = 0; s < this.Points.length; s++) {
        // Pick the on or off color based on the bitmask
        const color = element & 1 << s ? this.FillLight : this.FillDark;
        const stroke = element & 1 << s ? this.StrokeLight : this.StrokeDark;
        if (stroke === this.StrokeDark) continue; // console.error("c: %s, s: %s", color, stroke);

        context.lineWidth = this.StrokeWidth;
        context.strokeStyle = stroke;
        context.fillStyle = color;
        context.moveTo(0, 0);
        context.beginPath();
        context.moveTo(this.Points[s][0].x, this.Points[s][0].y); // Create the segment path

        let maxX = 0;

        for (let p = 1; p < this.Points[s].length; p++) {
          if (this.Points[s][p].x > maxX) maxX = this.Points[s][p].x;
          context.lineTo(Math.round(this.Points[s][p].x), Math.round(this.Points[s][p].y));
        }

        context.closePath();
        context.fill();
        context.stroke();
        if (this.StrokeWidth > 0) context.stroke();
      }

      context.translate(elementWidth + this.Spacing, 0);
    }

    context.restore();
  }

  CalcPoints() {
    const w = this.ElementWidth,
          h = this.ElementHeight,
          sw = this.SegmentWidth * w,
          si = this.SegmentInterval * w,
          bw = this.BevelWidth * sw,
          ib = this.SideBevelEnabled ? 1 : 0,
          sf = sw * 0.8,
          slope = h / w,
          sqrt2 = Math.SQRT2,
          sqrt3 = Math.sqrt(3); // Base position of points w/out bevel and interval

    const w0 = w / 2 - sw / 2,
          h0 = 0,
          w1 = w / 2,
          h1 = sw / 2,
          w2 = w / 2 + sw / 2,
          h2 = sw,
          w3 = w - sw,
          h3 = h / 2 - sw / 2,
          w4 = w - sw / 2,
          h4 = h / 2,
          w5 = w,
          h5 = h / 2 + sw / 2; // Order of segments stored in Points[][]

    const A1 = 0,
          A2 = 1,
          B = 2,
          C = 3,
          D1 = 4,
          D2 = 5,
          E = 6,
          F = 7,
          G1 = 8,
          G2 = 9,
          H = 10,
          I = 11,
          J = 12,
          K = 13,
          L = 14,
          M = 15; // Create the points array for all segments

    const points = [];
    points[A1] = [{
      x: bw * 2 + si / sqrt2,
      y: h0
    }, {
      x: w1 - si / 2 - sw / 2 * ib,
      y: h0
    }, {
      x: w1 - si / 2,
      y: h1
    }, {
      x: w0 - si / 2,
      y: h2
    }, {
      x: sw + si / sqrt2,
      y: h2
    }, {
      x: bw + si / sqrt2,
      y: h0 + bw
    }];
    points[G2] = [{
      x: w2 + si / sqrt2,
      y: h3
    }, {
      x: w3 - si / 2 * sqrt3,
      y: h3
    }, {
      x: w4 - si / 2 * sqrt3,
      y: h4
    }, {
      x: w3 - si / 2 * sqrt3,
      y: h5
    }, {
      x: w2 + si / sqrt2,
      y: h5
    }, {
      x: w1 + si / sqrt2,
      y: h4
    }];
    points[B] = [{
      x: w5,
      y: h0 + bw * 2 + si / sqrt2
    }, {
      x: w5,
      y: h4 - si / 2 - sw / 2 * ib
    }, {
      x: w4,
      y: h4 - si / 2
    }, {
      x: w3,
      y: h3 - si / 2
    }, {
      x: w3,
      y: h2 + si / sqrt2
    }, {
      x: w5 - bw,
      y: h0 + bw + si / sqrt2
    }];
    points[I] = [{
      x: w2,
      y: h2 + si / 2 * sqrt3
    }, {
      x: w2,
      y: h3 - si / sqrt2
    }, {
      x: w1,
      y: h4 - si / sqrt2
    }, {
      x: w0,
      y: h3 - si / sqrt2
    }, {
      x: w0,
      y: h2 + si / 2 * sqrt3
    }, {
      x: w1,
      y: h1 + si / 2 * sqrt3
    }];
    points[H] = [{
      x: (sw + sf) / slope + si,
      y: h2 + si
    }, {
      x: w0 - si,
      y: w0 * slope - sf - si
    }, {
      x: w0 - si,
      y: h3 - si
    }, {
      x: (h3 - sf) / slope - si,
      y: h3 - si
    }, {
      x: sw + si,
      y: h2 * slope + sf + si
    }, {
      x: sw + si,
      y: h2 + si
    }];
    points[A2] = this.FlipHorizontal(points[A1], w); // A2

    points[C] = this.FlipVertical(points[2], h); // C

    points[D1] = this.FlipVertical(points[0], h); // D1

    points[D2] = this.FlipHorizontal(points[4], w); // D2

    points[E] = this.FlipHorizontal(points[3], w); // E

    points[F] = this.FlipHorizontal(points[2], w); // F

    points[G1] = this.FlipHorizontal(points[9], w); // G1

    points[J] = this.FlipHorizontal(points[10], w); // J

    points[K] = this.FlipVertical(points[12], h); // K

    points[L] = this.FlipVertical(points[11], h); // L

    points[M] = this.FlipVertical(points[10], h); // M

    this.Points = points;
  }

}

const CharacterMasks = function () {
  // Segment Bitmasks for individual segments.
  // Binary Or them together to create bitmasks
  // a1|a2|b|c|d1|d2|e|f|g1|g2|h|i|j|k|l|m
  const a1 = 1 << 0,
        a2 = 1 << 1,
        b = 1 << 2,
        c = 1 << 3,
        d1 = 1 << 4,
        d2 = 1 << 5,
        e = 1 << 6,
        f = 1 << 7,
        g1 = 1 << 8,
        g2 = 1 << 9,
        h = 1 << 10,
        i = 1 << 11,
        j = 1 << 12,
        k = 1 << 13,
        l = 1 << 14,
        m = 1 << 15; // Character map associates characters with a bit pattern

  return {
    ' ': 0,
    '': 0,
    '0': a1 | a2 | b | c | d1 | d2 | e | f | j | m,
    '1': b | c | j,
    '2': a1 | a2 | b | d1 | d2 | e | g1 | g2,
    '3': a1 | a2 | b | c | d1 | d2 | g2,
    '4': b | c | f | g1 | g2,
    '5': a1 | a2 | c | d1 | d2 | f | g1 | g2,
    '6': a1 | a2 | c | d1 | d2 | e | f | g1 | g2,
    '7': a1 | a2 | b | c,
    '8': a1 | a2 | b | c | d1 | d2 | e | f | g1 | g2,
    '9': a1 | a2 | b | c | f | g1 | g2,
    'A': e | f | a1 | a2 | b | c | g1 | g2,
    'B': a1 | a2 | b | c | d1 | d2 | g2 | i | l,
    'C': a1 | a2 | f | e | d1 | d2,
    'D': a1 | a2 | b | c | d1 | d2 | i | l,
    'E': a1 | a2 | f | e | d1 | d2 | g1 | g2,
    'F': a1 | a2 | e | f | g1,
    'G': a1 | a2 | c | d1 | d2 | e | f | g2,
    'H': b | c | e | f | g1 | g2,
    'I': a1 | a2 | d1 | d2 | i | l,
    'J': b | c | d1 | d2 | e,
    'K': e | f | g1 | j | k,
    'L': d1 | d2 | e | f,
    'M': b | c | e | f | h | j,
    'N': b | c | e | f | h | k,
    'O': a1 | a2 | b | c | d1 | d2 | e | f,
    'P': a1 | a2 | b | e | f | g1 | g2,
    'Q': a1 | a2 | b | c | d1 | d2 | e | f | k,
    'R': a1 | a2 | b | e | f | g1 | g2 | k,
    'S': a1 | a2 | c | d1 | d2 | f | g1 | g2,
    'T': a1 | a2 | i | l,
    'U': b | c | d1 | d2 | e | f,
    'V': e | f | j | m,
    'W': b | c | e | f | k | m,
    'X': h | j | k | m,
    'Y': b | f | g1 | g2 | l,
    'Z': a1 | a2 | d1 | d2 | j | m,
    '-': g1 | g2,
    '?': a1 | a2 | b | g2 | l,
    '+': g1 | g2 | i | l,
    '*': g1 | g2 | h | i | j | k | l | m
  };
}();

/**
 * loading.js - loading element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Loading extends Box {
  /**
   * Loading
   */
  constructor(options = {}) {
    super(options); // if (!(this instanceof Node)) return new Loading(options)

    this._.icon = new Text({
      sup: this,
      align: 'center',
      top: 2,
      left: 1,
      right: 1,
      height: 1,
      content: '|'
    });
    this.type = 'loading';
  }

  static build(options) {
    return new Loading(options);
  }

  load(text) {
    const self = this; // XXX Keep above:
    // var sup = this.sup;
    // this.detach();
    // sup.append(this);

    this.show();
    this.setContent(text);
    if (this._.timer) this.stop();
    this.screen.lockKeys = true;
    this._.timer = setInterval(() => {
      const {
        icon
      } = self._,
            {
        content
      } = icon;

      if (content === '|') {
        icon.setContent('/');
      } else if (content === '/') {
        icon.setContent('-');
      } else if (content === '-') {
        icon.setContent('\\');
      } else if (content === '\\') {
        icon.setContent('|');
      }

      self.screen.render();
    }, 200);
  }

  stop() {
    this.screen.lockKeys = false;
    this.hide();

    if (this._.timer) {
      clearInterval(this._.timer);
      delete this._.timer;
    }

    this.screen.render();
  }

}

/**
 * message.js - message element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Message extends Box {
  /**
   * Message / Error
   */
  constructor(options = {}) {
    options.tags = true;
    super(options); // if (!(this instanceof Node)) return new Message(options)

    this.log = this.display;
    this.type = 'message';
  }

  static build(options) {
    return new Message(options);
  }

  display(text, time, callback) {
    const self = this;

    if (typeof time === 'function') {
      callback = time;
      time = null;
    }

    if (time == null) time = 3; // Keep above:
    // var sup = this.sup;
    // this.detach();
    // sup.append(this);

    if (this.scrollable) {
      this.screen.saveFocus();
      this.focus();
      this.scrollTo(0);
    }

    this.show();
    this.setContent(text);
    this.screen.render();

    if (time === Infinity || time === -1 || time === 0) {
      const end = function () {
        if (end.done) return;
        end.done = true;

        if (self.scrollable) {
          try {
            self.screen.restoreFocus();
          } catch (e) {}
        }

        self.hide();
        self.screen.render();
        if (callback) callback();
      };

      setTimeout(function () {
        self.onScreenEvent(KEYPRESS, function fn(ch, key) {
          if (key.name === MOUSE) return;

          if (self.scrollable) {
            if (key.name === 'up' || self.options.vi && key.name === 'k' || key.name === 'down' || self.options.vi && key.name === 'j' || self.options.vi && key.name === 'u' && key.ctrl || self.options.vi && key.name === 'd' && key.ctrl || self.options.vi && key.name === 'b' && key.ctrl || self.options.vi && key.name === 'f' && key.ctrl || self.options.vi && key.name === 'g' && !key.shift || self.options.vi && key.name === 'g' && key.shift) {
              return;
            }
          }

          if (self.options.ignoreKeys && ~self.options.ignoreKeys.indexOf(key.name)) {
            return;
          }

          self.removeScreenEvent(KEYPRESS, fn);
          end();
        }); // XXX May be affected by new element.options.mouse option.

        if (!self.options.mouse) return;
        self.onScreenEvent(MOUSE, function fn(data) {
          if (data.action === MOUSEMOVE) return;
          self.removeScreenEvent(MOUSE, fn);
          end();
        });
      }, 10);
      return;
    }

    setTimeout(function () {
      self.hide();
      self.screen.render();
      if (callback) callback();
    }, time * 1000);
  }

  error(text, time, callback) {
    return this.display('{red-fg}Error: ' + text + '{/red-fg}', time, callback);
  }

}
/**
 * Expose
 */

/**
 * progressbar.js - progress bar element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
/**
 * ProgressBar
 */

class ProgressBar extends Input {
  constructor(options = {}) {
    super(options);
    const self = this; // if (!(this instanceof Node)) return new ProgressBar(options)

    this.filled = options.filled || 0;
    if (typeof this.filled === STR) this.filled = +this.filled.slice(0, -1);
    this.value = this.filled;
    this.pch = options.pch || ' '; // XXX Workaround that predates the usage of `el.ch`.

    if (options.ch) {
      this.pch = options.ch;
      this.ch = ' ';
    }

    if (options.bch) {
      this.ch = options.bch;
    }

    if (!this.style.bar) {
      this.style.bar = {};
      this.style.bar.fg = options.barFg;
      this.style.bar.bg = options.barBg;
    }

    this.orientation = options.orientation || 'horizontal';

    if (options.keys) {
      this.on(KEYPRESS, function (ch, key) {
        let back, forward;

        if (self.orientation === 'horizontal') {
          back = ['left', 'h'];
          forward = ['right', 'l'];
        } else if (self.orientation === 'vertical') {
          back = ['down', 'j'];
          forward = ['up', 'k'];
        }

        if (key.name === back[0] || options.vi && key.name === back[1]) {
          self.progress(-5);
          self.screen.render();
          return;
        }

        if (key.name === forward[0] || options.vi && key.name === forward[1]) {
          self.progress(5);
          self.screen.render();
        }
      });
    }

    if (options.mouse) {
      this.on(CLICK, function (data) {
        let x, y, m, p;
        if (!self.prevPos) return;

        if (self.orientation === 'horizontal') {
          x = data.x - self.prevPos.xLo;
          m = self.prevPos.xHi - self.prevPos.xLo - self.intW;
          p = x / m * 100 | 0;
        } else if (self.orientation === 'vertical') {
          y = data.y - self.prevPos.yLo;
          m = self.prevPos.yHi - self.prevPos.yLo - self.intH;
          p = y / m * 100 | 0;
        }

        self.setProgress(p);
      });
    }

    this.type = 'progress-bar';
  }

  static build(options) {
    return new ProgressBar(options);
  }

  render() {
    const ret = this._render();

    if (!ret) return;
    let xLo = ret.xLo,
        xHi = ret.xHi,
        yLo = ret.yLo,
        yHi = ret.yHi,
        dattr;
    if (this.border) xLo++, yLo++, xHi--, yHi--;

    if (this.orientation === 'horizontal') {
      xHi = xLo + (xHi - xLo) * (this.filled / 100) | 0;
    } else if (this.orientation === 'vertical') {
      yLo = yLo + (yHi - yLo - ((yHi - yLo) * (this.filled / 100) | 0));
    }

    dattr = styleToAttr(this.style.bar);
    this.screen.fillRegion(dattr, this.pch, xLo, xHi, yLo, yHi);

    if (this.content) {
      const line = this.screen.lines[yLo];

      for (let i = 0; i < this.content.length; i++) {
        line[xLo + i].ch = this.content[i];
      }

      line.dirty = true;
    }

    return ret;
  }

  progress(filled) {
    this.filled += filled;
    if (this.filled < 0) this.filled = 0;else if (this.filled > 100) this.filled = 100;

    if (this.filled === 100) {
      this.emit(COMPLETE);
    }

    this.value = this.filled;
  }

  setProgress(filled) {
    this.filled = 0;
    this.progress(filled);
  }

  reset() {
    this.emit(RESET);
    this.filled = 0;
    this.value = this.filled;
  }

}

const lcd = options => new LCD(options);

const loading = options => new Loading(options);

const message = options => new Message(options);

const progressBar = options => new ProgressBar(options);

export { LCD, Loading, Message, ProgressBar, lcd, loading, message, progressBar };
