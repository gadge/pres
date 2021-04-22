import { Box }    from '@pres/components-core'
import { ATTACH } from '@pres/enum-events'
import sparkline  from 'sparkline'

export class Sparkline extends Box {
  constructor(options = {}) {
    // // if (!(this instanceof Node)) { return new Sparkline(options) }
    // options = options || {}
    options.bufferLength = options.bufferLength || 30
    options.style = options.style || {}
    options.style.titleFg = options.style.titleFg || 'white'
    super(options)
    const self = this
    // this.options = options
    // super(options) // Mixin.assign(this, new Box(options)) // Box.call(this, options)
    this.on(ATTACH, () => { if (self.options.data) { self.setData(self.options.data.titles, self.options.data.data) } })
    this.type = 'sparkline'
  }
  setData(titles, datasets) {
    let res = '\r\n'
    for (let i = 0; i < titles.length; i++) {
      res += '{bold}{' + this.options.style.titleFg + '-fg}' + titles[i] + ':{/' + this.options.style.titleFg + '-fg}{/bold}\r\n'
      res += sparkline(datasets[i].slice(0, this.width - 2)) + '\r\n\r\n'
    }
    this.setContent(res)
  }
  getOptionsPrototype() {
    return {
      label: 'Sparkline',
      tags: true,
      border: { type: 'line', fg: 'cyan' },
      width: '50%',
      height: '50%',
      style: { fg: 'blue' },
      data: {
        titles: [ 'Sparkline1', 'Sparkline2' ],
        data: [ [ 10, 20, 30, 20, 50, 70, 60, 30, 35, 38 ],
          [ 40, 10, 40, 50, 20, 30, 20, 20, 19, 40 ] ]
      }
    }
  }
}

