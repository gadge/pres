import { Cards }      from '@palett/cards'
import { toner }      from '@palett/toner-hex'
import { Screen }     from '@pres/components-core'
import { hexToRGB }   from '@pres/util-blessed-colors'
import { DonutChart } from '../index'

const screen = Screen.build()
/**
 * DonutChart Options
 self.options.stroke = options.stroke || "magenta"
 self.options.radius = options.radius || 14;
 self.options.arcWidth = options.arcWidth || 4;
 self.options.spacing = options.spacing || 2;
 self.options.yPadding = options.yPadding || 2;
 */
const donut = DonutChart.build({
  label: 'Test',
  radius: 9,
  arcWidth: 3,
  yPadding: 2,
  data: [ {
    percent: 80,
    label: 'web1',
    color: 'green'
  } ]
})
screen.append(donut)
setInterval(updateDonuts, 25)
let pct = 0.00
let count = 0
function updateDonuts() {
  if (pct > 0.99) pct = 0.00
  count++
  if (count >= 1000) count = 0
  donut.update([
    {
      percent: parseFloat(( pct + 0.00 ) % 1).toFixed(2),
      label: 'rcp',
      color: toner(Cards.green.accent_1, 0, 0, count / 10) |> hexToRGB
    }, {
      percent: parseFloat(( pct + 0.25 ) % 1).toFixed(2),
      label: 'rcp',
      color: toner(Cards.grey.accent_1, 0, 0, count / 10) |> hexToRGB
    }, {
      percent: parseFloat(( pct + 0.50 ) % 1).toFixed(2),
      label: 'rcp',
      color: toner(Cards.red.accent_1, 0, 0, count / 10) |> hexToRGB
    }, {
      percent: parseFloat(( pct + 0.75 ) % 1).toFixed(2),
      label: 'web1',
      color: toner(Cards.deepPurple.accent_1, 0, 0, count / 10) |> hexToRGB
    }
  ])
  screen.render()
  pct += 0.01
}
screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))
