import { Deco, logger }      from '@spare/logger'
import { TerminalInterface } from '../index'

Object.assign({}, TerminalInterface) |> Deco({ depth: 2, vert: 2 }) |> logger