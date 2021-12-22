'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

const ICH            = '@',
      // ICH            | CSI Ps @                        | Insert Ps (Blank) Character(s) (default = 1) (ICH).                                                                                                                     |
      SL             = ' @',
      // SL             | CSI Ps SP @                     | Shift left Ps columns(s) (default = 1) (SL), ECMA-48.                                                                                                                   |
      CUU            = 'A',
      // CUU            | CSI Ps A                        | Cursor Up Ps Times (default = 1) (CUU).                                                                                                                                 |
      SR             = ' A',
      // SR             | CSI Ps SP A                     | Shift right Ps columns(s) (default = 1) (SR), ECMA-48.                                                                                                                  |
      CUD            = 'B',
      // CUD            | CSI Ps B                        | Cursor Down Ps Times (default = 1) (CUD).                                                                                                                               |
      CUF            = 'C',
      // CUF            | CSI Ps C                        | Cursor Forward Ps Times (default = 1) (CUF).                                                                                                                            |
      CUB            = 'D',
      // CUB            | CSI Ps D                        | Cursor Backward Ps Times (default = 1) (CUB).                                                                                                                           |
      CNL            = 'E',
      // CNL            | CSI Ps E                        | Cursor Next Line Ps Times (default = 1) (CNL).                                                                                                                          |
      CPL            = 'F',
      // CPL            | CSI Ps F                        | Cursor Preceding Line Ps Times (default = 1) (CPL).                                                                                                                     |
      CHA            = 'G',
      // CHA            | CSI Ps G                        | Cursor Character Absolute [column] (default = [row,1]) (CHA).                                                                                                           |
      CUP            = 'H',
      // CUP            | CSI Ps ; Ps H                   | Cursor Position [row;column] (default = [1,1]) (CUP).                                                                                                                   |
      CHT            = 'I',
      // CHT            | CSI Ps I                        | Cursor Forward Tabulation Ps tab stops (default = 1) (CHT).                                                                                                             |
      ED             = 'J',
      // ED             | CSI Ps J                        | Erase in Display (ED), VT100.                                                                                                                                           |
      DECSED         = 'J',
      // DECSED         | CSI ? Ps J                      | Erase in Display (DECSED), VT220.                                                                                                                                       |
      EL             = 'K',
      // EL             | CSI Ps K                        | Erase in Line (EL), VT100.                                                                                                                                              |
      DECSEL         = 'K',
      // DECSEL         | CSI ? Ps K                      | Erase in Line (DECSEL), VT220.                                                                                                                                          |
      IL             = 'L',
      // IL             | CSI Ps L                        | Insert Ps Line(s) (default = 1) (IL).                                                                                                                                   |
      DL             = 'M',
      // DL             | CSI Ps M                        | Delete Ps Line(s) (default = 1) (DL).                                                                                                                                   |
      DCH            = 'P',
      // DCH            | CSI Ps P                        | Delete Ps Character(s) (default = 1) (DCH).                                                                                                                             |
      XTPUSHCOLORS   = '#P',
      // XTPUSHCOLORS   | CSI # P                         | Push current dynamic- and ANSI-palette colors onto stack (XTPUSHCOLORS), xterm.                                                                                         |
      // _XTPUSHCOLORS= '#P',  // XTPUSHCOLORS   | CSI Pm # P                      | Push current dynamic- and ANSI-palette colors onto stack (XTPUSHCOLORS), xterm.                                                                                         |
      XTPOPCOLORS    = '#Q',
      // XTPOPCOLORS    | CSI # Q                         | Pop stack to set dynamic- and ANSI-palette colors (XTPOPCOLORS), xterm.                                                                                                 |
      // _XTPOPCOLORS = '#Q',  // XTPOPCOLORS    | CSI Pm # Q                      | Pop stack to set dynamic- and ANSI-palette colors (XTPOPCOLORS), xterm.                                                                                                 |
      XTREPORTCOLORS = '#R',
      // XTREPORTCOLORS | CSI # R                         | Report the current entry on the palette stack, and the number of palettes stored on the stack, using the same form as XTPOPCOLOR (default = 0) (XTREPORTCOLORS), xterm. |
      SU             = 'S',
      // SU             | CSI Ps S                        | Scroll up Ps lines (default = 1) (SU), VT420, ECMA-48.                                                                                                                  |
      XTSMGRAPHICS   = 'S',
      // XTSMGRAPHICS   | CSI ? Pi ; Pa ; Pv S            | Set or request graphics attribute (XTSMGRAPHICS), xterm.                                                                                                                |
      SD             = 'T',
      // SD             | CSI Ps T                        | Scroll down Ps lines (default = 1) (SD), VT420.                                                                                                                         |
      XTHIMOUSE      = 'T',
      // XTHIMOUSE      | CSI Ps ; Ps ; Ps ; Ps ; Ps T    | Initiate highlight mouse tracking (XTHIMOUSE), xterm.                                                                                                                   |
      XTRMTITLE      = 'T',
      // XTRMTITLE      | CSI > Pm T                      | Reset title mode features to default value (XTRMTITLE), xterm.                                                                                                          |
      ECH            = 'X',
      // ECH            | CSI Ps X                        | Erase Ps Character(s) (default = 1) (ECH).                                                                                                                              |
      CBT            = 'Z',
      // CBT            | CSI Ps Z                        | Cursor Backward Tabulation Ps tab stops (default = 1) (CBT).                                                                                                            |
      // _SD          = '^',   // SD             | CSI Ps ^                        | Scroll down Ps lines (default = 1) (SD), ECMA-48.                                                                                                                       |
      HPA            = '`',
      // HPA            | CSI Ps `                        | Character Position Absolute [column] (default = [row,1]) (HPA).                                                                                                         |
      HPR            = 'a',
      // HPR            | CSI Ps a                        | Character Position Relative [columns] (default = [row,col+1]) (HPR).                                                                                                    |
      REP            = 'b',
      // REP            | CSI Ps b                        | Repeat the preceding graphic character Ps times (REP).                                                                                                                  |
      DA             = 'c',
      // Primary_DA     | CSI Ps c                        | Send Device Attributes (Primary DA).                                                                                                                                    |
      DA3            = 'c',
      // Tertiary_DA    | CSI = Ps c                      | Send Device Attributes (Tertiary DA).                                                                                                                                   |
      DA2            = 'c',
      // Secondary_DA   | CSI > Ps c                      | Send Device Attributes (Secondary DA).                                                                                                                                  |
      VPA            = 'd',
      // VPA            | CSI Ps d                        | Line Position Absolute [row] (default = [1,column]) (VPA).                                                                                                              |
      VPR            = 'e',
      // VPR            | CSI Ps e                        | Line Position Relative [rows] (default = [row+1,column]) (VPR).                                                                                                         |
      HVP            = 'f',
      // HVP            | CSI Ps ; Ps f                   | Horizontal and Vertical Position [row;column] (default = [1,1]) (HVP).                                                                                                  |
      TBC            = 'g',
      // TBC            | CSI Ps g                        | Tab Clear (TBC).                                                                                                                                                        |
      SM             = 'h',
      // SM             | CSI Pm h                        | Set Mode (SM).                                                                                                                                                          |
      DECANM         = 'h',
      // DECANM         | CSI ? Pm h                      | DEC Private Mode Set (DECSET). (DECANM), VT100, and set VT100 mode.                                                                                                     |
      MC             = 'i',
      // MC             | CSI Ps i                        | Media Copy (MC).                                                                                                                                                        |
      // _MC          = 'i',   // MC             | CSI ? Ps i                      | Media Copy (MC), DEC-specific.                                                                                                                                          |
      RM             = 'l',
      // RM             | CSI Pm l                        | Reset Mode (RM).                                                                                                                                                        |
      DECRST         = 'l',
      // DECRST         | CSI ? Pm l                      | DEC Private Mode Reset (DECRST).                                                                                                                                        |
      SGR            = 'm',
      // SGR            | CSI Pm m                        | Character Attributes (SGR).                                                                                                                                             |
      XTMODKEYS      = 'm',
      // XTMODKEYS      | CSI > Pp ; Pv m                 | Set/reset key modifier options (XTMODKEYS), xterm.                                                                                                                      |
      // _XTMODKEYS   = 'm',   // XTMODKEYS      | CSI > Pp m                      | Set/reset key modifier options (XTMODKEYS), xterm.                                                                                                                      |
      DSR            = 'n',
      // DSR            | CSI Ps n                        | Device Status Report (DSR).                                                                                                                                             |
      XTUNMODKEYS    = 'n',
      // XTUNMODKEYS    | CSI > Ps n                      | Disable key modifier options, xterm.                                                                                                                                    |
      DSR_DEC        = 'n',
      // DSR_DEC        | CSI ? Ps n                      | Device Status Report (DSR, DEC-specific).                                                                                                                               |
      XTSMPOINTER    = 'p',
      // XTSMPOINTER    | CSI > Ps p                      | Set resource value pointerMode (XTSMPOINTER), xterm.                                                                                                                    |
      DECSTR         = '!p',
      // DECSTR         | CSI ! p                         | Soft terminal reset (DECSTR), VT220 and up.                                                                                                                             |
      DECSCL         = '"p',
      // DECSCL         | CSI Pl ; Pc " p                 | Set conformance level (DECSCL), VT220 and up.                                                                                                                           |
      DECRQM         = '$p',
      // DECRQM         | CSI Ps $ p                      | Request ANSI mode (DECRQM).                                                                                                                                             |
      // _DECRQM      = '$p',  // DECRQM         | CSI ? Ps $ p                    | Request DEC private mode (DECRQM).                                                                                                                                      |
      XTPUSHSGR      = '#p',
      // XTPUSHSGR      | CSI # p                         | Push video attributes onto stack (XTPUSHSGR), xterm.                                                                                                                    |
      // _XTPUSHSGR   = '#p',  // XTPUSHSGR      | CSI Pm # p                      | Push video attributes onto stack (XTPUSHSGR), xterm.                                                                                                                    |
      XTVERSION      = 'q',
      // XTVERSION      | CSI > Ps q                      | (Ps = 0 ⇒) Report xterm name and version (XTVERSION).                                                                                                                   |
      DECLL          = 'q',
      // DECLL          | CSI Ps q                        | Load LEDs (DECLL), VT100.                                                                                                                                               |
      DECSCUSR       = ' q',
      // DECSCUSR       | CSI Ps SP q                     | Set cursor style (DECSCUSR), VT520.                                                                                                                                     |
      DECSCA         = '"q',
      // DECSCA         | CSI Ps " q                      | Select character protection attribute (DECSCA), VT220.                                                                                                                  |
      XTPOPSGR       = '#q',
      // XTPOPSGR       | CSI # q                         | Pop video attributes from stack (XTPOPSGR), xterm.                                                                                                                      |
      DECSTBM        = 'r',
      // DECSTBM        | CSI Ps ; Ps r                   | Set Scrolling Region [top;bottom] (default = full size of window) (DECSTBM), VT100.                                                                                     |
      XTRESTORE      = 'r',
      // XTRESTORE      | CSI ? Pm r                      | Restore DEC Private Mode Values (XTRESTORE), xterm.                                                                                                                     |
      DECCARA        = '$r',
      // DECCARA        | CSI Pt ; Pl ; Pb ; Pr ; Ps $ r  | Change Attributes in Rectangular Area (DECCARA), VT400 and up.                                                                                                          |
      SCOSC          = 's',
      // SCOSC          | CSI s                           | Save cursor, available only when DECLRMM is disabled (SCOSC, also ANSI.SYS).                                                                                            |
      DECSLRM        = 's',
      // DECSLRM        | CSI Pl ; Pr s                   | Set left and right margins (DECSLRM), VT420 and up.                                                                                                                     |
      XTSHIFTESCAPE  = 's',
      // XTSHIFTESCAPE  | CSI > Ps s                      | Set/reset shift-escape options (XTSHIFTESCAPE), xterm.                                                                                                                  |
      XTSAVE         = 's',
      // XTSAVE         | CSI ? Pm s                      | Save DEC Private Mode Values (XTSAVE), xterm.                                                                                                                           |
      XTWINOPS       = 't',
      // XTWINOPS       | CSI Ps ; Ps ; Ps t              | Window manipulation (XTWINOPS), dtterm, extended by xterm.                                                                                                              |
      XTSMTITLE      = 't',
      // XTSMTITLE      | CSI > Pm t                      | Sets one/more features of the title modes (XTSMTITLE), xterm.                                                                                                           |
      DECSWBV        = ' t',
      // DECSWBV        | CSI Ps SP t                     | Set warning-bell volume (DECSWBV), VT520.                                                                                                                               |
      DECRARA        = '$t',
      // DECRARA        | CSI Pt ; Pl ; Pb ; Pr ; Ps $ t  | Reverse Attributes in Rectangular Area (DECRARA), VT400 and up.                                                                                                         |
      SCORC          = 'u',
      // SCORC          | CSI u                           | Restore cursor (SCORC, also ANSI.SYS).                                                                                                                                  |
      DECSMBV        = ' u',
      // DECSMBV        | CSI Ps SP u                     | Set margin-bell volume (DECSMBV), VT520.                                                                                                                                |
      DECCRA         = '$v',
      // DECCRA         | CSI Pt;Pl;Pb;Pr;Pp;Pt;Pl;Pp $ v | Copy Rectangular Area (DECCRA), VT400 and up.                                                                                                                           |
      DECRQPSR       = '$w',
      // DECRQPSR       | CSI Ps $ w                      | Request presentation state report (DECRQPSR), VT320 and up.                                                                                                             |
      DECEFR         = '\'w',
      // DECEFR         | CSI Pt ; Pl ; Pb ; Pr ' w       | Enable Filter Rectangle (DECEFR), VT420 and up.                                                                                                                         |
      DECREQTPARM    = 'x',
      // DECREQTPARM    | CSI Ps x                        | Request Terminal Parameters (DECREQTPARM).                                                                                                                              |
      DECSACE        = '*x',
      // DECSACE        | CSI Ps * x                      | Select Attribute Change Extent (DECSACE), VT420 and up.                                                                                                                 |
      DECFRA         = '$x',
      // DECFRA         | CSI Pc ; Pt ; Pl ; Pb ; Pr $ x  | Fill Rectangular Area (DECFRA), VT420 and up.                                                                                                                           |
      XTCHECKSUM     = '#y',
      // XTCHECKSUM     | CSI Ps # y                      | Select checksum extension (XTCHECKSUM), xterm.                                                                                                                          |
      DECRQCRA       = '*y',
      // DECRQCRA       | CSI Pi;Pg;Pt;Pl;Pb;Pr * y       | Request Checksum of Rectangular Area (DECRQCRA), VT420 and up.                                                                                                          |
      DECELR         = '\'z',
      // DECELR         | CSI Ps ; Pu ' z                 | Enable Locator Reporting (DECELR).                                                                                                                                      |
      DECERA         = '$z',
      // DECERA         | CSI Pt ; Pl ; Pb ; Pr $ z       | Erase Rectangular Area (DECERA), VT400 and up.                                                                                                                          |
      DECSLE         = '\'{',
      // DECSLE         | CSI Pm ' {                      | Select Locator Events (DECSLE).                                                                                                                                         |
      // _XTPUSHSGR   = '#{',  // XTPUSHSGR      | CSI # {                         | Push video attributes onto stack (XTPUSHSGR), xterm.                                                                                                                    |
      // _XTPUSHSGR   = '#{',  // XTPUSHSGR      | CSI Pm # {                      | Push video attributes onto stack (XTPUSHSGR), xterm.                                                                                                                    |
      DECSERA        = '${',
      // DECSERA        | CSI Pt ; Pl ; Pb ; Pr $ {       | Selective Erase Rectangular Area (DECSERA), VT400 and up.                                                                                                               |
      XTREPORTSGR    = '#|',
      // XTREPORTSGR    | CSI Pt ; Pl ; Pb ; Pr # \|      | Report selected graphic rendition (XTREPORTSGR), xterm.                                                                                                                 |
      DECSCPP        = '$|',
      // DECSCPP        | CSI Ps $ \|                     | Select columns per page (DECSCPP), VT340.                                                                                                                               |
      DECRQLP        = '\'|',
      // DECRQLP        | CSI Ps ' \|                     | Request Locator Position (DECRQLP).                                                                                                                                     |
      DECSNLS        = '*|',
      // DECSNLS        | CSI Ps * \|                     | Select number of lines per screen (DECSNLS), VT420 and up.                                                                                                              |
      // _XTPOPSGR    = '#}',  // XTPOPSGR       | CSI # }                         | Pop video attributes from stack (XTPOPSGR), xterm.                                                                                                                      |
      DECIC          = '\'}',
      // DECIC          | CSI Ps ' }                      | Insert Ps Column(s) (default = 1) (DECIC), VT420 and up.                                                                                                                |
      DECDC          = '\'~' // DECDC          | CSI Ps ' ~                      | Delete Ps Column(s) (default = 1) (DECDC), VT420 and up.                                                                                                                |

const _ICH            = '@',
      // ICH            | CSI Ps @                        | Insert Ps (Blank) Character(s) (default = 1) (ICH).                                                                                                                     |
      _SL             = ' @',
      // SL             | CSI Ps SP @                     | Shift left Ps columns(s) (default = 1) (SL), ECMA-48.                                                                                                                   |
      _CUU            = 'A',
      // CUU            | CSI Ps A                        | Cursor Up Ps Times (default = 1) (CUU).                                                                                                                                 |
      _SR             = ' A',
      // SR             | CSI Ps SP A                     | Shift right Ps columns(s) (default = 1) (SR), ECMA-48.                                                                                                                  |
      _CUD            = 'B',
      // CUD            | CSI Ps B                        | Cursor Down Ps Times (default = 1) (CUD).                                                                                                                               |
      _CUF            = 'C',
      // CUF            | CSI Ps C                        | Cursor Forward Ps Times (default = 1) (CUF).                                                                                                                            |
      _CUB            = 'D',
      // CUB            | CSI Ps D                        | Cursor Backward Ps Times (default = 1) (CUB).                                                                                                                           |
      _CNL            = 'E',
      // CNL            | CSI Ps E                        | Cursor Next Line Ps Times (default = 1) (CNL).                                                                                                                          |
      _CPL            = 'F',
      // CPL            | CSI Ps F                        | Cursor Preceding Line Ps Times (default = 1) (CPL).                                                                                                                     |
      _CHA            = 'G',
      // CHA            | CSI Ps G                        | Cursor Character Absolute [column] (default = [row,1]) (CHA).                                                                                                           |
      _CUP            = 'H',
      // CUP            | CSI Ps ; Ps H                   | Cursor Position [row;column] (default = [1,1]) (CUP).                                                                                                                   |
      _CHT            = 'I',
      // CHT            | CSI Ps I                        | Cursor Forward Tabulation Ps tab stops (default = 1) (CHT).                                                                                                             |
      _ED             = 'J',
      // ED             | CSI Ps J                        | Erase in Display (ED), VT100.                                                                                                                                           |
      _DECSED         = 'J',
      // DECSED         | CSI ? Ps J                      | Erase in Display (DECSED), VT220.                                                                                                                                       |
      _EL             = 'K',
      // EL             | CSI Ps K                        | Erase in Line (EL), VT100.                                                                                                                                              |
      _DECSEL         = 'K',
      // DECSEL         | CSI ? Ps K                      | Erase in Line (DECSEL), VT220.                                                                                                                                          |
      _IL             = 'L',
      // IL             | CSI Ps L                        | Insert Ps Line(s) (default = 1) (IL).                                                                                                                                   |
      _DL             = 'M',
      // DL             | CSI Ps M                        | Delete Ps Line(s) (default = 1) (DL).                                                                                                                                   |
      _DCH            = 'P',
      // DCH            | CSI Ps P                        | Delete Ps Character(s) (default = 1) (DCH).                                                                                                                             |
      _XTPUSHCOLORS   = '#P',
      // XTPUSHCOLORS   | CSI # P                         | Push current dynamic- and ANSI-palette colors onto stack (XTPUSHCOLORS), xterm.                                                                                         |
      // _XTPUSHCOLORS= '#P',  // XTPUSHCOLORS   | CSI Pm # P                      | Push current dynamic- and ANSI-palette colors onto stack (XTPUSHCOLORS), xterm.                                                                                         |
      _XTPOPCOLORS    = '#Q',
      // XTPOPCOLORS    | CSI # Q                         | Pop stack to set dynamic- and ANSI-palette colors (XTPOPCOLORS), xterm.                                                                                                 |
      // _XTPOPCOLORS = '#Q',  // XTPOPCOLORS    | CSI Pm # Q                      | Pop stack to set dynamic- and ANSI-palette colors (XTPOPCOLORS), xterm.                                                                                                 |
      _XTREPORTCOLORS = '#R',
      // XTREPORTCOLORS | CSI # R                         | Report the current entry on the palette stack, and the number of palettes stored on the stack, using the same form as XTPOPCOLOR (default = 0) (XTREPORTCOLORS), xterm. |
      _SU             = 'S',
      // SU             | CSI Ps S                        | Scroll up Ps lines (default = 1) (SU), VT420, ECMA-48.                                                                                                                  |
      _XTSMGRAPHICS   = 'S',
      // XTSMGRAPHICS   | CSI ? Pi ; Pa ; Pv S            | Set or request graphics attribute (XTSMGRAPHICS), xterm.                                                                                                                |
      _SD             = 'T',
      // SD             | CSI Ps T                        | Scroll down Ps lines (default = 1) (SD), VT420.                                                                                                                         |
      _XTHIMOUSE      = 'T',
      // XTHIMOUSE      | CSI Ps ; Ps ; Ps ; Ps ; Ps T    | Initiate highlight mouse tracking (XTHIMOUSE), xterm.                                                                                                                   |
      _XTRMTITLE      = 'T',
      // XTRMTITLE      | CSI > Pm T                      | Reset title mode features to default value (XTRMTITLE), xterm.                                                                                                          |
      _ECH            = 'X',
      // ECH            | CSI Ps X                        | Erase Ps Character(s) (default = 1) (ECH).                                                                                                                              |
      _CBT            = 'Z',
      // CBT            | CSI Ps Z                        | Cursor Backward Tabulation Ps tab stops (default = 1) (CBT).                                                                                                            |
      // _SD          = '^',   // SD             | CSI Ps ^                        | Scroll down Ps lines (default = 1) (SD), ECMA-48.                                                                                                                       |
      _HPA            = '`',
      // HPA            | CSI Ps `                        | Character Position Absolute [column] (default = [row,1]) (HPA).                                                                                                         |
      _HPR            = 'a',
      // HPR            | CSI Ps a                        | Character Position Relative [columns] (default = [row,col+1]) (HPR).                                                                                                    |
      _REP            = 'b',
      // REP            | CSI Ps b                        | Repeat the preceding graphic character Ps times (REP).                                                                                                                  |
      _DA             = 'c',
      // Primary_DA     | CSI Ps c                        | Send Device Attributes (Primary DA).                                                                                                                                    |
      _DA3            = 'c',
      // Tertiary_DA    | CSI = Ps c                      | Send Device Attributes (Tertiary DA).                                                                                                                                   |
      _DA2            = 'c',
      // Secondary_DA   | CSI > Ps c                      | Send Device Attributes (Secondary DA).                                                                                                                                  |
      _VPA            = 'd',
      // VPA            | CSI Ps d                        | Line Position Absolute [row] (default = [1,column]) (VPA).                                                                                                              |
      _VPR            = 'e',
      // VPR            | CSI Ps e                        | Line Position Relative [rows] (default = [row+1,column]) (VPR).                                                                                                         |
      _HVP            = 'f',
      // HVP            | CSI Ps ; Ps f                   | Horizontal and Vertical Position [row;column] (default = [1,1]) (HVP).                                                                                                  |
      _TBC            = 'g',
      // TBC            | CSI Ps g                        | Tab Clear (TBC).                                                                                                                                                        |
      _SM             = 'h',
      // SM             | CSI Pm h                        | Set Mode (SM).                                                                                                                                                          |
      _DECANM         = 'h',
      // DECANM         | CSI ? Pm h                      | DEC Private Mode Set (DECSET). (DECANM), VT100, and set VT100 mode.                                                                                                     |
      _MC             = 'i',
      // MC             | CSI Ps i                        | Media Copy (MC).                                                                                                                                                        |
      // _MC          = 'i',   // MC             | CSI ? Ps i                      | Media Copy (MC), DEC-specific.                                                                                                                                          |
      _RM             = 'l',
      // RM             | CSI Pm l                        | Reset Mode (RM).                                                                                                                                                        |
      _DECRST         = 'l',
      // DECRST         | CSI ? Pm l                      | DEC Private Mode Reset (DECRST).                                                                                                                                        |
      _SGR            = 'm',
      // SGR            | CSI Pm m                        | Character Attributes (SGR).                                                                                                                                             |
      _XTMODKEYS      = 'm',
      // XTMODKEYS      | CSI > Pp ; Pv m                 | Set/reset key modifier options (XTMODKEYS), xterm.                                                                                                                      |
      // _XTMODKEYS   = 'm',   // XTMODKEYS      | CSI > Pp m                      | Set/reset key modifier options (XTMODKEYS), xterm.                                                                                                                      |
      _DSR            = 'n',
      // DSR            | CSI Ps n                        | Device Status Report (DSR).                                                                                                                                             |
      _XTUNMODKEYS    = 'n',
      // XTUNMODKEYS    | CSI > Ps n                      | Disable key modifier options, xterm.                                                                                                                                    |
      _DSR_DEC        = 'n',
      // DSR_DEC        | CSI ? Ps n                      | Device Status Report (DSR, DEC-specific).                                                                                                                               |
      _XTSMPOINTER    = 'p',
      // XTSMPOINTER    | CSI > Ps p                      | Set resource value pointerMode (XTSMPOINTER), xterm.                                                                                                                    |
      _DECSTR         = '!p',
      // DECSTR         | CSI ! p                         | Soft terminal reset (DECSTR), VT220 and up.                                                                                                                             |
      _DECSCL         = '"p',
      // DECSCL         | CSI Pl ; Pc " p                 | Set conformance level (DECSCL), VT220 and up.                                                                                                                           |
      _DECRQM         = '$p',
      // DECRQM         | CSI Ps $ p                      | Request ANSI mode (DECRQM).                                                                                                                                             |
      // _DECRQM      = '$p',  // DECRQM         | CSI ? Ps $ p                    | Request DEC private mode (DECRQM).                                                                                                                                      |
      _XTPUSHSGR      = '#p',
      // XTPUSHSGR      | CSI # p                         | Push video attributes onto stack (XTPUSHSGR), xterm.                                                                                                                    |
      // _XTPUSHSGR   = '#p',  // XTPUSHSGR      | CSI Pm # p                      | Push video attributes onto stack (XTPUSHSGR), xterm.                                                                                                                    |
      _XTVERSION      = 'q',
      // XTVERSION      | CSI > Ps q                      | (Ps = 0 ⇒) Report xterm name and version (XTVERSION).                                                                                                                   |
      _DECLL          = 'q',
      // DECLL          | CSI Ps q                        | Load LEDs (DECLL), VT100.                                                                                                                                               |
      _DECSCUSR       = ' q',
      // DECSCUSR       | CSI Ps SP q                     | Set cursor style (DECSCUSR), VT520.                                                                                                                                     |
      _DECSCA         = '"q',
      // DECSCA         | CSI Ps " q                      | Select character protection attribute (DECSCA), VT220.                                                                                                                  |
      _XTPOPSGR       = '#q',
      // XTPOPSGR       | CSI # q                         | Pop video attributes from stack (XTPOPSGR), xterm.                                                                                                                      |
      _DECSTBM        = 'r',
      // DECSTBM        | CSI Ps ; Ps r                   | Set Scrolling Region [top;bottom] (default = full size of window) (DECSTBM), VT100.                                                                                     |
      _XTRESTORE      = 'r',
      // XTRESTORE      | CSI ? Pm r                      | Restore DEC Private Mode Values (XTRESTORE), xterm.                                                                                                                     |
      _DECCARA        = '$r',
      // DECCARA        | CSI Pt ; Pl ; Pb ; Pr ; Ps $ r  | Change Attributes in Rectangular Area (DECCARA), VT400 and up.                                                                                                          |
      _SCOSC          = 's',
      // SCOSC          | CSI s                           | Save cursor, available only when DECLRMM is disabled (SCOSC, also ANSI.SYS).                                                                                            |
      _DECSLRM        = 's',
      // DECSLRM        | CSI Pl ; Pr s                   | Set left and right margins (DECSLRM), VT420 and up.                                                                                                                     |
      _XTSHIFTESCAPE  = 's',
      // XTSHIFTESCAPE  | CSI > Ps s                      | Set/reset shift-escape options (XTSHIFTESCAPE), xterm.                                                                                                                  |
      _XTSAVE         = 's',
      // XTSAVE         | CSI ? Pm s                      | Save DEC Private Mode Values (XTSAVE), xterm.                                                                                                                           |
      _XTWINOPS       = 't',
      // XTWINOPS       | CSI Ps ; Ps ; Ps t              | Window manipulation (XTWINOPS), dtterm, extended by xterm.                                                                                                              |
      _XTSMTITLE      = 't',
      // XTSMTITLE      | CSI > Pm t                      | Sets one/more features of the title modes (XTSMTITLE), xterm.                                                                                                           |
      _DECSWBV        = ' t',
      // DECSWBV        | CSI Ps SP t                     | Set warning-bell volume (DECSWBV), VT520.                                                                                                                               |
      _DECRARA        = '$t',
      // DECRARA        | CSI Pt ; Pl ; Pb ; Pr ; Ps $ t  | Reverse Attributes in Rectangular Area (DECRARA), VT400 and up.                                                                                                         |
      _SCORC          = 'u',
      // SCORC          | CSI u                           | Restore cursor (SCORC, also ANSI.SYS).                                                                                                                                  |
      _DECSMBV        = ' u',
      // DECSMBV        | CSI Ps SP u                     | Set margin-bell volume (DECSMBV), VT520.                                                                                                                                |
      _DECCRA         = '$v',
      // DECCRA         | CSI Pt;Pl;Pb;Pr;Pp;Pt;Pl;Pp $ v | Copy Rectangular Area (DECCRA), VT400 and up.                                                                                                                           |
      _DECRQPSR       = '$w',
      // DECRQPSR       | CSI Ps $ w                      | Request presentation state report (DECRQPSR), VT320 and up.                                                                                                             |
      _DECEFR         = '\'w',
      // DECEFR         | CSI Pt ; Pl ; Pb ; Pr ' w       | Enable Filter Rectangle (DECEFR), VT420 and up.                                                                                                                         |
      _DECREQTPARM    = 'x',
      // DECREQTPARM    | CSI Ps x                        | Request Terminal Parameters (DECREQTPARM).                                                                                                                              |
      _DECSACE        = '*x',
      // DECSACE        | CSI Ps * x                      | Select Attribute Change Extent (DECSACE), VT420 and up.                                                                                                                 |
      _DECFRA         = '$x',
      // DECFRA         | CSI Pc ; Pt ; Pl ; Pb ; Pr $ x  | Fill Rectangular Area (DECFRA), VT420 and up.                                                                                                                           |
      _XTCHECKSUM     = '#y',
      // XTCHECKSUM     | CSI Ps # y                      | Select checksum extension (XTCHECKSUM), xterm.                                                                                                                          |
      _DECRQCRA       = '*y',
      // DECRQCRA       | CSI Pi;Pg;Pt;Pl;Pb;Pr * y       | Request Checksum of Rectangular Area (DECRQCRA), VT420 and up.                                                                                                          |
      _DECELR         = '\'z',
      // DECELR         | CSI Ps ; Pu ' z                 | Enable Locator Reporting (DECELR).                                                                                                                                      |
      _DECERA         = '$z',
      // DECERA         | CSI Pt ; Pl ; Pb ; Pr $ z       | Erase Rectangular Area (DECERA), VT400 and up.                                                                                                                          |
      _DECSLE         = '\'{',
      // DECSLE         | CSI Pm ' {                      | Select Locator Events (DECSLE).                                                                                                                                         |
      // _XTPUSHSGR   = '#{',  // XTPUSHSGR      | CSI # {                         | Push video attributes onto stack (XTPUSHSGR), xterm.                                                                                                                    |
      // _XTPUSHSGR   = '#{',  // XTPUSHSGR      | CSI Pm # {                      | Push video attributes onto stack (XTPUSHSGR), xterm.                                                                                                                    |
      _DECSERA        = '${',
      // DECSERA        | CSI Pt ; Pl ; Pb ; Pr $ {       | Selective Erase Rectangular Area (DECSERA), VT400 and up.                                                                                                               |
      _XTREPORTSGR    = '#|',
      // XTREPORTSGR    | CSI Pt ; Pl ; Pb ; Pr # \|      | Report selected graphic rendition (XTREPORTSGR), xterm.                                                                                                                 |
      _DECSCPP        = '$|',
      // DECSCPP        | CSI Ps $ \|                     | Select columns per page (DECSCPP), VT340.                                                                                                                               |
      _DECRQLP        = '\'|',
      // DECRQLP        | CSI Ps ' \|                     | Request Locator Position (DECRQLP).                                                                                                                                     |
      _DECSNLS        = '*|',
      // DECSNLS        | CSI Ps * \|                     | Select number of lines per screen (DECSNLS), VT420 and up.                                                                                                              |
      // _XTPOPSGR    = '#}',  // XTPOPSGR       | CSI # }                         | Pop video attributes from stack (XTPOPSGR), xterm.                                                                                                                      |
      _DECIC          = '\'}',
      // DECIC          | CSI Ps ' }                      | Insert Ps Column(s) (default = 1) (DECIC), VT420 and up.                                                                                                                |
      _DECDC          = '\'~' // DECDC          | CSI Ps ' ~                      | Delete Ps Column(s) (default = 1) (DECDC), VT420 and up.                                                                                                                |

exports.CBT = CBT
exports.CHA = CHA
exports.CHT = CHT
exports.CNL = CNL
exports.CPL = CPL
exports.CUB = CUB
exports.CUD = CUD
exports.CUF = CUF
exports.CUP = CUP
exports.CUU = CUU
exports.DA = DA
exports.DA2 = DA2
exports.DA3 = DA3
exports.DCH = DCH
exports.DECANM = DECANM
exports.DECCARA = DECCARA
exports.DECCRA = DECCRA
exports.DECDC = DECDC
exports.DECEFR = DECEFR
exports.DECELR = DECELR
exports.DECERA = DECERA
exports.DECFRA = DECFRA
exports.DECIC = DECIC
exports.DECLL = DECLL
exports.DECRARA = DECRARA
exports.DECREQTPARM = DECREQTPARM
exports.DECRQCRA = DECRQCRA
exports.DECRQLP = DECRQLP
exports.DECRQM = DECRQM
exports.DECRQPSR = DECRQPSR
exports.DECRST = DECRST
exports.DECSACE = DECSACE
exports.DECSCA = DECSCA
exports.DECSCL = DECSCL
exports.DECSCPP = DECSCPP
exports.DECSCUSR = DECSCUSR
exports.DECSED = DECSED
exports.DECSEL = DECSEL
exports.DECSERA = DECSERA
exports.DECSLE = DECSLE
exports.DECSLRM = DECSLRM
exports.DECSMBV = DECSMBV
exports.DECSNLS = DECSNLS
exports.DECSTBM = DECSTBM
exports.DECSTR = DECSTR
exports.DECSWBV = DECSWBV
exports.DL = DL
exports.DSR = DSR
exports.DSR_DEC = DSR_DEC
exports.ECH = ECH
exports.ED = ED
exports.EL = EL
exports.HPA = HPA
exports.HPR = HPR
exports.HVP = HVP
exports.ICH = ICH
exports.IL = IL
exports.MC = MC
exports.REP = REP
exports.RM = RM
exports.SCORC = SCORC
exports.SCOSC = SCOSC
exports.SD = SD
exports.SGR = SGR
exports.SL = SL
exports.SM = SM
exports.SR = SR
exports.SU = SU
exports.TBC = TBC
exports.VPA = VPA
exports.VPR = VPR
exports.XTCHECKSUM = XTCHECKSUM
exports.XTHIMOUSE = XTHIMOUSE
exports.XTMODKEYS = XTMODKEYS
exports.XTPOPCOLORS = XTPOPCOLORS
exports.XTPOPSGR = XTPOPSGR
exports.XTPUSHCOLORS = XTPUSHCOLORS
exports.XTPUSHSGR = XTPUSHSGR
exports.XTREPORTCOLORS = XTREPORTCOLORS
exports.XTREPORTSGR = XTREPORTSGR
exports.XTRESTORE = XTRESTORE
exports.XTRMTITLE = XTRMTITLE
exports.XTSAVE = XTSAVE
exports.XTSHIFTESCAPE = XTSHIFTESCAPE
exports.XTSMGRAPHICS = XTSMGRAPHICS
exports.XTSMPOINTER = XTSMPOINTER
exports.XTSMTITLE = XTSMTITLE
exports.XTUNMODKEYS = XTUNMODKEYS
exports.XTVERSION = XTVERSION
exports.XTWINOPS = XTWINOPS
exports._CBT = _CBT
exports._CHA = _CHA
exports._CHT = _CHT
exports._CNL = _CNL
exports._CPL = _CPL
exports._CUB = _CUB
exports._CUD = _CUD
exports._CUF = _CUF
exports._CUP = _CUP
exports._CUU = _CUU
exports._DA = _DA
exports._DA2 = _DA2
exports._DA3 = _DA3
exports._DCH = _DCH
exports._DECANM = _DECANM
exports._DECCARA = _DECCARA
exports._DECCRA = _DECCRA
exports._DECDC = _DECDC
exports._DECEFR = _DECEFR
exports._DECELR = _DECELR
exports._DECERA = _DECERA
exports._DECFRA = _DECFRA
exports._DECIC = _DECIC
exports._DECLL = _DECLL
exports._DECRARA = _DECRARA
exports._DECREQTPARM = _DECREQTPARM
exports._DECRQCRA = _DECRQCRA
exports._DECRQLP = _DECRQLP
exports._DECRQM = _DECRQM
exports._DECRQPSR = _DECRQPSR
exports._DECRST = _DECRST
exports._DECSACE = _DECSACE
exports._DECSCA = _DECSCA
exports._DECSCL = _DECSCL
exports._DECSCPP = _DECSCPP
exports._DECSCUSR = _DECSCUSR
exports._DECSED = _DECSED
exports._DECSEL = _DECSEL
exports._DECSERA = _DECSERA
exports._DECSLE = _DECSLE
exports._DECSLRM = _DECSLRM
exports._DECSMBV = _DECSMBV
exports._DECSNLS = _DECSNLS
exports._DECSTBM = _DECSTBM
exports._DECSTR = _DECSTR
exports._DECSWBV = _DECSWBV
exports._DL = _DL
exports._DSR = _DSR
exports._DSR_DEC = _DSR_DEC
exports._ECH = _ECH
exports._ED = _ED
exports._EL = _EL
exports._HPA = _HPA
exports._HPR = _HPR
exports._HVP = _HVP
exports._ICH = _ICH
exports._IL = _IL
exports._MC = _MC
exports._REP = _REP
exports._RM = _RM
exports._SCORC = _SCORC
exports._SCOSC = _SCOSC
exports._SD = _SD
exports._SGR = _SGR
exports._SL = _SL
exports._SM = _SM
exports._SR = _SR
exports._SU = _SU
exports._TBC = _TBC
exports._VPA = _VPA
exports._VPR = _VPR
exports._XTCHECKSUM = _XTCHECKSUM
exports._XTHIMOUSE = _XTHIMOUSE
exports._XTMODKEYS = _XTMODKEYS
exports._XTPOPCOLORS = _XTPOPCOLORS
exports._XTPOPSGR = _XTPOPSGR
exports._XTPUSHCOLORS = _XTPUSHCOLORS
exports._XTPUSHSGR = _XTPUSHSGR
exports._XTREPORTCOLORS = _XTREPORTCOLORS
exports._XTREPORTSGR = _XTREPORTSGR
exports._XTRESTORE = _XTRESTORE
exports._XTRMTITLE = _XTRMTITLE
exports._XTSAVE = _XTSAVE
exports._XTSHIFTESCAPE = _XTSHIFTESCAPE
exports._XTSMGRAPHICS = _XTSMGRAPHICS
exports._XTSMPOINTER = _XTSMPOINTER
exports._XTSMTITLE = _XTSMTITLE
exports._XTUNMODKEYS = _XTUNMODKEYS
exports._XTVERSION = _XTVERSION
exports._XTWINOPS = _XTWINOPS
