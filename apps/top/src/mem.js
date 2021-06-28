import { COLOR_COLLECTION } from '@pres/fin/assets/COLOR_COLLECTION'
import { Escape }           from '@valjoux/linger'
import { last }             from '@vect/vector'
import { init, iso }        from '@vect/vector-init'
import si                   from 'systeminformation'
import { queue, utils }     from '../util'

export class Mem extends Escape {
  seriesCollection = []
  on = true
  constructor() {
    super(si.mem)
  }
  initSeriesCollection() {
    return this.seriesCollection = [
      {
        title: 'Memory',
        style: { line: COLOR_COLLECTION[0], },
        x: init(61, i => 60 - i),
        y: iso(61, 0),
      },
      {
        title: 'Swap',
        style: { line: COLOR_COLLECTION[1], },
        x: init(61, i => 60 - i),
        y: iso(61, 0),
      },
    ]
  }
  updateSeriesCollection(data) {
    const { available, total, swapfree, swaptotal } = data
    const memRatio = ( 100 * ( 1 - available / total ) ).toFixed()
    let swapRatio = ( 100 * ( 1 - swapfree / swaptotal ) ).toFixed()
    swapRatio = isNaN(swapRatio) ? 0 : swapRatio
    this.seriesCollection[0].subtitle = utils.humanFileSize(total - available) + ' of ' + utils.humanFileSize(total)
    this.seriesCollection[1].subtitle = utils.humanFileSize(swaptotal - swapfree) + ' of ' + utils.humanFileSize(swaptotal)
    queue(this.seriesCollection[0].y, memRatio)
    queue(this.seriesCollection[1].y, swapRatio)
    return this.seriesCollection
  }
  memSnapshot() {
    const { seriesCollection } = this
    return [ {
      percent: last(seriesCollection[0].y) / 100,
      label: seriesCollection[0].subtitle,
      color: COLOR_COLLECTION[0],
    }, ]
  }
  swapSnapshot() {
    const { seriesCollection } = this
    return [ {
      percent: last(seriesCollection[1].y) / 100,
      label: seriesCollection[1].subtitle,
      color: COLOR_COLLECTION[1],
    }, ]
  }
  async setInterval(ms, pipe) {
    this.initSeriesCollection()
    await si.mem().then(data => data |> this.updateSeriesCollection |> pipe)
    await super.setInterval(ms, data => data|> this.updateSeriesCollection |> pipe)
  }
}

