export const NumberCapabilities = {
  head: [ 'variable', 'cap-name', 'tcap-code' ],
  rows: [
    [ 'columns', 'cols', 'co' ], // number of columns in a line
    [ 'init_tabs', 'it', 'it' ], // tabs initially every # spaces
    [ 'label_height', 'lh', 'lh' ], // rows in each label
    [ 'label_width', 'lw', 'lw' ], // columns in each label
    [ 'lines', 'lines', 'li' ], // number of lines on screen or page
    [ 'lines_of_memory', 'lm', 'lm' ], // lines of memory if > line. 0 means varies
    [ 'magic_cookie_glitch', 'xmc', 'sg' ], // number of blank characters left by smso or rmso
    [ 'max_attributes', 'ma', 'ma' ], // maximum combined attributes terminal can handle
    [ 'max_colors', 'colors', 'Co' ], // maximum number of colors on screen
    [ 'max_pairs', 'pairs', 'pa' ], // maximum number of color-pairs on the screen
    [ 'maximum_windows', 'wnum', 'MW' ], // maximum number of defineable windows
    [ 'no_color_video', 'ncv', 'NC' ], // video attributes that cannot be used with colors
    [ 'num_labels', 'nlab', 'Nl' ], // number of labels on screen
    [ 'padding_baud_rate', 'pb', 'pb' ], // lowest baud rate where padding needed
    [ 'virtual_terminal', 'vt', 'vt' ], // virtual terminal number (CB/unix)
    [ 'width_status_line', 'wsl', 'ws' ], // number of columns in status line
    // The following numeric capabilities are present in the SVr4.0 term structure, but are not yet documented in the man page.
    // They came in with SVr4's printer support.
    [ 'bit_image_entwining', 'bitwin', 'Yo' ], // number of passes for each bit-image row
    [ 'bit_image_type', 'bitype', 'Yp' ], // type of bit-image device
    [ 'buffer_capacity', 'bufsz', 'Ya' ], // numbers of bytes buffered before printing
    [ 'buttons', 'btns', 'BT' ], // number of buttons on mouse
    [ 'dot_horz_spacing', 'spinh', 'Yc' ], // spacing of dots hor‐ izontally in dots per inch
    [ 'dot_vert_spacing', 'spinv', 'Yb' ], // spacing of pins ver‐ tically in pins per inch
    [ 'max_micro_address', 'maddr', 'Yd' ], // maximum value in micro_..._address
    [ 'max_micro_jump', 'mjump', 'Ye' ], // maximum value in parm_..._micro
    [ 'micro_col_size', 'mcs', 'Yf' ], // character step size when in micro mode
    [ 'micro_line_size', 'mls', 'Yg' ], // line step size when in micro mode
    [ 'number_of_pins', 'npins', 'Yh' ], // numbers of pins in print-head
    [ 'output_res_char', 'orc', 'Yi' ], // horizontal resolu‐ tion in units per line
    [ 'output_res_horz_inch', 'orhi', 'Yk' ], // horizontal resolu‐ tion in units per inch
    [ 'output_res_line', 'orl', 'Yj' ], // vertical resolution in units per line
    [ 'output_res_vert_inch', 'orvi', 'Yl' ], // vertical resolution in units per inch
    [ 'print_rate', 'cps', 'Ym' ], // print rate in char‐ acters per second
    [ 'wide_char_size', 'widcs', 'Yn' ], // character step size when in double wide mode
  ],
}
