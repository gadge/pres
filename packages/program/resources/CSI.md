## Popular ANSI CSI (Control Sequence Introducer) sequences

| Code        | Abbr | Name                         | Effect                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------- | ---- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSI n A     | CUU  | Cursor Up                    | Moves the cursor n (default `1`) cells in the given direction. If the cursor is already at the edge of the screen, this has no effect.                                                                                                                                                                                                                                                                              |
| CSI n B     | CUD  | Cursor Down                  |                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CSI n C     | CUF  | Cursor Forward               |                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CSI n D     | CUB  | Cursor Back                  |                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CSI n E     | CNL  | Cursor Next Line             | Moves cursor to beginning of the line n (default `1`) lines down. (not [ANSI.SYS]                                                                                                                                                                                                                                                                                                                                   |
| CSI n F     | CPL  | Cursor Previous Line         | Moves cursor to beginning of the line n (default `1`) lines up. (not [ANSI.SYS]                                                                                                                                                                                                                                                                                                                                     |
| CSI n G     | CHA  | Cursor Horizontal Absolute   | Moves the cursor to column n (default `1`). (not [ANSI.SYS]                                                                                                                                                                                                                                                                                                                                                         |
| CSI n ; m H | CUP  | Cursor Position              | Moves the cursor to row n, column m. The values are 1-based, and default to `1` (top left corner) if omitted. A sequence such as `CSI ;5H` is a synonym for `CSI 1;5H` as well as `CSI 17;H` is the same as `CSI 17H` and `CSI 17;1H`                                                                                                                                                                               |
| CSI n J     | ED   | Erase in Display             | Clears part of the screen. If n is `0` (or missing), clear from cursor to end of screen. If n is `1`, clear from cursor to beginning of the screen. If n is `2`, clear entire screen (and moves cursor to upper left on DOS [ANSI.SYS]). If n is `3`, clear entire screen and delete all lines saved in the scrollback buffer (this feature was added for [xterm] and is supported by other terminal applications). |
| CSI n K     | EL   | Erase in Line                | Erases part of the line. If n is `0` (or missing), clear from cursor to the end of the line. If n is `1`, clear from cursor to beginning of the line. If n is `2`, clear entire line. Cursor position does not change.                                                                                                                                                                                              |
| CSI n S     | SU   | Scroll Up                    | Scroll whole page up by n (default `1`) lines. New lines are added at the bottom. (not [ANSI.SYS]                                                                                                                                                                                                                                                                                                                   |
| CSI n T     | SD   | Scroll Down                  | Scroll whole page down by n (default `1`) lines. New lines are added at the top. (not [ANSI.SYS]                                                                                                                                                                                                                                                                                                                    |
| CSI n ; m f | HVP  | Horizontal Vertical Position | Same as CUP, but counts as a format effector function (like [CR] "Carriage return") or [LF] "Line feed") rather than an editor function (like CUD or CNL). This can lead to different handling in certain terminal modes.[[5]]:Annex A                                                                                                                                                                              |
| CSI n m     | SGR  | Select Graphic Rendition     | Sets the appearance of the following characters.                                                                                                                                                                                                                                                                                                                                                                    |
| CSI 5i      |      | AUX Port On                  | Enable aux serial port usually for local serial printer                                                                                                                                                                                                                                                                                                                                                             |
| CSI 4i      |      | AUX Port Off                 | Disable aux serial port usually for local serial printer                                                                                                                                                                                                                                                                                                                                                            |
| CSI 6n      | DSR  | Device Status Report         | Reports the cursor position (CPR) by transmitting `ESC[n;mR`, where n is the row and m is the column.)                                                                                                                                                                                                                                                                                                              |

## Popular Private CSI sequences

| Code         | Abbr       | Name                          | Effect                                                                                                                                                                                                                |
| ------------ | ---------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSI s        | SCP, SCOSC | Save Current Cursor Position  | Saves the cursor position/state in SCO console mode.[[24]]  In vertical split screen mode, instead used to set (as  `CSI  n  ;  n  s`) or reset left and right margins.[[25]]                                         |
| CSI u        | RCP, SCORC | Restore Saved Cursor Position | Restores the cursor position/state in SCO console mode.[[26]]                                                                                                                                                         |
| CSI ? 25 h   | DECTCEM    |                               | Shows the cursor, from the  [VT220] .                                                                                                                                                                                 |
| CSI ? 25 l   | DECTCEM    |                               | Hides the cursor.                                                                                                                                                                                                     |
| CSI ? 1049 h |            |                               | Enable alternative screen buffer, from xterm                                                                                                                                                                          |
| CSI ? 1049 l |            |                               | Disable alternative screen buffer, from xterm                                                                                                                                                                         |
| CSI ? 2004 h |            |                               | Turn on bracketed paste mode. Text pasted into the terminal will be surrounded by  `ESC [200~`  and  `ESC [201~`, and characters in it should not be treated as commands (for example in Vim).[[27]] From xterm[[28]] |
| CSI ? 2004 l |            |                               | Turn off bracketed paste mode.                                                                                                                                                                                        |

## C1 (8-Bit) Control Characters

The xterm program recognizes both 8-bit and 7-bit control characters.
It generates 7-bit controls (by default) or 8-bit if S8C1T is enabled.
The following pairs of 7-bit and 8-bit control characters are equivalent:

| code  | name  | desc                                                                                     |
| ----- | ----- | ---------------------------------------------------------------------------------------- |
| ESC D | IND   | Index (IND is 0x84).                                                                     |
| ESC E | NEL   | Next Line (NEL is 0x85).                                                                 |
| ESC H | HTS   | Tab Set (HTS is 0x88).                                                                   |
| ESC M | RI    | Reverse Index (RI is 0x8d).                                                              |
| ESC N | SS2   | Single Shift Select of G2 Character Set (SS2 is 0x8e). This affects next character only. |
| ESC O | SS3   | Single Shift Select of G3 Character Set (SS3 is 0x8f). This affects next character only. |
| ESC P | DCS   | Device Control String (DCS is 0x90).                                                     |
| ESC V | SPA   | Start of Guarded Area (SPA is 0x96).                                                     |
| ESC W | EPA   | End of Guarded Area (EPA is 0x97).                                                       |
| ESC X | SOS   | Start of String (SOS is 0x98).                                                           |
| ESC Z | DECID | Return Terminal ID (DECID is 0x9a).  Obsolete form of CSI c (DA).                        |
| ESC [ | CSI   | Control Sequence Introducer (CSI is 0x9b).                                               |
| ESC \ | ST    | String Terminator (ST is 0x9c).                                                          |
| ESC ] | OSC   | Operating System Command (OSC is 0x9d).                                                  |
| ESC ^ | PM    | Privacy Message (PM is 0x9e).                                                            |
| ESC _ | APC   | Application Program Command (APC is 0x9f).                                               |

## Controls beginning with ESC

This excludes controls where ESC  is part of a 7-bit equivalent to 8-bit C1 controls, ordered by the final character(s).

| code     | name             | desc                                                                                                           |
| -------- | ---------------- | -------------------------------------------------------------------------------------------------------------- |
| ESC SP F | S7C1T            | 7-bit controls (S7C1T).                                                                                        |
| ESC SP G | S8C1T            | 8-bit controls (S8C1T).                                                                                        |
| ESC SP L | dpANS X3.134.1   | Set ANSI conformance level 1 (dpANS X3.134.1).                                                                 |
| ESC SP M | dpANS X3.134.1   | Set ANSI conformance level 2 (dpANS X3.134.1).                                                                 |
| ESC SP N | dpANS X3.134.1   | Set ANSI conformance level 3 (dpANS X3.134.1).                                                                 |
| ESC # 3  | DECDHL           | DEC double-height line, top half (DECDHL).                                                                     |
| ESC # 4  | DECDHL           | DEC double-height line, bottom half (DECDHL).                                                                  |
| ESC # 5  | DECSWL           | DEC single-width line (DECSWL).                                                                                |
| ESC # 6  | DECDWL           | DEC double-width line (DECDWL).                                                                                |
| ESC # 8  | DECALN           | DEC Screen Alignment Test (DECALN).                                                                            |
| ESC % @  | ISO 2022         | Select default character set.  That is ISO 8859-1 (ISO 2022).                                                  |
| ESC % G  | ISO 2022         | Select UTF-8 character set (ISO 2022).                                                                         |
| ESC ( C  | ISO 2022, VT100  | Designate G0 Character Set (ISO 2022, VT100). [Appendix.1]                                                     |
| ESC ) C  | ISO 2022, VT100  | Designate G1 Character Set (ISO 2022, VT100). The same character sets apply as for ESC ( C.                    |
| ESC * C  | ISO 2022, VT220  | Designate G2 Character Set (ISO 2022, VT220). The same character sets apply as for ESC ( C.                    |
| ESC + C  | ISO 2022, VT220  | Designate G3 Character Set (ISO 2022, VT220). The same character sets apply as for ESC ( C.                    |
| ESC - C  | VT300            | Designate G1 Character Set (VT300). The same character sets apply as for ESC ( C.                              |
| ESC . C  | VT300            | Designate G2 Character Set (VT300). The same character sets apply as for ESC ( C.                              |
| ESC / C  | VT300            | Designate G3 Character Set (VT300). These work for 96-character sets only. C = A  -> ISO Latin-1 Supplemental. |
| ESC 6    | DECBI            | Back Index (DECBI), VT420 and up.                                                                              |
| ESC 7    | DECSC            | Save Cursor (DECSC).                                                                                           |
| ESC 8    | DECRC            | Restore Cursor (DECRC).                                                                                        |
| ESC 9    | DECFI            | Forward Index (DECFI), VT420 and up.                                                                           |
| ESC =    | DECKPAM          | Application Keypad (DECKPAM).                                                                                  |
| ESC >    | DECKPNM          | Normal Keypad (DECKPNM).                                                                                       |
| ESC F    |                  | Cursor to lower left corner of screen.  This is enabled by the hpLowerleftBugCompat resource.                  |
| ESC c    | RIS              | Full Reset (RIS).                                                                                              |
| ESC l    | per HP terminals | Memory Lock (per HP terminals).  Locks memory above the cursor.                                                |
| ESC m    | per HP terminals | Memory Unlock (per HP terminals).                                                                              |
| ESC n    | LS2              | Invoke the G2 Character Set as GL (LS2).                                                                       |
| ESC o    | LS3              | Invoke the G3 Character Set as GL (LS3).                                                                       |
| ESC      |                  |                                                                                                                |
| ESC }    | LS2R             | Invoke the G2 Character Set as GR (LS2R).                                                                      |
| ESC ~    | LS1R             | Invoke the G1 Character Set as GR (LS1R).                                                                      |

[Appendix.1]
Final character C for designating 94-character sets.  In this
list, 0 , A  and B  apply to VT100 and up, the remainder to
VT220 and up.  The VT220 character sets, together with the
Portuguese character set are activated by the National
Replacement Character controls.  The A  is a special case,
since it is also activated by the VT300-control for British
Latin-1 separately from the National Replacement Character
controls.
C = 0  -> DEC Special Character and Line Drawing Set.
C = <  -> DEC Supplementary (VT200).
C = % 5  -> DEC Supplementary Graphics (VT300).
C = >  -> DEC Technical (VT300).
C = A  -> United Kingdom (UK).
C = B  -> United States (USASCII).
C = 4  -> Dutch.
C = C  or 5  -> Finnish.
C = R  or f  -> French.
C = Q  or 9  -> French Canadian (VT200, VT300).
C = K  -> German.
C = Y  -> Italian.
C = ` , E  or 6  -> Norwegian/Danish.
C = % 6  -> Portuguese (VT300).
C = Z  -> Spanish.
C = H  or 7  -> Swedish.
C = =  -> Swiss.

## CSI from Google

| CSI | Name        | Description                            | Action                                                                                                                                |
| --- | ----------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| @   | ICH         | Insert Blank Characters                | Add space                                                                                                                             |
| A   | CUU         | Cursor Up                              | Move cursor up `arg1` rows                                                                                                            |
| B   | CUD         | Cursor Down                            | Move cursor down `arg1` rows                                                                                                          |
| C   | CUF         | Cursor Forward                         | Move cursor forward `arg1` columns                                                                                                    |
| D   | CUB         | Cursor Backward                        | Move cursor back `arg1` columns                                                                                                       |
| E   | CNL         | Cursor Next Line                       | Move cursor down `arg1` rows and to first column                                                                                      |
| F   | CPL         | Cursor Preceding Line                  | Move cursor up `arg1` rows and to first column                                                                                        |
| G   | CHA         | Cursor Character Absolute              | Move cursor to `arg1` column                                                                                                          |
| H   | CUP         | Cursor Position                        | Move cursor to `arg1` row and `arg2` column                                                                                           |
| I   | CHT         | Cursor Forward Tabulation              | Move cursor forward `arg1` tabs                                                                                                       |
| J   | ED          | Erase in Display                       | `!arg1` or `arg1 == 0`: Clear cursor to end of display<br>`arg1 == 1`: Clear start of display to cursor<br>`arg1 == 2`: Clear display |
| ?J  | DECSED      | Selective Erase in Display             | Same as ED above                                                                                                                      |
| K   | EL          | Erase in Line                          | `!arg1` or `arg1 == 0`: Clear cursor to end of line<br>`arg1 == 1`: Clear start of line to cursor<br>`arg1 == 2`: Clear line          |
| ?K  | DECSEL      | Selective Erase in Line                | Same as EL above                                                                                                                      |
| L   | IL          | Insert Lines                           | Insert `arg1` lines                                                                                                                   |
| M   | DL          | Delete Lines                           | Delete `arg1` lines                                                                                                                   |
| N   | EF          | Erase in Field                         | *Ignored (TBD)*                                                                                                                       |
| O   | EA          | Erase in Area                          | *Ignored (TBD)*                                                                                                                       |
| P   | DCH         | Delete Characters                      | Delete `arg1` characters before cursor                                                                                                |
| Q   | SEE         | Select Editing Extent                  | *Ignored (TBD)*                                                                                                                       |
| R   | CPR         | Active Position Report                 | *Ignored (TBD)*                                                                                                                       |
| S   | SU          | Scroll Up                              | Scroll up `arg1` lines                                                                                                                |
| T   | SD          | Scroll Down                            | Scroll down `arg1` lines                                                                                                              |
| >T  |             |                                        | Won't support                                                                                                                         |
| U   | NP          | Next Page                              | *Ignored (TBD)*                                                                                                                       |
| V   | PP          | Previous Page                          | *Ignored (TBD)*                                                                                                                       |
| W   | CTC         | Cursor Tabulation Control              | *Ignored (TBD)*                                                                                                                       |
| X   | ECH         | Erase Characters                       | Delete `arg1` characters after cursor                                                                                                 |
| Y   | CVT         | Cursor Line Tabulation                 | *Ignored (TBD)*                                                                                                                       |
| Z   | CBT         | Cursor Backward Tabulation             | Move cursor back `arg1` tabs                                                                                                          |
| [   | SRS         | Start Reversed String                  | *Ignored (TBD)*                                                                                                                       |
| \   | PTX         | Parallel Texts                         | *Ignored (TBD)*                                                                                                                       |
| ]   | SDS         | Start Directed String                  | *Ignored (TBD)*                                                                                                                       |
| ^   | SIMD        | Select Implicit Movement Direction     | *Ignored (TBD)*                                                                                                                       |
| _   |             |                                        | *Ignored (TBD)*                                                                                                                       |
| `   | HPA         | Character Position Absolute            | Same as CHA above                                                                                                                     |
| a   | HPR         | Character Position Relative            | Move cursor forward `arg1` columns                                                                                                    |
| b   | REP         | Repeat                                 | *Ignored (TBD)*                                                                                                                       |
| c   | DA/DA1      | Send Primary Device Attributes         | Currently reports “VT100 with Advanced Video Option”                                                                                  |
| >c  | DA2         | Send Secondary Device Attributes       | Currently reports “VT100”                                                                                                             |
| d   | VPA         | Line Position Absolute                 | Move cursor to `arg1` row                                                                                                             |
| e   | VPR         | Line Position Forward                  | *Ignored (TBD)*                                                                                                                       |
| f   | HVP         | Horizontal and Vertical Position       | Same as CUP above                                                                                                                     |
| g   | TBC         | Tab Clear                              | `!arg1` or `arg1 == 0`: Clear tab stop at cursor<br>`arg1 == 3`: Clear all tab stops                                                  |
| h   | SM          | Set Mode                               | Supported [**(1)**]                                                                                                                   |
| ?h  | DECSET      | DEC Set Mode                           | Supported [**(2)**]                                                                                                                   |
| i   | MC          | Media Copy                             | Won't support                                                                                                                         |
| ?i  | DECMC       | DEC Media Copy                         | Won't support                                                                                                                         |
| j   | HPB         | Character Position Backward            | *Ignored (TBD)*                                                                                                                       |
| k   | VPB         | Line Position Backward                 | *Ignored (TBD)*                                                                                                                       |
| l   | RM          | Reset Mode                             | Supported [**(1)**]                                                                                                                   |
| ?l  | DECRST      | DEC Mode Reset                         | Supported [**(2)**]                                                                                                                   |
| m   | SGR         | Select Graphic Rendition               | Supported [**(3)**]                                                                                                                   |
| >m  |             | xterm specific keyboard modes          | Won't support                                                                                                                         |
| n   | DSR         | Device Status Reports                  | Supported                                                                                                                             |
| ?n  | DECDSR      | DEC Device Status Reports              | Supported                                                                                                                             |
| >n  |             | xterm specific modifiers               | Won't support                                                                                                                         |
| o   | DAQ         | Define Area Qualification              | *Ignored (TBD)*                                                                                                                       |
| p   |             |                                        | *Ignored (TBD)*                                                                                                                       |
| >p  |             | xterm specific cursor display control  | *Ignored (TBD)*                                                                                                                       |
| !p  | DECSTR      | Soft Terminal Reset                    | Supported                                                                                                                             |
| $p  | DECRQM      | Request Mode - Host To Terminal        | *Ignored (TBD)*                                                                                                                       |
| ?$p | DECRQM      | Request Mode - Host To Terminal        | *Ignored (TBD)*                                                                                                                       |
| "p  | DECSCL      | Select Conformance Level               | *Ignored (TBD)*                                                                                                                       |
| q   | DECLL       | Load LEDs                              | *Ignored (TBD)*                                                                                                                       |
| ␠q  | DECSCUSR    | Set Cursor Style                       | Supported                                                                                                                             |
| "q  | DECSCA      | Select Character Protection Attribute  | Won't support                                                                                                                         |
| r   | DECSTBM     | Set Top and Bottom Margins             | Supported                                                                                                                             |
| ?r  |             |                                        | Won't support                                                                                                                         |
| $r  |             |                                        | Won't support                                                                                                                         |
| s   |             | Save cursor (ANSI.SYS)                 | Supported                                                                                                                             |
| ?s  |             |                                        | Won't support                                                                                                                         |
| t   |             |                                        | Won't support                                                                                                                         |
| $t  | DECRARA     | Reverse Attributes in Rectangular Area | Won't support                                                                                                                         |
| >t  |             |                                        | Won't support                                                                                                                         |
| ␠t  | DECSWBV     | Set Warning Bell Volume                | Won't support                                                                                                                         |
| u   |             | Restore cursor (ANSI.SYS)              | Supported                                                                                                                             |
| ␠u  | DECSMBV     | Set Margin Bell Volume                 | Won't support                                                                                                                         |
| v   |             |                                        | *Ignored (TBD)*                                                                                                                       |
| $v  | DECCRA      | Copy Rectangular Area                  | Won't support                                                                                                                         |
| w   |             |                                        | *Ignored (TBD)*                                                                                                                       |
| 'w  | DECEFR      | Enable Filter Rectangle                | Won't support                                                                                                                         |
| x   | DECREQTPARM | Request Terminal Parameters            | *Ignored (TBD)*                                                                                                                       |
| *x  | DECSACE     | Select Attribute Change Extent         | Won't support                                                                                                                         |
| $x  | DECFRA      | Fill Rectangular Area                  | Won't support                                                                                                                         |
| y   |             |                                        | *Ignored (TBD)*                                                                                                                       |
| z   |             |                                        | *Ignored (TBD)*                                                                                                                       |
| 'z  |             |                                        | *Ignored (TBD)*                                                                                                                       |
| $z  | DECERA      | Erase Rectangular Area                 | Won't support                                                                                                                         |
| '{  |             |                                        | *Ignored (TBD)*                                                                                                                       |
| '\| |             |                                        | *Ignored (TBD)*                                                                                                                       |
| '}  | DECIC       | Insert Column                          | Won't support                                                                                                                         |
| '~  | DECDC       | Delete Column                          | Won't support                                                                                                                         |
