import { SC }  from '@texting/enum-chars'
import { ESC } from './control.characters'

export const CSI = ESC + '['

export class CsiFuncs {
  static CUU = n => CSI + n + 'A'               // CUU   | Cursor Up
  static CUD = n => CSI + n + 'B'               // CUD   | Cursor Down
  static CUF = n => CSI + n + 'C'               // CUF   | Cursor Forward
  static CUB = n => CSI + n + 'D'               // CUB   | Cursor Back
  static CNL = n => CSI + n + 'E'               // CNL   | Cursor Next Line
  static CPL = n => CSI + n + 'F'               // CPL   | Cursor Previous Line
  static CHA = n => CSI + n + 'G'               // CHA   | Cursor Horizontal Absolute
  static CUP = (n, m) => CSI + n + SC + m + 'H' // CUP   | Cursor Position
  static ED = n => CSI + n + 'J'                // ED    | Erase in Display
  static EL = n => CSI + n + 'K'                // EL    | Erase in Line
  static SU = n => CSI + n + 'S'                // SU    | Scroll Up
  static SD = n => CSI + n + 'T'                // SD    | Scroll Down
  static HVP = (n, m) => CSI + n + SC + m + 'f' // HVP   | Horizontal Vertical Position
  static SGR = n => CSI + n + 'm'               // SGR   | Select Graphic Rendition
  static APON = n => CSI + '5i'                 // APON  | AUX Port On
  static APOFF = n => CSI + '4i'                // APOFF | AUX Port Off
  static DSR = n => CSI + '6n'                  // DSR   | Device Status Report
  static SCP = n => CSI + 's'                   // SCP, SCOSC | Save Current Cursor Position
  static RCP = n => CSI + 'u'                   // RCP, SCORC | Restore Saved Cursor Position
}

export const _CUU = 'A'    // CUU   | Cursor Up
export const _CUD = 'B'    // CUD   | Cursor Down
export const _CUF = 'C'    // CUF   | Cursor Forward
export const _CUB = 'D'    // CUB   | Cursor Back
export const _CNL = 'E'    // CNL   | Cursor Next Line
export const _CPL = 'F'    // CPL   | Cursor Previous Line
export const _CHA = 'G'    // CHA   | Cursor Horizontal Absolute
export const _CUP = 'H'    // CUP   | Cursor Position
export const _ED = 'J'    // ED    | Erase in Display
export const _EL = 'K'    // EL    | Erase in Line
export const _SU = 'S'    // SU    | Scroll Up
export const _SD = 'T'    // SD    | Scroll Down
export const _HVP = 'f'    // HVP   | Horizontal Vertical Position
export const _SGR = 'm'    // SGR   | Select Graphic Rendition
export const _APON = '5i'   // APON  | AUX Port On
export const _APOFF = '4i'   // APOFF | AUX Port Off
export const _DSR = '6n'   // DSR   | Device Status Report
export const _SCP = 's'    // SCP, SCOSC | Save Current Cursor Position
export const _RCP = 'u'    // RCP, SCORC | Restore Saved Cursor Position