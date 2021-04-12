export { Box }            from './core/box'
export { Element }        from './core/element'
export { Node }           from './core/node'
export { Screen }         from './core/screen'
export { Log }            from './src/log'
export { ScrollableBox }  from './src/scrollablebox'
export { ScrollableText } from './src/scrollabletext'
// export { Layout }  from './src/layout'
// export { Line }  from './src/line'
// export { Terminal }  from './src/terminal'

class Core {
  static _screen
  static _element
  static get Screen() {
    if (!Core._screen) Core._screen = Screen
    return Core._screen
  }
  static get Element() {
    if (!Core._element) Core._element = Element
    return Core._element
  }
}

export { Core as TUIComponentsCore }