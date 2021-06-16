import { logger } from '@spare/logger'

{
  const gridScale = GridScale.build(25)
  gridScale.scaleT('25%', 100) |> logger
  gridScale.scaleH('50%', 100) |> logger
  gridScale.scaleT('0%', 100) |> logger
  gridScale.scaleH('100%', 100) |> logger
}

{
  const gridScale = GridScale.build(25)
  gridScale.scaleL('33%', 100) |> logger
  gridScale.scaleW('66%', 100) |> logger
  gridScale.scaleL('0%', 100) |> logger
  gridScale.scaleW('100%', 100) |> logger
}