const screen = Screen.build({
  tput: true,
  smartCSR: true,
  dump: __dirname + '/logs/prompt.log',
  autoPadding: true,
  warnings: true
})

const prompt = Prompt.build({
  parent: screen,
  border: 'line',
  height: 'shrink',
  width: 'half',
  top: 'center',
  left: 'center',
  label: ' {blue-fg}Prompt{/blue-fg} ',
  tags: true,
  keys: true,
  vi: true
})

const question = Question.build({
  parent: screen,
  border: 'line',
  height: 'shrink',
  width: 'half',
  top: 'center',
  left: 'center',
  label: ' {blue-fg}Question{/blue-fg} ',
  tags: true,
  keys: true,
  vi: true
})

const msg = Message.build({
  parent: screen,
  border: 'line',
  height: 'shrink',
  width: 'half',
  top: 'center',
  left: 'center',
  label: ' {blue-fg}Message{/blue-fg} ',
  tags: true,
  keys: true,
  hidden: true,
  vi: true
})

const loader = Loading.build({
  parent: screen,
  border: 'line',
  height: 'shrink',
  width: 'half',
  top: 'center',
  left: 'center',
  label: ' {blue-fg}Loader{/blue-fg} ',
  tags: true,
  keys: true,
  hidden: true,
  vi: true
})

prompt.input('Question?', '', (err, value) => {
  question.ask('Question?', (err, value) => {
    msg.display('Hello world!', 3, err => {
      msg.display('Hello world again!', -1, err => {
        loader.load('Loading...')
        setTimeout(() => {
          loader.stop()
          screen.destroy()
        }, 3000)
      })
    })
  })
})

screen.key('q', () => screen.destroy())

screen.render()
