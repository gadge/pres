import { Red, Pink, Purple, DeepPurple, Indigo, Blue, LightBlue, Cyan, Teal, Green, LightGreen, Lime, Yellow, Amber, Orange, DeepOrange, BlueGrey } from '@palett/cards';
import { Screen, Grid, LineChart, Sparkline, DonutChart, DataTable, Box, ListBar } from '@pres/components';
import { RESIZE, ATTACH, UNCAUGHT_EXCEPTION } from '@pres/enum-events';
import si from 'systeminformation';
import { Escape } from '@valjoux/linger';
import { init as init$1, iso } from '@vect/vector-init';
import { mapper } from '@vect/vector-mapper';
import { mutazip } from '@vect/vector-zipper';
import { roundD2, roundD1 } from '@aryth/math';

const COLOR_COLLECTION = [Red.base, Pink.base, Purple.base, DeepPurple.base, Indigo.base, Blue.base, LightBlue.base, Cyan.base, Teal.base, Green.base, LightGreen.base, Lime.base, Yellow.base, Amber.base, Orange.base, DeepOrange.base];
const COLOR_NO = COLOR_COLLECTION.length;

const SP = ' ';
const LF = '\n';

const trailZero = num => {
  if (!num) return '0';
  const tx = '' + roundD2(num);
  let i = tx.indexOf('.');

  if (!~i) {
    return tx + '.00';
  }

  let df = tx.length - i;

  if (df === 3) {
    return tx;
  }

  if (df === 2) {
    return tx + '0';
  }

  if (df === 1) {
    return tx + '00';
  }

  return tx;
};

const powSI = (pow, dec) => {
  if (pow === 0) return 'B'; //

  if (pow === 1) return dec ? 'KB' : 'KiB'; // Kilo

  if (pow === 2) return dec ? 'MB' : 'MiB'; // Mega

  if (pow === 3) return dec ? 'GB' : 'GiB'; // Giga

  if (pow === 4) return dec ? 'TB' : 'TiB'; // Tera

  if (pow === 5) return dec ? 'PB' : 'PiB'; // Peta

  if (pow === 6) return dec ? 'EB' : 'EiB'; // Exa

  if (pow === 7) return dec ? 'ZB' : 'ZiB'; // Zetta

  if (pow === 8) return dec ? 'YB' : 'YiB'; // Yotta
};

const humanScale = (num, dec) => {
  const B10 = dec ? 1000 : 1024;
  let pow = 0;

  while (num > B10) {
    num /= B10, pow++;
  }

  return trailZero(num) + SP + powSI(pow, dec);
};
let queue = (arr, item) => (arr.push(item), arr.shift());

class Cpu extends Escape {
  on = true;
  seriesCollection = [];

  constructor() {
    super(si.currentLoad, 'overtime');
  }

  static build() {
    return new Cpu();
  }

  initSeriesCollection(cpuCollection) {
    return this.seriesCollection = mapper(cpuCollection, (cpu, i) => ({
      title: 'CPU' + (i + 1),
      style: {
        line: COLOR_COLLECTION[i % COLOR_NO]
      },
      x: init$1(61, i => 60 - i),
      y: iso(61, 0)
    }));
  }

  updateSeriesCollection(cpuCollection) {
    return mutazip(this.seriesCollection, cpuCollection, (series, cpu, i) => {
      let loadInfo = cpu.load.toFixed(1).toString();

      while (loadInfo.length < 6) loadInfo = ' ' + loadInfo;

      series.title = 'CPU' + ++i + loadInfo + '%';
      queue(series.y, cpu.load);
      return series;
    });
  }

  async setInterval(ms, pipe) {
    await si.currentLoad().then(data => pipe(this.initSeriesCollection(data.cpus)));
    await super.setInterval(ms, data => pipe(this.updateSeriesCollection(data.cpus)));
  }

}

class Disk extends Escape {
  seriesCollection = [];
  on = true;

  constructor() {
    super(si.fsSize);
  }

  initSeriesCollection() {
    this.seriesCollection = [{}];
  }

  updateSeriesCollection(data) {
    const [disk] = data;
    const [series] = this.seriesCollection;
    series.percent = disk.use / 100;
    series.label = humanScale(disk.used, true) + ' of ' + humanScale(disk.size, true);
    series.color = COLOR_COLLECTION[5];
    return this.seriesCollection;
  }

  async setInterval(ms, pipe) {
    this.initSeriesCollection();
    await super.setInterval(ms, data => pipe(this.updateSeriesCollection(data)));
  }

}

const first$1 = ve => ve[0];

const last$1 = ve => ve[ve.length - 1];

var Index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  first: first$1,
  last: last$1
});

const {
  random,
  abs,
  exp,
  log,
  sqrt,
  pow,
  cos,
  sin,
  PI
} = Math;
const R0 = 3.442619855899;
exp(-0.5 * R0 * R0);
-pow(2, 32);

const {
  first,
  last
} = Index;

class Mem extends Escape {
  seriesCollection = [];
  on = true;

  constructor() {
    super(si.mem);
  }

  initSeriesCollection() {
    return this.seriesCollection = [{
      title: 'Memory',
      style: {
        line: COLOR_COLLECTION[0]
      },
      x: init$1(61, i => 60 - i),
      y: iso(61, 0)
    }, {
      title: 'Swap',
      style: {
        line: COLOR_COLLECTION[1]
      },
      x: init$1(61, i => 60 - i),
      y: iso(61, 0)
    }];
  }

  updateSeriesCollection(data) {
    const {
      available,
      total,
      swapfree,
      swaptotal
    } = data;
    const memRatio = (100 * (1 - available / total)).toFixed();
    let swapRatio = (100 * (1 - swapfree / swaptotal)).toFixed();
    swapRatio = isNaN(swapRatio) ? 0 : swapRatio;
    this.seriesCollection[0].subtitle = humanScale(total - available) + ' of ' + humanScale(total);
    this.seriesCollection[1].subtitle = humanScale(swaptotal - swapfree) + ' of ' + humanScale(swaptotal);
    queue(this.seriesCollection[0].y, memRatio);
    queue(this.seriesCollection[1].y, swapRatio);
    return this.seriesCollection;
  }

  memSnapshot() {
    const {
      seriesCollection
    } = this;
    return [{
      percent: last(seriesCollection[0].y) / 100,
      label: seriesCollection[0].subtitle,
      color: COLOR_COLLECTION[0]
    }];
  }

  swapSnapshot() {
    const {
      seriesCollection
    } = this;
    return [{
      percent: last(seriesCollection[1].y) / 100,
      label: seriesCollection[1].subtitle,
      color: COLOR_COLLECTION[1]
    }];
  }

  async setInterval(ms, pipe) {
    this.initSeriesCollection();
    await si.mem().then(data => pipe(this.updateSeriesCollection(data)));
    await super.setInterval(ms, data => pipe(this.updateSeriesCollection(data)));
  }

}

class Net extends Escape {
  seriesCollection = [];
  on = true;

  constructor() {
    super(); // () => si.networkInterfaceDefault().then(interfaces => si.networkStats(interfaces))
  }

  initSeriesCollection() {
    return this.seriesCollection = [iso(61, 0), iso(61, 0)];
  }

  updateSeriesCollection(data) {
    const [stat] = data;
    const rx_sec = Math.max(0, stat.rx_sec);
    const tx_sec = Math.max(0, stat.tx_sec);
    queue(this.seriesCollection[0], rx_sec);
    queue(this.seriesCollection[1], tx_sec);
    this.seriesCollection[0].title = 'Receiving:      ' + humanScale(rx_sec) + '/s ' + LF + 'Total received: ' + humanScale(stat['rx_bytes']);
    this.seriesCollection[1].title = 'Transferring:      ' + humanScale(tx_sec) + '/s ' + LF + 'Total transferred: ' + humanScale(stat['tx_bytes']);
    return this.seriesCollection;
  }

  async setInterval(ms, pipe) {
    this.initSeriesCollection();
    const interfaces = await si.networkInterfaceDefault();
    this.conf = {
      fn: async () => await si.networkStats(interfaces)
    };
    await super.setInterval(ms, data => pipe(this.updateSeriesCollection(data)));
  }

}

const KEY_TO_LABEL = {
  p: 'pid',
  c: 'cpu',
  m: 'mem'
};
const LABEL_TO_INDEX = {
  'pid': 0,
  'cpu': 2,
  'mem': 3
};
const HEADERS = ['PID', 'Command', '%CPU', '%MEM'];
class Proc extends Escape {
  selectedLabel = 'cpu';
  resetIndex = false;
  reverse = false;
  on = true;

  constructor() {
    super(si.processes);
  }

  set readKey(ch) {
    if (this.selectedLabel === KEY_TO_LABEL[ch]) {
      this.reverse = !this.reverse;
    } else {
      this.selectedLabel = KEY_TO_LABEL[ch] ?? this.selectedLabel;
    }
  }

  get head() {
    const head = HEADERS.slice();
    head[LABEL_TO_INDEX[this.selectedLabel]] += this.reverse ? '▲' : '▼';
    return head;
  }

  async setInterval(ms, pipe) {
    await super.setInterval(ms, data => pipe(this.dataToTable(data))); // setInterval(updater, 3000)
  }

  dataToTable(data) {
    const key = this.selectedLabel;
    const rows = data.list.sort((a, b) => b[key] - a[key]).map(({
      command,
      cpu,
      mem,
      pid
    }) => [pid, command, SP + roundD1(cpu), roundD1(mem)]);
    return {
      head: this.head,
      rows: this.reverse ? rows.reverse() : rows
    };
  }

  tryReset(dataTable) {
    if (this.resetIndex) this.resetIndex = void dataTable.rows.select(0); // this.resetIndex switched to false
  }

}

const screen = Screen.build({
  padding: 1
});
const grid = Grid.build({
  rows: 12,
  cols: 12,
  screen: screen
});
/**
 *
 * @type {{
 * cpuLine: LineChart,
 * memLine: LineChart
 * memDonut: DonutChart,
 * swapDonut: DonutChart,
 * diskDonut: DonutChart,
 * networkSparkline: Sparkline,
 * }}
 */

const charts = {
  cpuLine: grid.set(0, 0, 5, 12, LineChart.build, {
    name: 'lineChart',
    showNthLabel: 5,
    maxY: 100,
    label: 'CPU History',
    showLegend: true
  }),
  memLine: grid.set(5, 0, 2, 6, LineChart.build, {
    showNthLabel: 5,
    maxY: 100,
    label: 'Memory and Swap History',
    showLegend: true,
    legend: {
      width: 10
    }
  }),
  networkSparkline: grid.set(7, 0, 2, 6, Sparkline.build, {
    label: 'Network History',
    tags: true,
    style: {
      fg: 'blue'
    }
  }),
  diskDonut: grid.set(9, 0, 2, 4, DonutChart.build, {
    radius: 8,
    arcWidth: 3,
    yPadding: 2,
    remainColor: 'black',
    label: 'Disk usage'
  }),
  memDonut: grid.set(9, 4, 2, 4, DonutChart.build, {
    radius: 8,
    arcWidth: 3,
    yPadding: 2,
    remainColor: 'black',
    label: 'Memory'
  }),
  swapDonut: grid.set(9, 8, 2, 4, DonutChart.build, {
    radius: 8,
    arcWidth: 3,
    yPadding: 2,
    remainColor: 'black',
    label: 'Swap'
  })
};
const tables = {
  process: grid.set(5, 6, 4, 6, DataTable.build, {
    keys: true,
    label: 'Processes',
    columnSpacing: 1,
    columnWidth: [7, 24, 7, 7]
  })
};
const box = grid.set(11, 8, 1, 4, Box.build, {
  align: 'center',
  valign: 'middle',
  content: '...'
});
const listBar = grid.set(11, 0, 1, 8, ListBar.build, {
  top: 'center',
  left: 'center',
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
});
tables.process.focus();
screen.render();
screen.on(RESIZE, () => {
  charts.cpuLine.emit(ATTACH);
  charts.memLine.emit(ATTACH);
  charts.memDonut.emit(ATTACH);
  charts.swapDonut.emit(ATTACH);
  charts.networkSparkline.emit(ATTACH);
  charts.diskDonut.emit(ATTACH);
  tables.process.emit(ATTACH);
  listBar.emit(ATTACH);
  box.emit(ATTACH);
});
screen.key(['escape', 'q', 'C-c'], (ch, key) => {
  screen.destroy();
  process.exit(0);
});
async function init() {
  const cpu = new Cpu(); //no Windows support

  const mem = new Mem();
  const net = new Net();
  const disk = new Disk();
  const proc = new Proc(); // no Windows support

  screen.key(['m', 'c', 'p'], async (ch, key) => {
    proc.readKey = ch;
    proc.resetIndex = true;
    await si.processes().then(data => {
      tables.process.update(proc.dataToTable(data));
      proc.tryReset(tables.process);
      screen.render();
    });
  });
  screen.emit('adjourn');
  await Promise.allSettled([cpu.setInterval(1000, seriesCollection => {
    charts.cpuLine.update(seriesCollection), screen.render();
  }), mem.setInterval(1000, seriesCollection => {
    charts.memLine.update(seriesCollection);
    charts.memDonut.update(mem.memSnapshot());
    charts.swapDonut.update(mem.swapSnapshot());
    screen.render();
  }), net.setInterval(1000, seriesCollection => {
    charts.networkSparkline.update(seriesCollection), screen.render();
  }), proc.setInterval(3000, table => {
    tables.process.update(table), proc.tryReset(tables.process), screen.render();
  }), disk.setInterval(10000, seriesCollection => {
    charts.diskDonut.update(seriesCollection), screen.render();
  })]);
}
process.on(UNCAUGHT_EXCEPTION, err => {// avoid exiting due to unsupported system resources in Windows
});

export { init };
