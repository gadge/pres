import { ESC } from './control.chars'

// initiated by: ESC + [
// terminated by: m
export const CSI = ESC + '['

// export const _CUU = 'A'    // CUU   | Cursor Up
// export const _CUD = 'B'    // CUD   | Cursor Down
// export const _CUF = 'C'    // CUF   | Cursor Forward
// export const _CUB = 'D'    // CUB   | Cursor Back
// export const _CNL = 'E'    // CNL   | Cursor Next Line
// export const _CPL = 'F'    // CPL   | Cursor Previous Line
// export const _CHA = 'G'    // CHA   | Cursor Horizontal Absolute
// export const _CUP = 'H'    // CUP   | Cursor Position
// export const _ED = 'J'    // ED    | Erase in Display
// export const _EL = 'K'    // EL    | Erase in Line
// export const _SU = 'S'    // SU    | Scroll Up
// export const _SD = 'T'    // SD    | Scroll Down
// export const _HVP = 'f'    // HVP   | Horizontal Vertical Position
// export const _SGR = 'm'    // SGR   | Select Graphic Rendition
// export const _APON = '5i'   // APON  | AUX Port On
// export const _APOFF = '4i'   // APOFF | AUX Port Off
// export const _DSR = '6n'   // DSR   | Device Status Report
export const _SCP = 's'    // SCP, SCOSC | Save Current Cursor Position
export const _RCP = 'u'    // RCP, SCORC | Restore Saved Cursor Position

export const _ICH         =  '@'   // ICH         | Insert Blank Characters                | Add space                                                                                                                             |
export const _CUU         =  'A'   // CUU         | Cursor Up                              | Move cursor up `arg1` rows                                                                                                            |
export const _CUD         =  'B'   // CUD         | Cursor Down                            | Move cursor down `arg1` rows                                                                                                          |
export const _CUF         =  'C'   // CUF         | Cursor Forward                         | Move cursor forward `arg1` columns                                                                                                    |
export const _CUB         =  'D'   // CUB         | Cursor Backward                        | Move cursor back `arg1` columns                                                                                                       |
export const _CNL         =  'E'   // CNL         | Cursor Next Line                       | Move cursor down `arg1` rows and to first column                                                                                      |
export const _CPL         =  'F'   // CPL         | Cursor Preceding Line                  | Move cursor up `arg1` rows and to first column                                                                                        |
export const _CHA         =  'G'   // CHA         | Cursor Character Absolute              | Move cursor to `arg1` column                                                                                                          |
export const _CUP         =  'H'   // CUP         | Cursor Position                        | Move cursor to `arg1` row and `arg2` column                                                                                           |
export const _CHT         =  'I'   // CHT         | Cursor Forward Tabulation              | Move cursor forward `arg1` tabs                                                                                                       |
export const _ED          =  'J'   // ED          | Erase in Display                       | `!arg1` or `arg1 == 0`: Clear cursor to end of display<br>`arg1 == 1`: Clear start of display to cursor<br>`arg1 == 2`: Clear display |
export const _DECSED      =  '?J'  // DECSED      | Selective Erase in Display             | Same as ED above                                                                                                                      |
export const _EL          =  'K'   // EL          | Erase in Line                          | `!arg1` or `arg1 == 0`: Clear cursor to end of line<br>`arg1 == 1`: Clear start of line to cursor<br>`arg1 == 2`: Clear line          |
export const _DECSEL      =  '?K'  // DECSEL      | Selective Erase in Line                | Same as EL above                                                                                                                      |
export const _IL          =  'L'   // IL          | Insert Lines                           | Insert `arg1` lines                                                                                                                   |
export const _DL          =  'M'   // DL          | Delete Lines                           | Delete `arg1` lines                                                                                                                   |
export const _EF          =  'N'   // EF          | Erase in Field                         | *Ignored (TBD)*                                                                                                                       |
export const _EA          =  'O'   // EA          | Erase in Area                          | *Ignored (TBD)*                                                                                                                       |
export const _DCH         =  'P'   // DCH         | Delete Characters                      | Delete `arg1` characters before cursor                                                                                                |
export const _SEE         =  'Q'   // SEE         | Select Editing Extent                  | *Ignored (TBD)*                                                                                                                       |
export const _CPR         =  'R'   // CPR         | Active Position Report                 | *Ignored (TBD)*                                                                                                                       |
export const _SU          =  'S'   // SU          | Scroll Up                              | Scroll up `arg1` lines                                                                                                                |
export const _SD          =  'T'   // SD          | Scroll Down                            | Scroll down `arg1` lines                                                                                                              |
export const __NA1        =  '>T'  // _           |                                        | Won't support                                                                                                                         |
export const _NP          =  'U'   // NP          | Next Page                              | *Ignored (TBD)*                                                                                                                       |
export const _PP          =  'V'   // PP          | Previous Page                          | *Ignored (TBD)*                                                                                                                       |
export const _CTC         =  'W'   // CTC         | Cursor Tabulation Control              | *Ignored (TBD)*                                                                                                                       |
export const _ECH         =  'X'   // ECH         | Erase Characters                       | Delete `arg1` characters after cursor                                                                                                 |
export const _CVT         =  'Y'   // CVT         | Cursor Line Tabulation                 | *Ignored (TBD)*                                                                                                                       |
export const _CBT         =  'Z'   // CBT         | Cursor Backward Tabulation             | Move cursor back `arg1` tabs                                                                                                          |
export const _SRS         =  '['   // SRS         | Start Reversed String                  | *Ignored (TBD)*                                                                                                                       |
export const _PTX         =  '\\'  // PTX         | Parallel Texts                         | *Ignored (TBD)*                                                                                                                       |
export const _SDS         =  ']'   // SDS         | Start Directed String                  | *Ignored (TBD)*                                                                                                                       |
export const _SIMD        =  '^'   // SIMD        | Select Implicit Movement Direction     | *Ignored (TBD)*                                                                                                                       |
export const __NA2        =  '_'   // _           |                                        | *Ignored (TBD)*                                                                                                                       |
export const _HPA         =  '`'   // HPA         | Character Position Absolute            | Same as CHA above                                                                                                                     |
export const _HPR         =  'a'   // HPR         | Character Position Relative            | Move cursor forward `arg1` columns                                                                                                    |
export const _REP         =  'b'   // REP         | Repeat                                 | *Ignored (TBD)*                                                                                                                       |
export const _DA          =  'c'   // DA/DA1      | Send Primary Device Attributes         | Currently reports “VT100 with Advanced Video Option”                                                                                  |
export const _DA2         =  '>c'  // DA2         | Send Secondary Device Attributes       | Currently reports “VT100”                                                                                                             |
export const _VPA         =  'd'   // VPA         | Line Position Absolute                 | Move cursor to `arg1` row                                                                                                             |
export const _VPR         =  'e'   // VPR         | Line Position Forward                  | *Ignored (TBD)*                                                                                                                       |
export const _HVP         =  'f'   // HVP         | Horizontal and Vertical Position       | Same as CUP above                                                                                                                     |
export const _TBC         =  'g'   // TBC         | Tab Clear                              | `!arg1` or `arg1 == 0`: Clear tab stop at cursor<br>`arg1 == 3`: Clear all tab stops                                                  |
export const _SM          =  'h'   // SM          | Set Mode                               | Supported [**(1)**]                                                                                                                   |
export const _DECSET      =  '?h'  // DECSET      | DEC Set Mode                           | Supported [**(2)**]                                                                                                                   |
export const _MC          =  'i'   // MC          | Media Copy                             | Won't support                                                                                                                         |
export const _DECMC       =  '?i'  // DECMC       | DEC Media Copy                         | Won't support                                                                                                                         |
export const _HPB         =  'j'   // HPB         | Character Position Backward            | *Ignored (TBD)*                                                                                                                       |
export const _VPB         =  'k'   // VPB         | Line Position Backward                 | *Ignored (TBD)*                                                                                                                       |
export const _RM          =  'l'   // RM          | Reset Mode                             | Supported [**(1)**]                                                                                                                   |
export const _DECRST      =  '?l'  // DECRST      | DEC Mode Reset                         | Supported [**(2)**]                                                                                                                   |
export const _SGR         =  'm'   // SGR         | Select Graphic Rendition               | Supported [**(3)**]                                                                                                                   |
export const __NA3       =  '>m'  // _           | xterm specific keyboard modes          | Won't support                                                                                                                         |
export const _DSR         =  'n'   // DSR         | Device Status Reports                  | Supported                                                                                                                             |
export const _DECDSR      =  '?n'  // DECDSR      | DEC Device Status Reports              | Supported                                                                                                                             |
export const __NA4        =  '>n'  // _           | xterm specific modifiers               | Won't support                                                                                                                         |
export const _DAQ         =  'o'   // DAQ         | Define Area Qualification              | *Ignored (TBD)*                                                                                                                       |
export const __NA5        =  'p'   // _           |                                        | *Ignored (TBD)*                                                                                                                       |
export const __NA6        =  '>p'  // _           | xterm specific cursor display control  | *Ignored (TBD)*                                                                                                                       |
export const _DECSTR      =  '!p'  // DECSTR      | Soft Terminal Reset                    | Supported                                                                                                                             |
export const _DECRQM      =  '$p'  // DECRQM      | Request Mode - Host To Terminal        | *Ignored (TBD)*                                                                                                                       |
// export const _DECRQM      =  '?$p' // DECRQM      | Request Mode - Host To Terminal        | *Ignored (TBD)*                                                                                                                       |
export const _DECSCL      =  '"p'  // DECSCL      | Select Conformance Level               | *Ignored (TBD)*                                                                                                                       |
export const _DECLL       =  'q'   // DECLL       | Load LEDs                              | *Ignored (TBD)*                                                                                                                       |
export const _DECSCUSR    =  ' q'  // DECSCUSR    | Set Cursor Style                       | Supported                                                                                                                             |
export const _DECSCA      =  '"q'  // DECSCA      | Select Character Protection Attribute  | Won't support                                                                                                                         |
export const _DECSTBM     =  'r'   // DECSTBM     | Set Top and Bottom Margins             | Supported                                                                                                                             |
export const __NA7        =  '?r'  // _           |                                        | Won't support                                                                                                                         |
export const __NA8        =  '$r'  // _           |                                        | Won't support                                                                                                                         |
export const __NA9        =  's'   // _           | Save cursor (ANSI.SYS)                 | Supported                                                                                                                             |
export const __NA10       =  '?s'  // _           |                                        | Won't support                                                                                                                         |
export const __NA11       =  't'   // _           |                                        | Won't support                                                                                                                         |
export const _DECRARA     =  '$t'  // DECRARA     | Reverse Attributes in Rectangular Area | Won't support                                                                                                                         |
export const __NA12       =  '>t'  // _           |                                        | Won't support                                                                                                                         |
export const _DECSWBV     =  ' t'  // DECSWBV     | Set Warning Bell Volume                | Won't support                                                                                                                         |
export const __NA13       =  'u'   // _           | Restore cursor (ANSI.SYS)              | Supported                                                                                                                             |
export const _DECSMBV     =  ' u'  // DECSMBV     | Set Margin Bell Volume                 | Won't support                                                                                                                         |
export const __NA14       =  'v'   // _           |                                        | *Ignored (TBD)*                                                                                                                       |
export const _DECCRA      =  '$v'  // DECCRA      | Copy Rectangular Area                  | Won't support                                                                                                                         |
export const __NA15       =  'w'   // _           |                                        | *Ignored (TBD)*                                                                                                                       |
export const _DECEFR      =  '\'w' // DECEFR      |                                        | Won't support                                                                                                                         |
export const _DECREQTPARM =  'x'   // DECREQTPARM |                                        | *Ignored (TBD)*                                                                                                                       |
export const _DECSACE     =  '*x'  // DECSACE     | Select Attribute Change Extent         | Won't support                                                                                                                         |
export const _DECFRA      =  '$x'  // DECFRA      | Fill Rectangular Area                  | Won't support                                                                                                                         |
export const __NA16       =  'y'   // _           |                                        | *Ignored (TBD)*                                                                                                                       |
export const __NA17       =  'z'   // _           |                                        | *Ignored (TBD)*                                                                                                                       |
export const __NA18       =  '\'z' // _           |                                        | *Ignored (TBD)*                                                                                                                       |
export const _DECERA      =  '$z'  // DECERA      | Erase Rectangular Area                 | Won't support                                                                                                                         |
export const __NA19       =  '\'{' // _           |                                        | *Ignored (TBD)*                                                                                                                       |
export const __NA20       =  '\'\|'// _           |                                        | *Ignored (TBD)*                                                                                                                       |
export const _DECIC       =  '\'}' // DECIC       | Insert Column                          | Won't support                                                                                                                         |
export const _DECDC       =  '\'~' // DECDC       | Delete Column                          | Won't support
