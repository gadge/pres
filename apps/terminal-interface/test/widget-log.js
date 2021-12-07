import { Log, Screen } from '@pres/components'

const screen = Screen.build({
  dump: __dirname + '/logs/logger.log',
  smartCSR: true,
  autoPadding: false,
  warnings: true
})

const logger = Log.build({
  parent: screen,
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  border: 'line',
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
  scrollback: 100,
  scrollbar: {
    ch: ' ',
    track: {
      bg: 'yellow'
    },
    style: {
      inverse: true
    }
  }
})

logger.focus()

setInterval(function () {
  logger.log('Hello {#0fe1ab-fg}world{/}: {bold}%s{/bold}.', Date.now().toString(36))
  if (Math.random() < 0.30) {
    logger.log({ foo: { bar: { baz: true } } })
  }
  screen.render()
}, 1000).unref()

screen.key('q', function () {
  return screen.destroy()
})

screen.render()
