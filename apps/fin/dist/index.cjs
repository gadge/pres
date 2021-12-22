'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var cards = require('@palett/cards');
var components = require('@pres/components');
var enumEvents = require('@pres/enum-events');
var table = require('@analys/table');
var boundVector = require('@aryth/bound-vector');
var math = require('@aryth/math');
var rand = require('@aryth/rand');
var marketIndexesFmp = require('@morpont/market-indexes-fmp');
var phrasing = require('@texting/phrasing');
var convert = require('@valjoux/convert');
var dateShift = require('@valjoux/date-shift');
var linger = require('@valjoux/linger');
var entriesUnwind = require('@vect/entries-unwind');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var APIKEY = "fe647ef26d2700f2e11b53a996860481";

const COLOR_COLLECTION = [cards.Red.base, cards.Pink.base, cards.Purple.base, cards.DeepPurple.base, cards.Indigo.base, cards.Blue.base, cards.LightBlue.base, cards.Cyan.base, cards.Teal.base, cards.Green.base, cards.LightGreen.base, cards.Lime.base, cards.Yellow.base, cards.Amber.base, cards.Orange.base, cards.DeepOrange.base];

var _Date;
const TODAY = (_Date = new Date(), convert.dateToYmd(_Date));
const BEFORE = dateShift.shiftDay(TODAY.slice(), -60);
let colorGenerator = rand.flopGenerator(COLOR_COLLECTION, cards.Grey.base);
marketIndexesFmp.MarketIndexes.login(APIKEY);
class MarketWatch extends linger.Escape {
  constructor(lineChart, indicator) {
    super(marketIndexesFmp.MarketIndexes.prices.bind(null, {
      indicator,
      start: BEFORE
    }));
    this.chart = lineChart;
    this.seriesCollection = [];
    this.indicator = indicator;
  }

  async run() {
    const filename = phrasing.camelToSnake(this.indicator, '_').toUpperCase();
    const filepath = process.cwd() + '/apps/fin/resources/' + filename + '.js';
    const table$1 = await (function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(t)); }); })(filepath).then(fileTrunk => fileTrunk[filename]);
    this.updateData(table.Table.from(table$1)); // await MarketIndexes
    //   .prices({ indicator: this.indicator, start: BEFORE })
    //   .then(table => this.updateData(table))
  }
  /**
   *
   * @param {Table} table
   */


  updateData(table) {
    var _entries$slice;

    const entries = table.select(['date', 'adj.c']).rows; // console.log(entries)

    const [x, y] = (_entries$slice = entries.slice(0, 90), entriesUnwind.unwind(_entries$slice));
    const {
      min,
      max
    } = roundBound(boundVector.bound(y));
    const series = {
      title: this.indicator,
      style: {
        line: colorGenerator.next().value
      },
      x: x.reverse().slice(-45),
      y: y.reverse().slice(-45)
    };
    const seriesCollection = [series];
    this.chart.ticks.prev.min = min;
    this.chart.ticks.prev.max = max;
    this.chart.setData(seriesCollection);
    this.chart.screen.render();
  }

}
function roundBound({
  min,
  max
}) {
  const magMin = 10 ** (math.intExpon(min) - 1);
  const magMax = 10 ** (math.intExpon(max) - 1);
  return {
    min: Math.floor(min / magMin) * magMin,
    max: Math.ceil(max / magMax) * magMax
  };
}

const screen = components.Screen.build({
  smartCSR: true,
  padding: {
    t: 3,
    b: 3,
    l: 0,
    r: 0
  },
  title: 'Leagyun Financial Dashboard'
});
const grid = components.Grid.build({
  rows: 12,
  cols: 12,
  screen: screen
}); // margin: { t: 4, b: 4, l: 4, r: 4 },

const {
  top,
  bottom,
  left,
  right,
  width,
  height
} = grid;
console.log('grid', {
  top,
  bottom,
  left,
  right,
  width,
  height
});
const lineChartCollection = {
  A1: grid.add(0, 0, 4, 4, components.LineChart.build, {
    label: 'S&P 500',
    showLegend: true
  }),
  B1: grid.add(0, 4, 4, 4, components.LineChart.build, {
    label: 'Dow Jones',
    showLegend: true
  }),
  C1: grid.add(0, 8, 4, 4, components.LineChart.build, {
    label: 'Nasdaq',
    showLegend: true
  }),
  A2: grid.add(4, 0, 4, 4, components.LineChart.build, {
    label: 'Shanghai',
    showLegend: true
  }),
  B2: grid.add(4, 4, 4, 4, components.LineChart.build, {
    label: 'FTSE',
    showLegend: true
  }),
  C2: grid.add(4, 8, 4, 4, components.LineChart.build, {
    label: 'Hang Seng',
    showLegend: true
  }),
  A3: grid.add(8, 0, 4, 4, components.LineChart.build, {
    label: 'Nikkei',
    showLegend: true
  }),
  B3: grid.add(8, 4, 4, 4, components.LineChart.build, {
    label: 'Euronext',
    showLegend: true
  }),
  C3: grid.add(8, 8, 4, 4, components.LineChart.build, {
    label: 'Seoul',
    showLegend: true
  })
};
const form = components.Form.build({
  sup: screen,
  top: 0,
  left: 0,
  height: 3,
  width: '100%',
  // width: '90%',
  keys: true,
  vi: true
});
const label = components.Box.build({
  sup: screen,
  top: 0,
  left: 0,
  height: 3,
  width: 10,
  content: 'SYMBOL',
  border: {
    type: 'bg'
  },
  align: 'right',
  valign: 'middle'
});
const textbox = components.Textbox.build({
  sup: form,
  top: 0,
  left: 'center',
  height: 3,
  width: '100%-20',
  name: 'symbol',
  inputOnFocus: true,
  content: 'symbol',
  border: {
    type: 'line'
  },
  focus: {
    fg: 'blue'
  }
});
const submit = components.Button.build({
  sup: form,
  top: 0,
  right: 0,
  height: 3,
  width: 10,
  name: 'submit',
  content: 'Submit',
  // shrink: true,
  // padding: { top: 1, right: 2, bottom: 1, left: 2 },
  align: 'center',
  valign: 'middle',
  style: {
    bold: true,
    fg: 'white',
    bg: 'green',
    focus: {
      inverse: true
    },
    hover: {
      bg: 'red'
    }
  },
  border: {
    type: 'bg'
  } // hideBorder: true,

});
const box = components.Box.build({
  sup: screen,
  bottom: 0,
  left: 0,
  //'50%',
  height: 1,
  width: '100%',
  align: 'center',
  valign: 'middle',
  content: '...' // border: 'line'

});
const listBar = components.ListBar.build({
  sup: screen,
  bottom: 1,
  left: 0,
  height: 3,
  width: '100%',
  mouse: true,
  keys: true,
  autoCommandKeys: true,
  border: 'line',
  vi: true,
  style: {
    // bg: Pink.lighten_4,
    item: {
      bg: cards.BlueGrey.darken_4,
      hover: {
        bg: cards.LightBlue.base
      }
    },
    // focus: { bg: 'blue' }
    selected: {
      bg: cards.Indigo.accent_4
    }
  },
  commands: {
    home: {
      keys: ['a'],

      callback() {
        box.setContent('Pressed home.'), screen.render();
      }

    },
    favorite: {
      keys: ['b'],

      callback() {
        box.setContent('Pressed favorite.'), screen.render();
      }

    },
    search: {
      keys: ['c'],

      callback() {
        box.setContent('Pressed search.'), screen.render();
      }

    },
    refresh: {
      keys: ['d'],

      callback() {
        box.setContent('Pressed refresh.'), screen.render();
      }

    },
    about: {
      keys: ['e'],

      callback() {
        box.setContent('Pressed about.'), screen.render();
      }

    }
  }
}); // lineChartCollection.A1.focus()

textbox.focus();
submit.on(enumEvents.PRESS, () => {
  console.log('pressed');
  form.submit();
});
form.on(enumEvents.SUBMIT, data => {
  console.log(data);
});
screen.render();
screen.on(enumEvents.RESIZE, () => {
  label.emit(enumEvents.ATTACH);
  textbox.emit(enumEvents.ATTACH);
  screen.emit(enumEvents.ATTACH);
  form.emit(enumEvents.ATTACH);
  listBar.emit(enumEvents.ATTACH);
  box.emit(enumEvents.ATTACH);

  for (let key in lineChartCollection) lineChartCollection[key].emit(enumEvents.ATTACH);
});
screen.key(['escape', 'q', 'C-c'], (ch, key) => process.exit(0));
async function init() {
  const A1 = new MarketWatch(lineChartCollection.A1, 'sp500');
  const B1 = new MarketWatch(lineChartCollection.B1, 'dowJones');
  const C1 = new MarketWatch(lineChartCollection.C1, 'nasdaq');
  const A2 = new MarketWatch(lineChartCollection.A2, 'shanghai');
  const B2 = new MarketWatch(lineChartCollection.B2, 'ftse');
  const C2 = new MarketWatch(lineChartCollection.C2, 'hangSeng');
  const A3 = new MarketWatch(lineChartCollection.A3, 'nikkei');
  const B3 = new MarketWatch(lineChartCollection.B3, 'euronext');
  const C3 = new MarketWatch(lineChartCollection.C3, 'seoul');
  screen.emit('adjourn');
  await Promise.allSettled([A1.run(), B1.run(), C1.run(), A2.run(), B2.run(), C2.run(), A3.run(), B3.run(), C3.run()]);
}
process.on(enumEvents.UNCAUGHT_EXCEPTION, err => {// avoid exiting due to unsupported system resources in Windows
});

exports.MarketWatch = MarketWatch;
exports.init = init;
