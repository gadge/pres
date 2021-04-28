import { logger } from '@spare/logger'
import { range }  from '@vect/vector'

logger('\x1b[XXm')

for (let i of range(30, 37 + 1)) {
  console.log(`\x1b[${i}m${i}\t\t\x1b[${i + 60}m${i + 60}`)
}

logger('\x1b[39m\x1b[39m - Reset colour')
logger('\x1b[2K - Clear Line')
logger('\x1b[<L>;<C>H OR \x1b[<L>;<C>f puts the cursor at line L and column C.')
logger('\x1b[<N>A Move the cursor up N lines')
logger('\x1b[<N>B Move the cursor down N lines')
logger('\x1b[<N>C Move the cursor forward N columns')
logger('\x1b[<N>D Move the cursor backward N columns')
logger('\x1b[2J Clear the screen, move to (0,0)')
logger('\x1b[K Erase to end of line')
logger('\x1b[s Save cursor position')
logger('\x1b[u Restore cursor position')
logger(' ')
logger('\x1b[4m  Underline on')
logger('\x1b[24m Underline off')
logger('\x1b[1m  Bold on')
logger('\x1b[21m Bold off')