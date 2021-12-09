import { Deco, says } from '@spare/logger'

export const whichTerminal = (options) => {
  const terminal = options.terminal || options.term || process.env.TERM || ( process.platform === 'win32' ? 'windows-ansi' : 'xterm' )
  return terminal.toLowerCase()
}

const test = () => {
  const terminal = process.env.TERM || ( process.platform === 'win32' ? 'windows-ansi' : 'xterm' )
  const isOSXTerm = process.env.TERM_PROGRAM === 'Apple_Terminal'
  const isiTerm2 = process.env.TERM_PROGRAM === 'iTerm.app' || !!process.env.ITERM_SESSION_ID
  const isTerminator = !!process.env.TERMINATOR_UUID
  const isXFCE = /xfce/i.test(process.env.COLORTERM)
  const isRxvt = /rxvt/i.test(process.env.COLORTERM)
  const isVTE = !!process.env.VTE_VERSION || isXFCE || isTerminator
  const tmux = !!process.env.TMUX // IO
  const result = {
    terminal,
    isOSXTerm,
    isiTerm2,
    isTerminator,
    isVTE,
    isXFCE,
    isRxvt,
    tmux,
  }
  result |> Deco({ vert: 1 }) |> says['process.env']
  // process.env |> Deco({ depth: 1 }) |> says['process.env']
}

test()