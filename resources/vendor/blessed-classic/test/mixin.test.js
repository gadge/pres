class Base {
  type = 'base'
  constructor() {}
}

class Fund {
  type = 'fund'
  constructor() {}
}

class Squad extends Base {
  type = 'squad'
  constructor() {
    super()
  }
}

const squad=new Squad()

