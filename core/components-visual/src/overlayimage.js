/**
 * overlayimage.js - w3m image element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
import { Box }                                                            from '@pres/components-core'
import { ATTACH, DATA, DETACH, ERROR, EXIT, HIDE, RENDER, RESIZE, SHOW, } from '@pres/enum-events'
import * as helpers                                                       from '@pres/util-helpers'
import cp                                                                 from 'child_process'
import fs                                                                 from 'fs'

export class OverlayImage extends Box {
  /**
   * OverlayImage
   * Good example of w3mimgdisplay commands:
   * https://github.com/hut/ranger/blob/master/ranger/ext/img_display.py
   */
  constructor(options = {}) {
    super(options)
    const self = this
    // if (!(this instanceof Node)) { return new OverlayImage(options) }
    if (options.w3m) {
      OverlayImage.w3mdisplay = options.w3m
    }
    if (OverlayImage.hasW3MDisplay == null) {
      if (fs.existsSync(OverlayImage.w3mdisplay)) {
        OverlayImage.hasW3MDisplay = true
      }
      else if (options.search !== false) {
        const file = helpers.findFile('/usr', 'w3mimgdisplay') ||
          helpers.findFile('/lib', 'w3mimgdisplay') ||
          helpers.findFile('/bin', 'w3mimgdisplay')
        if (file) {
          OverlayImage.hasW3MDisplay = true
          OverlayImage.w3mdisplay = file
        }
        else {
          OverlayImage.hasW3MDisplay = false
        }
      }
    }
    this.on(HIDE, function () {
      self._lastFile = self.file
      self.clearImage()
    })
    this.on(SHOW, function () {
      if (!self._lastFile) return
      self.setImage(self._lastFile)
    })
    this.on(DETACH, function () {
      self._lastFile = self.file
      self.clearImage()
    })
    this.on(ATTACH, function () {
      if (!self._lastFile) return
      self.setImage(self._lastFile)
    })
    this.onScreenEvent(RESIZE, function () {
      self._needsRatio = true
    })
    // Get images to overlap properly. Maybe not worth it:
    // this.onScreenEvent(RENDER, function() {
    //   self.screen.program.flush();
    //   if (!self._noImage) return;
    //   function display(el, next) {
    //     if (el.type === 'w3mimage' && el.file) {
    //       el.setImage(el.file, next);
    //     } else {
    //       next();
    //     }
    //   }
    //   function done(el) {
    //     el.sub.forEach(recurse);
    //   }
    //   function recurse(el) {
    //     display(el, function() {
    //       var pending = el.sub.length;
    //       el.sub.forEach(function(el) {
    //         display(el, function() {
    //           if (!--pending) done(el);
    //         });
    //       });
    //     });
    //   }
    //   recurse(self.screen);
    // });
    this.onScreenEvent(RENDER, function () {
      self.screen.program.flush()
      if (!self._noImage) {
        self.setImage(self.file)
      }
    })
    if (this.options.file || this.options.img) {
      this.setImage(this.options.file || this.options.img)
    }
    this.type = 'overlayimage'
  }
  static build(options) { return new OverlayImage(options) }
  spawn(file, args, opt, callback) {
    const spawn = cp.spawn
    let ps

    opt = opt || {}
    ps = spawn(file, args, opt)
    ps.on(ERROR, function (err) {
      if (!callback) return
      return callback(err)
    })
    ps.on(EXIT, function (code) {
      if (!callback) return
      if (code !== 0) return callback(new Error('Exit Code: ' + code))
      return callback(null, code === 0)
    })
    return ps
  }
  setImage(img, callback) {
    const self = this
    if (this._settingImage) {
      this._queue = this._queue || []
      this._queue.push([ img, callback ])
      return
    }
    this._settingImage = true
    const reset = function () {
      self._settingImage = false
      self._queue = self._queue || []
      const item = self._queue.shift()
      if (item) {
        self.setImage(item[0], item[1])
      }
    }
    if (OverlayImage.hasW3MDisplay === false) {
      reset()
      if (!callback) return
      return callback(new Error('W3M Image Display not available.'))
    }
    if (!img) {
      reset()
      if (!callback) return
      return callback(new Error('No image.'))
    }
    this.file = img
    return this.getPixelRatio(function (err, ratio) {
      if (err) {
        reset()
        if (!callback) return
        return callback(err)
      }
      return self.renderImage(img, ratio, function (err, success) {
        if (err) {
          reset()
          if (!callback) return
          return callback(err)
        }
        if (self.shrink || self.options.autofit) {
          delete self.shrink
          delete self.options.shrink
          self.options.autofit = true
          return self.imageSize(function (err, size) {
            if (err) {
              reset()
              if (!callback) return
              return callback(err)
            }
            if (self._lastSize &&
              ratio.tw === self._lastSize.tw &&
              ratio.th === self._lastSize.th &&
              size.width === self._lastSize.width &&
              size.height === self._lastSize.height &&
              self.absL === self._lastSize.absL &&
              self.absT === self._lastSize.absT) {
              reset()
              if (!callback) return
              return callback(null, success)
            }
            self._lastSize = {
              tw: ratio.tw,
              th: ratio.th,
              width: size.width,
              height: size.height,
              absL: self.absL,
              absT: self.absT
            }
            self.pos.width = size.width / ratio.tw | 0
            self.pos.height = size.height / ratio.th | 0
            self._noImage = true
            self.screen.render()
            self._noImage = false

            reset()
            return self.renderImage(img, ratio, callback)
          })
        }
        reset()
        if (!callback) return
        return callback(null, success)
      })
    })
  }
  renderImage(img, ratio, callback) {
    const self = this
    if (cp.execSync) {
      callback = callback || function (err, result) { return result }
      try {
        return callback(null, this.renderImageSync(img, ratio))
      } catch (e) {
        return callback(e)
      }
    }
    if (OverlayImage.hasW3MDisplay === false) {
      if (!callback) return
      return callback(new Error('W3M Image Display not available.'))
    }
    if (!ratio) {
      if (!callback) return
      return callback(new Error('No ratio.'))
    }
    // clearImage unsets these:
    const _file = self.file
    const _lastSize = self._lastSize
    return self.clearImage(function (err) {
      if (err) return callback(err)
      self.file = _file
      self._lastSize = _lastSize
      const opt = {
        stdio: 'pipe',
        env: process.env,
        cwd: process.env.HOME
      }
      const ps = self.spawn(OverlayImage.w3mdisplay, [], opt, function (err, success) {
        if (!callback) return
        return err
          ? callback(err)
          : callback(null, success)
      })
      const width  = self.width * ratio.tw | 0,
            height = self.height * ratio.th | 0,
            absL  = self.absL * ratio.tw | 0,
            absT   = self.absT * ratio.th | 0
      const input = '0;1;'
        + absL + ';'
        + absT + ';'
        + width + ';'
        + height + ';;;;;'
        + img
        + '\n4;\n3;\n'
      self._props = {
        absL: absL,
        absT: absT,
        width: width,
        height: height
      }
      ps.stdin.write(input)
      ps.stdin.end()
    })
  }
  clearImage(callback) {
    if (cp.execSync) {
      callback = callback || function (err, result) { return result }
      try {
        return callback(null, this.clearImageSync())
      } catch (e) {
        return callback(e)
      }
    }
    if (OverlayImage.hasW3MDisplay === false) {
      if (!callback) return
      return callback(new Error('W3M Image Display not available.'))
    }
    if (!this._props) {
      if (!callback) return
      return callback(null)
    }
    const opt = {
      stdio: 'pipe',
      env: process.env,
      cwd: process.env.HOME
    }
    const ps = this.spawn(OverlayImage.w3mdisplay, [], opt, function (err, success) {
      if (!callback) return
      return err
        ? callback(err)
        : callback(null, success)
    })
    let width  = this._props.width + 2,
        height = this._props.height + 2,
        absL  = this._props.absL,
        absT   = this._props.absT
    if (this._drag) {
      absL -= 10
      absT -= 10
      width += 10
      height += 10
    }
    const input = '6;'
      + absL + ';'
      + absT + ';'
      + width + ';'
      + height
      + '\n4;\n3;\n'

    delete this.file
    delete this._props
    delete this._lastSize

    ps.stdin.write(input)
    ps.stdin.end()
  }
  imageSize(callback) {
    const img = this.file
    if (cp.execSync) {
      callback = callback || function (err, result) { return result }
      try {
        return callback(null, this.imageSizeSync())
      } catch (e) {
        return callback(e)
      }
    }
    if (OverlayImage.hasW3MDisplay === false) {
      if (!callback) return
      return callback(new Error('W3M Image Display not available.'))
    }
    if (!img) {
      if (!callback) return
      return callback(new Error('No image.'))
    }
    const opt = {
      stdio: 'pipe',
      env: process.env,
      cwd: process.env.HOME
    }
    const ps = this.spawn(OverlayImage.w3mdisplay, [], opt)
    let buf = ''

    ps.stdout.setEncoding('utf8')
    ps.stdout.on(DATA, function (data) {
      buf += data
    })
    ps.on(ERROR, function (err) {
      if (!callback) return
      return callback(err)
    })
    ps.on(EXIT, function () {
      if (!callback) return
      const size = buf.trim().split(/\s+/)
      return callback(null, {
        raw: buf.trim(),
        width: +size[0],
        height: +size[1]
      })
    })
    const input = '5;' + img + '\n'

    ps.stdin.write(input)
    ps.stdin.end()
  }
  termSize(callback) {
    const self = this
    if (cp.execSync) {
      callback = callback || function (err, result) { return result }
      try {
        return callback(null, this.termSizeSync())
      } catch (e) {
        return callback(e)
      }
    }
    if (OverlayImage.hasW3MDisplay === false) {
      if (!callback) return
      return callback(new Error('W3M Image Display not available.'))
    }
    const opt = {
      stdio: 'pipe',
      env: process.env,
      cwd: process.env.HOME
    }
    const ps = this.spawn(OverlayImage.w3mdisplay, [ '-test' ], opt)
    let buf = ''

    ps.stdout.setEncoding('utf8')
    ps.stdout.on(DATA, function (data) {
      buf += data
    })
    ps.on(ERROR, function (err) {
      if (!callback) return
      return callback(err)
    })
    ps.on(EXIT, function () {
      if (!callback) return
      if (!buf.trim()) {
        // Bug: w3mimgdisplay will sometimes
        // output nothing. Try again:
        return self.termSize(callback)
      }
      const size = buf.trim().split(/\s+/)
      return callback(null, {
        raw: buf.trim(),
        width: +size[0],
        height: +size[1]
      })
    })
    ps.stdin.end()
  }
  getPixelRatio(callback) {
    const self = this
    if (cp.execSync) {
      callback = callback || function (err, result) { return result }
      try {
        return callback(null, this.getPixelRatioSync())
      } catch (e) {
        return callback(e)
      }
    }
    // XXX We could cache this, but sometimes it's better
    // to recalculate to be pixel perfect.
    if (this._ratio && !this._needsRatio) {
      return callback(null, this._ratio)
    }
    return this.termSize(function (err, dimensions) {
      if (err) return callback(err)
      self._ratio = {
        tw: dimensions.width / self.screen.width,
        th: dimensions.height / self.screen.height
      }
      self._needsRatio = false
      return callback(null, self._ratio)
    })
  }
  renderImageSync(img, ratio) {
    if (OverlayImage.hasW3MDisplay === false) {
      throw new Error('W3M Image Display not available.')
    }
    if (!ratio) {
      throw new Error('No ratio.')
    }
    // clearImage unsets these:
    const _file = this.file
    const _lastSize = this._lastSize
    this.clearImageSync()
    this.file = _file
    this._lastSize = _lastSize
    const width  = this.width * ratio.tw | 0,
          height = this.height * ratio.th | 0,
          absL  = this.absL * ratio.tw | 0,
          absT   = this.absT * ratio.th | 0
    const input = '0;1;'
      + absL + ';'
      + absT + ';'
      + width + ';'
      + height + ';;;;;'
      + img
      + '\n4;\n3;\n'
    this._props = {
      absL: absL,
      absT: absT,
      width: width,
      height: height
    }
    try {
      cp.execFileSync(OverlayImage.w3mdisplay, [], {
        env: process.env,
        encoding: 'utf8',
        input: input,
        timeout: 1000
      })
    } catch (e) {

    }
    return true
  }
  clearImageSync() {
    if (OverlayImage.hasW3MDisplay === false) {
      throw new Error('W3M Image Display not available.')
    }
    if (!this._props) {
      return false
    }
    let width  = this._props.width + 2,
        height = this._props.height + 2,
        absL  = this._props.absL,
        absT   = this._props.absT
    if (this._drag) {
      absL -= 10
      absT -= 10
      width += 10
      height += 10
    }
    const input = '6;'
      + absL + ';'
      + absT + ';'
      + width + ';'
      + height
      + '\n4;\n3;\n'

    delete this.file
    delete this._props
    delete this._lastSize

    try {
      cp.execFileSync(OverlayImage.w3mdisplay, [], {
        env: process.env,
        encoding: 'utf8',
        input: input,
        timeout: 1000
      })
    } catch (e) {

    }
    return true
  }
  imageSizeSync() {
    const img = this.file
    if (OverlayImage.hasW3MDisplay === false) {
      throw new Error('W3M Image Display not available.')
    }
    if (!img) {
      throw new Error('No image.')
    }
    let buf = ''
    const input = '5;' + img + '\n'

    try {
      buf = cp.execFileSync(OverlayImage.w3mdisplay, [], {
        env: process.env,
        encoding: 'utf8',
        input: input,
        timeout: 1000
      })
    } catch (e) {

    }
    const size = buf.trim().split(/\s+/)
    return {
      raw: buf.trim(),
      width: +size[0],
      height: +size[1]
    }
  }
  termSizeSync(_, recurse) {
    if (OverlayImage.hasW3MDisplay === false) {
      throw new Error('W3M Image Display not available.')
    }
    let buf = ''

    try {
      buf = cp.execFileSync(OverlayImage.w3mdisplay, [ '-test' ], {
        env: process.env,
        encoding: 'utf8',
        timeout: 1000
      })
    } catch (e) {

    }
    if (!buf.trim()) {
      // Bug: w3mimgdisplay will sometimes
      // output nothing. Try again:
      recurse = recurse || 0
      if (++recurse === 5) {
        throw new Error('Term size not determined.')
      }
      return this.termSizeSync(_, recurse)
    }
    const size = buf.trim().split(/\s+/)
    return {
      raw: buf.trim(),
      width: +size[0],
      height: +size[1]
    }
  }
  getPixelRatioSync() {
    // XXX We could cache this, but sometimes it's better
    // to recalculate to be pixel perfect.
    if (this._ratio && !this._needsRatio) {
      return this._ratio
    }
    this._needsRatio = false
    const dimensions = this.termSizeSync()
    this._ratio = {
      tw: dimensions.width / this.screen.width,
      th: dimensions.height / this.screen.height
    }
    return this._ratio
  }
  displayImage(callback) {
    return this.screen.displayImage(this.file, callback)
  }
}

OverlayImage.w3mdisplay = '/usr/lib/w3m/w3mimgdisplay'

/**
 * Expose
 */


