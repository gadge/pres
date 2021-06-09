import {
  Amber, Blue, Cyan, DeepOrange, DeepPurple, Green, Indigo, LightBlue, LightGreen, Lime, Orange, Pink, Purple, Red,
  Teal, Yellow,
}                      from '@palett/cards'
import { AsyncLooper } from '@valjoux/linger'
import { mapper }      from '@vect/vector-mapper'
import { mutazip }     from '@vect/vector-zipper'
import { iso, init }   from '@vect/vector-init'
import si              from 'systeminformation'

const COLOR_COLLECTION = [
  Red.base,
  Pink.base,
  Purple.base,
  DeepPurple.base,
  Indigo.base,
  Blue.base,
  LightBlue.base,
  Cyan.base,
  Teal.base,
  Green.base,
  LightGreen.base,
  Lime.base,
  Yellow.base,
  Amber.base,
  Orange.base,
  DeepOrange.base,
]
const COLOR_NO = COLOR_COLLECTION.length

export class Cpu extends AsyncLooper {
  constructor(lineChart) {
    super(si.currentLoad)
    this.chart = lineChart
    this.seriesCollection = []
  }
  async run() {
    const updateData = this.updateData.bind(this)
    await si.currentLoad().then(data => {
      this.seriesCollection = mapper(
        data.cpus,
        (cpu, i) => ( {
          title: 'CPU' + ( i + 1 ),
          style: { line: COLOR_COLLECTION[i % COLOR_NO] },
          x: init(61, i => 60 - i),
          y: iso(61, 0),
        } )
      )
      this.updateData(data)
    })
    await this.setInterval(1000, updateData)
  }
  updateData({ cpus }) {
    mutazip(this.seriesCollection, cpus, (series, cpu, i) => {
      let loadInfo = cpu.load.toFixed(1).toString()
      while (loadInfo.length < 6) loadInfo = ' ' + loadInfo
      series.title = 'CPU' + ( ++i ) + loadInfo + '%'
      series.y.shift(), series.y.push(cpu.load)
      return series
    })
    this.chart.setData(this.seriesCollection)
    this.chart.screen.render()
  }
}

