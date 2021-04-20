/**
 * checkbox.js - checkbox element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { BLUR, CHECK, CLICK, FOCUS, KEYPRESS, UNCHECK, } from '@pres/enum-events'
import { ENTER, SPACE, }                                 from '@pres/enum-key-names'
import { Input }                                         from './input'

export class Checkbox extends Input {
  /**
   * Checkbox
   */
  constructor(options = {}) {
    super(options)
    const self = this
    // if (!(this instanceof Node)) return new Checkbox(options)

    this.text = options.content || options.text || ''
    this.checked = this.value = options.checked || false

    this.on(KEYPRESS, function (ch, key) {
      if (key.name === ENTER || key.name === SPACE) {
        self.toggle()
        self.screen.render()
      }
    })

    if (options.mouse) {
      this.on(CLICK, function () {
        self.toggle()
        self.screen.render()
      })
    }

    this.on(FOCUS, function () {
      const lpos = self.lpos
      if (!lpos) return
      self.screen.program.lsaveCursor('checkbox')
      self.screen.program.cup(lpos.yi, lpos.xi + 1)
      self.screen.program.showCursor()
    })

    this.on(BLUR, function () {
      self.screen.program.lrestoreCursor('checkbox', true)
    })
    this.type = 'checkbox'
    // console.log(`>>> ${this.type} created, uid = ${this.uid}`)
  }
  render() {
    // console.log('>>> checkbox rendered')
    this.clearPos(true)
    this.setContent('[' + (this.checked ? 'x' : ' ') + '] ' + this.text, true)
    return this._render()
  }
  check() {
    if (this.checked) return
    this.checked = this.value = true
    this.emit(CHECK)
  }
  uncheck() {
    if (!this.checked) return
    this.checked = this.value = false
    this.emit(UNCHECK)
  }
  toggle() {
    return this.checked
      ? this.uncheck()
      : this.check()
  }
}






