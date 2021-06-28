import { COLOR_COLLECTION } from '@pres/fin/assets/COLOR_COLLECTION'
import { Escape }           from '@valjoux/linger'
import si                   from 'systeminformation'
import { humanScale }       from '../util'

export class Disk extends Escape {
  seriesCollection = []
  on = true
  constructor() {
    super(si.fsSize)
  }
  initSeriesCollection() {
    this.seriesCollection = [ {} ]
  }
  updateSeriesCollection(data) {
    const [ disk ] = data
    const [ series ] = this.seriesCollection
    series.percent = disk.use / 100
    series.label = humanScale(disk.used, true) + ' of ' + humanScale(disk.size, true)
    series.color = COLOR_COLLECTION[5]
    return this.seriesCollection
  }
  async setInterval(ms, pipe) {
    this.initSeriesCollection()
    await super.setInterval(ms, data => data|> this.updateSeriesCollection |> pipe)
  }
}

