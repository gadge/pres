'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var utilChartSeries = require('@pres/util-chart-series')
var matrix = require('@vect/matrix')
var vectorMapper = require('@vect/vector-mapper')

class SeriesCollection extends Array {
  constructor(length) {
    super(length)
  }

  static fromSeriesList(seriesList) {
    const length = seriesList.length
    const seriesCollection = new SeriesCollection(length)

    if (length === 1) {
      seriesCollection[0] = seriesList[0]
    }

    if (length >= 2) {
      for (let i = 0; i < length; i++) seriesCollection[i] = seriesList[i]
    }

    return seriesCollection
  }

  static fromTable(table, xColumn, ...yColumns) {
    var _table$select

    const xs = table.column(xColumn)
    const ysCollection = ( _table$select = table.select(yColumns), matrix.transpose(_table$select) )
    const seriesList = vectorMapper.mapper(ysCollection, (ys, i) => new utilChartSeries.Series(xs, ys, yColumns[i]))
    return SeriesCollection.fromSeriesList(seriesList)
  }

}

exports.SeriesCollection = SeriesCollection
