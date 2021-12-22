import { PRESS, RESET, SUBMIT } from '@pres/enum-events'
import { Button, Form, Screen } from '../index.js'

const screen = Screen.build()

const form = Form.build({
  sup: screen,
  keys: true,
  left: 0,
  top: 0,
  width: 30,
  height: 4,
  bg: 'green',
  content: 'Submit or cancel?'
})

const submit = Button.build({
  sup: form,
  mouse: true,
  keys: true,
  shrink: true,
  padding: {
    left: 1,
    right: 1
  },
  left: 10,
  top: 2,
  name: 'submit',
  content: 'submit',
  style: {
    bg: 'blue',
    focus: { bg: 'red' },
    hover: { bg: 'red' }
  }
})

const cancel = Button.build({
  sup: form,
  mouse: true,
  keys: true,
  shrink: true,
  padding: { left: 1, right: 1 },
  left: 20,
  top: 2,
  name: 'cancel',
  content: 'cancel',
  style: {
    bg: 'blue',
    focus: { bg: 'red' },
    hover: { bg: 'red' }
  }
})

submit.on(PRESS, () => form.submit())
cancel.on(PRESS, () => form.reset())
form.on(SUBMIT, function (data) { form.setContent('Submitted.'), screen.render() })
form.on(RESET, function (data) { form.setContent('Canceled.'), screen.render() })
screen.key([ 'escape', 'q', 'C-c' ], () => {
  screen.destroy()
  process.exit(0)
})
screen.render()
