import { AsyncLooper } from '@valjoux/linger'
import si              from 'systeminformation'

async function run() {
  // const updater = () => si.processes(data => self.updateData(data))
  const looper = AsyncLooper.build(si.processes)
  // updater()
  // this.interval =

  await looper.setInterval(3000, data => console.table(data.list.slice(0, 5))) // setInterval(updater, 3000)
}

const init = async () => {
  await run().then()
}

init().then()