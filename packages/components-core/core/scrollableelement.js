import { assign }        from '@ject/mixin'
import { ScrollableBox } from '../src/scrollablebox'
import { Element }       from './element'

export class ScrollableElement extends Element {
  type = 'element'
  /**
   * Element
   */
  constructor(options = {}) {
    super(options)
    this._injectScrollableBox(options)
  }
  _injectScrollableBox(options) {
    Object
      .getOwnPropertyNames(ScrollableBox.prototype)
      .forEach(
        function (key) {
          if (key === 'type') return
          const desc = Object.getOwnPropertyDescriptor(ScrollableBox.prototype, key)
          Object.defineProperty(this, key, desc)
        },
        this
      )
    this._ignore = true
    assign(this, new ScrollableBox(options)) // ScrollableBox.call(this, options)
    delete this._ignore
  }
}