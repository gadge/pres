import Canvas from '../index'

const n = 20
const a = 40
const w = 80
const t = 2
const pi = Math.PI
const pi2 = pi / 2
const sin = Math.sin
const cos = Math.cos

let c
let flush
if(typeof document == 'undefined') {
  c = new Canvas(w*2, w);
  //non-default canvas implementation:
  //c = new Canvas(w*2, w, require('../ansi-term'));  
  c.strokeStyle=[200,100,100];

  flush = function() {
    console.log(c.drawille.frame());
  };
} else {
  c = document.getElementById('canvas').getContext('2d');
  c.scale(2, 2);
  flush = function() {};
}

function draw() {
  const now = Date.now() / 1000
  c.clearRect(0, 0, w*2, w*2);
  c.save();
  c.translate(w, w);
  for(let i = 1; i < n; i++) {
    const r = i * ( w / n )
    c.beginPath();
    c.moveTo(-r, 0);
    const tt = now * pi / t
    const p = ( sin(tt - pi * ( cos(pi * i / n) + 1 ) / 2) + 1 ) * pi2
    for(let j = 0; j < a; j++) {
      const ca = pi * j / ( a - i )
      if(p > ca) {
        c.lineTo(-cos(ca)*r, -sin(ca)*r);
      } else {
        c.lineTo(-cos(p)*r, -sin(p)*r);
      }
    }
    c.stroke();
  }
  c.restore();
  flush();
}

setInterval(draw, 1000/30);
