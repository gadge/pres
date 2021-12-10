import { Deco, logger } from '@spare/logger'
import { TI }           from '../../index'

Object.assign({}, TI) |> Deco({ depth: 2, vert: 2 }) |> logger