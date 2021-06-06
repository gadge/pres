import {
  Amber, Blue, Cyan, DeepOrange, DeepPurple, Green, Indigo, LightBlue, LightGreen, Lime, Orange, Pink, Purple, Red,
  Teal, Yellow,
}         from '@palett/cards'
import si from 'systeminformation'

const COLOR_COLLECTION = [
  Red.base,
  Pink.base,
  Purple.base,
  DeepPurple.base,
  Indigo.base,
  Blue.base,
  LightBlue.base,
  Cyan.base,
  Teal.base,
  Green.base,
  LightGreen.base,
  Lime.base,
  Yellow.base,
  Amber.base,
  Orange.base,
  DeepOrange.base,
]
export function Cpu(line) {
  this.line = line
  si.currentLoad(data => {
    this.cpuData = data.cpus.map((cpu, i) => ( {
      title: 'CPU' + ( i + 1 ),
      style: { line: COLOR_COLLECTION[i % COLOR_COLLECTION.length] },
      x: Array(61).fill().map((_, i) => 60 - i),
      y: Array(61).fill(0),
    } ))
    this.updateData(data)
    this.interval = setInterval(() => si.currentLoad(data => this.updateData(data)), 1000)
  })
}

Cpu.prototype.updateData = function (data) {
  data.cpus.forEach((cpu, i) => {
    let loadInfo = cpu.load.toFixed(1).toString()
    while (loadInfo.length < 6) loadInfo = ' ' + loadInfo
    loadInfo = loadInfo + '%'
    this.cpuData[i].title = 'CPU' + ( i + 1 ) + loadInfo
    this.cpuData[i].y.shift()
    this.cpuData[i].y.push(cpu.load)
  })
  this.line.setData(this.cpuData)
  this.line.screen.render()
}
