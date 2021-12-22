import { logger } from '@spare/logger'
import { Mor }    from '../src/Mor'

const mor = Mor.init(19, 115, 8, ' ')
mor.toString() |> logger;
+mor |> logger
'' + mor |> logger;
`${mor}` |> logger