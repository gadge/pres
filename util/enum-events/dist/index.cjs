'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

/** @type {string} */
const ACTION = 'action'
/** @type {string} */

const ADD_ITEM = 'add item'
/** @type {string} */

const ADOPT = 'adopt'
/** @type {string} */

const ATTACH = 'attach'
/** @type {string} */

const BLUR = 'blur'
/** @type {string} */

const BTNDOWN = 'btndown'
/** @type {string} */

const BTNUP = 'btnup'
/** @type {string} */

const CANCEL = 'cancel'
/** @type {string} */

const CD = 'cd'
/** @type {string} */

const CHECK = 'check'
/** @type {string} */

const CLICK = 'click'
/** @type {string} */

const CLOSE = 'close'
/** @type {string} */

const COMPLETE = 'complete'
/** @type {string} */

const CONNECT = 'connect'
/** @type {string} */

const CREATE_ITEM = 'create item'
/** @type {string} */

const DATA = 'data'
/** @type {string} */

const DBLCLICK = 'dblclick'
/** @type {string} */

const DESTROY = 'destroy'
/** @type {string} */

const DETACH = 'detach'
/** @type {string} */

const DRAG = 'drag'
/** @type {string} */

const ELEMENT_CLICK = 'element click'
/** @type {string} */

const ELEMENT_FOCUS = 'element focus'
/** @type {string} */

const ELEMENT_KEYPRESS = 'element keypress'
/** @type {string} */

const ELEMENT_MOUSEOUT = 'element mouseout'
/** @type {string} */

const ELEMENT_MOUSEOVER = 'element mouseover'
/** @type {string} */

const ELEMENT_MOUSEUP = 'element mouseup'
/** @type {string} */

const ELEMENT_WHEELDOWN = 'element wheeldown'
/** @type {string} */

const ELEMENT_WHEELUP = 'element wheelup'
/** @type {string} */

const ERROR = 'error'
/** @type {string} */

const EVENT = 'event'
/** @type {string} */

const EXIT = 'exit'
/** @type {string} */

const FILE = 'file'
/** @type {string} */

const FOCUS = 'focus'
/** @type {string} */

const HIDE = 'hide'
/** @type {string} */

const INSERT_ITEM = 'insert item'
/** @type {string} */

const KEY = 'key'
/** @type {string} */

const KEYPRESS = 'keypress'
/** @type {string} */

const LOG = 'log'
/** @type {string} */

const MOUSE = 'mouse'
/** @type {string} */

const MOUSEDOWN = 'mousedown'
/** @type {string} */

const MOUSEMOVE = 'mousemove'
/** @type {string} */

const MOUSEOUT = 'mouseout'
/** @type {string} */

const MOUSEOVER = 'mouseover'
/** @type {string} */

const MOUSEUP = 'mouseup'
/** @type {string} */

const MOUSEWHEEL = 'mousewheel'
/** @type {string} */

const MOVE = 'move'
/** @type {string} */

const NEW_LISTENER = 'newListener'
/** @type {string} */

const ON = 'on'
/** @type {string} */

const PARSED_CONTENT = 'parsed content'
/** @type {string} */

const PASSTHROUGH = 'passthrough'
/** @type {string} */

const PRERENDER = 'prerender'
/** @type {string} */

const PRESS = 'press'
/** @type {string} */

const REFRESH = 'refresh'
/** @type {string} */

const REMOVE = 'remove'
/** @type {string} */

const REMOVE_ITEM = 'remove item'
/** @type {string} */

const REMOVE_LISTENER = 'removeListener'
/** @type {string} */

const RENDER = 'render'
/** @type {string} */

const REPARENT = 'reparent'
/** @type {string} */

const RESET = 'reset'
/** @type {string} */

const RESIZE = 'resize'
/** @type {string} */

const RESPONSE = 'response'
/** @type {string} */

const SCROLL = 'scroll'
/** @type {string} */

const SELECT = 'select'
/** @type {string} */

const SELECT_ITEM = 'select item'
/** @type {string} */

const SELECT_TAB = 'select tab'
/** @type {string} */

const SET_CONTENT = 'set content'
/** @type {string} */

const SET_ITEMS = 'set items'
/** @type {string} */

const SHOW = 'show'
/** @type {string} */

const SIGINT = 'SIGINT'
/** @type {string} */

const SIGQUIT = 'SIGQUIT'
/** @type {string} */

const SIGTERM = 'SIGTERM'
/** @type {string} */

const SIZE = 'size'
/** @type {string} */

const SUBMIT = 'submit'
/** @type {string} */

const TITLE = 'title'
/** @type {string} */

const UNCAUGHT_EXCEPTION = 'uncaughtException'
/** @type {string} */

const UNCHECK = 'uncheck'
/** @type {string} */

const WARNING = 'warning'
/** @type {string} */

const WHEELDOWN = 'wheeldown'
/** @type {string} */

const WHEELUP = 'wheelup'

exports.ACTION = ACTION
exports.ADD_ITEM = ADD_ITEM
exports.ADOPT = ADOPT
exports.ATTACH = ATTACH
exports.BLUR = BLUR
exports.BTNDOWN = BTNDOWN
exports.BTNUP = BTNUP
exports.CANCEL = CANCEL
exports.CD = CD
exports.CHECK = CHECK
exports.CLICK = CLICK
exports.CLOSE = CLOSE
exports.COMPLETE = COMPLETE
exports.CONNECT = CONNECT
exports.CREATE_ITEM = CREATE_ITEM
exports.DATA = DATA
exports.DBLCLICK = DBLCLICK
exports.DESTROY = DESTROY
exports.DETACH = DETACH
exports.DRAG = DRAG
exports.ELEMENT_CLICK = ELEMENT_CLICK
exports.ELEMENT_FOCUS = ELEMENT_FOCUS
exports.ELEMENT_KEYPRESS = ELEMENT_KEYPRESS
exports.ELEMENT_MOUSEOUT = ELEMENT_MOUSEOUT
exports.ELEMENT_MOUSEOVER = ELEMENT_MOUSEOVER
exports.ELEMENT_MOUSEUP = ELEMENT_MOUSEUP
exports.ELEMENT_WHEELDOWN = ELEMENT_WHEELDOWN
exports.ELEMENT_WHEELUP = ELEMENT_WHEELUP
exports.ERROR = ERROR
exports.EVENT = EVENT
exports.EXIT = EXIT
exports.FILE = FILE
exports.FOCUS = FOCUS
exports.HIDE = HIDE
exports.INSERT_ITEM = INSERT_ITEM
exports.KEY = KEY
exports.KEYPRESS = KEYPRESS
exports.LOG = LOG
exports.MOUSE = MOUSE
exports.MOUSEDOWN = MOUSEDOWN
exports.MOUSEMOVE = MOUSEMOVE
exports.MOUSEOUT = MOUSEOUT
exports.MOUSEOVER = MOUSEOVER
exports.MOUSEUP = MOUSEUP
exports.MOUSEWHEEL = MOUSEWHEEL
exports.MOVE = MOVE
exports.NEW_LISTENER = NEW_LISTENER
exports.ON = ON
exports.PARSED_CONTENT = PARSED_CONTENT
exports.PASSTHROUGH = PASSTHROUGH
exports.PRERENDER = PRERENDER
exports.PRESS = PRESS
exports.REFRESH = REFRESH
exports.REMOVE = REMOVE
exports.REMOVE_ITEM = REMOVE_ITEM
exports.REMOVE_LISTENER = REMOVE_LISTENER
exports.RENDER = RENDER
exports.REPARENT = REPARENT
exports.RESET = RESET
exports.RESIZE = RESIZE
exports.RESPONSE = RESPONSE
exports.SCROLL = SCROLL
exports.SELECT = SELECT
exports.SELECT_ITEM = SELECT_ITEM
exports.SELECT_TAB = SELECT_TAB
exports.SET_CONTENT = SET_CONTENT
exports.SET_ITEMS = SET_ITEMS
exports.SHOW = SHOW
exports.SIGINT = SIGINT
exports.SIGQUIT = SIGQUIT
exports.SIGTERM = SIGTERM
exports.SIZE = SIZE
exports.SUBMIT = SUBMIT
exports.TITLE = TITLE
exports.UNCAUGHT_EXCEPTION = UNCAUGHT_EXCEPTION
exports.UNCHECK = UNCHECK
exports.WARNING = WARNING
exports.WHEELDOWN = WHEELDOWN
exports.WHEELUP = WHEELUP
