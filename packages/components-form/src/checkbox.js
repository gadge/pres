/**
 * checkbox.js - checkbox element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { Node }  from '@pres/components-core'
import { Input } from './input'

export class Checkbox extends Input {
  /**
   * Checkbox
   */
  constructor(options = {}) {
    super(options)
    const self = this
    if (!(this instanceof Node)) return new Checkbox(options)

    this.text = options.content || options.text || ''
    this.checked = this.value = options.checked || false

    this.on('keypress', function (ch, key) {
      if (key.name === 'enter' || key.name === 'space') {
        self.toggle()
        self.screen.render()
      }
    })

    if (options.mouse) {
      this.on('click', function () {
        self.toggle()
        self.screen.render()
      })
    }

    this.on('focus', function () {
      const lpos = self.lpos
      if (!lpos) return
      self.screen.program.lsaveCursor('checkbox')
      self.screen.program.cup(lpos.yi, lpos.xi + 1)
      self.screen.program.showCursor()
    })

    this.on('blur', function () {
      self.screen.program.lrestoreCursor('checkbox', true)
    })
    this.type = 'checkbox'
  }
  render() {
    this.clearPos(true)
    this.setContent('[' + (this.checked ? 'x' : ' ') + '] ' + this.text, true)
    return this._render()
  }
  check() {
    if (this.checked) return
    this.checked = this.value = true
    this.emit('check')
  }
  uncheck() {
    if (!this.checked) return
    this.checked = this.value = false
    this.emit('uncheck')
  }
  toggle() {
    return this.checked
      ? this.uncheck()
      : this.check()
  }
}






