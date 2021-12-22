import { Series }    from '@pres/util-chart-series'
import { transpose } from '@vect/matrix'
import { mapper }    from '@vect/vector-mapper'

class SeriesCollection extends Array {
  constructor(length) {
    super(length);
  }

  static fromSeriesList(seriesList) {
    const length = seriesList.length;
    const seriesCollection = new SeriesCollection(length);

    if (length === 1) {
      seriesCollection[0] = seriesList[0];
    }

    if (length >= 2) {
      for (let i = 0; i < length; i++) seriesCollection[i] = seriesList[i];
    }

    return seriesCollection;
  }

  static fromTable(table, xColumn, ...yColumns) {
    const xs = table.column(xColumn);
    const ysCollection = transpose(table.select(yColumns));
    const seriesList = mapper(ysCollection, (ys, i) => new Series(xs, ys, yColumns[i]));
    return SeriesCollection.fromSeriesList(seriesList);
  }

}

export { SeriesCollection };
