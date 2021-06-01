import { logger } from '@spare/logger'
import { Mor }    from '../src/mor'

const mor = Mor.init(0, 127, 11, ' ')
mor |> logger
mor.mode |> logger
mor.fore |> logger
mor.back |> logger
mor.mode = 21
mor.fore = 131
mor.back = 12
mor.mode |> logger
mor.fore |> logger
mor.back |> logger

mor.modeSign |> logger

mor.bold = true
mor.underline = true
mor.blink = true
mor.inverse = true
mor.hide = true

mor.modeSign |> logger

mor.bold = !mor.bold
mor.underline = mor.underline
mor.blink = !mor.blink
mor.inverse = mor.inverse
mor.hide = !mor.hide

mor.modeSign |> logger
