/**
 * loading.js - loading element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { Box }  from '@pres/components-core'
import { Text } from '@pres/components-text'

export class Loading extends Box {
  /**
   * Loading
   */
  constructor(options = {}) {
    super(options)
    // if (!(this instanceof Node)) return new Loading(options)
    this._.icon = new Text({
      parent: this,
      align: 'center',
      top: 2,
      left: 1,
      right: 1,
      height: 1,
      content: '|'
    })
    this.type = 'loading'
  }
  static build(options) { return new Loading(options) }
  load(text) {
    const self = this
    // XXX Keep above:
    // var parent = this.parent;
    // this.detach();
    // parent.append(this);
    this.show()
    this.setContent(text)
    if (this._.timer) this.stop()
    this.screen.lockKeys = true
    this._.timer = setInterval(() => {
      const { icon } = self._, { content } = icon
      if (content === '|') { icon.setContent('/') }
      else if (content === '/') { icon.setContent('-') }
      else if (content === '-') { icon.setContent('\\') }
      else if (content === '\\') { icon.setContent('|') }
      self.screen.render()
    }, 200)
  }
  stop() {
    this.screen.lockKeys = false
    this.hide()
    if (this._.timer) {
      clearInterval(this._.timer)
      delete this._.timer
    }
    this.screen.render()
  }
}
