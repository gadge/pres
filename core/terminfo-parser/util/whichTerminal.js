export const whichTerminal = (options) => {
  const terminal = options.terminal || options.term || process.env.TERM || (process.platform === 'win32' ? 'windows-ansi' : 'xterm')
  return terminal.toLowerCase()
}