const Chart = require('../../../chart.js/Chart.js')
const Canvas = require('../../index.js')

const width = 220, height = 100, xLabelSpacing = 10, yLabelSpacing = 10
const c = new Canvas(width, height)

//var width = 80, height = 50, xLabelSpacing = 3, yLabelSpacing = 5
//var c = new Canvas(width, height, require('../../../ansi-term'));  


c.canvas = c.drawille


c.clearRect(0, 0, c.width, c.height)

const randomScalingFactor = function () { return Math.round(Math.random() * 100)}
const lineChartData = {
  labels: [ "January", "February", "March", "April" ],
  datasets: [
    {
      label: "My First dataset",
      fillColor: "red",
      strokeColor: "green",
      pointColor: "white",
      pointStrokeColor: "red",
      pointHighlightFill: "green",
      pointHighlightStroke: "white",
      data: [ 20, 40, 20, 50 ]
    }
  ]
}

const myLine = new Chart(c).Line(lineChartData, {
  responsive: false,
  animation: false,
  bezierCurve: false,
  scaleShowGridLines: false,
  scaleGridLineWidth: 0,
  showTooltips: false,
  scaleFontColor: "red",
  scaleBeginAtZero: true,
  pointLabelFontColor: "green",
  scaleLineColor: "blue",
  showSmallBaseLines: false,
  xLabelSpacing: xLabelSpacing,
  yLabelSpacing: yLabelSpacing,
  XLineOffset: 1,
})

console.log(c.drawille.frame())
