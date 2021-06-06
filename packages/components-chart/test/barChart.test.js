import { Cards }    from '@palett/cards'
import { Pres }     from '@pres/terminal-interface'
import { hexToRGB } from '@pres/util-blessed-colors'
import { barChart } from '../index'

const screen = Pres.screen(),
      bar    = barChart({
        label: 'Server Utilization (%)',
        barWidth: 4,
        barSpacing: 6,
        xOffset: 0,
        xPadding: 2,
        maxHeight: 9,
        height: "40%",
        preset: {
          back: Cards.amber.accent_1 |> hexToRGB
        }
      })
screen.append(bar)
bar.setData({
  titles: [ 'chn', 'usa', 'deu', 'rus' ],
  data: [ 7, 10, 5, 4 ]
})
screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))
screen.render()
