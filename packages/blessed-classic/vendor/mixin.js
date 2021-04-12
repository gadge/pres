export function mixin(...ClassCollection) {
  class Inherited {
    constructor(options) {
      for (let Base of ClassCollection)
        assign(this, new Base(options)) // 拷贝实例属性
    }
  }
  for (let Base of ClassCollection) {
    assign(Inherited, Base) // 拷贝静态属性
    assign(Inherited.prototype, Base.prototype) // 拷贝原型属性
  }
  return Inherited
}

const
  CONSTRUCTOR = 'constructor',
  PROTOTYPE = 'prototype',
  NAME = 'name'
export function assign(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if (key === CONSTRUCTOR || key === PROTOTYPE || key === NAME) continue
    const desc = Object.getOwnPropertyDescriptor(source, key)
    Object.defineProperty(target, key, desc)
  }
}