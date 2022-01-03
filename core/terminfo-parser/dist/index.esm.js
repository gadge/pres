import fs from 'fs';
import path, { dirname } from 'path';
import { Logger, merge, slice } from '@pres/util-helpers';
import { STR, FUN, BOO, NUM } from '@typen/enum-data-types';
import { nullish } from '@typen/nullish';
import assert from 'assert';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { BooleanCapabilities, NumberCapabilities, StringCapabilities } from '@pres/enum-terminfo-alias';

function tryRead(file) {
  if (Array.isArray(file)) {
    for (let i = 0; i < file.length; i++) {
      const data = tryRead(file[i]);
      if (data) return data;
    }

    return '';
  }

  if (!file) return '';
  file = path.resolve.apply(path, arguments);

  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    return '';
  }
}
/**
 * sprintf
 *  http://www.cplusplus.com/reference/cstdio/printf/
 */

function sprintf(src) {
  const params = Array.prototype.slice.call(arguments, 1),
        rule = /%([\-+# ]{1,4})?(\d+(?:\.\d+)?)?([doxXsc])/g;
  let i = 0;
  return src.replace(rule, (_, flag, width, type) => {
    const flags = (flag || '').split('');
    let param = params[i] != null ? params[i] : '';
    const initial = param; // , width = +width,

    const opt = {};
    let pre = '';
    i++;

    switch (type) {
      case 'd':
        // signed int
        param = (+param).toString(10);
        break;

      case 'o':
        // unsigned octal
        param = (+param).toString(8);
        break;

      case 'x':
        // unsigned hex int
        param = (+param).toString(16);
        break;

      case 'X':
        // unsigned hex int uppercase
        param = (+param).toString(16).toUppercase();
        break;

      case 's':
        // string
        break;

      case 'c':
        // char
        param = isFinite(param) ? String.fromCharCode(param || 0x80) : '';
        break;
    }

    flags.forEach(flag => {
      switch (flag) {
        // left-justify by width
        case '-':
          opt.left = true;
          break;
        // always precede numbers with their signs

        case '+':
          opt.signs = true;
          break;
        // used with o, x, X - value is preceded with 0, 0x, or 0X respectively.
        // used with a, A, e, E, f, F, g, G - forces written output to contain
        // a decimal point even if no more digits follow

        case '#':
          opt.hexpoint = true;
          break;
        // if no sign is going to be written, black space in front of the value

        case ' ':
          opt.space = true;
          break;
      }
    });
    width = +width.split('.')[0]; // Should this be for opt.left too?
    // Example: %2.2X - turns 0 into 00

    if (width && !opt.left) {
      param = param + '';

      while (param.length < width) {
        param = '0' + param;
      }
    }

    if (opt.signs) {
      if (+initial >= 0) {
        pre += '+';
      }
    }

    if (opt.space) {
      if (!opt.signs && +initial >= 0) {
        pre += ' ';
      }
    }

    if (opt.hexpoint) {
      switch (type) {
        case 'o':
          // unsigned octal
          pre += '0';
          break;

        case 'x':
          // unsigned hex int
          pre += '0x';
          break;

        case 'X':
          // unsigned hex int uppercase
          pre += '0X';
          break;
      }
    }

    if (opt.left) {
      if (width > pre.length + param.length) {
        width -= pre.length + param.length;
        pre = Array(width + 1).join(' ') + pre;
      }
    }

    return pre + param;
  });
}

const whichTerminal = options => {
  const terminal = options.terminal || options.term || process.env.TERM || (process.platform === 'win32' ? 'windows-ansi' : 'xterm');
  return terminal.toLowerCase();
};

// DEC Special Character and Line Drawing Set.
// Taken from tty.js.
const ACSC = {
  // (0
  '`': '\u25c6',
  // '◆'
  'a': '\u2592',
  // '▒'
  'b': '\u0009',
  // '\t'
  'c': '\u000c',
  // '\f'
  'd': '\u000d',
  // '\r'
  'e': '\u000a',
  // '\n'
  'f': '\u00b0',
  // '°'
  'g': '\u00b1',
  // '±'
  'h': '\u2424',
  // '\u2424' (NL)
  'i': '\u000b',
  // '\v'
  'j': '\u2518',
  // '┘'
  'k': '\u2510',
  // '┐'
  'l': '\u250c',
  // '┌'
  'm': '\u2514',
  // '└'
  'n': '\u253c',
  // '┼'
  'o': '\u23ba',
  // '⎺'
  'p': '\u23bb',
  // '⎻'
  'q': '\u2500',
  // '─'
  'r': '\u23bc',
  // '⎼'
  's': '\u23bd',
  // '⎽'
  't': '\u251c',
  // '├'
  'u': '\u2524',
  // '┤'
  'v': '\u2534',
  // '┴'
  'w': '\u252c',
  // '┬'
  'x': '\u2502',
  // '│'
  'y': '\u2264',
  // '≤'
  'z': '\u2265',
  // '≥'
  '{': '\u03c0',
  // 'π'
  '|': '\u2260',
  // '≠'
  '}': '\u00a3',
  // '£'
  '~': '\u00b7' // '·'

};

/**
 * Terminfo Data
 */
const CAPS_BOO = ['auto_left_margin', 'auto_right_margin', 'no_esc_ctlc', 'ceol_standout_glitch', 'eat_newline_glitch', 'erase_overstrike', 'generic_type', 'hard_copy', 'has_meta_key', 'has_status_line', 'insert_null_glitch', 'memory_above', 'memory_below', 'move_insert_mode', 'move_standout_mode', 'over_strike', 'status_line_esc_ok', 'dest_tabs_magic_smso', 'tilde_glitch', 'transparent_underline', 'xon_xoff', 'needs_xon_xoff', 'prtr_silent', 'hard_cursor', 'non_rev_rmcup', 'no_pad_char', 'non_dest_scroll_region', 'can_change', 'back_color_erase', 'hue_lightness_saturation', 'col_addr_glitch', 'cr_cancels_micro_mode', 'has_print_wheel', 'row_addr_glitch', 'semi_auto_right_margin', 'cpi_changes_res', 'lpi_changes_res', // #ifdef __INTERNAL_CAPS_VISIBLE
'backspaces_with_bs', 'crt_no_scrolling', 'no_correctly_working_cr', 'gnu_has_meta_key', 'linefeed_is_newline', 'has_hardware_tabs', 'return_does_clr_eol'];

const CAPS_NUM = ['columns', 'init_tabs', 'lines', 'lines_of_memory', 'magic_cookie_glitch', 'padding_baud_rate', 'virtual_terminal', 'width_status_line', 'num_labels', 'label_height', 'label_width', 'max_attributes', 'maximum_windows', 'max_colors', 'max_pairs', 'no_color_video', 'buffer_capacity', 'dot_vert_spacing', 'dot_horz_spacing', 'max_micro_address', 'max_micro_jump', 'micro_col_size', 'micro_line_size', 'number_of_pins', 'output_res_char', 'output_res_line', 'output_res_horz_inch', 'output_res_vert_inch', 'print_rate', 'wide_char_size', 'buttons', 'bit_image_entwining', 'bit_image_type', // #ifdef __INTERNAL_CAPS_VISIBLE
'magic_cookie_glitch_ul', 'carriage_return_delay', 'new_line_delay', 'backspace_delay', 'horizontal_tab_delay', 'number_of_function_keys'];

const CAPS_STR = ['back_tab', 'bell', 'carriage_return', 'change_scroll_region', 'clear_all_tabs', 'clear_screen', 'clr_eol', 'clr_eos', 'column_address', 'command_character', 'cursor_address', 'cursor_down', 'cursor_home', 'cursor_invisible', 'cursor_left', 'cursor_mem_address', 'cursor_normal', 'cursor_right', 'cursor_to_ll', 'cursor_up', 'cursor_visible', 'delete_character', 'delete_line', 'dis_status_line', 'down_half_line', 'enter_alt_charset_mode', 'enter_blink_mode', 'enter_bold_mode', 'enter_ca_mode', 'enter_delete_mode', 'enter_dim_mode', 'enter_insert_mode', 'enter_secure_mode', 'enter_protected_mode', 'enter_reverse_mode', 'enter_standout_mode', 'enter_underline_mode', 'erase_chars', 'exit_alt_charset_mode', 'exit_attribute_mode', 'exit_ca_mode', 'exit_delete_mode', 'exit_insert_mode', 'exit_standout_mode', 'exit_underline_mode', 'flash_screen', 'form_feed', 'from_status_line', 'init_1string', 'init_2string', 'init_3string', 'init_file', 'insert_character', 'insert_line', 'insert_padding', 'key_backspace', 'key_catab', 'key_clear', 'key_ctab', 'key_dc', 'key_dl', 'key_down', 'key_eic', 'key_eol', 'key_eos', 'key_f0', 'key_f1', 'key_f10', 'key_f2', 'key_f3', 'key_f4', 'key_f5', 'key_f6', 'key_f7', 'key_f8', 'key_f9', 'key_home', 'key_ic', 'key_il', 'key_left', 'key_ll', 'key_npage', 'key_ppage', 'key_right', 'key_sf', 'key_sr', 'key_stab', 'key_up', 'keypad_local', 'keypad_xmit', 'lab_f0', 'lab_f1', 'lab_f10', 'lab_f2', 'lab_f3', 'lab_f4', 'lab_f5', 'lab_f6', 'lab_f7', 'lab_f8', 'lab_f9', 'meta_off', 'meta_on', 'newline', 'pad_char', 'parm_dch', 'parm_delete_line', 'parm_down_cursor', 'parm_ich', 'parm_index', 'parm_insert_line', 'parm_left_cursor', 'parm_right_cursor', 'parm_rindex', 'parm_up_cursor', 'pkey_key', 'pkey_local', 'pkey_xmit', 'print_screen', 'prtr_off', 'prtr_on', 'repeat_char', 'reset_1string', 'reset_2string', 'reset_3string', 'reset_file', 'restore_cursor', 'row_address', 'save_cursor', 'scroll_forward', 'scroll_reverse', 'set_attributes', 'set_tab', 'set_window', 'tab', 'to_status_line', 'underline_char', 'up_half_line', 'init_prog', 'key_a1', 'key_a3', 'key_b2', 'key_c1', 'key_c3', 'prtr_non', 'char_padding', 'acs_chars', 'plab_norm', 'key_btab', 'enter_xon_mode', 'exit_xon_mode', 'enter_am_mode', 'exit_am_mode', 'xon_character', 'xoff_character', 'ena_acs', 'label_on', 'label_off', 'key_beg', 'key_cancel', 'key_close', 'key_command', 'key_copy', 'key_create', 'key_end', 'key_enter', 'key_exit', 'key_find', 'key_help', 'key_mark', 'key_message', 'key_move', 'key_next', 'key_open', 'key_options', 'key_previous', 'key_print', 'key_redo', 'key_reference', 'key_refresh', 'key_replace', 'key_restart', 'key_resume', 'key_save', 'key_suspend', 'key_undo', 'key_sbeg', 'key_scancel', 'key_scommand', 'key_scopy', 'key_screate', 'key_sdc', 'key_sdl', 'key_select', 'key_send', 'key_seol', 'key_sexit', 'key_sfind', 'key_shelp', 'key_shome', 'key_sic', 'key_sleft', 'key_smessage', 'key_smove', 'key_snext', 'key_soptions', 'key_sprevious', 'key_sprint', 'key_sredo', 'key_sreplace', 'key_sright', 'key_srsume', 'key_ssave', 'key_ssuspend', 'key_sundo', 'req_for_input', 'key_f11', 'key_f12', 'key_f13', 'key_f14', 'key_f15', 'key_f16', 'key_f17', 'key_f18', 'key_f19', 'key_f20', 'key_f21', 'key_f22', 'key_f23', 'key_f24', 'key_f25', 'key_f26', 'key_f27', 'key_f28', 'key_f29', 'key_f30', 'key_f31', 'key_f32', 'key_f33', 'key_f34', 'key_f35', 'key_f36', 'key_f37', 'key_f38', 'key_f39', 'key_f40', 'key_f41', 'key_f42', 'key_f43', 'key_f44', 'key_f45', 'key_f46', 'key_f47', 'key_f48', 'key_f49', 'key_f50', 'key_f51', 'key_f52', 'key_f53', 'key_f54', 'key_f55', 'key_f56', 'key_f57', 'key_f58', 'key_f59', 'key_f60', 'key_f61', 'key_f62', 'key_f63', 'clr_bol', 'clear_margins', 'set_left_margin', 'set_right_margin', 'label_format', 'set_clock', 'display_clock', 'remove_clock', 'create_window', 'goto_window', 'hangup', 'dial_phone', 'quick_dial', 'tone', 'pulse', 'flash_hook', 'fixed_pause', 'wait_tone', 'user0', 'user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'orig_pair', 'orig_colors', 'initialize_color', 'initialize_pair', 'set_color_pair', 'set_foreground', 'set_background', 'change_char_pitch', 'change_line_pitch', 'change_res_horz', 'change_res_vert', 'define_char', 'enter_doublewide_mode', 'enter_draft_quality', 'enter_italics_mode', 'enter_leftward_mode', 'enter_micro_mode', 'enter_near_letter_quality', 'enter_normal_quality', 'enter_shadow_mode', 'enter_subscript_mode', 'enter_superscript_mode', 'enter_upward_mode', 'exit_doublewide_mode', 'exit_italics_mode', 'exit_leftward_mode', 'exit_micro_mode', 'exit_shadow_mode', 'exit_subscript_mode', 'exit_superscript_mode', 'exit_upward_mode', 'micro_column_address', 'micro_down', 'micro_left', 'micro_right', 'micro_row_address', 'micro_up', 'order_of_pins', 'parm_down_micro', 'parm_left_micro', 'parm_right_micro', 'parm_up_micro', 'select_char_set', 'set_bottom_margin', 'set_bottom_margin_parm', 'set_left_margin_parm', 'set_right_margin_parm', 'set_top_margin', 'set_top_margin_parm', 'start_bit_image', 'start_char_set_def', 'stop_bit_image', 'stop_char_set_def', 'subscript_characters', 'superscript_characters', 'these_cause_cr', 'zero_motion', 'char_set_names', 'key_mouse', 'mouse_info', 'req_mouse_pos', 'get_mouse', 'set_a_foreground', 'set_a_background', 'pkey_plab', 'device_type', 'code_set_init', 'set0_des_seq', 'set1_des_seq', 'set2_des_seq', 'set3_des_seq', 'set_lr_margin', 'set_tb_margin', 'bit_image_repeat', 'bit_image_newline', 'bit_image_carriage_return', 'color_names', 'define_bit_image_region', 'end_bit_image_region', 'set_color_band', 'set_page_length', 'display_pc_char', 'enter_pc_charset_mode', 'exit_pc_charset_mode', 'enter_scancode_mode', 'exit_scancode_mode', 'pc_term_options', 'scancode_escape', 'alt_scancode_esc', 'enter_horizontal_hl_mode', 'enter_left_hl_mode', 'enter_low_hl_mode', 'enter_right_hl_mode', 'enter_top_hl_mode', 'enter_vertical_hl_mode', 'set_a_attributes', 'set_pglen_inch', // #ifdef __INTERNAL_CAPS_VISIBLE
'termcap_init2', 'termcap_reset', 'linefeed_if_not_lf', 'backspace_if_not_bs', 'other_non_function_keys', 'arrow_key_map', 'acs_ulcorner', 'acs_llcorner', 'acs_urcorner', 'acs_lrcorner', 'acs_ltee', 'acs_rtee', 'acs_btee', 'acs_ttee', 'acs_hline', 'acs_vline', 'acs_plus', 'memory_lock', 'memory_unlock', 'box_chars_1'];

/**
 * Termcap
 */
const CPATHS = [process.env.TERMCAP || '', (process.env.TERMPATH || '').split(/[: ]/), (process.env.HOME || '') + '/.termcap', '/usr/share/misc/termcap', '/etc/termcap'];

/**
 * Terminfo
 */
const IPATHS = [process.env.TERMINFO || '', (process.env.TERMINFO_DIRS || '').split(':'), (process.env.HOME || '') + '/.terminfo', '/usr/share/terminfo', '/usr/share/lib/terminfo', '/usr/lib/terminfo', '/usr/local/share/terminfo', '/usr/local/share/lib/terminfo', '/usr/local/lib/terminfo', '/usr/local/ncurses/lib/terminfo', '/lib/terminfo'];

const TERMCAP = '' + 'vt102|dec vt102:' + ':do=^J:co#80:li#24:cl=50\\E[;H\\E[2J:' + ':le=^H:bs:cm=5\\E[%i%d;%dH:nd=2\\E[C:up=2\\E[A:' + ':ce=3\\E[K:cd=50\\E[J:so=2\\E[7m:se=2\\E[m:us=2\\E[4m:ue=2\\E[m:' + ':md=2\\E[1m:mr=2\\E[7m:mb=2\\E[5m:me=2\\E[m:is=\\E[1;24r\\E[24;1H:' + ':rs=\\E>\\E[?3l\\E[?4l\\E[?5l\\E[?7h\\E[?8h:ks=\\E[?1h\\E=:ke=\\E[?1l\\E>:' + ':ku=\\EOA:kd=\\EOB:kr=\\EOC:kl=\\EOD:kb=^H:\\\n' + ':ho=\\E[H:k1=\\EOP:k2=\\EOQ:k3=\\EOR:k4=\\EOS:pt:sr=5\\EM:vt#3:' + ':sc=\\E7:rc=\\E8:cs=\\E[%i%d;%dr:vs=\\E[?7l:ve=\\E[?7h:' + ':mi:al=\\E[L:dc=\\E[P:dl=\\E[M:ei=\\E[4l:im=\\E[4h:';

// Convert ACS unicode characters to the
// most similar-looking ascii characters.
const UTOA = {
  '\u25c6': '*',
  // '◆'
  '\u2592': ' ',
  // '▒'
  // '\u0009': '\t', // '\t'
  // '\u000c': '\f', // '\f'
  // '\u000d': '\r', // '\r'
  // '\u000a': '\n', // '\n'
  '\u00b0': '*',
  // '°'
  '\u00b1': '+',
  // '±'
  '\u2424': '\n',
  // '\u2424' (NL)
  // '\u000b': '\v', // '\v'
  '\u2518': '+',
  // '┘'
  '\u2510': '+',
  // '┐'
  '\u250c': '+',
  // '┌'
  '\u2514': '+',
  // '└'
  '\u253c': '+',
  // '┼'
  '\u23ba': '-',
  // '⎺'
  '\u23bb': '-',
  // '⎻'
  '\u2500': '-',
  // '─'
  '\u23bc': '-',
  // '⎼'
  '\u23bd': '_',
  // '⎽'
  '\u251c': '+',
  // '├'
  '\u2524': '+',
  // '┤'
  '\u2534': '+',
  // '┴'
  '\u252c': '+',
  // '┬'
  '\u2502': '|',
  // '│'
  '\u2264': '<',
  // '≤'
  '\u2265': '>',
  // '≥'
  '\u03c0': '?',
  // 'π'
  '\u2260': '=',
  // '≠'
  '\u00a3': '?',
  // '£'
  '\u00b7': '*' // '·'

};

/**
 * _nc_captoinfo - ported to javascript directly from ncurses.
 * Copyright (c) 1998-2009,2010 Free Software Foundation, Inc.
 * See: ~/ncurses/ncurses/tinfo/captoinfo.c
 *
 * Convert a termcap string to terminfo format.
 * 'cap' is the relevant terminfo capability index.
 * 's' is the string value of the capability.
 * 'parameterized' tells what type of translations to do:
 *    % translations if 1
 *    pad translations if >=0
 */
function capToInfo(cap, s, parameterized) {
  const self = this;
  let capStart;
  if (parameterized == null) parameterized = 0;
  const MAX_PUSHED = 16,
        stack = [];
  let stackPtr = 0,
      onStack = 0,
      seenM = 0,
      seenN = 0,
      seenR = 0,
      param = 1,
      i = 0,
      out = '';

  function warn(...args) {
    if (!self.debug) return void 0;
    args[0] = 'capToInfo: ' + (args[0] || '');
    return console.log(args);
  }

  function isDigit(ch) {
    return ch >= '0' && ch <= '9';
  }

  function isGraph(ch) {
    return ch > ' ' && ch <= '~';
  } // convert a character to a terminfo push


  function cvtChar(sp) {
    let c = '\0',
        len;
    let j = i;

    switch (sp[j]) {
      case '\\':
        switch (sp[++j]) {
          case '\'':
          case '$':
          case '\\':
          case '%':
            c = sp[j];
            len = 2;
            break;

          case '\0':
            c = '\\';
            len = 1;
            break;

          case '0':
          case '1':
          case '2':
          case '3':
            len = 1;

            while (isDigit(sp[j])) {
              c = String.fromCharCode(8 * c.charCodeAt(0) + (sp[j++].charCodeAt(0) - '0'.charCodeAt(0)));
              len++;
            }

            break;

          default:
            c = sp[j];
            len = 2;
            break;
        }

        break;

      case '^':
        c = String.fromCharCode(sp[++j].charCodeAt(0) & 0x1f);
        len = 2;
        break;

      default:
        c = sp[j];
        len = 1;
    }

    if (isGraph(c) && c !== ',' && c !== '\'' && c !== '\\' && c !== ':') {
      out += '%\'';
      out += c;
      out += '\'';
    } else {
      out += '%{';

      if (c.charCodeAt(0) > 99) {
        out += String.fromCharCode((c.charCodeAt(0) / 100 | 0) + '0'.charCodeAt(0));
      }

      if (c.charCodeAt(0) > 9) {
        out += String.fromCharCode((c.charCodeAt(0) / 10 | 0) % 10 + '0'.charCodeAt(0));
      }

      out += String.fromCharCode(c.charCodeAt(0) % 10 + '0'.charCodeAt(0));
      out += '}';
    }

    return len;
  } // push n copies of param on the terminfo stack if not already there


  function getParam(parm, n) {
    if (seenR) parm = parm === 1 ? 2 : parm === 2 ? 1 : parm;

    if (onStack === parm) {
      if (n > 1) {
        warn('string may not be optimal');
        out += '%Pa';

        while (n--) {
          out += '%ga';
        }
      }

      return;
    }

    if (onStack !== 0) {
      push();
    }

    onStack = parm;

    while (n--) {
      out += '%p';
      out += String.fromCharCode('0'.charCodeAt(0) + parm);
    }

    if (seenN && parm < 3) {
      out += '%{96}%^';
    }

    if (seenM && parm < 3) {
      out += '%{127}%^';
    }
  } // push onstack on to the stack


  function push() {
    if (stackPtr >= MAX_PUSHED) {
      warn('string too complex to convert');
    } else {
      stack[stackPtr++] = onStack;
    }
  } // pop the top of the stack into onstack


  function pop() {
    if (stackPtr === 0) {
      if (onStack === 0) {
        warn('I\'m confused');
      } else {
        onStack = 0;
      }
    } else {
      onStack = stack[--stackPtr];
    }

    param++;
  }

  function see03() {
    getParam(param, 1);
    out += '%3d';
    pop();
  }

  function invalid() {
    out += '%';
    i--;
    warn('unknown %% code %s (%#x) in %s', JSON.stringify(s[i]), s[i].charCodeAt(0), cap);
  } // skip the initial padding (if we haven't been told not to)


  capStart = null;
  if (s == null) s = '';

  if (parameterized >= 0 && isDigit(s[i])) {
    for (capStart = i;; i++) {
      if (!(isDigit(s[i]) || s[i] === '*' || s[i] === '.')) {
        break;
      }
    }
  }

  while (s[i]) {
    switch (s[i]) {
      case '%':
        i++;

        if (parameterized < 1) {
          out += '%';
          break;
        }

        switch (s[i++]) {
          case '%':
            out += '%';
            break;

          case 'r':
            if (seenR++ === 1) warn('saw %%r twice in %s', cap);
            break;

          case 'm':
            if (seenM++ === 1) warn('saw %%m twice in %s', cap);
            break;

          case 'n':
            if (seenN++ === 1) warn('saw %%n twice in %s', cap);
            break;

          case 'i':
            out += '%i';
            break;

          case '6':
          case 'B':
            getParam(param, 1);
            out += '%{10}%/%{16}%*';
            getParam(param, 1);
            out += '%{10}%m%+';
            break;

          case '8':
          case 'D':
            getParam(param, 2);
            out += '%{2}%*%-';
            break;

          case '>':
            getParam(param, 2); // %?%{x}%>%t%{y}%+%;

            out += '%?';
            i += cvtChar(s);
            out += '%>%t';
            i += cvtChar(s);
            out += '%+%;';
            break;

          case 'a':
            if ((s[i] === '=' || s[i] === '+' || s[i] === '-' || s[i] === '*' || s[i] === '/') && (s[i + 1] === 'p' || s[i + 1] === 'c') && s[i + 2] !== '\0' && s[i + 2]) {
              let l;
              l = 2;

              if (s[i] !== '=') {
                getParam(param, 1);
              }

              if (s[i + 1] === 'p') {
                getParam(param + s[i + 2].charCodeAt(0) - '@'.charCodeAt(0), 1);

                if (param !== onStack) {
                  pop();
                  param--;
                }

                l++;
              } else {
                i += 2, l += cvtChar(s), i -= 2;
              }

              switch (s[i]) {
                case '+':
                  out += '%+';
                  break;

                case '-':
                  out += '%-';
                  break;

                case '*':
                  out += '%*';
                  break;

                case '/':
                  out += '%/';
                  break;

                case '=':
                  onStack = seenR ? param === 1 ? 2 : param === 2 ? 1 : param : param;
                  break;
              }

              i += l;
              break;
            }

            getParam(param, 1);
            i += cvtChar(s);
            out += '%+';
            break;

          case '+':
            getParam(param, 1);
            i += cvtChar(s);
            out += '%+%c';
            pop();
            break;

          case 's':
            // #ifdef WATERLOO
            //          i += cvtChar(s);
            //          getparm(param, 1);
            //          out += '%-';
            // #else
            getParam(param, 1);
            out += '%s';
            pop(); // #endif /* WATERLOO */

            break;

          case '-':
            i += cvtChar(s);
            getParam(param, 1);
            out += '%-%c';
            pop();
            break;

          case '.':
            getParam(param, 1);
            out += '%c';
            pop();
            break;

          case '0':
            // not clear any of the historical termcaps did this
            if (s[i] === '3') {
              see03(); // goto

              break;
            } else if (s[i] !== '2') {
              invalid(); // goto

              break;
            }

          // FALLTHRU

          case '2':
            getParam(param, 1);
            out += '%2d';
            pop();
            break;

          case '3':
            see03();
            break;

          case 'd':
            getParam(param, 1);
            out += '%d';
            pop();
            break;

          case 'f':
            param++;
            break;

          case 'b':
            param--;
            break;

          case '\\':
            out += '%\\';
            break;

          default:
            invalid();
            break;
        }

        break;

      default:
        out += s[i++];
        break;
      // #endif
    }
  } // Now, if we stripped off some leading padding, add it at the end
  // of the string as mandatory padding.


  if (capStart != null) {
    out += '$<';

    for (i = capStart;; i++) {
      if (isDigit(s[i]) || s[i] === '*' || s[i] === '.') {
        out += s[i];
      } else {
        break;
      }
    }

    out += '/>';
  }

  if (s !== out) {
    warn('Translating %s from %s to %s.', cap, JSON.stringify(s), JSON.stringify(out));
  }

  return out;
}

function noop() {
  return '';
}
noop.unsupported = true;

function defaultWrite(data) {
  return process.stdout.write(data);
}
function termPrint(code, print = defaultWrite, done = noop) {
  const xon = !this.booleans.needs_xon_xoff || this.booleans.xon_xoff;

  if (!this.padding) {
    return print(code), done();
  }

  const parts = code.split(/(?=\$<[\d.]+[*\/]{0,2}>)/);
  let i = 0;

  function next() {
    if (i === parts.length) return done();
    let part = parts[i++];
    const padding = /^\$<([\d.]+)([*\/]{0,2})>/.exec(part);
    let amount, suffix;

    if (!padding) {
      return print(part), next();
    }

    part = part.substring(padding[0].length);
    amount = +padding[1];
    suffix = padding[2]; // A `/'  suffix indicates  that  the  padding  is  mandatory and forces a delay of the given number of milliseconds even on devices for which xon is present to indicate flow control.

    if (xon && !~suffix.indexOf('/')) {
      return print(part), next();
    } // A `*' indicates that the padding required is proportional to the number of lines affected by the operation,
    // and the amount given is the per-affected-unit padding required.
    // (In the case of insert character, the factor is still the number of lines affected.)
    // Normally, padding is advisory if the device has the xon capability;
    // it is used for cost computation but does not trigger delays.


    if (~suffix.indexOf('*')) ; // amount = amount


    return setTimeout(() => (print(part), next()), amount);
  }

  next();
}

class TerminfoLib {
  static ipaths = IPATHS;
  /** Extended Parsing */

  /** Termcap */

  static cpaths = CPATHS;
  static _prefix = CPATHS;
  static _tprefix = CPATHS;
  static alias = {};
  /** Feature Checking */

  static keyMap = {};
  /** Fallback Termcap Entry */

  static termcap = TERMCAP;
  /** Terminfo Data */

  static #boo = CAPS_BOO;
  static #num = CAPS_NUM;
  static #str = CAPS_STR;
  static acsc = ACSC;
  static utoa = UTOA;

  static get booleans() {
    return TerminfoLib.#boo;
  }

  static get numerics() {
    return TerminfoLib.#num;
  }

  static get literals() {
    return TerminfoLib.#str;
  }

  static initialize() {
    const {
      alias,
      keyMap
    } = TerminfoLib;

    for (const {
      rows
    } of [BooleanCapabilities, NumberCapabilities, StringCapabilities]) {
      for (const [key, terminfo, termcap] of rows) {
        alias[key] = [terminfo];
        alias[key].terminfo = terminfo;
        alias[key].termcap = termcap;
      }
    }

    alias.no_esc_ctlc.push('beehive_glitch'); // boo

    alias.dest_tabs_magic_smso.push('teleray_glitch'); // boo

    alias.micro_col_size.push('micro_char_size'); // #num

    for (const key in alias) {
      keyMap[key] = key;
      alias[key].forEach(k => keyMap[k] = key);
    }

    console.log('>> [TerminfoLib.initialize]', 'alias', Object.keys(TerminfoLib.alias).length, 'keyMap', Object.keys(TerminfoLib.keyMap).length); // Logger.localInfo('terminfo-lib-booleans', TerminfoLib.booleans)
    // Logger.localInfo('terminfo-lib-numerics', TerminfoLib.numerics)
    // Logger.localInfo('terminfo-lib-literals', TerminfoLib.literals)
    // Logger.localInfo('terminfo-lib-termcap', TerminfoLib.termcap)
    // Logger.localInfo('terminfo-lib-alias', TerminfoLib.alias)
    // Logger.localInfo('terminfo-lib-keyMap', TerminfoLib.keyMap)
    // Logger.localInfo('terminfo-lib-acsc', TerminfoLib.acsc)
    // Logger.localInfo('terminfo-lib-utoa', TerminfoLib.utoa)
  } // to easily output text with setTimeouts.


  static print(...args) {
    const fake = {
      padding: true,
      booleans: {
        needs_xon_xoff: true,
        xon_xoff: false
      }
    };
    return termPrint.apply(fake, args); // See:
    // ~/ncurses/ncurses/tinfo/lib_tparm.c
  }

}
TerminfoLib.initialize();

/**
 * TerminfoParser.js - parse and compile terminfo caps to javascript.
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

const __dirname = dirname(fileURLToPath(import.meta.url));

const SCOPES = ['booleans', 'numerics', 'literals'];
const HEADERS = ['name', 'names', 'desc', 'file', 'termcap'];
const USR = __dirname + '/../usr/';
/**
 * Terminfo
 * TerminfoParser
 */

class TerminfoParser {
  // boo
  // num
  // str
  // all
  // info
  // methods
  // features
  // terminal
  debug = false;
  error = null;
  utoa = UTOA; // Convert ACS unicode characters to the most similar-looking ascii characters.

  #boo = null;
  #num = null;
  #str = null;

  constructor(options = {}) {
    if (typeof options === STR) options = {
      terminal: options
    };
    this.configTput(options);
    if (options.terminal || options.term) this.setup();
    console.log('>> [TerminfoParser.constructor]', `[booleans] (${Object.keys(this.booleans).length})`, `[numerics] (${Object.keys(this.numerics).length})`, `[literals] (${Object.keys(this.literals).length})`, `[all] (${Object.keys(this.all).length})`, `[colors] (${this.colors})`);
  }

  static build(options) {
    return new TerminfoParser(options);
  }

  configTput(options) {
    this.options = options;
    this.terminal = whichTerminal(options);
    this.debug = options.debug;
    this.padding = options.padding;
    this.extended = options.extended;
    this.printf = options.printf;
    this.termcap = options.termcap;
    this.terminfoPrefix = options.terminfoPrefix;
    this.terminfoFile = options.terminfoFile;
    this.termcapFile = options.termcapFile;
    console.log(`>> [TerminfoParser.config] [terminal] (${this.terminal}) [termcap] (${!!this.termcap})`);
  }

  setup() {
    this.error = null;

    try {
      if (this.termcap) {
        try {
          this.termcap ? this.injectTermcap() : this.injectTerminfo();
        } catch (e) {
          if (this.debug) throw e;
          this.error = new Error(`${this.termcap ? 'Termcap' : 'Terminfo'} parse error.`);
          this.#useInternalCap(this.terminal);
        }
      } else {
        try {
          this.injectTerminfo();
        } catch (e) {
          if (this.debug) throw e;
          this.error = new Error('Terminfo parse error.');
          this.#useInternalInfo(this.terminal);
        }
      }
    } catch (e) {
      // If there was an error, fallback
      // to an internally stored terminfo/cap.
      if (this.debug) throw e;
      this.error = new Error('Terminfo not found.');
      this.#useXtermInfo();
    }
  }

  term(is) {
    return this.terminal.indexOf(is) === 0;
  }

  #debug() {
    if (this.debug) return console.log.apply(console, arguments);
  }

  get booleans() {
    return this.#boo;
  }

  get numerics() {
    return this.#num;
  }

  get literals() {
    return this.#str;
  } // Example:
  // vt102|dec vt102:\
  //  :do=^J:co#80:li#24:cl=50\E[;H\E[2J:\
  //  :le=^H:bs:cm=5\E[%i%d;%dH:nd=2\E[C:up=2\E[A:\
  //  :ce=3\E[K:cd=50\E[J:so=2\E[7m:se=2\E[m:us=2\E[4m:ue=2\E[m:\
  //  :md=2\E[1m:mr=2\E[7m:mb=2\E[5m:me=2\E[m:is=\E[1;24r\E[24;1H:\
  //  :rs=\E>\E[?3l\E[?4l\E[?5l\E[?7h\E[?8h:ks=\E[?1h\E=:ke=\E[?1l\E>:\
  //  :ku=\EOA:kd=\EOB:kr=\EOC:kl=\EOD:kb=^H:\
  //  :ho=\E[H:k1=\EOP:k2=\EOQ:k3=\EOR:k4=\EOS:pt:sr=5\EM:vt#3:\
  //  :sc=\E7:rc=\E8:cs=\E[%i%d;%dr:vs=\E[?7l:ve=\E[?7h:\

  /**
   * Fallback
   */


  #useVt102Cap() {
    return this.injectTermcap('vt102');
  }

  #useXtermCap() {
    return this.injectTermcap(USR + 'xterm.termcap');
  }

  #useXtermInfo() {
    return this.injectTerminfo(USR + 'xterm');
  }

  #useInternalInfo(name) {
    return this.injectTerminfo(USR + path.basename(name));
  }

  #useInternalCap(name) {
    return this.injectTermcap(USR + path.basename(name) + '.termcap');
  }

  _prefix(term) {
    // If we have a terminfoFile, or our term looks like a filename, use it.
    if (term) {
      if (~term.indexOf(path.sep)) return term;
      if (this.terminfoFile) return this.terminfoFile;
    }

    const paths = TerminfoLib.ipaths.slice();
    let file;
    if (this.terminfoPrefix) paths.unshift(this.terminfoPrefix); // Try exact matches.

    file = this._tprefix(paths, term);
    if (file) return file; // Try similar matches.

    file = this._tprefix(paths, term, true);
    if (file) return file; // Not found.

    throw new Error('Terminfo directory not found.');
  }

  _tprefix(prefix, term, soft) {
    if (!prefix) return;
    let file, dir, i, sdiff, sfile, list;

    if (Array.isArray(prefix)) {
      for (i = 0; i < prefix.length; i++) if (file = this._tprefix(prefix[i], term, soft)) return file;

      return void 0;
    }

    const find = word => {
      let file, ch;
      file = path.resolve(prefix, word[0]);

      try {
        fs.statSync(file);
        return file;
      } catch (e) {}

      ch = word[0].charCodeAt(0).toString(16);
      if (ch.length < 2) ch = '0' + ch;
      file = path.resolve(prefix, ch);

      try {
        fs.statSync(file);
        return file;
      } catch (e) {}
    };

    if (!term) {
      // Make sure the directory's sub-directories
      // are all one-letter, or hex digits.
      // return find('x') ? prefix : null;
      try {
        dir = fs.readdirSync(prefix).filter(file => file.length !== 1 && !/^[0-9a-fA-F]{2}$/.test(file));
        if (!dir.length) return prefix;
      } catch (e) {}

      return;
    }

    term = path.basename(term);
    dir = find(term);
    if (!dir) return;

    if (soft) {
      try {
        list = fs.readdirSync(dir);
      } catch (e) {
        return;
      }

      list.forEach(file => {
        if (file.indexOf(term) === 0) {
          const diff = file.length - term.length;

          if (!sfile || diff < sdiff) {
            sdiff = diff, sfile = file;
          }
        }
      });
      return sfile && (soft || sdiff === 0) ? path.resolve(dir, sfile) : null;
    }

    file = path.resolve(dir, term);

    try {
      fs.statSync(file);
      return file;
    } catch (e) {}
  }
  /**
   * Terminfo Parser
   * All shorts are little-endian
   */


  parseTerminfo(data, file) {
    const info = {};
    let extended;
    const h = info.header = {
      dataSize: data.length,
      headerSize: 12,
      magicNumber: data[1] << 8 | data[0],
      namesSize: data[3] << 8 | data[2],
      booleanNo: data[5] << 8 | data[4],
      numericNo: data[7] << 8 | data[6],
      literalNo: data[9] << 8 | data[8],
      strTableSize: data[11] << 8 | data[10]
    };
    h.total = h.headerSize + h.namesSize + h.booleanNo + h.numericNo * 2 + h.literalNo * 2 + h.strTableSize;
    let i = 0;
    i += h.headerSize; // Names Section

    const names = data.toString('ascii', i, i + h.namesSize - 1),
          parts = names.split('|'),
          name = parts[0],
          desc = parts.pop();
    info.name = name;
    info.names = parts;
    info.desc = desc;
    info.dir = path.resolve(file, '..', '..');
    info.file = file;
    info.booleans = {};
    info.numerics = {};
    info.literals = {};
    i += h.namesSize - 1; // Names is nul-terminated.

    assert.equal(data[i], 0);
    i++; // Booleans Section
    //  One byte for each flag
    //  Same order as <term.h>

    for (let o = 0, l = i + h.booleanNo; i < l; i++) {
      let v = TerminfoLib.booleans[o++];
      info.booleans[v] = data[i] === 1;
    } // Null byte in between to make sure numbers begin on an even byte.


    if (i % 2) {
      assert.equal(data[i], 0);
      i++;
    } // Numbers Section


    for (let o = 0, l = i + h.numericNo * 2; i < l; i += 2) {
      let v = TerminfoLib.numerics[o++];

      if (data[i + 1] === 0xff && data[i] === 0xff) {
        info.numerics[v] = -1;
      } else {
        info.numerics[v] = data[i + 1] << 8 | data[i];
      }
    } // Strings Section


    for (let o = 0, l = i + h.literalNo * 2; i < l; i += 2) {
      let v = TerminfoLib.literals[o++];
      info.literals[v] = data[i + 1] === 0xff && data[i] === 0xff ? -1 : data[i + 1] << 8 | data[i];
    } // String Table


    Object.keys(info.literals).forEach(key => {
      if (info.literals[key] === -1) return void delete info.literals[key]; // WORKAROUND: fix an odd bug in the screen-256color terminfo where it tries to set -1, but it appears to have {0xfe, 0xff} instead of {0xff, 0xff}.
      // TODO: Possibly handle errors gracefully below, as well as in the extended info. Also possibly do: `if (info.literals[key] >= data.length)`.

      if (info.literals[key] === 65534) return void delete info.literals[key];
      const s = i + info.literals[key];
      let j = s;

      while (data[j]) j++;

      assert(j < data.length);
      info.literals[key] = data.toString('ascii', s, j);
    });
    Logger.localInfo("terminfo-parser-info", info); // Extended Header

    if (this.extended !== false) {
      i--;
      i += h.strTableSize;

      if (i % 2) {
        assert.equal(data[i], 0);
        i++;
      }

      let l = data.length;

      if (i < l - 1) {
        try {
          extended = this.parseExtended(data.slice(i));
        } catch (e) {
          if (this.debug) {
            throw e;
          }

          return info;
        }

        info.header.extended = extended.header;
        SCOPES.forEach(key => merge(info[key], extended[key]));
      }
    }

    return info;
  } // For some reason TERM=linux has smacs/rmacs, but it maps to `^[[11m`
  // and it does not switch to the DEC SCLD character set. What the hell?
  // xterm: \x1b(0, screen: \x0e, linux: \x1b[11m (doesn't work)
  // `man console_codes` says:
  // 11  select null mapping, set display control flag, reset tog‐
  //     gle meta flag (ECMA-48 says "first alternate font").
  // See ncurses:
  // ~/ncurses/ncurses/base/lib_set_term.c
  // ~/ncurses/ncurses/tinfo/lib_acs.c
  // ~/ncurses/ncurses/tinfo/tinfo_driver.c
  //   h.symOffsetSize = (h.strTableSize - h.literalNo) * 2;


  parseExtended(data) {
    const info = {};
    data.length;
        let i = 0;
    const h = info.header = {
      dataSize: data.length,
      headerSize: 10,
      booleanNo: data[i + 1] << 8 | data[i + 0],
      numericNo: data[i + 3] << 8 | data[i + 2],
      literalNo: data[i + 5] << 8 | data[i + 4],
      strTableSize: data[i + 7] << 8 | data[i + 6],
      lastStrTableOffset: data[i + 9] << 8 | data[i + 8]
    }; // h.symOffsetCount = h.strTableSize - h.literalNo;

    h.total = h.headerSize + h.booleanNo + h.numericNo * 2 + h.literalNo * 2 + h.strTableSize;
    i += h.headerSize; // Booleans Section
    // One byte for each flag

    const booleanList = [];

    for (let l = i + h.booleanNo; i < l; i++) booleanList.push(data[i] === 1); // Null byte in between to make sure numbers begin on an even byte.


    if (i % 2) {
      assert.equal(data[i], 0);
      i++;
    } // Numbers Section


    const numericList = [];

    for (let l = i + h.numericNo * 2; i < l; i += 2) data[i + 1] === 0xff && data[i] === 0xff ? numericList.push(-1) : numericList.push(data[i + 1] << 8 | data[i]); // Strings Section


    const literalList = [];

    for (let l = i + h.literalNo * 2; i < l; i += 2) data[i + 1] === 0xff && data[i] === 0xff ? literalList.push(-1) : literalList.push(data[i + 1] << 8 | data[i]); // Pass over the sym offsets and get to the string table.


    i = data.length - h.lastStrTableOffset; // Might be better to do this instead if the file has trailing bytes:
    // i += h.symOffsetCount * 2;
    // String Table

    let high = 0;
    literalList.forEach((offset, index) => {
      if (offset === -1) return void (literalList[index] = '');
      const s = i + offset;
      let j = s;

      while (data[j]) j++;

      assert(j < data.length); // Find out where the string table ends by
      // getting the highest string length.

      if (high < j - i) high = j - i;
      literalList[index] = data.toString('ascii', s, j);
    }); // Symbol Table
    // Add one to the highest string length because we didn't count \0.

    i += high + 1;
    const sym = [];

    for (let l = data.length; i < l; i++) {
      let j = i;

      while (data[j]) j++;

      sym.push(data.toString('ascii', i, j));
      i = j;
    } // Identify by name


    let idx = 0;
    info.booleans = {};
    info.numerics = {};
    info.literals = {};
    booleanList.forEach(boolean => info.booleans[sym[idx++]] = boolean);
    numericList.forEach(numeric => info.numerics[sym[idx++]] = numeric);
    literalList.forEach(literal => info.literals[sym[idx++]] = literal); // Should be the very last bit of data.

    assert.equal(i, data.length);
    return info;
  } // If enter_pc_charset is the same as enter_alt_charset,
  // the terminal does not support SCLD as ACS.
  //      total: 245 },


  compileTerminfo(term) {
    return this.compile(this.readTerminfo(term));
  } //   total: 2342 }


  injectTerminfo(term) {
    return this.inject(this.compileTerminfo(term));
  }
  /**
   * Compiler - terminfo cap->javascript
   */


  compile(info) {
    if (!info) throw new Error('Terminal not found.');
    this.detectFeatures(info);
    this.#debug(info);
    const all = info.all = {};
    const methods = info.methods = {}; // boo, num, str

    for (const scope of SCOPES) for (const [key, value] of Object.entries(info[scope])) {
      methods[key] = this.#compile(info, key, all[key] = value);
    }

    for (const key of TerminfoLib.booleans) if (nullish(methods[key])) methods[key] = false;

    for (const key of TerminfoLib.numerics) if (nullish(methods[key])) methods[key] = -1;

    for (const key of TerminfoLib.literals) if (nullish(methods[key])) methods[key] = noop;

    for (const [key, method] of Object.entries(methods)) if (TerminfoLib.alias[key]) for (const alias of TerminfoLib.alias[key]) {
      methods[alias] = method;
    } // Could just use:
    // Object.keys(TerminfoLib.keyMap).forEach(function(key) {
    //   methods[key] = methods[TerminfoLib.keyMap[key]];
    // });


    return info;
  } // Some data to help understand:


  inject(info) {
    const self = this;
    this.info = info;
    this.all = info.all;
    this.methods = info.methods;
    this.#boo = info.booleans;
    this.#num = info.numerics;
    this.#str = info.literals;
    if (!~info.names.indexOf(this.terminal)) this.terminal = info.name;
    this.features = info.features;

    for (const [key, method] of Object.entries(info.methods || info)) this[key] = typeof method === FUN ? function () {
      return method.call(self, slice(arguments));
    } : method;

    for (const [key, feature] of Object.entries(info.features)) this[key] = key === 'padding' ? !feature && this.options.padding !== true ? false : this[key] : feature;
  } // ~/ncurses/ncurses/tinfo/comp_scan.c


  #compile(info, key, value) {
    let v;
    if (key === 'max_colors') console.log('>> [TerminfoParser.#compile]', key, value);
    this.#debug('Compiling %s: %s', key, JSON.stringify(value));
    const type = typeof value;
    if (type === BOO || type === NUM) return value;
    if (!value || type !== STR) return noop; // See:
    // ~/ncurses/progs/tput.c - tput() - L149
    // ~/ncurses/progs/tset.c - set_init() - L992

    if (key === 'init_file' || key === 'reset_file') {
      try {
        value = fs.readFileSync(value, 'utf8');

        if (this.debug) {
          v = ('return ' + JSON.stringify(value) + ';').replace(/\x1b/g, '\\x1b').replace(/\r/g, '\\r').replace(/\n/g, '\\n');
          process.stdout.write(v + '\n');
        }

        return function () {
          return value;
        };
      } catch (e) {
        return noop;
      }
    }

    const tkey = info.name + '.' + key,
          header = 'var v, dyn = {}, stat = {}, stack = [], out = [];',
          footer = ';return out.join("");';
    let code = header,
        val = value,
        buff = '',
        cap,
        ch,
        fi,
        then,
        els,
        end;

    function read(regex, no) {
      cap = regex.exec(val);
      if (!cap) return;
      val = val.substring(cap[0].length);
      ch = cap[1];
      if (!no) clear();
      return cap;
    }

    function stmt(c) {
      if (code[code.length - 1] === ',') code = code.slice(0, -1);
      code += c;
    }

    function expr(c) {
      code += c + ',';
    }

    function echo(c) {
      return c === '""' ? void 0 : expr('out.push(' + c + ')');
    }

    function print(c) {
      buff += c;
    }

    function clear() {
      if (buff) {
        echo(JSON.stringify(buff).replace(/\\u00([0-9a-fA-F]{2})/g, '\\x$1'));
        buff = '';
      }
    }

    while (val) {
      // Ignore newlines
      if (read(/^\n /, true)) continue; // '^A' -> ^A

      if (read(/^\^(.)/i, true)) {
        if (!(' ' <= ch && ch <= '~')) {
          this.#debug('%s: bad caret char.', tkey); // NOTE: ncurses appears to simply
          // continue in this situation, but
          // I could be wrong.

          print(cap[0]);
          continue;
        }

        if (ch === '?') {
          ch = '\x7f';
        } else {
          ch = ch.charCodeAt(0) & 31;
          if (ch === 0) ch = 128;
          ch = String.fromCharCode(ch);
        }

        print(ch);
        continue;
      } // 3 octal digits -> character


      if (read(/^\\([0-7]{3})/, true)) {
        print(String.fromCharCode(parseInt(ch, 8)));
        continue;
      } // '\e' -> ^[
      // '\n' -> \n
      // '\r' -> \r
      // '\0' -> \200 (special case)


      if (read(/^\\([eEnlrtbfs\^\\,:0]|.)/, true)) {
        ch = ch === 'e' || ch === 'E' ? '\x1b' : ch === 'n' ? '\n' : ch === 'l' ? '\x85' : ch === 'r' ? '\r' : ch === 't' ? '\t' : ch === 'b' ? '\x08' : ch === 'f' ? '\x0c' : ch === 's' ? ' ' : ch === '^' ? '^' : ch === '\\' ? '\\' : ch === ',' ? ',' : ch === ':' ? ':' : ch === '0' ? '\x80' : ch === 'a' ? '\x07' : (this.#debug('%s: bad backslash char.', tkey), cap[0]);
        print(ch);
        continue;
      } // $<5> -> padding
      // e.g. flash_screen: '\u001b[?5h$<100/>\u001b[?5l',


      if (read(/^\$<(\d+)([*\/]{0,2})>/, true)) {
        if (this.padding) print(cap[0]);
        continue;
      } // %%   outputs `%'


      if (read(/^%%/, true)) {
        print('%');
        continue;
      } // %[[:]flags][width[.precision]][doxXs]
      //   as in printf, flags are [-+#] and space.  Use a `:' to allow the
      //   next character to be a `-' flag, avoiding interpreting "%-" as an
      //   operator.
      // %c   print pop() like %c in printf
      // Example from screen terminfo:
      //   S0: "\u001b(%p1%c"
      // %d   print pop()
      // "Print (e.g., "%d") is a special case."
      // %s   print pop() like %s in printf


      if (read(/^%((?::-|[+# ]){1,4})?(\d+(?:\.\d+)?)?([doxXsc])/)) {
        if (this.printf || cap[1] || cap[2] || ~'oxX'.indexOf(cap[3])) {
          echo('sprintf("' + cap[0].replace(':-', '-') + '", stack.pop())');
        } else if (cap[3] === 'c') {
          echo('(v = stack.pop(), isFinite(v) ' + '? String.fromCharCode(v || 0200) : "")');
        } else {
          echo('stack.pop()');
        }

        continue;
      } // %p[1-9]
      //   push i'th parameter


      if (read(/^%p([1-9])/)) {
        expr('(stack.push(v = params[' + (ch - 1) + ']), v)');
        continue;
      } // %P[a-z]
      //   set dynamic variable [a-z] to pop()


      if (read(/^%P([a-z])/)) {
        expr('dyn.' + ch + ' = stack.pop()');
        continue;
      } // %g[a-z]
      //   get dynamic variable [a-z] and push it


      if (read(/^%g([a-z])/)) {
        expr('(stack.push(dyn.' + ch + '), dyn.' + ch + ')');
        continue;
      } // %P[A-Z]
      //   set static variable [a-z] to pop()


      if (read(/^%P([A-Z])/)) {
        expr('stat.' + ch + ' = stack.pop()');
        continue;
      } // %g[A-Z]
      //   get static variable [a-z] and push it
      //   The  terms  "static"  and  "dynamic" are misleading.  Historically,
      //   these are simply two different sets of variables, whose values are
      //   not reset between calls to tparm.  However, that fact is not
      //   documented in other implementations.  Relying on it will adversely
      //   impact portability to other implementations.


      if (read(/^%g([A-Z])/)) {
        expr('(stack.push(v = stat.' + ch + '), v)');
        continue;
      } // %'c' char constant c
      // NOTE: These are stored as c chars, exemplified by:
      // cursor_address: "\u001b=%p1%' '%+%c%p2%' '%+%c"


      if (read(/^%'(.)'/)) {
        expr('(stack.push(v = ' + ch.charCodeAt(0) + '), v)');
        continue;
      } // %{nn}
      //   integer constant nn


      if (read(/^%\{(\d+)\}/)) {
        expr('(stack.push(v = ' + ch + '), v)');
        continue;
      } // %l   push strlen(pop)


      if (read(/^%l/)) {
        expr('(stack.push(v = (stack.pop() || "").length || 0), v)');
        continue;
      } // %+ %- %* %/ %m
      //   arithmetic (%m is mod): push(pop() op pop())
      // %& %| %^
      //   bit operations (AND, OR and exclusive-OR): push(pop() op pop())
      // %= %> %<
      //   logical operations: push(pop() op pop())


      if (read(/^%([+\-*\/m&|\^=><])/)) {
        if (ch === '=') {
          ch = '===';
        } else if (ch === 'm') {
          ch = '%';
        }

        expr('(v = stack.pop(),' + ' stack.push(v = (stack.pop() ' + ch + ' v) || 0),' + ' v)');
        continue;
      } // %A, %O
      //   logical AND and OR operations (for conditionals)


      if (read(/^%([AO])/)) {
        // Are we supposed to store the result on the stack?
        expr('(stack.push(v = (stack.pop() ' + (ch === 'A' ? '&&' : '||') + ' stack.pop())), v)');
        continue;
      } // %! %~
      //   unary operations (logical and bit complement): push(op pop())


      if (read(/^%([!~])/)) {
        expr('(stack.push(v = ' + ch + 'stack.pop()), v)');
        continue;
      } // %i   add 1 to first two parameters (for ANSI terminals)


      if (read(/^%i/)) {
        // Are these supposed to go on the stack in certain situations?
        // ncurses doesn't seem to put them on the stack, but xterm.user6
        // seems to assume they're on the stack for some reason. Could
        // just be a bad terminfo string.
        // user6: "\u001b[%i%d;%dR" - possibly a termcap-style string.
        // expr('(params[0] |= 0, params[1] |= 0, params[0]++, params[1]++)');
        expr('(params[0]++, params[1]++)');
        continue;
      } // %? expr %t thenpart %e elsepart %;
      //   This forms an if-then-else.  The %e elsepart is optional.  Usually
      //   the %? expr part pushes a value onto the stack, and %t pops it from
      //   the stack, testing if it is nonzero (true).  If it is zero (false),
      //   control passes to the %e (else) part.
      //   It is possible to form else-if's a la Algol 68:
      //     %? c1 %t b1 %e c2 %t b2 %e c3 %t b3 %e c4 %t b4 %e %;
      //   where ci are conditions, bi are bodies.


      if (read(/^%\?/)) {
        end = -1;
        stmt(';if (');
        continue;
      }

      if (read(/^%t/)) {
        end = -1; // Technically this is supposed to pop everything off the stack that was
        // pushed onto the stack after the if statement, see man terminfo.
        // Right now, we don't pop anything off. This could cause compat issues.
        // Perhaps implement a "pushed" counter from the time the if statement
        // is added, to the time the then statement is added, and pop off
        // the appropriate number of elements.
        // while (pushed--) expr('stack.pop()');

        stmt(') {');
        continue;
      } // Terminfo does elseif's like
      // this: %?[expr]%t...%e[expr]%t...%;


      if (read(/^%e/)) {
        fi = val.indexOf('%?');
        then = val.indexOf('%t');
        els = val.indexOf('%e');
        end = val.indexOf('%;');
        if (end === -1) end = Infinity;

        if (then !== -1 && then < end && (fi === -1 || then < fi) && (els === -1 || then < els)) {
          stmt('} else if (');
        } else {
          stmt('} else {');
        }

        continue;
      }

      if (read(/^%;/)) {
        end = null;
        stmt('}');
        continue;
      }

      buff += val[0];
      val = val.substring(1);
    } // Clear the buffer of any remaining text.


    clear(); // Some terminfos (I'm looking at you, atari-color), don't end an if
    // statement. It's assumed terminfo will automatically end it for
    // them, because they are a bunch of lazy bastards.

    if (end != null) stmt('}'); // Add the footer.

    stmt(footer); // Optimize and cleanup generated code.

    v = code.slice(header.length, -footer.length);

    if (!v.length) {
      code = 'return "";';
    } else if (v = /^out\.push\(("(?:[^"]|\\")+")\)$/.exec(v)) {
      code = 'return ' + v[1] + ';';
    } else {
      // Turn `(stack.push(v = params[0]), v),out.push(stack.pop())`
      // into `out.push(params[0])`.
      code = code.replace(/\(stack\.push\(v = params\[(\d+)\]\), v\),out\.push\(stack\.pop\(\)\)/g, 'out.push(params[$1])'); // Remove unnecessary variable initializations.

      v = code.slice(header.length, -footer.length);
      if (!~v.indexOf('v = ')) code = code.replace('v, ', '');
      if (!~v.indexOf('dyn')) code = code.replace('dyn = {}, ', '');
      if (!~v.indexOf('stat')) code = code.replace('stat = {}, ', '');
      if (!~v.indexOf('stack')) code = code.replace('stack = [], ', ''); // Turn `var out = [];out.push("foo"),` into `var out = ["foo"];`.

      code = code.replace(/out = \[\];out\.push\(("(?:[^"]|\\")+")\),/, 'out = [$1];');
    } // Terminfos `wyse350-vb`, and `wy350-w`
    // seem to have a few broken literals.


    if (value === '\u001b%?') code = 'return "\\x1b";';

    if (this.debug) {
      v = code.replace(/\x1b/g, '\\x1b').replace(/\r/g, '\\r').replace(/\n/g, '\\n');
      process.stdout.write(v + '\n');
    }

    try {
      if (this.options.stringify && code.indexOf('return ') === 0) {
        return new Function('', code)();
      }

      return this.printf || ~code.indexOf('sprintf(') ? new Function('sprintf, params', code).bind(null, sprintf) : new Function('params', code);
    } catch (e) {
      console.error('');
      console.error('Error on %s:', tkey);
      console.error(JSON.stringify(value));
      console.error('');
      console.error(code.replace(/(,|;)/g, '$1\n'));
      e.stack = e.stack.replace(/\x1b/g, '\\x1b');
      throw e;
    }
  } // See: ~/ncurses/ncurses/tinfo/lib_tputs.c


  _print(code, print, done) {
    return termPrint.call(this, code, print, done);
  }

  _tryCap(file, term) {
    if (!file) return;
    let terms, data, i;

    if (Array.isArray(file)) {
      for (i = 0; i < file.length; i++) {
        data = this._tryCap(file[i], term);
        if (data) return data;
      }

      return;
    } // If the termcap string starts with `/`,
    // ncurses considers it a filename.


    data = file[0] === '/' ? tryRead(file) : file;
    if (!data) return;
    terms = this.parseTermcap(data, file);
    return term && !terms[term] ? void 0 : terms;
  } //  :mi:al=\E[L:dc=\E[P:dl=\E[M:ei=\E[4l:im=\E[4h:


  parseTermcap(data, file) {
    const terms = {};
    let parts, term, entries, fields, field, names, i, j, k; // remove escaped newlines

    data = data.replace(/\\\n[ \t]*/g, ''); // remove comments

    data = data.replace(/^#[^\n]+/gm, ''); // split entries

    entries = data.trim().split(/\n+/);

    for (i = 0; i < entries.length; i++) {
      fields = entries[i].split(/:+/);

      for (j = 0; j < fields.length; j++) {
        field = fields[j].trim();
        if (!field) continue;

        if (j === 0) {
          names = field.split('|');
          term = {
            name: names[0],
            names: names,
            desc: names.pop(),
            file: ~file.indexOf(path.sep) ? path.resolve(file) : file,
            termcap: true
          };

          for (k = 0; k < names.length; k++) {
            terms[names[k]] = term;
          }

          term.booleans = {};
          term.numerics = {};
          term.literals = {};
          continue;
        }

        if (~field.indexOf('=')) {
          parts = field.split('=');
          term.literals[parts[0]] = parts.slice(1).join('=');
        } else if (~field.indexOf('#')) {
          parts = field.split('#');
          term.numerics[parts[0]] = +parts.slice(1).join('#');
        } else {
          term.booleans[field] = true;
        }
      }
    }

    return terms;
  }
  /**
   * Termcap Compiler
   *  man termcap
   */


  translateTermcap(info) {
    console.log(`>> [TerminfoParser.translateTermcap] ${info}`);
    const self = this,
          out = {};
    if (!info) return;
    this.#debug(info);
    HEADERS.forEach(key => out[key] = info[key]); // Separate aliases for termcap

    const map = (() => {
      const out = {};
      Object.keys(TerminfoLib.alias).forEach(key => {
        const aliases = TerminfoLib.alias[key];
        out[aliases.termcap] = key;
      });
      return out;
    })(); // Translate termcap cap names to terminfo cap names.
    // e.g. `up` -> `cursor_up`


    SCOPES.forEach(key => {
      const source = info[key],
            target = out[key] = {};
      Object.keys(source).forEach(cap => {
        if (key === STR) info.literals[cap] = capToInfo.call(self, cap, info.literals[cap], 1);

        if (map[cap]) {
          target[map[cap]] = source[cap];
        } else {
          // NOTE: Possibly include all termcap names
          // in a separate alias.js file. Some are
          // missing from the terminfo alias.js file
          // which is why we have to do this:
          // See: $ man termcap
          target[cap] = source[cap];
        }
      });
    });
    return out;
  } // A small helper function if we want

  /**
   * Termcap Parser
   *  http://en.wikipedia.org/wiki/Termcap
   *  http://www.gnu.org/software
   *    /termutils/manual/termcap-1.3/html_mono/termcap.html
   *  http://www.gnu.org/software
   *    /termutils/manual/termcap-1.3/html_mono/termcap.html#SEC17
   *  http://tldp.org/HOWTO/Text-Terminal-HOWTO.html#toc16
   *  man termcap
   */


  compileTermcap(term) {
    return this.compile(this.readTermcap(term));
  }

  injectTermcap(term) {
    return this.inject(this.compileTermcap(term));
  }
  /**
   * Compile All Terminfo
   */


  getAll() {
    const dir = this._prefix(),
          list = asort(fs.readdirSync(dir)),
          infos = [];

    list.forEach(letter => {
      const terms = asort(fs.readdirSync(path.resolve(dir, letter)));
      infos.push.apply(infos, terms);
    });

    function asort(obj) {
      return obj.sort((a, b) => a.toLowerCase().charCodeAt(0) - b.toLowerCase().charCodeAt(0));
    }

    return infos;
  }

  compileAll(start) {
    const self = this,
          all = {};
    this.getAll().forEach(name => {
      if (start && name !== start) {
        return;
      } else {
        start = null;
      }

      all[name] = self.compileTerminfo(name);
    });
    return all;
  }

  detectFeatures(info) {
    /**
     * Detect Features / Quirks
     */
    const data = this.parseACS(info);
    info.features = {
      unicode: this.detectUnicode(info),
      brokenACS: this.detectBrokenACS(info),
      PCRomSet: this.detectPCRomSet(info),
      magicCookie: this.detectMagicCookie(info),
      padding: this.detectPadds(info),
      setbuf: this.detectSetbuf(info),
      acsc: data.acsc,
      acscr: data.acscr
    };
    return info.features;
  } // ~/ncurses/ncurses/tinfo/lib_setup.c


  detectBrokenACS(info) {
    var _ref;

    // ncurses-compatible env variable.
    if (process.env.NCURSES_NO_UTF8_ACS != null) return !!+process.env.NCURSES_NO_UTF8_ACS; // If the terminal supports unicode, we don't need ACS.

    if (((_ref = info.numerics || info.numerics) === null || _ref === void 0 ? void 0 : _ref.U8) >= 0) return !!(info.numerics || info.numerics).U8; // The linux console is just broken for some reason.
    // Apparently the Linux console does not support ACS,
    // but it does support the PC ROM character set.

    if (info.name === 'linux') return true; // PC alternate charset
    // if (acsc.indexOf('+\x10,\x11-\x18.\x190') === 0) {

    if (this.detectPCRomSet(info)) return true; // screen termcap is bugged?

    if (this.termcap && info.name.indexOf('screen') === 0 && process.env.TERMCAP && ~process.env.TERMCAP.indexOf('screen') && ~process.env.TERMCAP.indexOf('hhII00')) {
      if (~info.literals.enter_alt_charset_mode.indexOf('\x0e') || ~info.literals.enter_alt_charset_mode.indexOf('\x0f') || ~info.literals.set_attributes.indexOf('\x0e') || ~info.literals.set_attributes.indexOf('\x0f')) {
        return true;
      }
    }

    return false;
  } // See: ~/ncurses/ncurses/tinfo/lib_acs.c


  detectPCRomSet(info) {
    const s = info.literals;
    return !!(s.enter_pc_charset_mode && s.enter_alt_charset_mode && s.enter_pc_charset_mode === s.enter_alt_charset_mode && s.exit_pc_charset_mode === s.exit_alt_charset_mode);
  }

  detectMagicCookie() {
    return process.env.NCURSES_NO_MAGIC_COOKIE == null;
  }

  detectPadds() {
    return process.env.NCURSES_NO_PADDING == null;
  }

  detectSetbuf() {
    return process.env.NCURSES_NO_SETBUF == null;
  }

  parseACS(info) {
    const data = {};
    data.acsc = {};
    data.acscr = {}; // Possibly just return an empty object, as done here, instead of
    // specifically saying ACS is "broken" above. This would be more
    // accurate to ncurses logic. But it doesn't really matter.

    if (this.detectPCRomSet(info)) {
      return data;
    } // See: ~/ncurses/ncurses/tinfo/lib_acs.c: L208


    Object.keys(TerminfoLib.acsc).forEach(ch => {
      const acs_chars = info.literals.acs_chars || '',
            i = acs_chars.indexOf(ch),
            next = acs_chars[i + 1],
            value = TerminfoLib.acsc[next];

      if (!next || i === -1 || !value) {
        return;
      }

      data.acsc[ch] = value;
      data.acscr[value] = ch;
    });
    return data;
  }

  GetConsoleCP() {
    let ccp;
    if (process.platform !== 'win32') return -1; // Allow unicode on all windows consoles for now:

    if (+process.env.NCURSES_NO_WINDOWS_UNICODE !== 1) return 65001; // cp.execSync('chcp 65001', { stdio: 'ignore', timeout: 1500 });

    try {
      // Produces something like: 'Active code page: 437\n\n'
      ccp = cp.execFileSync(process.env.WINDIR + '\\system32\\chcp.com', [], {
        stdio: ['ignore', 'pipe', 'ignore'],
        encoding: 'ascii',
        timeout: 1500
      }); // ccp = cp.execSync('chcp', {
      //   stdio: ['ignore', 'pipe', 'ignore'],
      //   encoding: 'ascii',
      //   timeout: 1500
      // });
    } catch (e) {}

    ccp = /\d+/.exec(ccp);
    return !ccp ? -1 : (ccp = +ccp[0], ccp);
  }

  has(name) {
    name = TerminfoLib.keyMap[name];
    const val = this.all[name];
    return !name ? false : typeof val === NUM ? val !== -1 : !!val;
  }

  _readTermcap = this.readTermcap;

  readTermcap(term) {
    const self = this;
    let terms, term_, root, paths;
    term = term || this.terminal; // Termcap has a bunch of terminals usually stored in one file/string,
    // so we need to find the one containing our desired terminal.

    if (~term.indexOf(path.sep) && (terms = this._tryCap(path.resolve(term)))) {
      term_ = path.basename(term).split('.')[0];
      term = terms[process.env.TERM] ? process.env.TERM : terms[term_] ? term_ : Object.keys(terms)[0];
    } else {
      paths = TerminfoLib.cpaths.slice();
      if (this.termcapFile) paths.unshift(this.termcapFile);
      paths.push(TerminfoLib.termcap);
      terms = this._tryCap(paths, term);
    }

    if (!terms) throw new Error('Cannot find termcap for: ' + term);
    root = terms[term];
    if (this.debug) this._termcap = terms(function tc(term) {
      if (term && term.literals.tc) {
        root.inherits = root.inherits || [];
        root.inherits.push(term.literals.tc);
        const names = terms[term.literals.tc] ? terms[term.literals.tc].names : [term.literals.tc];
        self.#debug('%s inherits from %s.', term.names.join('/'), names.join('/'));
        const inherit = tc(terms[term.literals.tc]);

        if (inherit) {
          SCOPES.forEach(function (type) {
            merge(term[type], inherit[type]);
          });
        }
      }

      return term;
    })(root); // Translate termcap names to terminfo-style names.

    root = this.translateTermcap(root);
    return root;
  } // DEC Special Character and Line Drawing Set.


  detectUnicode() {
    const {
      env
    } = process;
    if (env.NCURSES_FORCE_UNICODE != null) return !!+env.NCURSES_FORCE_UNICODE;
    if (this.options.forceUnicode != null) return this.options.forceUnicode;
    const LANG = env.LANG + ':' + env.LANGUAGE + ':' + env.LC_ALL + ':' + env.LC_CTYPE;
    return /utf-?8/i.test(LANG) || this.GetConsoleCP() === 65001;
  }

  readTerminfo(term) {
    let data, file, info;
    term = term || this.terminal;
    file = path.normalize(this._prefix(term));
    data = fs.readFileSync(file);
    info = this.parseTerminfo(data, file);
    if (this.debug) this._terminfo = info; // console.log('>> [tput.readTerminfo]', term, 'max_colors', info.numerics.max_colors)

    if (term.endsWith('xterm')) info.numerics.max_colors = 256;
    return info;
  }

}

export { TerminfoLib, TerminfoParser, sprintf, tryRead, whichTerminal };
