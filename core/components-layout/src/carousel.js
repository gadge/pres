export class Carousel {
  constructor(pages, options) {
    this.currPage = 0
    this.pages = pages
    this.options = options
    this.screen = this.options.screen
  }
  static build(pages,options) { return new Carousel(pages,options) }
  move() {
    let i = this.screen.sub.length
    while (i--) this.screen.sub[i].detach()
    this.pages[this.currPage](this.screen, this.currPage)
    this.screen.render()
  }
  next() {
    this.currPage++
    if ((this.currPage === this.pages.length)) {
      if (this.options.rotate) { this.currPage = 0 }
      else { return void ( this.currPage-- ) }
    }
    this.move()
  }
  prev() {
    this.currPage--
    if (this.currPage < 0) {
      if (this.options.rotate) { this.currPage = this.pages.length - 1 }
      else { return void ( this.currPage++ ) }
    }
    this.move()
  }
  home() {
    this.currPage = 0
    this.move()
  }
  end() {
    this.currPage = this.pages.length - 1
    this.move()
  }
  start() {
    const self = this
    this.move()
    if (this.options.interval) setInterval(this.next.bind(this), this.options.interval)
    if (this.options.controlKeys) {
      this.screen.key([ 'right', 'left', 'home', 'end' ], (ch, key) => {
        if (key.name === 'right') self.next()
        if (key.name === 'left') self.prev()
        if (key.name === 'home') self.home()
        if (key.name === 'end') self.end()
      })
    }
  }
}
