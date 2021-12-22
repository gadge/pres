import { clear, cursor }     from '@arpel/escape'
import { LF }                from '@pres/enum-control-chars'
import { EXIT, SIGINT }      from '@pres/enum-events'
import { Context as Canvas } from '../src/Context.js'


const n = 20
const a = 40
const w = 80
const t = 2
const pi = Math.PI
const pi2 = pi / 2
const sin = Math.sin
const cos = Math.cos

const canvas = new Canvas(w * 2, w)
//non-default canvas implementation:
//c = new Canvas(w*2, w, require('../ansi-term'));
canvas.strokeStyle = [ 200, 100, 100 ]

process.stdout.write(clear.ENTIRE_SCREEN + cursor.goto(0, 0) + cursor.HIDE)
console.debug('isTTY', process.stdout.isTTY, 'isRaw', process.stdin.isRaw)
process.stdout.write(cursor.SAVE)

function draw() {
  process.stdout.write(cursor.goto(2, 0) + clear.AFTER_CURSOR)
  const now = Date.now() / 1000
  canvas.clearRect(0, 0, w * 2, w * 2)
  canvas.save()
  canvas.translate(w, w)
  for (let i = 1; i < n; i++) {
    const r = i * ( w / n )
    canvas.beginPath()
    canvas.moveTo(-r, 0)
    const tt = now * pi / t
    const p = ( sin(tt - pi * ( cos(pi * i / n) + 1 ) / 2) + 1 ) * pi2
    for (let j = 0; j < a; j++) {
      const ca = pi * j / ( a - i )
      if (p > ca) {
        canvas.lineTo(-cos(ca) * r, -sin(ca) * r)
      }
      else {
        canvas.lineTo(-cos(p) * r, -sin(p) * r)
      }
    }
    canvas.stroke()
  }
  canvas.restore()
  console.log(canvas.drawille.frame())
}

setInterval(draw, 1000 / 30)

process.once(SIGINT, (code) => {
  console.debug(LF + '>> triggered sigint, code', code)
  process.exit(SIGINT)
})
process.once(EXIT, (code) => {
  console.debug('>> triggered exit, code', code)
  process.stdout.write(cursor.SHOW)
  process.exit(code)
})
