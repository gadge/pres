import { round } from '@aryth/math';
import { Canvas } from '@pres/components-layout';
import { ATTACH } from '@pres/enum-events';
import { maxBy } from '@vect/vector-indicator';
import * as utils from '@pres/util-helpers';
import { nullish } from '@typen/nullish';
import x256 from 'x256';
import { NUM } from '@typen/enum-data-types';
import { Box } from '@pres/components-core';
import { toByte } from '@pres/util-byte-colors';
import { Ticks } from '@pres/util-chart-ticks';
import { iterate } from '@vect/vector-mapper';
import { zipper } from '@vect/vector-zipper';
import sparkline from 'sparkline';

class Padds {
  constructor(options) {
    this.labelX = options.xLabelPadding ?? options.labelX ?? 5;
    this.labelY = 3;
    this.x = options.xPadding ?? options.x ?? 10;
    this.y = 11;
  }

  get relativeX() {
    return this.x - this.labelX;
  }

  get relativeY() {
    return this.y - this.labelY;
  }

  static build(options) {
    return new Padds(options);
  }

  adjustPadds(tickWidth) {
    if (this.labelX < tickWidth) this.labelX = tickWidth;
    if (this.relativeX < 0) this.x = this.labelX;
  }

}

class Labels {
  #list;

  constructor(options) {
    this.step = options.showNthLabel ?? options.labelStep ?? options.step ?? 1;
  }

  get list() {
    return this.#list;
  }

  set list(value) {
    this.#list = value;
  }

  get length() {
    return this.#list.length;
  }

  get labelWidth() {
    return maxBy(this.list, x => x === null || x === void 0 ? void 0 : x.length) ?? 0;
  }

  static build(options) {
    return new Labels(options);
  }

  loadLabels(seriesCollection) {
    this.list = seriesCollection[0].x;
  }

  labelStep(charsLimit) {
    const labelCount = charsLimit / (this.labelWidth + 2);
    const pointsPerLabel = Math.ceil(this.length / labelCount);
    return this.step < pointsPerLabel ? pointsPerLabel : this.step;
  }

}

class Bars {
  constructor(options) {
    var _options$preset, _options$preset2, _options$preset3;

    this.width = options.barWidth ?? options.width ?? 6;
    this.spacing = options.barSpacing ?? options.spacing ?? 9;
    if (this.spacing - this.width < 3) this.spacing = this.width + 3;
    this.preset = {
      fore: options.barFgColor ?? ((_options$preset = options.preset) === null || _options$preset === void 0 ? void 0 : _options$preset.fore) ?? 'white',
      back: options.barBgColor ?? ((_options$preset2 = options.preset) === null || _options$preset2 === void 0 ? void 0 : _options$preset2.back) ?? 'blue',
      label: options.labelColor ?? ((_options$preset3 = options.preset) === null || _options$preset3 === void 0 ? void 0 : _options$preset3.label) ?? 'white'
    };
  }

  static build(options) {
    return new Bars(options);
  }

}

function AnsiTerm(width, height) {
  this.width = width;
  this.height = height;
  this.clear();
  this.fontFg = 'normal';
  this.fontBg = 'normal';
  this.color = 'normal';
}
const colors = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7
};

function getFgCode(color) {
  // String Value
  if (typeof color == 'string' && color !== 'normal') {
    return '\x1b[3' + colors[color] + 'm';
  } // RGB Value
  else if (Array.isArray(color) && color.length === 3) {
    return '\x1b[38;5;' + x256(color[0], color[1], color[2]) + 'm';
  } // Number
  else if (typeof color == 'number') {
    return '\x1b[38;5;' + color + 'm';
  } // Default
  else {
    return '\x1b[39m';
  }
}

function getBgCode(color) {
  // String Value
  if (typeof color == 'string' && color !== 'normal') {
    return '\x1b[4' + colors[color] + 'm';
  } // RGB Value
  else if (Array.isArray(color) && color.length === 3) {
    return '\x1b[48;5;' + x256(color[0], color[1], color[2]) + 'm';
  } // Number
  else if (typeof color == 'number') {
    return '\x1b[48;5;' + color + 'm';
  } // Default
  else {
    return '\x1b[49m';
  }
}

const methods = {
  set: function (coord) {
    const color = getBgCode(this.color);
    this.content[coord] = color + ' \x1b[49m';
  },
  unset: function (coord) {
    this.content[coord] = null;
  },
  toggle: function (coord) {
    this.content[coord] === this.content[coord] == null ? 'p' : null;
  }
};
Object.keys(methods).forEach(function (method) {
  AnsiTerm.prototype[method] = function (x, y) {
    if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
      return;
    }

    const coord = this.getCoord(x, y);
    methods[method].call(this, coord);
  };
});

AnsiTerm.prototype.getCoord = function (x, y) {
  x = Math.floor(x);
  y = Math.floor(y);
  return x + this.width * y;
};

AnsiTerm.prototype.clear = function () {
  this.content = new Array(this.width * this.height);
};

AnsiTerm.prototype.measureText = function (str) {
  return {
    width: str.length * 1
  };
};

AnsiTerm.prototype.writeText = function (str, x, y) {
  //console.log(str + ": " + x + "," + y)
  const coord = this.getCoord(x, y);

  for (let i = 0; i < str.length; i++) {
    this.content[coord + i] = str[i];
  }

  const bg = getBgCode(this.color);
  const fg = getFgCode(this.fontFg);
  this.content[coord] = fg + bg + this.content[coord];
  this.content[coord + str.length - 1] += '\x1b[39m\x1b[49m';
};

AnsiTerm.prototype.frame = function frame(delimiter) {
  delimiter = delimiter || '\n';
  const result = [];
  let i = 0,
      j = 0;

  for (; i < this.content.length; i++, j++) {
    if (j === this.width) {
      result.push(delimiter);
      j = 0;
    }

    if (this.content[i] == null) {
      result.push(' ');
    } else {
      result.push(this.content[i]);
    }
  }

  result.push(delimiter);
  return result.join('');
};

class BarChart extends Canvas {
  constructor(options = {}) {
    if (!options.sku) options.sku = 'bar-chart'; // if (!(this instanceof Node)) return new BarChart(options)

    super(options, AnsiTerm);
    const self = this;
    this.bars = this.options.bars = Bars.build(options.bars ?? options);
    this.options.xOffset = this.options.xOffset ?? 5;
    this.options.showText = this.options.showText !== false;
    this.on(ATTACH, () => {
      if (self.options.data) {
        self.setData(self.options.data);
      }
    });
    this.type = 'bar-chart'; // console.log('>>> BarChart this.options')
    // console.log(this.options)
  }

  get canvH() {
    return this.height;
  }

  get canvW() {
    return this.width - 2;
  }

  get labelY() {
    return this.canvH - 3;
  }

  get valueY() {
    return this.canvH - 4;
  }

  get barY() {
    return this.canvH - 5;
  }

  static build(options) {
    return new BarChart(options);
  }

  setData(series) {
    if (!this.context) throw 'error: canvas context does not exist. setData() for bar charts must be called after the chart has been added to the screen via screen.append()';
    this.clear();
    const labels = series.labels ?? series.x ?? series.titles;
    const values = series.values ?? series.y ?? series.data;
    const {
      bars,
      context
    } = this;
    const max = Math.max(maxBy(values), this.options.maxHeight);
    const {
      barY,
      labelY,
      valueY
    } = this;

    for (let i = 0, x = this.options.xOffset; i < values.length; i++, x += bars.spacing) {
      var _bars$preset2, _bars$preset3;

      // draw bar
      if (values[i] <= 0) {
        context.strokeStyle = 'normal';
      } else {
        var _bars$preset;

        context.strokeStyle = (_bars$preset = bars.preset) === null || _bars$preset === void 0 ? void 0 : _bars$preset.back;
        const height = round(barY * (values[i] / max));
        context.fillRect(x, barY - height + 1, bars.width, height);
      } // draw values


      context.fillStyle = (_bars$preset2 = bars.preset) === null || _bars$preset2 === void 0 ? void 0 : _bars$preset2.fore;
      if (this.options.showText) context.fillText(values[i].toString(), x + 1, valueY);
      context.strokeStyle = 'normal'; // draw labels

      context.fillStyle = (_bars$preset3 = bars.preset) === null || _bars$preset3 === void 0 ? void 0 : _bars$preset3.label;
      if (this.options.showText) context.fillText(labels[i], x + 1, labelY);
    }
  }

  getOptionsPrototype() {
    return {
      barWidth: 1,
      barSpacing: 1,
      xOffset: 1,
      maxHeight: 1,
      data: {
        titles: ['s'],
        data: [1]
      }
    };
  }

}

const {
  cos,
  sin,
  PI
} = Math; // 3.141592635

class DonutChart extends Canvas {
  constructor(options = {}) {
    if (!options.stroke) options.stroke = 'magenta';
    if (!options.fill) options.fill = 'white';
    if (!options.radius) options.radius = 14;
    if (!options.arcWidth) options.arcWidth = 4;
    if (!options.spacing) options.spacing = 2;
    if (!options.yPadding) options.yPadding = 2;
    if (!options.remainColor) options.remainColor = 'black';
    if (!options.data) options.data = [];
    if (!options.sku) options.sku = 'donut-chart';
    super(options);
    const self = this;
    this.on(ATTACH, () => {
      self.setData(self.options.data);
    });
    this.type = 'donut';
  }

  get canvH() {
    let canvH = (this.height << 2) - 12;
    if (canvH % 4 !== 1) canvH += canvH % 4;
    return canvH;
  }

  get canvW() {
    let canvW = Math.round((this.width << 1) - 5);
    if (canvW % 2 === 1) canvW--;
    return canvW;
  }

  static build(options) {
    return new DonutChart(options);
  }

  setData(data) {
    this.update(data);
  }

  update(data) {
    if (!this.context) throw 'error: canvas context does not exist. setData() for line charts must be called after the chart has been added to the screen via screen.append()';
    const c = this.context;
    c.save();
    c.translate(0, -this.options.yPadding);
    c.strokeStyle = this.options.stroke;
    c.fillStyle = this.options.fill;
    c.clearRect(0, 0, this.canvW, this.canvH);
    const canvH = this.canvH;
    const canvW = this.canvW;

    function makeRound(percent, radius, width, cx, cy, color) {
      let s = 0;
      const points = 370;
      c.strokeStyle = color || 'green';

      while (s < radius) {
        if (s < radius - width) {
          s++;
          continue;
        }

        const slice = 2 * PI / points;
        c.beginPath();
        const p = parseFloat(percent * 360);

        for (let i = 0; i <= points; i++) {
          if (i > p) continue;
          const si = i - 90;
          const a = slice * si;
          c.lineTo(Math.round(cx + s * cos(a)), Math.round(cy + s * sin(a)));
        }

        c.stroke();
        c.closePath();
        s++;
      }
    }

    const donuts = data.length;
    const radius = this.options.radius;
    const width = this.options.arcWidth;
    const remainColor = this.options.remainColor;
    const middle = canvH / 2;
    const spacing = (canvW - donuts * radius * 2) / (donuts + 1);

    function drawDonut(label, percent, radius, width, cxx, middle, color) {
      makeRound(100, radius, width, cxx, middle, remainColor);
      makeRound(percent, radius, width, cxx, middle, color);
      const ptext = parseFloat(percent * 100).toFixed(0) + '%';
      c.fillText(ptext, cxx - Math.round(parseFloat(c.measureText(ptext).width / 2)) + 3, middle);
      c.fillText(label, cxx - Math.round(parseFloat(c.measureText(label).width / 2)) + 3, middle + radius + 5);
    }

    function makeDonut(stat, which) {
      const left = radius + spacing * which + radius * 2 * (which - 1);
      let percent = stat.percent;
      if (percent > 1.001) percent = parseFloat(percent / 100).toFixed(2);
      const label = stat.label;
      const color = stat.color || 'green';
      const cxx = left;
      drawDonut(label, percent, radius, width, cxx, middle, color);
    }

    function makeDonuts(stats) {
      for (let l = 0; l <= stats.length - 1; l++) makeDonut(stats[l], l + 1);
    }

    if (data.length) makeDonuts(data);
    this.currentData = data;
    c.strokeStyle = 'magenta';
    c.restore();
    return void 0;
  }

  getOptionsPrototype() {
    return {
      spacing: 1,
      yPadding: 1,
      radius: 1,
      arcWidth: 1,
      data: [{
        color: 'red',
        percent: '50',
        label: 'a'
      }, {
        color: 'blue',
        percent: '20',
        label: 'b'
      }, {
        color: 'yellow',
        percent: '80',
        label: 'c'
      }]
    };
  }

}

class Gauge extends Canvas {
  constructor(options = {}) {
    // if (!(this instanceof Node)) { return new Gauge(options) }
    options.stroke = options.stroke || 'magenta';
    options.fill = options.fill || 'white';
    options.data = options.data || [];
    options.showLabel = options.showLabel !== false;
    if (!options.sku) options.sku = 'gauge';
    super(options, AnsiTerm);
    const self = this;
    this.on(ATTACH, function () {
      if (self.options.stack) {
        const stack = this.stack = self.options.stack;
        this.setStack(stack);
      } else {
        const percent = this.percent = self.options.percent || 0;
        this.setData(percent);
      }
    });
    this.type = 'gauge';
  }

  get canvH() {
    return this.height;
  }

  get canvW() {
    return this.width - 2;
  }

  static build(options) {
    return new Gauge(options);
  }

  setData(data) {
    return data !== null && data !== void 0 && data.length ? this.setStack(data) : typeof data === NUM ? this.setPercent(data) : void 0;
  }

  setPercent(percent) {
    if (!this.context) throw 'error: canvas context does not exist. setData() for gauges must be called after the gauge has been added to the screen via screen.append()';
    const c = this.context;
    c.strokeStyle = this.options.stroke; //'magenta'

    c.fillStyle = this.options.fill; //'white'

    c.clearRect(0, 0, this.canvW, this.canvH);
    if (percent < 1.001) percent = percent * 100;
    const width = percent / 100 * (this.canvW - 3);
    c.fillRect(1, 2, width, 2);
    const textX = 7;
    if (width < textX) c.strokeStyle = 'normal';
    if (this.options.showLabel) c.fillText(Math.round(percent) + '%', textX, 3);
  }

  setStack(stack) {
    const colors = ['green', 'magenta', 'cyan', 'red', 'blue'];
    if (!this.context) throw 'error: canvas context does not exist. setData() for gauges must be called after the gauge has been added to the screen via screen.append()';
    const c = this.context;
    let leftStart = 1;
    let textLeft = 5;
    c.clearRect(0, 0, this.canvW, this.canvH);

    for (let i = 0; i < stack.length; i++) {
      const currentStack = stack[i];
      let percent = typeof currentStack === typeof {} ? currentStack.percent : currentStack;
      c.strokeStyle = currentStack.stroke || colors[i % colors.length]; // use specified or choose from the array of colors

      c.fillStyle = this.options.fill; //'white'

      textLeft = 5;
      if (percent < 1.001) percent = percent * 100;
      const width = percent / 100 * (this.canvW - 3);
      c.fillRect(leftStart, 2, width, 2);
      textLeft = width / 2 - 1; // if (textLeft)

      const textX = leftStart + textLeft;
      if (leftStart + width < textX) c.strokeStyle = 'normal';
      if (this.options.showLabel) c.fillText(percent + '%', textX, 3);
      leftStart += width;
    }
  }

  getOptionsPrototype() {
    return {
      percent: 10
    };
  }

}

class GaugeList extends Canvas {
  constructor(options = {}) {
    // if (!(this instanceof Node)) { return new GaugeList(options) }
    options.stroke = options.stroke || 'magenta';
    options.fill = options.fill || 'white';
    options.data = options.data || [];
    options.showLabel = options.showLabel !== false;
    options.gaugeSpacing = options.gaugeSpacing || 0;
    options.gaugeHeight = options.gaugeHeight || 1;
    if (!options.sku) options.sku = 'gauge';
    super(options, AnsiTerm);
    const self = this;
    this.on(ATTACH, function () {
      const gauges = this.gauges = self.options.gauges;
      this.setGauges(gauges);
    });
    this.type = 'gauge';
  }

  get canvH() {
    return this.height;
  }

  get canvW() {
    return this.width - 2;
  }

  static build(options) {
    return new GaugeList(options);
  }

  setData() {}

  setGauges(gauges) {
    if (!this.context) {
      throw 'error: canvas context does not exist. setData() for gauges must be called after the gauge has been added to the screen via screen.append()';
    }

    const c = this.context;
    c.clearRect(0, 0, this.canvW, this.canvH);

    for (let i = 0; i < gauges.length; i++) {
      this.setSingleGauge(gauges[i], i);
    }
  }

  setSingleGauge(gauge, offset) {
    const colors = ['green', 'magenta', 'cyan', 'red', 'blue'];
    const stack = gauge.stack;
    const c = this.context;
    let leftStart = 3;
    let textLeft = 5;
    c.strokeStyle = 'normal';
    c.fillStyle = 'white';
    c.fillText(offset.toString(), 0, offset * (this.options.gaugeHeight + this.options.gaugeSpacing));

    for (let i = 0; i < stack.length; i++) {
      const currentStack = stack[i];
      let percent;

      if (typeof currentStack == typeof {}) {
        percent = currentStack.percent;
      } else {
        percent = currentStack;
      }

      c.strokeStyle = currentStack.stroke || colors[i % colors.length]; // use specified or choose from the array of colors

      c.fillStyle = this.options.fill; //'white'

      textLeft = 5;
      const width = percent / 100 * (this.canvW - 5);
      c.fillRect(leftStart, offset * (this.options.gaugeHeight + this.options.gaugeSpacing), width, this.options.gaugeHeight - 1);
      textLeft = width / 2 - 1; // if (textLeft)

      const textX = leftStart + textLeft;

      if (leftStart + width < textX) {
        c.strokeStyle = 'normal';
      }

      if (gauge.showLabel) c.fillText(percent + '%', textX, 3);
      leftStart += width;
    }
  }

  getOptionsPrototype() {
    return {
      percent: 10
    };
  }

}

class LineChart extends Canvas {
  constructor(options = {}) {
    if (nullish(options.labelStep)) options.labelStep = options.showNthLabel ?? 1;
    const style = options.style ?? (options.style = {});
    if (nullish(style.line)) style.line = 'yellow';
    if (nullish(style.text)) style.text = 'green';
    if (nullish(style.baseline)) style.baseline = 'black';
    if (nullish(options.legend)) options.legend = {};
    const padds = options.padds = Padds.build(options.padds ?? options);
    const ticks = options.ticks = Ticks.build(options.ticks ?? options);
    const labels = options.labels = Labels.build(options.labels ?? options);
    if (!options.sku) options.sku = 'line-chart';
    super(options);
    this.style = style;
    this.padds = padds;
    this.ticks = ticks;
    this.labels = labels;
    this.seriesCollection = null;
    this.on(ATTACH, () => {
      if (this.seriesCollection) {
        this.setData(this.seriesCollection);
      }
    });
    this.type = 'line-chart';
  }

  get originY() {
    return this.canvH - this.padds.y;
  }

  get originX() {
    return this.canvW - this.padds.x;
  }

  get canvH() {
    return (this.height << 2) - 8;
  }

  get canvW() {
    return (this.width << 1) - 12;
  }

  static build(options) {
    return new LineChart(options);
  }

  coordX(val) {
    return this.originX / this.labels.length * val + this.padds.x * 1.0 + 2;
  }

  coordY(val) {
    let res = this.originY - this.originY / this.ticks.dif * (val - this.ticks.min);
    res -= 2; //to separate the baseline and the data line to separate chars so canvas will show separate colors

    return res;
  }

  labelWidth(labels) {
    return maxBy(labels, x => x === null || x === void 0 ? void 0 : x.length) ?? 0;
  }

  drawLegend(seriesCollection) {
    if (!this.options.showLegend) return;
    if (this.legend) this.remove(this.legend);
    const legendWidth = this.options.legend.width || 15;
    this.legend = new Box({
      height: seriesCollection.length + 2,
      top: 1,
      width: legendWidth,
      left: this.width - legendWidth - 3,
      content: '',
      fg: 'green',
      tags: true,
      border: {
        type: 'line',
        fg: 'black'
      },
      style: {
        fg: 'blue'
      },
      screen: this.screen
    });
    let legendText = '';
    const maxChars = legendWidth - 2;

    for (const series of seriesCollection) {
      const style = series.style || {};
      const color = toByte(style.line || this.options.style.line);
      legendText += '{' + color + '-fg}' + series.title.substring(0, maxChars) + '{/' + color + '-fg}\r\n';
    }

    this.legend.setContent(legendText);
    this.append(this.legend);
  }

  drawLine(values, style = {}) {
    // Draw the line graph
    const {
      context
    } = this;
    const color = this.options.style.line;
    context.strokeStyle = style.line || color;
    context.moveTo(0, 0);
    context.beginPath();
    context.lineTo(this.coordX(0), this.coordY(values[0]));

    for (let i = 1; i < values.length; i++) context.lineTo(this.coordX(i), this.coordY(values[i]));

    context.stroke();
  }

  drawAxes() {
    const {
      context
    } = this;
    context.strokeStyle = this.options.style.baseline;
    context.beginPath();
    context.lineTo(this.padds.x, 0);
    context.lineTo(this.padds.x, this.originY);
    context.lineTo(this.canvW, this.originY);
    context.stroke();
  }

  setData(seriesCollection) {
    return this.update(seriesCollection);
  }

  update(seriesCollection) {
    if (!this.context) throw 'error: canvas context does not exist. setData() for line charts must be called after the chart has been added to the screen via screen.append()';
    seriesCollection = this.seriesCollection = Array.isArray(seriesCollection) ? seriesCollection : [seriesCollection];
    const {
      padds,
      ticks,
      labels,
      context
    } = this;
    labels.loadLabels(seriesCollection);
    this.ticks.setup(seriesCollection); // console.log('this.ticks.tickWidth', this.ticks.tickWidth)

    this.padds.adjustPadds(this.ticks.tickWidth);
    this.drawLegend(seriesCollection);
    context.fillStyle = this.options.style.text;
    context.clearRect(0, 0, this.canvW, this.canvH); // Draw tick labels (y-axis values)

    for (let i = ticks.min; i < ticks.max; i += ticks.step) context.fillText(ticks.formatValue(i), padds.relativeX, this.coordY(i)); // Draw y-value series collection


    for (const series of seriesCollection) this.drawLine(series.y, series.style); // Draw x and y axes


    this.drawAxes(); // Draw x-value labels

    const charsLimit = this.originX / 2;

    for (let i = 0, step = labels.labelStep(charsLimit); i < labels.length; i += step) {
      if (this.coordX(i) + labels.list[i].length * 2 <= this.canvW) {
        context.fillText(labels.list[i], this.coordX(i), this.originY + padds.labelY);
      }
    }
  }

  getOptionsPrototype() {
    return {
      width: 80,
      height: 30,
      left: 15,
      top: 12,
      xPadding: 5,
      label: 'Title',
      showLegend: true,
      legend: {
        width: 12
      },
      data: [{
        title: 'us-east',
        x: ['t1', 't2', 't3', 't4'],
        y: [5, 1, 7, 5],
        style: {
          line: 'red'
        }
      }, {
        title: 'us-west',
        x: ['t1', 't2', 't3', 't4'],
        y: [2, 4, 9, 8],
        style: {
          line: 'yellow'
        }
      }, {
        title: 'eu-north-with-some-long-string',
        x: ['t1', 't2', 't3', 't4'],
        y: [22, 7, 12, 1],
        style: {
          line: 'blue'
        }
      }]
    };
  }

}

const RN = '\r\n';

class Sparkline extends Box {
  constructor(options = {}) {
    // // if (!(this instanceof Node)) { return new Sparkline(options) }
    // options = options || {}
    options.bufferLength = options.bufferLength || 30;
    options.style = options.style || {};
    options.style.titleFg = options.style.titleFg || 'white';
    if (!options.sku) options.sku = 'sparkline';
    super(options);
    const self = this; // this.options = options
    // super(options) // Mixin.assign(this, new Box(options)) // Box.call(this, options)

    this.on(ATTACH, () => {
      if (self.options.data) {
        self.setData(self.options.data.titles, self.options.data.data);
      }
    });
    this.type = 'sparkline';
  }

  static build(options) {
    return new Sparkline(options);
  }
  /** @deprecated */


  setData(titles, datasets) {
    this.update(zipper(datasets, titles, (vec, title) => (vec.title = title, vec)));
  }

  update(titledVectors) {
    const fg = this.options.style.titleFg;
    let content = RN;
    iterate(titledVectors, titledVector => {
      content += '{bold}{' + fg + '-fg}' + titledVector.title + ':{/' + fg + '-fg}{/bold}' + RN;
      content += sparkline(titledVector.slice(0, this.width - 2)) + RN + RN;
    }); // for (let i = 0; i < titledVectors.length; i++) {
    //   res += '{bold}{' + fg + '-fg}' + titledVectors[i].title + ':{/' + fg + '-fg}{/bold}\r\n'
    //   res += sparkline(titledVectors[i].slice(0, this.width - 2)) + '\r\n\r\n'
    // }

    this.setContent(content);
  }

  getOptionsPrototype() {
    return {
      label: 'Sparkline',
      tags: true,
      border: {
        type: 'line',
        fg: 'cyan'
      },
      width: '50%',
      height: '50%',
      style: {
        fg: 'blue'
      },
      data: {
        titles: ['Sparkline1', 'Sparkline2'],
        data: [[10, 20, 30, 20, 50, 70, 60, 30, 35, 38], [40, 10, 40, 50, 20, 30, 20, 20, 19, 40]]
      }
    };
  }

}

class StackedBarChart extends Canvas {
  constructor(options = {}) {
    if (!options.sku) options.sku = 'bar-chart';
    super(options, AnsiTerm);
    const self = this;
    this.options.barWidth = this.options.barWidth || 6;
    this.options.barSpacing = this.options.barSpacing || 9;
    if (this.options.barSpacing - this.options.barWidth < 3) this.options.barSpacing = this.options.barWidth + 3;
    this.options.xOffset = this.options.xOffset == null ? 5 : this.options.xOffset;
    this.options.showText = this.options.showText !== false;
    this.options.legend = this.options.legend || {};
    this.options.showLegend = this.options.showLegend !== false;
    this.on(ATTACH, () => {
      if (self.options.data) self.setData(self.options.data);
    });
    this.type = 'bar-chart';
  }

  get canvH() {
    return this.height;
  }

  get canvW() {
    return this.width - 2;
  }

  static build(options) {
    return new StackedBarChart(options);
  }

  getSummedBars(bars) {
    const res = [];
    bars.forEach(function (stackedValues) {
      const sum = stackedValues.reduce((a, b) => a + b, 0);
      res.push(sum);
    });
    return res;
  }

  setData(bars) {
    if (!this.context) throw 'error: canvas context does not exist. setData() for bar charts must be called after the chart has been added to the screen via screen.append()';
    this.clear();
    const summedBars = this.getSummedBars(bars.data);
    let maxBarValue = Math.max.apply(Math, summedBars);
    if (this.options.maxValue) maxBarValue = Math.max(maxBarValue, this.options.maxValue);
    let x = this.options.xOffset;

    for (let i = 0; i < bars.data.length; i++) {
      this.renderBar(x, bars.data[i], summedBars[i], maxBarValue, bars.barCategory[i]);
      x += this.options.barSpacing;
    }

    this.addLegend(bars, x);
  }

  renderBar(x, bar, curBarSummedValue, maxBarValue, category) {
    /*
      var c = this.context
      c.strokeStyle = 'red';
      c.fillRect(0,7,4,0)
      c.strokeStyle = 'blue';
      c.fillRect(0,4,4,1)
      c.strokeStyle = 'green';
      c.fillRect(5,7,4,2)
      return
    */
    //first line is for label
    const BUFFER_FROM_TOP = 2;
    const BUFFER_FROM_BOTTOM = (this.options.border ? 2 : 0) + (this.options.showText ? 1 : 0);
    const c = this.context;
    c.strokeStyle = 'normal';
    c.fillStyle = 'white';
    if (this.options.labelColor) c.fillStyle = this.options.labelColor;

    if (this.options.showText) {
      c.fillText(category, x + 1, this.canvH - BUFFER_FROM_BOTTOM);
    }

    if (curBarSummedValue < 0) return;
    const maxBarHeight = this.canvH - BUFFER_FROM_TOP - BUFFER_FROM_BOTTOM;
    const currentBarHeight = Math.round(maxBarHeight * (curBarSummedValue / maxBarValue)); //start painting from bottom of bar, section by section

    let y = maxBarHeight + BUFFER_FROM_TOP;
    let availableBarHeight = currentBarHeight;

    for (let i = 0; i < bar.length; i++) {
      const currStackHeight = this.renderBarSection(x, y, bar[i], curBarSummedValue, currentBarHeight, availableBarHeight, this.options.barBgColor[i]);
      y -= currStackHeight;
      availableBarHeight -= currStackHeight;
    }
  }

  renderBarSection(x, y, data, curBarSummedValue, currentBarHeight, availableBarHeight, bg) {
    const c = this.context;
    const currStackHeight = currentBarHeight <= 0 ? 0 : Math.min(availableBarHeight, //round() can make total stacks excceed curr bar height so we limit it
    Math.round(currentBarHeight * (data / curBarSummedValue)));
    c.strokeStyle = bg;

    if (currStackHeight > 0) {
      const calcY = y - currStackHeight;
      /*fillRect starts from the point bottom of start point so we compensate*/

      const calcHeight = Math.max(0, currStackHeight - 1);
      c.fillRect(x, calcY, this.options.barWidth, calcHeight);
      c.fillStyle = 'white';
      if (this.options.barFgColor) c.fillStyle = this.options.barFgColor;

      if (this.options.showText) {
        const str = utils.abbrNumber(data.toString());
        c.fillText(str, Math.floor(x + this.options.barWidth / 2 + str.length / 2), calcY + Math.round(calcHeight / 2));
      }
    }

    return currStackHeight;
  }

  getOptionsPrototype() {
    return {
      barWidth: 1,
      barSpacing: 1,
      xOffset: 1,
      maxValue: 1,
      barBgColor: 's',
      data: {
        barCategory: ['s'],
        stackedCategory: ['s'],
        data: [[1]]
      }
    };
  }

  addLegend(bars, x) {
    const self = this;
    if (!self.options.showLegend) return;
    if (self.legend) self.remove(self.legend);
    const legendWidth = self.options.legend.width || 15;
    self.legend = new Box({
      height: bars.stackedCategory.length + 2,
      top: 1,
      width: legendWidth,
      left: x,
      content: '',
      fg: 'green',
      tags: true,
      border: {
        type: 'line',
        fg: 'black'
      },
      style: {
        fg: 'blue'
      },
      screen: self.screen
    });
    let legendText = '';
    const maxChars = legendWidth - 2;

    for (let i = 0; i < bars.stackedCategory.length; i++) {
      const color = utils.getColorCode(self.options.barBgColor[i]);
      legendText += '{' + color + '-fg}' + bars.stackedCategory[i].substring(0, maxChars) + '{/' + color + '-fg}\r\n';
    }

    self.legend.setContent(legendText);
    self.append(self.legend);
  }

}

export { BarChart, DonutChart, Gauge, GaugeList, LineChart, Sparkline, StackedBarChart };
