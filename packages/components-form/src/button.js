/**
 * button.js - button element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { Input } from './input'

export class Button extends Input {
  /**
   * Button
   */
  constructor(options = {}){
    if (options.autoFocus == null) options.autoFocus = false
    super(options)
    const self = this

    // if (!(this instanceof Node)) return new Button(options)

    this.on('keypress', function (ch, key) {
      if (key.name === 'enter' || key.name === 'space') {
        return self.press()
      }
    })

    if (this.options.mouse) {
      this.on('click', function () {
        return self.press()
      })
    }
    this.type = 'button'
  }
  press() {
    this.focus()
    this.value = true
    const result = this.emit('press')
    delete this.value
    return result
  }
}






