import { Red, Pink, Purple, DeepPurple, Indigo, Blue, LightBlue, Cyan, Teal, Green, LightGreen, Lime, Yellow, Amber, Orange, DeepOrange, BlueGrey } from '@palett/cards';
import { RESIZE, ATTACH, UNCAUGHT_EXCEPTION } from '@pres/enum-events';
import { Pres } from '@pres/terminal-interface';
import { AsyncLooper } from '@valjoux/linger';
import { mapper } from '@vect/vector-mapper';
import { mutazip } from '@vect/vector-zipper';
import { init as init$1, iso } from '@vect/vector-init';
import si from 'systeminformation';
import { roundD1 } from '@aryth/math';

const COLOR_COLLECTION = [Red.base, Pink.base, Purple.base, DeepPurple.base, Indigo.base, Blue.base, LightBlue.base, Cyan.base, Teal.base, Green.base, LightGreen.base, Lime.base, Yellow.base, Amber.base, Orange.base, DeepOrange.base];
const COLOR_NO = COLOR_COLLECTION.length;
class Cpu extends AsyncLooper {
  constructor(lineChart) {
    super(si.currentLoad);
    this.chart = lineChart;
    this.seriesCollection = [];
  }

  async run() {
    const updateData = this.updateData.bind(this);
    await si.currentLoad().then(data => {
      this.seriesCollection = mapper(data.cpus, (cpu, i) => ({
        title: 'CPU' + (i + 1),
        style: {
          line: COLOR_COLLECTION[i % COLOR_NO]
        },
        x: init$1(61, i => 60 - i),
        y: iso(61, 0)
      }));
      this.updateData(data);
    });
    await this.setInterval(1000, updateData);
  }

  updateData({
    cpus
  }) {
    mutazip(this.seriesCollection, cpus, (series, cpu, i) => {
      let loadInfo = cpu.load.toFixed(1).toString();

      while (loadInfo.length < 6) loadInfo = ' ' + loadInfo;

      series.title = 'CPU' + ++i + loadInfo + '%';
      series.y.shift(), series.y.push(cpu.load);
      return series;
    });
    this.chart.setData(this.seriesCollection);
    this.chart.screen.render();
  }

}

const utils = {};

utils.humanFileSize = function (bytes, isDecimal) {
  isDecimal = typeof isDecimal !== 'undefined' ? isDecimal : false;
  if (!bytes) return '0.00 B';
  const base = isDecimal ? 1000 : 1024;
  const e = ~~(Math.log(bytes) / Math.log(base));
  return (bytes / Math.pow(base, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + (isDecimal || e == 0 ? '' : 'i') + 'B';
};

utils.colors = ['magenta', 'cyan', 'blue', 'yellow', 'green', 'red'];

const colors$1 = utils.colors;
class Mem {
  constructor(line, memDonut, swapDonut) {
    this.line = line;
    this.memDonut = memDonut;
    this.swapDonut = swapDonut;
    si.mem(data => {
      this.memData = [{
        title: 'Memory',
        style: {
          line: colors$1[0]
        },
        x: Array(61).fill().map((_, i) => 60 - i),
        y: Array(61).fill(0)
      }, {
        title: 'Swap',
        style: {
          line: colors$1[1]
        },
        x: Array(61).fill().map((_, i) => 60 - i),
        y: Array(61).fill(0)
      }];
      this.updateData(data);
      this.interval = setInterval(() => {
        si.mem(data => {
          this.updateData(data);
        });
      }, 1000);
    });
  }

  updateData(data) {
    const memPer = (100 * (1 - data.available / data.total)).toFixed();
    let swapPer = (100 * (1 - data.swapfree / data.swaptotal)).toFixed();
    swapPer = isNaN(swapPer) ? 0 : swapPer;
    this.memData[0].y.shift();
    this.memData[0].y.push(memPer);
    this.memData[1].y.shift();
    this.memData[1].y.push(swapPer);
    const memTitle = utils.humanFileSize(data.total - data.available) + ' of ' + utils.humanFileSize(data.total);
    const swapTitle = utils.humanFileSize(data.swaptotal - data.swapfree) + ' of ' + utils.humanFileSize(data.swaptotal);
    this.line.setData(this.memData);
    this.memDonut.setData([{
      percent: memPer / 100,
      label: memTitle,
      color: colors$1[0]
    }]);
    this.swapDonut.setData([{
      percent: swapPer / 100,
      label: swapTitle,
      color: colors$1[1]
    }]);
    this.line.screen.render();
  }

}

class Net {
  constructor(sparkline) {
    this.sparkline = sparkline;
    this.netData = [Array(61).fill(0), Array(61).fill(0)];
    si.networkInterfaceDefault(iface => {
      const that = this;

      const updater = () => si.networkStats(iface, data => {
        that.updateData(data[0]);
      });

      updater();
      this.interval = setInterval(updater, 1000);
    });
  }

  updateData(data) {
    const rx_sec = Math.max(0, data['rx_sec']);
    const tx_sec = Math.max(0, data['tx_sec']);
    this.netData[0].shift();
    this.netData[0].push(rx_sec);
    this.netData[1].shift();
    this.netData[1].push(tx_sec);
    let rx_label = 'Receiving:      ' + utils.humanFileSize(rx_sec) + '/s \nTotal received: ' + utils.humanFileSize(data['rx_bytes']);
    let tx_label = 'Transferring:      ' + utils.humanFileSize(tx_sec) + '/s \nTotal transferred: ' + utils.humanFileSize(data['tx_bytes']);
    this.sparkline.setData([rx_label, tx_label], this.netData);
    this.sparkline.screen.render();
  }

}

const colors = utils.colors;
class Disk {
  constructor(donut) {
    this.donut = donut;
    si.fsSize(data => this.updateData(data));
    this.interval = setInterval(() => si.fsSize(data => this.updateData(data)), 10000);
  }

  updateData(data) {
    const disk = data[0];
    const label = utils.humanFileSize(disk.used, true) + ' of ' + utils.humanFileSize(disk.size, true);
    this.donut.setData([{
      percent: disk.use / 100,
      label: label,
      color: colors[5]
    }]);
    this.donut.screen.render();
  }

}

const SP = ' ';

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
class Proc extends AsyncLooper {
  constructor(table) {
    super(si.processes);
    /** @type {DataTable} */

    this.selectedLabel = 'cpu';
    this.resetIndex = false;
    this.reverse = false;
    this.table = table;
  }

  set readKey(ch) {
    if (this.selectedLabel === KEY_TO_LABEL[ch]) {
      this.reverse = !this.reverse;
    } else {
      this.selectedLabel = KEY_TO_LABEL[ch] || this.selectedLabel;
    }
  }

  get headers() {
    const headers = HEADERS.slice();
    headers[LABEL_TO_INDEX[this.selectedLabel]] += this.reverse ? '▲' : '▼';
    return headers;
  }

  async run() {
    const updateData = this.updateData.bind(this);
    this.table.screen.key(['m', 'c', 'p'], async (ch, key) => {
      this.readKey = ch;
      this.resetIndex = true;
      await si.processes().then(updateData);
    });
    await this.setInterval(3000, updateData); // setInterval(updater, 3000)
  }

  updateData(data) {
    const key = this.selectedLabel;
    data = data.list.sort((a, b) => b[key] - a[key]).map(({
      command,
      cpu,
      mem,
      pid
    }) => [pid, command, SP + roundD1(cpu), roundD1(mem)]);
    this.table.setData({
      headers: this.headers,
      data: this.reverse ? data.reverse() : data
    });
    if (this.resetIndex) this.resetIndex = void this.table.rows.select(0); // this.resetIndex switched to false

    this.table.screen.render();
  }

}

const screen = Pres.screen({
  padding: 1
});
const grid = Pres.grid({
  rows: 12,
  cols: 12,
  screen: screen
});
const lineChartCPU = grid.set(0, 0, 5, 12, Pres.lineChart, {
  name: 'lineChart',
  showNthLabel: 5,
  maxY: 100,
  label: 'CPU History',
  showLegend: true
});
const lineChartMem = grid.set(5, 0, 2, 6, Pres.lineChart, {
  showNthLabel: 5,
  maxY: 100,
  label: 'Memory and Swap History',
  showLegend: true,
  legend: {
    width: 10
  }
});
const sparklineNetwork = grid.set(7, 0, 2, 6, Pres.sparkline, {
  label: 'Network History',
  tags: true,
  style: {
    fg: 'blue'
  }
});
const tableProcesses = grid.set(5, 6, 4, 6, Pres.dataTable, {
  keys: true,
  label: 'Processes',
  columnSpacing: 1,
  columnWidth: [7, 24, 7, 7]
});
const donutChartDisk = grid.set(9, 0, 2, 4, Pres.donutChart, {
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  remainColor: 'black',
  label: 'Disk usage'
});
const donutChartMem = grid.set(9, 4, 2, 4, Pres.donutChart, {
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  remainColor: 'black',
  label: 'Memory'
});
const donutChartSwap = grid.set(9, 8, 2, 4, Pres.donutChart, {
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  remainColor: 'black',
  label: 'Swap'
});
const box = grid.set(11, 8, 1, 4, Pres.box, {
  align: 'center',
  valign: 'middle',
  content: '...'
});
const listBar = grid.set(11, 0, 1, 8, Pres.listBar, {
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
tableProcesses.focus();
screen.render();
screen.on(RESIZE, () => {
  lineChartCPU.emit(ATTACH);
  lineChartMem.emit(ATTACH);
  donutChartMem.emit(ATTACH);
  donutChartSwap.emit(ATTACH);
  sparklineNetwork.emit(ATTACH);
  donutChartDisk.emit(ATTACH);
  tableProcesses.emit(ATTACH);
  listBar.emit(ATTACH);
  box.emit(ATTACH);
});
screen.key(['escape', 'q', 'C-c'], (ch, key) => process.exit(0));
async function init() {
  const cpu = new Cpu(lineChartCPU); //no Windows support

  new Mem(lineChartMem, donutChartMem, donutChartSwap);
  new Net(sparklineNetwork);
  new Disk(donutChartDisk);
  const proc = new Proc(tableProcesses); // no Windows support

  screen.emit('adjourn');
  await Promise.all([cpu.run(), proc.run()]);
}
process.on(UNCAUGHT_EXCEPTION, err => {// avoid exiting due to unsupported system resources in Windows
});

export { Cpu, Disk, Mem, Net, Proc, init };
