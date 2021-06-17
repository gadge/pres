import { BOTTOM, HEIGHT, LEFT, RIGHT, TOP, WIDTH } from '@pres/enum-coord-infos'
import {
  BACK, BG, BLINK, BOLD, FG, FORE, HIDE, INVERSE, INVISIBLE, ITALIC, REVERSE, TRANSPARENT, UNDERLINE
}                                                  from '@pres/enum-sgr-attrs'

export const REGEX_SGR_G = /\x1b\[[\d;]*m/g
export const REGEX_INIT_SGR = /^\x1b\[[\d;]*m/
export const SGR_ATTRS = [ FORE, FG, BACK, BG, BOLD, ITALIC, UNDERLINE, BLINK, REVERSE, INVERSE, HIDE, INVISIBLE, TRANSPARENT ]
export const COORD_INFOS = [ LEFT, RIGHT, TOP, BOTTOM, WIDTH, HEIGHT ]

export const UI_EVENT_TODOS = [
  [ 'hoverEffects', 'mouseover', 'mouseout', '_htemp' ],
  [ 'focusEffects', 'focus', 'blur', '_ftemp' ]
]