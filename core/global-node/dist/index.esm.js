class GlobalNode {
  static types = {};
  static uid = 0;

  static typedId(type) {
    const types = GlobalNode.types;
    return type in types ? ++types[type] : types[type] = 0;
  }

}

export { GlobalNode };
