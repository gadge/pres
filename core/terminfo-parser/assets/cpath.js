/**
 * Termcap
 */
export const CPATHS = [
  process.env.TERMCAP || '',
  (process.env.TERMPATH || '').split(/[: ]/),
  (process.env.HOME || '') + '/.termcap',
  '/usr/share/misc/termcap',
  '/etc/termcap'
]