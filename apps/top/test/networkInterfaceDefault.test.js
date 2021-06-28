import { Deco, deco, logger } from '@spare/logger'
import si                     from 'systeminformation'

const test = async () => {
  const networkInterface = await si.networkInterfaceDefault()
  networkInterface |> deco |> logger
  const stats = await si.networkStats(networkInterface)
  stats |> Deco({ vert: 2 }) |> logger
}

test()