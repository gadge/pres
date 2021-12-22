import { Escape }                     from '@valjoux/linger'
import { init, iso }                  from '@vect/vector-init'
import { mapper }                     from '@vect/vector-mapper'
import { mutazip }                    from '@vect/vector-zipper'
import si                             from 'systeminformation'
import { COLOR_COLLECTION, COLOR_NO } from '../assets/COLOR_COLLECTION.js'
import { queue }                      from '../util/index.js'

export class Cpu extends Escape {
  on = true
  seriesCollection = []
  constructor() {
    super(si.currentLoad, 'overtime')
  }
  static build() { return new Cpu() }
  initSeriesCollection(cpuCollection) {
    return this.seriesCollection = mapper(
      cpuCollection,
      (cpu, i) => ( {
        title: 'CPU' + ( i + 1 ),
        style: { line: COLOR_COLLECTION[i % COLOR_NO] },
        x: init(61, i => 60 - i),
        y: iso(61, 0),
      } )
    )
  }
  updateSeriesCollection(cpuCollection) {
    return mutazip(this.seriesCollection, cpuCollection, (series, cpu, i) => {
      let loadInfo = cpu.load.toFixed(1).toString()
      while (loadInfo.length < 6) loadInfo = ' ' + loadInfo
      series.title = 'CPU' + ( ++i ) + loadInfo + '%'
      queue(series.y, cpu.load)
      return series
    })
  }

  async setInterval(ms, pipe) {
    await si.currentLoad().then(data => pipe(this.initSeriesCollection(data.cpus)))
    await super.setInterval(ms, data => pipe(this.updateSeriesCollection(data.cpus)))
  }
}

