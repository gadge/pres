import { logger } from '@spare/logger'
import { range }  from '@vect/vector'

logger('[XXm')

for (let i of range(30, 37 + 1)) {
  console.log(`[${i}m${i}\t\t[${i + 60}m${i + 60}`)
}

logger('[39m[39m - Reset colour')
logger('[2K - Clear Line')
logger('[<L>;<C>H OR [<L>;<C>f puts the cursor at line L and column C.')
logger('[<N>A Move the cursor up N lines')
logger('[<N>B Move the cursor down N lines')
logger('[<N>C Move the cursor forward N columns')
logger('[<N>D Move the cursor backward N columns')
logger('[2J Clear the screen, move to (0,0)')
logger('[K Erase to end of line')
logger('[s Save cursor position')
logger('[u Restore cursor position')
logger(' ')
logger('[4m  Underline on')
logger('[24m Underline off')
logger('[1m  Bold on')
logger('[21m Bold off')