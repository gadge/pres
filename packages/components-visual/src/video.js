/**
 * video.js - video element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box, Terminal } from '@pres/components-core'
import cp                from 'child_process'

import { ATTACH, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEWLISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHTEXCEPTION, WARNING, } from '@pres/enum-events'

export class  Video extends Box {
  /**
   * Video
   */
  constructor(options = {}) {
    super(options)
    const self = this
    let
      shell,
      args
    // if (!(this instanceof Node)) { return new Video(options) }
    if (this.exists('mplayer')) {
      shell = 'mplayer'
      args = [ '-vo', 'caca', '-quiet', options.file ]
    } else if (this.exists('mpv')) {
      shell = 'mpv'
      args = [ '--vo', 'caca', '--really-quiet', options.file ]
    } else {
      this.parseTags = true
      this.setContent('{red-fg}{bold}Error:{/bold}'
        + ' mplayer or mpv not installed.{/red-fg}')
      return this
    }

    const opts = {
      parent: this,
      left: 0,
      top: 0,
      width: this.width - this.iwidth,
      height: this.height - this.iheight,
      shell: shell,
      args: args.slice()
    }

    this.now = Date.now() / 1000 | 0
    this.start = opts.start || 0
    if (this.start) {
      if (shell === 'mplayer') {
        opts.args.unshift('-ss', this.start + '')
      } else if (shell === 'mpv') {
        opts.args.unshift('--start', this.start + '')
      }
    }

    const DISPLAY = process.env.DISPLAY
    delete process.env.DISPLAY
    this.tty = new Terminal(opts)
    process.env.DISPLAY = DISPLAY

    this.on(CLICK, function () {
      self.tty.pty.write('p')
    })

    // mplayer/mpv cannot resize itself in the terminal, so we have
    // to restart it at the correct start time.
    this.on(RESIZE, function () {
      self.tty.destroy()

      const opts = {
        parent: self,
        left: 0,
        top: 0,
        width: self.width - self.iwidth,
        height: self.height - self.iheight,
        shell: shell,
        args: args.slice()
      }

      const watched = (Date.now() / 1000 | 0) - self.now
      self.now = Date.now() / 1000 | 0
      self.start += watched
      if (shell === 'mplayer') {
        opts.args.unshift('-ss', self.start + '')
      } else if (shell === 'mpv') {
        opts.args.unshift('--start', self.start + '')
      }

      const DISPLAY = process.env.DISPLAY
      delete process.env.DISPLAY
      self.tty = new Terminal(opts)
      process.env.DISPLAY = DISPLAY
      self.screen.render()
    })
    this.type = 'video'
  }
  exists(program) {
    try {
      return !!+cp.execSync('type '
        + program + ' > /dev/null 2> /dev/null'
        + ' && echo 1', { encoding: 'utf8' }).trim()
    } catch (e) {
      return false
    }
  }
}


/**
 * Expose
 */


