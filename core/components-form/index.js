import { Button }      from './src/button'
import { Checkbox }    from './src/checkbox'
import { FileManager } from './src/file-manager'
import { Form }        from './src/form'
import { Input }       from './src/input'
import { Prompt }      from './src/prompt'
import { Question }    from './src/question'
import { RadioButton } from './src/radio-button'
import { RadioSet }    from './src/radio-set'
import { Textarea }    from './src/textarea'
import { Textbox }     from './src/textbox'

const button = (options) => new Button(options)
const checkbox = (options) => new Checkbox(options)
const fileManager = (options) => new FileManager(options)
const form = (options) => new Form(options)
const input = (options) => new Input(options)
const prompt = (options) => new Prompt(options)
const question = (options) => new Question(options)
const radioButton = (options) => new RadioButton(options)
const radioSet = (options) => new RadioSet(options)
const textbox = (options) => new Textbox(options)
const textarea = (options) => new Textarea(options)

export {
  Button, button,
  Checkbox, checkbox,
  FileManager, fileManager,
  Form, form,
  Input, input,
  Prompt, prompt,
  Question, question,
  RadioButton, radioButton,
  RadioSet, radioSet,
  Textbox, textbox,
  Textarea, textarea,
}