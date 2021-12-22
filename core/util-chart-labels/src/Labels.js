import { maxBy } from '@vect/vector-indicator'

export class Labels {
  #list
  constructor(options) {
    this.step = options.showNthLabel ?? options.labelStep ?? options.step ?? 1
  }
  get list() { return this.#list}
  set list(value) { this.#list = value }
  get length() { return this.#list.length }
  get labelWidth() { return maxBy(this.list, x => x?.length) ?? 0 }
  static build(options) { return new Labels(options) }
  loadLabels(seriesCollection) { this.list = seriesCollection[0].x }
  labelStep(charsLimit) {
    const labelCount = charsLimit / ( this.labelWidth + 2 )
    const pointsPerLabel = Math.ceil(this.length / labelCount)
    return this.step < pointsPerLabel ? pointsPerLabel : this.step
  }
}