import { Table }                                                        from '@analys/table'
import { bound }                                                        from '@aryth/bound-vector'
import { intExpon }                                                     from '@aryth/math'
import { flopGenerator }                                                from '@aryth/rand'
import { MarketIndexes }                                                from '@morpont/market-indexes-fmp'
import {
  Amber, Blue, BlueGrey, Cyan, DeepOrange, DeepPurple, Green, Grey, Indigo, LightBlue, LightGreen, Lime, Orange, Pink, Purple, Red, Teal, Yellow
}                                                                       from '@palett/cards'
import { Box, Button, Form, Grid, LineChart, ListBar, Screen, Textbox } from '@pres/components'
import { ATTACH, PRESS, RESIZE, SUBMIT, UNCAUGHT_EXCEPTION }            from '@pres/enum-events'
import { camelToSnake }                                                 from '@texting/phrasing'
import { dateToYmd }                                                    from '@valjoux/convert'
import { shiftDay }                                                     from '@valjoux/date-shift'
import { Escape }                                                       from '@valjoux/linger'
import { unwind }                                                       from '@vect/entries-unwind'

const COLOR_COLLECTION = [Red.base, Pink.base, Purple.base, DeepPurple.base, Indigo.base, Blue.base, LightBlue.base, Cyan.base, Teal.base, Green.base, LightGreen.base, Lime.base, Yellow.base, Amber.base, Orange.base, DeepOrange.base];

const TODAY = dateToYmd(new Date());
const BEFORE = shiftDay(TODAY.slice(), -60);
let colorGenerator = flopGenerator(COLOR_COLLECTION, Grey.base); // MarketIndexes.login(APIKEY)

class MarketWatch extends Escape {
  constructor(lineChart, indicator) {
    super(MarketIndexes.prices.bind(null, {
      indicator,
      start: BEFORE
    }));
    this.chart = lineChart;
    this.seriesCollection = [];
    this.indicator = indicator;
  }

  async run() {
    const filename = camelToSnake(this.indicator, '_').toUpperCase();
    const filepath = process.cwd() + '/apps/fin/resources/' + filename + '.js';
    const table = await import(filepath).then(fileTrunk => fileTrunk[filename]);
    this.updateData(Table.from(table)); // await MarketIndexes
    //   .prices({ indicator: this.indicator, start: BEFORE })
    //   .then(table => this.updateData(table))
  }
  /**
   *
   * @param {Table} table
   */


  updateData(table) {
    const entries = table.select(['date', 'adj.c']).rows; // console.log(entries)

    const [x, y] = unwind(entries.slice(0, 90));
    const {
      min,
      max
    } = roundBound(bound(y));
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
  const magMin = 10 ** (intExpon(min) - 1);
  const magMax = 10 ** (intExpon(max) - 1);
  return {
    min: Math.floor(min / magMin) * magMin,
    max: Math.ceil(max / magMax) * magMax
  };
}

const screen = Screen.build({
  smartCSR: true,
  padding: {
    t: 3,
    b: 3,
    l: 0,
    r: 0
  },
  title: 'Leagyun Financial Dashboard'
});
const grid = Grid.build({
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
  A1: grid.add(0, 0, 4, 4, LineChart.build, {
    label: 'S&P 500',
    showLegend: true
  }),
  B1: grid.add(0, 4, 4, 4, LineChart.build, {
    label: 'Dow Jones',
    showLegend: true
  }),
  C1: grid.add(0, 8, 4, 4, LineChart.build, {
    label: 'Nasdaq',
    showLegend: true
  }),
  A2: grid.add(4, 0, 4, 4, LineChart.build, {
    label: 'Shanghai',
    showLegend: true
  }),
  B2: grid.add(4, 4, 4, 4, LineChart.build, {
    label: 'FTSE',
    showLegend: true
  }),
  C2: grid.add(4, 8, 4, 4, LineChart.build, {
    label: 'Hang Seng',
    showLegend: true
  }),
  A3: grid.add(8, 0, 4, 4, LineChart.build, {
    label: 'Nikkei',
    showLegend: true
  }),
  B3: grid.add(8, 4, 4, 4, LineChart.build, {
    label: 'Euronext',
    showLegend: true
  }),
  C3: grid.add(8, 8, 4, 4, LineChart.build, {
    label: 'Seoul',
    showLegend: true
  })
};
const form = Form.build({
  sup: screen,
  top: 0,
  left: 0,
  height: 3,
  width: '100%',
  // width: '90%',
  keys: true,
  vi: true
});
const label = Box.build({
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
const textbox = Textbox.build({
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
const submit = Button.build({
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
const box = Box.build({
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
const listBar = ListBar.build({
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
      bg: BlueGrey.darken_4,
      hover: {
        bg: LightBlue.base
      }
    },
    // focus: { bg: 'blue' }
    selected: {
      bg: Indigo.accent_4
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
submit.on(PRESS, () => {
  console.log('pressed');
  form.submit();
});
form.on(SUBMIT, data => {
  console.log(data);
});
screen.render();
screen.on(RESIZE, () => {
  label.emit(ATTACH);
  textbox.emit(ATTACH);
  screen.emit(ATTACH);
  form.emit(ATTACH);
  listBar.emit(ATTACH);
  box.emit(ATTACH);

  for (let key in lineChartCollection) lineChartCollection[key].emit(ATTACH);
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
process.on(UNCAUGHT_EXCEPTION, err => {// avoid exiting due to unsupported system resources in Windows
});

export { MarketWatch, init };
