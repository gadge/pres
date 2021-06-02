// import { init } from '@vect/vector'
// export const GREYS2 = Object.fromEntries(init(24, i => [ i + 232, '#' + d2(8 + i * 10).repeat(3) ]))

const d2 = n => ( n = n.toString(16) ).length === 1 ? '0' + n : n

export const indexToGrey = i => '#' + d2(8 + ( i - 232 ) * 10).repeat(3)