import { PRESS, RESET, SUBMIT } from '@pres/enum-events'
import { blessed }              from '../index'

const screen = blessed.screen()

const form = blessed.form({
  sup: screen,
  keys: true,
  left: 0,
  top: 0,
  width: 30,
  height: 4,
  bg: 'green',
  content: 'Submit or cancel?'
})

const submit = blessed.button({
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

const cancel = blessed.button({
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
screen.key([ 'escape', 'q', 'C-c' ], () => process.exit(0))
screen.render()
