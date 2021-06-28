import { Box }     from '@pres/components-core'
import { ATTACH }  from '@pres/enum-events'
import { RN }      from '@texting/enum-chars'
import { iterate } from '@vect/vector-mapper'
import { zipper }  from '@vect/vector-zipper'
import sparkline   from 'sparkline'

export class Sparkline extends Box {
  constructor(options = {}) {
    // // if (!(this instanceof Node)) { return new Sparkline(options) }
    // options = options || {}
    options.bufferLength = options.bufferLength || 30
    options.style = options.style || {}
    options.style.titleFg = options.style.titleFg || 'white'
    if (!options.sku) options.sku = 'sparkline'
    super(options)
    const self = this
    // this.options = options
    // super(options) // Mixin.assign(this, new Box(options)) // Box.call(this, options)
    this.on(ATTACH, () => { if (self.options.data) { self.setData(self.options.data.titles, self.options.data.data) } })
    this.type = 'sparkline'
  }
  static build(options) { return new Sparkline(options) }
  /** @deprecated */
  setData(titles, datasets) {
    this.update(zipper(datasets, titles, (vec, title) => ( vec.title = title, vec )))
  }
  update(titledVectors) {
    const fg = this.options.style.titleFg
    let content = RN
    iterate(titledVectors, titledVector => {
      content += '{bold}{' + fg + '-fg}' + titledVector.title + ':{/' + fg + '-fg}{/bold}' + RN
      content += sparkline(titledVector.slice(0, this.width - 2)) + RN + RN
    })
    // for (let i = 0; i < titledVectors.length; i++) {
    //   res += '{bold}{' + fg + '-fg}' + titledVectors[i].title + ':{/' + fg + '-fg}{/bold}\r\n'
    //   res += sparkline(titledVectors[i].slice(0, this.width - 2)) + '\r\n\r\n'
    // }
    this.setContent(content)
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
        data: [
          [ 10, 20, 30, 20, 50, 70, 60, 30, 35, 38 ],
          [ 40, 10, 40, 50, 20, 30, 20, 20, 19, 40 ],
        ]
      }
    }
  }
}
