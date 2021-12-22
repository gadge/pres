import { Deco, logger } from '@spare/logger'
import { TI }           from '../../index'

logger(Deco({ depth: 2, vert: 2 })(Object.assign({}, TI)))