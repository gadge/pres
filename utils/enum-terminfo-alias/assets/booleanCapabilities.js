export const BooleanCapabilities = {
  head: ['variable', 'cap-name', 'tcap-code'],
  rows: [
    ['auto_left_margin'        , 'bw'   , 'bw'], // cub1 wraps from col‐ umn 0 to last column
    ['auto_right_margin'       , 'am'   , 'am'], // terminal has auto‐ matic margins
    ['back_color_erase'        , 'bce'  , 'ut'], // screen erased with background color
    ['can_change'              , 'ccc'  , 'cc'], // terminal can re- define existing col‐ ors
    ['ceol_standout_glitch'    , 'xhp'  , 'xs'], // standout not erased by overwriting (hp)
    ['col_addr_glitch'         , 'xhpa' , 'YA'], // only positive motion for hpa/mhpa caps
    ['cpi_changes_res'         , 'cpix' , 'YF'], // changing character pitch changes reso‐ lution
    ['cr_cancels_micro_mode'   , 'crxm' , 'YB'], // using cr turns off micro mode
    ['dest_tabs_magic_smso'    , 'xt'   , 'xt'], // tabs destructive, magic so char (t1061)
    ['eat_newline_glitch'      , 'xenl' , 'xn'], // newline ignored after 80 cols (con‐ cept)
    ['erase_overstrike'        , 'eo'   , 'eo'], // can erase over‐ strikes with a blank
    ['generic_type'            , 'gn'   , 'gn'], // generic line type
    ['hard_copy'               , 'hc'   , 'hc'], // hardcopy terminal
    ['hard_cursor'             , 'chts' , 'HC'], // cursor is hard to see
    ['has_meta_key'            , 'km'   , 'km'], // Has a meta key (i.e., sets 8th-bit)
    ['has_print_wheel'         , 'daisy', 'YC'], // printer needs opera‐ tor to change char‐ acter set
    ['has_status_line'         , 'hs'   , 'hs'], // has extra status line
    ['hue_lightness_saturation', 'hls'  , 'hl'], // terminal uses only HLS color notation (Tektronix)
    ['insert_null_glitch'      , 'in'   , 'in'], // insert mode distin‐ guishes nulls
    ['lpi_changes_res'         , 'lpix' , 'YG'], // changing line pitch changes resolution
    ['memory_above'            , 'da'   , 'da'], // display may be retained above the screen
    ['memory_below'            , 'db'   , 'db'], // display may be retained below the screen
    ['move_insert_mode'        , 'mir'  , 'mi'], // safe to move while in insert mode
    ['move_standout_mode'      , 'msgr' , 'ms'], // safe to move while in standout mode
    ['needs_xon_xoff'          , 'nxon' , 'nx'], // padding will not work, xon/xoff required
    ['no_esc_ctlc'             , 'xsb'  , 'xb'], // beehive (f1=escape, f2=ctrl C)
    ['no_pad_char'             , 'npc'  , 'NP'], // pad character does not exist
    ['non_dest_scroll_region'  , 'ndscr', 'ND'], // scrolling region is non-destructive
    ['non_rev_rmcup'           , 'nrrmc', 'NR'], // smcup does not reverse rmcup
    ['over_strike'             , 'os'   , 'os'], // terminal can over‐ strike
    ['prtr_silent'             , 'mc5i' , '5i'], // printer will not echo on screen
    ['row_addr_glitch'         , 'xvpa' , 'YD'], // only positive motion for vpa/mvpa caps
    ['semi_auto_right_margin'  , 'sam'  , 'YE'], // printing in last column causes cr
    ['status_line_esc_ok'      , 'eslok', 'es'], // escape can be used on the status line
    ['tilde_glitch'            , 'hz'   , 'hz'], // cannot print ~'s (hazeltine)
    ['transparent_underline'   , 'ul'   , 'ul'], // underline character overstrikes
    ['xon_xoff'                , 'xon'  , 'xo'], // terminal uses xon/xoff handshaking
  ],
}
