'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

const SP = ' '

const NUL = ' ',
      // \x00 \u0000
      SOH = '',
      // \x01 \u0001
      STX = '',
      // \x02 \u0002
      ETX = '',
      // \x03 \u0003
      EOT = '',
      // \x04 \u0004
      ENQ = '',
      // \x05 \u0005
      ACK = '',
      // \x06 \u0006
      BEL = '',
      // \x07 \u0007
      BS  = '\b',
      // \x08 \u0008
      TAB = '\t',
      // \x09 \u0009
      LF  = '\n',
      // \x0a \u000a
      VT  = '',
      // \x0b \u000b
      FF  = '\f',
      // \x0c \u000c
      RN  = '\r',
      // \x0d \u000d
      SO  = '',
      // \x0e \u000e
      SI  = '',
      // \x0f \u000f
      DLE = '',
      // \x10 \u0010
      DC1 = '',
      // \x11 \u0011
      DC2 = '',
      // \x12 \u0012
      DC3 = '',
      // \x13 \u0013
      DC4 = '',
      // \x14 \u0014
      NAK = '',
      // \x15 \u0015
      SYN = '',
      // \x16 \u0016
      ETB = '',
      // \x17 \u0017
      CAN = '',
      // \x18 \u0018
      EM  = '',
      // \x19 \u0019
      SUB = '',
      // \x1a \u001a
      ESC = '',
      // \x1b \u001b
      FS  = '',
      // \x1c \u001c
      GS  = '',
      // \x1d \u001d
      RS  = '',
      // \x1e \u001e
      US  = '',
      // \x1f \u001f
      DEL = '' // \x7f \u007f

const IND   = ESC + 'D',
      // IND   | Index (IND is 0x84).                                                                     |
      NEL   = ESC + 'E',
      // NEL   | Next Line (NEL is 0x85).                                                                 |
      HTS   = ESC + 'H',
      // HTS   | Tab Set (HTS is 0x88).                                                                   |
      RI    = ESC + 'M',
      // RI    | Reverse Index (RI is 0x8d).                                                              |
      SS2   = ESC + 'N',
      // SS2   | Single Shift Select of G2 Character Set (SS2 is 0x8e). This affects next character only. |
      SS3   = ESC + 'O',
      // SS3   | Single Shift Select of G3 Character Set (SS3 is 0x8f). This affects next character only. |
      DCS   = ESC + 'P',
      // DCS   | Device Control String (DCS is 0x90).                                                     |
      SPA   = ESC + 'V',
      // SPA   | Start of Guarded Area (SPA is 0x96).                                                     |
      EPA   = ESC + 'W',
      // EPA   | End of Guarded Area (EPA is 0x97).                                                       |
      SOS   = ESC + 'X',
      // SOS   | Start of String (SOS is 0x98).                                                           |
      DECID = ESC + 'Z',
      // DECID | Return Terminal ID (DECID is 0x9a).  Obsolete form of CSI c (DA).                        |
      CSI   = ESC + '[',
      // CSI   | Control Sequence Introducer (CSI is 0x9b).                                               |
      ST    = ESC + '\\',
      // ST    | String Terminator (ST is 0x9c).                                                          |
      OSC   = ESC + ']',
      // OSC   | Operating System Command (OSC is 0x9d).                                                  |
      PM    = ESC + '^',
      // PM    | Privacy Message (PM is 0x9e).                                                            |
      APC   = ESC + '_' // APC   | Application Program Command (APC is 0x9f).                                               |

const S7C1T   = ESC + SP + 'F',
      // 7-bit controls (S7C1T).                                                                                        |
      S8C1T   = ESC + SP + 'G',
      // 8-bit controls (S8C1T).                                                                                        | |
      // DECDHL  = ESC + '#3',  // DEC double-height line, top half (DECDHL).                                                                     |
      // DECDHL  = ESC + '#4',  // DEC double-height line, bottom half (DECDHL).                                                                  |
      // DECSWL  = ESC + '#5',  // DEC single-width line (DECSWL).                                                                                |
      // DECDWL  = ESC + '#6',  // DEC double-width line (DECDWL).                                                                                |
      // DECALN  = ESC + '#8',  // DEC Screen Alignment Test (DECALN).                                                                            |
      DECBI   = ESC + '6',
      // Back Index (DECBI), VT420 and up.                                                                              |
      DECSC   = ESC + '7',
      // Save Cursor (DECSC).                                                                                           |
      DECRC   = ESC + '8',
      // Restore Cursor (DECRC).                                                                                        |
      DECFI   = ESC + '9',
      // Forward Index (DECFI), VT420 and up.                                                                           |
      DECKPAM = ESC + '=',
      // Application Keypad (DECKPAM).                                                                                  |
      DECKPNM = ESC + '>',
      // Normal Keypad (DECKPNM).                                                                                       |
      RIS     = ESC + 'c',
      // Full Reset (RIS).                                                                                              |
      LS2     = ESC + 'n',
      // Invoke the G2 Character Set as GL (LS2).                                                                       |
      LS3     = ESC + 'o',
      // Invoke the G3 Character Set as GL (LS3).                                                                       |
      LS2R    = ESC + '}',
      // Invoke the G2 Character Set as GR (LS2R).                                                                      |
      LS1R    = ESC + '~' // Invoke the G1 Character Set as GR (LS1R).                                                                      |

exports.ACK = ACK
exports.APC = APC
exports.BEL = BEL
exports.BS = BS
exports.CAN = CAN
exports.CSI = CSI
exports.DC1 = DC1
exports.DC2 = DC2
exports.DC3 = DC3
exports.DC4 = DC4
exports.DCS = DCS
exports.DECBI = DECBI
exports.DECFI = DECFI
exports.DECID = DECID
exports.DECKPAM = DECKPAM
exports.DECKPNM = DECKPNM
exports.DECRC = DECRC
exports.DECSC = DECSC
exports.DEL = DEL
exports.DLE = DLE
exports.EM = EM
exports.ENQ = ENQ
exports.EOT = EOT
exports.EPA = EPA
exports.ESC = ESC
exports.ETB = ETB
exports.ETX = ETX
exports.FF = FF
exports.FS = FS
exports.GS = GS
exports.HTS = HTS
exports.IND = IND
exports.LF = LF
exports.LS1R = LS1R
exports.LS2 = LS2
exports.LS2R = LS2R
exports.LS3 = LS3
exports.NAK = NAK
exports.NEL = NEL
exports.NUL = NUL
exports.OSC = OSC
exports.PM = PM
exports.RI = RI
exports.RIS = RIS
exports.RN = RN
exports.RS = RS
exports.S7C1T = S7C1T
exports.S8C1T = S8C1T
exports.SI = SI
exports.SO = SO
exports.SOH = SOH
exports.SOS = SOS
exports.SPA = SPA
exports.SS2 = SS2
exports.SS3 = SS3
exports.ST = ST
exports.STX = STX
exports.SUB = SUB
exports.SYN = SYN
exports.TAB = TAB
exports.US = US
exports.VT = VT
