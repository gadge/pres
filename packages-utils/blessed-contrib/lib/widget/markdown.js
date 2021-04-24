import { Box }          from '@pres/components-core'
import chalk            from 'chalk'
import marked           from 'marked'
import TerminalRenderer from 'marked-terminal'

export class Markdown extends Box {
  constructor(options) {
    // if (!(this instanceof Box)) { return new Markdown(options) }
    const markdownOptions = { style: options.markdownStyle }
    Markdown.prototype.evalStyles.call(null, markdownOptions)
    Markdown.prototype.setOptions.call(null, markdownOptions.style)
    // this.options = options
    super(options) // Mixin.assign(this, new Box(options)) // Box.call(this, options)
    if (options.markdown) this.setMarkdown(options.markdown)
    this.type = 'markdown'
  }
  setMarkdown(str) { this.setContent(marked(str)) }
  setOptions(style) { marked.setOptions({ renderer: new TerminalRenderer(style) }) }
  evalStyles(options) {
    if (!options.style) return
    for (let st in options.style) {
      if (typeof (options.style[st]) != 'string') continue
      const tokens = options.style[st].split('.')
      options.style[st] = chalk
      for (let j = 1; j < tokens.length; j++) { options.style[st] = options.style[st][tokens[j]] }
    }
  }
  getOptionsPrototype() {
    return {
      markdown: 'string',
      markdownStyle: 'object'
    }
  }
}
