import { Deco, deco, logger } from '@spare/logger'
import si                     from 'systeminformation'

const test = async () => {
  const networkInterface = await si.networkInterfaceDefault()
  logger(deco(networkInterface))
  const stats = await si.networkStats(networkInterface)
  logger(Deco({ vert: 2 })(stats))
}

test()