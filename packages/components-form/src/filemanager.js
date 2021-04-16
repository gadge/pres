/**
 * filemanager.js - file manager element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { List }    from '@pres/components-data'
import { helpers } from '@pres/util-helpers'
import fs          from 'fs'
import path        from 'path'

import { ATTACH, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEWLISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHTEXCEPTION, WARNING, } from '@pres/enum-events'

export class  FileManager extends List {
  /**
   * FileManager
   */
  constructor(options = {}) {
    options.parseTags = true
    super(options)
    const self = this
    // if (!(this instanceof Node)) return new FileManager(options)
    // options.label = ' {blue-fg}%path{/blue-fg} ';
    // List.call(this, options)
    this.cwd = options.cwd || process.cwd()
    this.file = this.cwd
    this.value = this.cwd
    if (options.label && ~options.label.indexOf('%path')) {
      this._label.setContent(options.label.replace('%path', this.cwd))
    }
    this.on('select', function (item) {
      const value = item.content.replace(/\{[^{}]+\}/g, '').replace(/@$/, ''),
        file = path.resolve(self.cwd, value)
      return fs.stat(file, function (err, stat) {
        if (err) {
          return self.emit('error', err, file)
        }
        self.file = file
        self.value = file
        if (stat.isDirectory()) {
          self.emit('cd', file, self.cwd)
          self.cwd = file
          if (options.label && ~options.label.indexOf('%path')) {
            self._label.setContent(options.label.replace('%path', file))
          }
          self.refresh()
        } else {
          self.emit('file', file)
        }
      })
    })
    this.type = 'file-manager'
  }
  refresh(cwd, callback) {
    if (!callback) {
      callback = cwd
      cwd = null
    }

    const self = this

    if (cwd) this.cwd = cwd
    else cwd = this.cwd

    return fs.readdir(cwd, function (err, list) {
      if (err && err.code === 'ENOENT') {
        self.cwd = cwd !== process.env.HOME
          ? process.env.HOME
          : '/'
        return self.refresh(callback)
      }

      if (err) {
        if (callback) return callback(err)
        return self.emit('error', err, cwd)
      }

      let dirs = [],
        files = []

      list.unshift('..')

      list.forEach(function (name) {
        const f = path.resolve(cwd, name)
        let stat

        try {
          stat = fs.lstatSync(f)
        } catch (e) {

        }

        if ((stat && stat.isDirectory()) || name === '..') {
          dirs.push({
            name: name,
            text: '{light-blue-fg}' + name + '{/light-blue-fg}/',
            dir: true
          })
        } else if (stat && stat.isSymbolicLink()) {
          files.push({
            name: name,
            text: '{light-cyan-fg}' + name + '{/light-cyan-fg}@',
            dir: false
          })
        } else {
          files.push({
            name: name,
            text: name,
            dir: false
          })
        }
      })

      dirs = helpers.asort(dirs)
      files = helpers.asort(files)

      list = dirs.concat(files).map(function (data) {
        return data.text
      })

      self.setItems(list)
      self.select(0)
      self.screen.render()

      self.emit('refresh')

      if (callback) callback()
    })
  }
  pick(cwd, callback) {
    if (!callback) {
      callback = cwd
      cwd = null
    }

    const self = this,
      focused = this.screen.focused === this,
      hidden = this.hidden
    let onfile,
      oncancel

    function resume() {
      self.removeListener('file', onfile)
      self.removeListener(CANCEL, oncancel)
      if (hidden) {
        self.hide()
      }
      if (!focused) {
        self.screen.restoreFocus()
      }
      self.screen.render()
    }

    this.on('file', onfile = function (file) {
      resume()
      return callback(null, file)
    })

    this.on(CANCEL, oncancel = function () {
      resume()
      return callback()
    })

    this.refresh(cwd, function (err) {
      if (err) return callback(err)

      if (hidden) {
        self.show()
      }

      if (!focused) {
        self.screen.saveFocus()
        self.focus()
      }

      self.screen.render()
    })
  }
  reset(cwd, callback) {
    if (!callback) {
      callback = cwd
      cwd = null
    }
    this.cwd = cwd || this.options.cwd
    this.refresh(callback)
  }
}




