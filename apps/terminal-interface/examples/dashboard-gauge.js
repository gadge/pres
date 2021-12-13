import { DonutChart }     from '@pres/components-chart'
import { Screen }         from '@pres/components-core'
import { Grid }           from '@pres/components-layout'
import { ATTACH, RESIZE } from '@pres/enum-events'

const screen = Screen.build()
//create layout and widgets
const grid = Grid.build({ rows: 12, cols: 12, dashboardMargin: 3, screen: screen })

/**
 * DonutChart Options
 self.options.radius = options.radius || 14; // how wide is it? over 5 is best
 self.options.arcWidth = options.arcWidth || 4; //width of the donutChart
 self.options.yPadding = options.yPadding || 2; //padding from the top
 */
const donut = grid.set(8, 8, 4, 2, DonutChart.build, {
  label: 'Percent DonutChart',
  radius: 16,
  arcWidth: 4,
  yPadding: 2,
  data: [ { label: 'Storage', percent: 87 } ]
})

let pct = 0.00
function updateDonut() {
  if (pct > 0.99) pct = 0.00
  let color = 'green'
  if (pct >= 0.25) color = 'cyan'
  if (pct >= 0.5) color = 'yellow'
  if (pct >= 0.75) color = 'red'
  donut.setData([
    { percent: parseFloat(( pct + 0.00 ) % 1).toFixed(2), label: 'storage', 'color': color } ])
  pct += 0.01
}
setInterval(() => { updateDonut(), screen.render() }, 500)

screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))
// fixes https://github.com/yaronn/TerminalInterface-contrib/issues/10

screen.on(RESIZE, () => {
  donut.emit(ATTACH)
})
screen.render()
// screen.emit('adjourn')