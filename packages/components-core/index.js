import { Node }              from '@pres/components-node'
import { Box }               from './core/box'
import { Element }           from './core/element'
import { Screen }            from './core/screen'
import { ScrollableElement } from './core/scrollableelement'
import { Layout }            from './src/layout'
import { Line }              from './src/line'
import { Log }               from './src/log'
import { ScrollableBox }     from './src/scrollablebox'
import { ScrollableText }    from './src/scrollabletext'
import { Terminal }          from './src/terminal'

// const nodes = {
//   Node: NodeFile.Node,
//   Box: BoxFile.Box,
//   Element: ElementFile.Element,
//   Screen: ScreenFile.Screen,
//   Layout: LayoutFile.Layout,
//   Line: LineFile.Line,
//   Log: LogFile.Log,
//   ScrollableBox: ScrollableBoxFile.ScrollableBox,
//   ScrollableText: ScrollableTextFile.ScrollableText,
//   Terminal: TerminalFile.Terminal,
// }
export { ScrollableElement }
export { Node }
export { Element }
export { Screen }
export { Box }
export { Layout }
export { Line }
export { Log }
export { ScrollableBox }
export { ScrollableText }
export { Terminal }
// class Core {
//   static _screen
//   static _element
//   static get Screen() {
//     if (!Core._screen) Core._screen = Screen
//     return Core._screen
//   }
//   static get Element() {
//     if (!Core._element) Core._element = Element
//     return Core._element
//   }
// }
//
// export { Core as TUIComponentsCore }

// export {
//   Node,
//   Element,
//   Box,
//   Screen,
//   Log,
//   ScrollableBox,
//   ScrollableText,
//   Layout,
//   Lie,
//   Terminal,
// }