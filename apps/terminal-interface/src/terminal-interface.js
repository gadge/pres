import { assign }   from '@ject/mixin'
import { Pres }     from '@pres/components'
import { Program }  from '@pres/program'
import { Tput }     from '@pres/terminfo-parser'
import * as colors  from '@pres/util-blessed-colors'
import * as helpers from '@pres/util-helpers'
import * as unicode from '@pres/util-unicode'

/**
 // chart
 * @property {function(Object?):BarChart} barChart
 * @property {function(Object?):DonutChart} donutChart
 * @property {function(Object?):Gauge} gauge
 * @property {function(Object?):GaugeList} gaugeList
 * @property {function(Object?):LineChart} lineChart
 * @property {function(Object?):Sparkline} sparkline
 * @property {function(Object?):StackedBarChart} stackedBarChart
 // core
 * @property {function(Object?):Box} box
 * @property {function(Object?):Element} element
 * @property {function(Object?):Node} node
 * @property {function(Object?):Screen} screen
 * @property {function(Object?):Layout} layout
 * @property {function(Object?):Line} line
 * @property {function(Object?):Log} log
 * @property {function(Object?):ScrollableBox} scrollableBox
 * @property {function(Object?):ScrollableText} scrollableText
 * @property {function(Object?):Terminal} terminal
 // data
 * @property {function(Object?):DataTable} dataTable
 * @property {function(Object?):List} list
 * @property {function(Object?):ListBar} listBar
 * @property {function(Object?):ListTable} listTable
 * @property {function(Object?):Table} table
 * @property {function(Object?):Tree} tree
 // form
 * @property {function(Object?):Button} button
 * @property {function(Object?):Checkbox} checkbox
 * @property {function(Object?):FileManager} fileManager
 * @property {function(Object?):Form} form
 * @property {function(Object?):Input} input
 * @property {function(Object?):Prompt} prompt
 * @property {function(Object?):Question} question
 * @property {function(Object?):RadioButton} radioButton
 * @property {function(Object?):RadioSet} radioSet
 * @property {function(Object?):Textbox} textbox
 * @property {function(Object?):Textarea} textarea
 // geo
 * @property {function(Object?):Map} map
 // inform
 * @property {function(Object?):LCD} lcd
 * @property {function(Object?):Loading} loading
 * @property {function(Object?):Message} message
 * @property {function(Object?):ProgressBar} progressBar
 // layout
 * @property {function(Object?):Canvas} canvas
 * @property {function(Object?):Carousel} carousel
 * @property {function(Object?):Grid} grid
 * @property {function(Object?):Page} page
 // text
 * @property {function(Object?):LogList} logList
 * @property {function(Object?):Markdown} markdown
 * @property {function(Object?):Text} text
 // visual
 * @property {function(Object?):ANSIImage} ansiImage
 * @property {function(Object?):BigText} bigText
 * @property {function(Object?):Image} image
 * @property {function(Object?):OverlayImage} overlayImage
 * @property {function(Object?):Picture} picture
 * @property {function(Object?):PNG} png
 * @property {function(Object?):Video} video
 */
export class TI {
  static program = Program.build
  static build = Program.build
  static helpers = helpers
  static unicode = unicode
  static colors = colors
  static Tput = Tput
}

assign(TI, Pres)




