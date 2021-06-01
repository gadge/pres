export class Mor extends Array {
  constructor(at, ch) { super(at, ch) }
  static by(mor) { return new Mor(mor[0], mor[1]) }
  static build(at, ch) { return new Mor(at, ch) }
  static init(mode, fore, back, ch) { return new Mor(( mode & 0x1ff ) << 18 | ( fore & 0x1ff ) << 9 | ( back & 0x1ff ), ch) }
  get at() { return this[0] }
  set at(value) { return this[0] = value }
  get ch() { return this[1] }
  set ch(value) { return this[1] = value }
  get mode() { return ( this.at >> 18 ) & 0x1ff }
  get fore() { return ( this.at >> 9 ) & 0x1ff }
  get back() { return ( this.at ) & 0x1ff }
  set mode(value) { return this.at &= ~( 0x1ff << 18 ) , this.at |= ( value & 0x1ff ) << 18 }
  set fore(value) { return this.at &= ~( 0x1ff << 9 ) , this.at |= ( value & 0x1ff ) << 9 }
  set back(value) { return this.at &= ~( 0x1ff << 0 ) , this.at |= ( value & 0x1ff ) }
  get modeSign() {
    const mode = this.mode
    let tx = ''
    tx += mode & 1 ? 'B' : '-' // bold
    tx += mode & 2 ? 'U' : '-' // underline
    tx += mode & 4 ? 'B' : '-' // blink
    tx += mode & 8 ? 'I' : '-' // inverse
    tx += mode & 16 ? 'H' : '-' // hide
    return tx
  }
  get bold() { return !!( this.mode & 1 ) }
  get underline() { return !!( this.mode & 2 ) }
  get blink() { return !!( this.mode & 4 ) }
  get inverse() { return !!( this.mode & 8 ) }
  get hide() { return !!( this.mode & 16 ) }
  set bold(value) { return value ? ( this.mode |= 1 ) : ( this.mode &= ~1 ) }
  set underline(value) { return value ? ( this.mode |= 2 ) : ( this.mode &= ~2 ) }
  set blink(value) { return value ? ( this.mode |= 4 ) : ( this.mode &= ~4 ) }
  set inverse(value) { return value ? ( this.mode |= 8 ) : ( this.mode &= ~8 ) }
  set hide(value) { return value ? ( this.mode |= 16 ) : ( this.mode &= ~16 ) }
  atEq(mor) { return this.at === mor.at }
  chEq(mor) { return this.ch === mor.ch }
  eq(mor) { return this.at === mor.at && this.ch === mor.ch }
}