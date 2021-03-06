import { Button, Checkbox, Form, Message, RadioButton, Screen, Table, Text, Textarea, Textbox } from '@pres/components'
import fs                                                                                       from 'fs'
// Screen
const screen = Screen.build({
  smartCSR: true,
  title: 'TI form'
})
// Form
const form = Form.build({
  sup: screen,
  width: '90%',
  left: 'center',
  keys: true,
  vi: true
})
// Text boxes
const label1 = Text.build({
  sup: screen,
  top: 3,
  left: 5,
  content: 'FIRST NAME:'
})
const firstName = Textbox.build({
  sup: form,
  name: 'firstname',
  top: 4,
  left: 5,
  height: 3,
  inputOnFocus: true,
  content: 'first',
  border: { type: 'line' }, focus: { fg: 'blue' }
})
const label2 = Text.build({
  sup: screen,
  content: 'LAST NAME:',
  top: 8,
  left: 5
})
const lastName = Textbox.build({
  sup: form,
  name: 'lastname',
  top: 9,
  left: 5,
  height: 3,
  inputOnFocus: true,
  content: 'last',
  border: { type: 'line' }, focus: { fg: 'blue' }
})
// Check boxes
const label3 = Text.build({
  sup: screen,
  content: 'What are your favorite editors?',
  top: 14,
  left: 5
})
const vim = Checkbox.build({
  sup: form,
  name: 'editors',
  content: 'Vim',
  top: 16,
  left: 5
})
const emacs = Checkbox.build({
  sup: form,
  name: 'editors',
  content: 'Emacs',
  top: 16,
  left: 20
})
const atom = Checkbox.build({
  sup: form,
  name: 'editors',
  content: 'Atom',
  top: 16,
  left: 35
})
const brackets = Checkbox.build({
  sup: form,
  name: 'editors',
  content: 'Brackets',
  top: 16,
  left: 50
})
// Radio buttons
const label4 = Text.build({
  sup: screen,
  content: 'Do you like TI?',
  top: 19,
  left: 5
})
const radioset = TI.radioSet({
  sup: form,
  width: '100%',
  height: 5,
  top: 21
})
const yes = RadioButton.build({
  sup: radioset,
  name: 'like',
  content: 'Yes',
  left: 5
})
const no = RadioButton.build({
  sup: radioset,
  name: 'like',
  content: 'No',
  left: 15
})
// Text area
const label5 = Text.build({
  sup: screen,
  content: 'Your comments...',
  top: 24,
  left: 5
})
const textarea = Textarea.build({
  sup: form,
  name: 'comments',
  top: 26,
  left: 5,
  height: 7,
  inputOnFocus: true,
  border: {
    type: 'line'
  }
})
// Submit/Cancel buttons
const submit = Button.build({
  sup: form,
  name: 'submit',
  content: 'Submit',
  top: 35,
  left: 5,
  shrink: true,
  padding: { top: 1, right: 2, bottom: 1, left: 2 },
  style: { bold: true, fg: 'white', bg: 'green', focus: { inverse: true } }
})
const reset = Button.build({
  sup: form,
  name: 'reset',
  content: 'Reset',
  top: 35,
  left: 15,
  shrink: true,
  padding: { top: 1, right: 2, bottom: 1, left: 2 },
  style: { bold: true, fg: 'white', bg: 'red', focus: { inverse: true } }
})
// Info
const msg = Message.build({
  sup: screen,
  top: 40,
  left: 5,
  style: { italic: true, fg: 'green' }
})
const table = Table.build({
  sup: screen,
  content: '',
  top: 40,
  left: 'center',
  style: { fg: 'green', header: { bold: true, fg: 'white', bg: 'blue' } },
  hidden: true
})
// Event management
submit.on('press', () => form.submit())
reset.on('press', () => form.reset())
form.on('submit', data => {
  const editors = [ 'Vim', 'Emacs', 'Atom', 'Brackets' ].filter(function (item, index) {
    return data.editors[index]
  })
  msg.display('Form submitted!', function () {
    let summary = ''
    summary += data.firstname + ' ' + data.lastname + '\n'
    summary += '------------------------------\n'
    summary += 'Favorite editors: ' + editors + '\n'
    summary += 'Likes TI: ' + data.like[0] + '\n'
    summary += 'Comments: ' + data.comments
    fs.writeFile('form-data.txt', summary, err => {
      if (err) throw err
    })
  })
})
form.on('reset', () => msg.display('Form cleared!', () => {}))
// Key bindings
screen.key('q', () => {
  screen.destroy()
})
// Render everything!
screen.render()