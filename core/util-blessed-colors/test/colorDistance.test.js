function colorDistance([ r_, g_, b_ ], [ _r, _g, _b ]) {
  return ( ( 30 * ( r_ - _r ) ) ** 2 ) + ( ( 59 * ( g_ - _g ) ) ** 2 ) + ( ( 11 * ( b_ - _b ) ) ** 2 )
}
