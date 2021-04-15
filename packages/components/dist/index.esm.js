import { Box, Element, Node, Screen, Log, ScrollableBox, ScrollableText, Layout, Line, Terminal } from '@pres/components-core';
export { Box, Element, Layout, Line, Log, Node, Screen, ScrollableBox, ScrollableText, Terminal } from '@pres/components-core';
import { List, Listbar, ListTable, Table } from '@pres/components-data';
export { List, ListTable, Listbar, Table } from '@pres/components-data';
import { Button, Checkbox, FileManager, Form, Input, Prompt, Question, RadioButton, RadioSet } from '@pres/components-form';
export { Button, Checkbox, FileManager, Form, Input, Prompt, Question, RadioButton, RadioSet } from '@pres/components-form';
import { Loading, Message, ProgressBar } from '@pres/components-inform';
export { Loading, Message, ProgressBar } from '@pres/components-inform';
import { Text } from '@pres/components-text';
export { Text } from '@pres/components-text';
import { ANSIImage, BigText, Image, OverlayImage, PNG, Video } from '@pres/components-visual';
export { ANSIImage, BigText, Image, OverlayImage, PNG, Video } from '@pres/components-visual';

const box = options => new Box(options);
const element = function (options) {
  // return options.scrollable && !this._ignore && this.type !== 'scrollable-box'
  //   ? new ScrollableElement(options)
  //   :
  return new Element(options);
};
const node = options => new Node(options);
const screen = options => new Screen(options);
const log = options => new Log(options);
const scrollablebox = options => new ScrollableBox(options);
const scrollabletext = options => new ScrollableText(options);
const layout = options => new Layout(options);
const line = options => new Line(options);
const terminal = options => new Terminal(options);
const list = options => new List(options);
const listbar = options => new Listbar(options);
const listtable = options => new ListTable(options);
const table = options => new Table(options);
const button = options => new Button(options);
const checkbox = options => new Checkbox(options);
const filemanager = options => new FileManager(options);
const form = options => new Form(options);
const input = options => new Input(options);
const prompt = options => new Prompt(options);
const question = options => new Question(options);
const radiobutton = options => new RadioButton(options);
const radioset = options => new RadioSet(options);
const loading = options => new Loading(options);
const message = options => new Message(options);
const progressbar = options => new ProgressBar(options);
const text = options => new Text(options);
const ansiimage = options => new ANSIImage(options);
const bigtext = options => new BigText(options);
const image = options => new Image(options);
const overlayimage = options => new OverlayImage(options);
const png = options => new PNG(options);
const video = options => new Video(options);

export { ansiimage, bigtext, box, button, checkbox, element, filemanager, form, image, input, layout, line, list, listbar, listtable, loading, log, message, node, overlayimage, png, progressbar, prompt, question, radiobutton, radioset, screen, scrollablebox, scrollabletext, table, terminal, text, video };
