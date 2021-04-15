'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var componentsCore = require('@pres/components-core');
var componentsData = require('@pres/components-data');
var componentsForm = require('@pres/components-form');
var componentsInform = require('@pres/components-inform');
var componentsText = require('@pres/components-text');
var componentsVisual = require('@pres/components-visual');

const box = options => new componentsCore.Box(options);
const element = function (options) {
  // return options.scrollable && !this._ignore && this.type !== 'scrollable-box'
  //   ? new ScrollableElement(options)
  //   :
  return new componentsCore.Element(options);
};
const node = options => new componentsCore.Node(options);
const screen = options => new componentsCore.Screen(options);
const log = options => new componentsCore.Log(options);
const scrollablebox = options => new componentsCore.ScrollableBox(options);
const scrollabletext = options => new componentsCore.ScrollableText(options);
const layout = options => new componentsCore.Layout(options);
const line = options => new componentsCore.Line(options);
const terminal = options => new componentsCore.Terminal(options);
const list = options => new componentsData.List(options);
const listbar = options => new componentsData.Listbar(options);
const listtable = options => new componentsData.ListTable(options);
const table = options => new componentsData.Table(options);
const button = options => new componentsForm.Button(options);
const checkbox = options => new componentsForm.Checkbox(options);
const filemanager = options => new componentsForm.FileManager(options);
const form = options => new componentsForm.Form(options);
const input = options => new componentsForm.Input(options);
const prompt = options => new componentsForm.Prompt(options);
const question = options => new componentsForm.Question(options);
const radiobutton = options => new componentsForm.RadioButton(options);
const radioset = options => new componentsForm.RadioSet(options);
const loading = options => new componentsInform.Loading(options);
const message = options => new componentsInform.Message(options);
const progressbar = options => new componentsInform.ProgressBar(options);
const text = options => new componentsText.Text(options);
const ansiimage = options => new componentsVisual.ANSIImage(options);
const bigtext = options => new componentsVisual.BigText(options);
const image = options => new componentsVisual.Image(options);
const overlayimage = options => new componentsVisual.OverlayImage(options);
const png = options => new componentsVisual.PNG(options);
const video = options => new componentsVisual.Video(options);

Object.defineProperty(exports, 'Box', {
  enumerable: true,
  get: function () {
    return componentsCore.Box;
  }
});
Object.defineProperty(exports, 'Element', {
  enumerable: true,
  get: function () {
    return componentsCore.Element;
  }
});
Object.defineProperty(exports, 'Layout', {
  enumerable: true,
  get: function () {
    return componentsCore.Layout;
  }
});
Object.defineProperty(exports, 'Line', {
  enumerable: true,
  get: function () {
    return componentsCore.Line;
  }
});
Object.defineProperty(exports, 'Log', {
  enumerable: true,
  get: function () {
    return componentsCore.Log;
  }
});
Object.defineProperty(exports, 'Node', {
  enumerable: true,
  get: function () {
    return componentsCore.Node;
  }
});
Object.defineProperty(exports, 'Screen', {
  enumerable: true,
  get: function () {
    return componentsCore.Screen;
  }
});
Object.defineProperty(exports, 'ScrollableBox', {
  enumerable: true,
  get: function () {
    return componentsCore.ScrollableBox;
  }
});
Object.defineProperty(exports, 'ScrollableText', {
  enumerable: true,
  get: function () {
    return componentsCore.ScrollableText;
  }
});
Object.defineProperty(exports, 'Terminal', {
  enumerable: true,
  get: function () {
    return componentsCore.Terminal;
  }
});
Object.defineProperty(exports, 'List', {
  enumerable: true,
  get: function () {
    return componentsData.List;
  }
});
Object.defineProperty(exports, 'ListTable', {
  enumerable: true,
  get: function () {
    return componentsData.ListTable;
  }
});
Object.defineProperty(exports, 'Listbar', {
  enumerable: true,
  get: function () {
    return componentsData.Listbar;
  }
});
Object.defineProperty(exports, 'Table', {
  enumerable: true,
  get: function () {
    return componentsData.Table;
  }
});
Object.defineProperty(exports, 'Button', {
  enumerable: true,
  get: function () {
    return componentsForm.Button;
  }
});
Object.defineProperty(exports, 'Checkbox', {
  enumerable: true,
  get: function () {
    return componentsForm.Checkbox;
  }
});
Object.defineProperty(exports, 'FileManager', {
  enumerable: true,
  get: function () {
    return componentsForm.FileManager;
  }
});
Object.defineProperty(exports, 'Form', {
  enumerable: true,
  get: function () {
    return componentsForm.Form;
  }
});
Object.defineProperty(exports, 'Input', {
  enumerable: true,
  get: function () {
    return componentsForm.Input;
  }
});
Object.defineProperty(exports, 'Prompt', {
  enumerable: true,
  get: function () {
    return componentsForm.Prompt;
  }
});
Object.defineProperty(exports, 'Question', {
  enumerable: true,
  get: function () {
    return componentsForm.Question;
  }
});
Object.defineProperty(exports, 'RadioButton', {
  enumerable: true,
  get: function () {
    return componentsForm.RadioButton;
  }
});
Object.defineProperty(exports, 'RadioSet', {
  enumerable: true,
  get: function () {
    return componentsForm.RadioSet;
  }
});
Object.defineProperty(exports, 'Loading', {
  enumerable: true,
  get: function () {
    return componentsInform.Loading;
  }
});
Object.defineProperty(exports, 'Message', {
  enumerable: true,
  get: function () {
    return componentsInform.Message;
  }
});
Object.defineProperty(exports, 'ProgressBar', {
  enumerable: true,
  get: function () {
    return componentsInform.ProgressBar;
  }
});
Object.defineProperty(exports, 'Text', {
  enumerable: true,
  get: function () {
    return componentsText.Text;
  }
});
Object.defineProperty(exports, 'ANSIImage', {
  enumerable: true,
  get: function () {
    return componentsVisual.ANSIImage;
  }
});
Object.defineProperty(exports, 'BigText', {
  enumerable: true,
  get: function () {
    return componentsVisual.BigText;
  }
});
Object.defineProperty(exports, 'Image', {
  enumerable: true,
  get: function () {
    return componentsVisual.Image;
  }
});
Object.defineProperty(exports, 'OverlayImage', {
  enumerable: true,
  get: function () {
    return componentsVisual.OverlayImage;
  }
});
Object.defineProperty(exports, 'PNG', {
  enumerable: true,
  get: function () {
    return componentsVisual.PNG;
  }
});
Object.defineProperty(exports, 'Video', {
  enumerable: true,
  get: function () {
    return componentsVisual.Video;
  }
});
exports.ansiimage = ansiimage;
exports.bigtext = bigtext;
exports.box = box;
exports.button = button;
exports.checkbox = checkbox;
exports.element = element;
exports.filemanager = filemanager;
exports.form = form;
exports.image = image;
exports.input = input;
exports.layout = layout;
exports.line = line;
exports.list = list;
exports.listbar = listbar;
exports.listtable = listtable;
exports.loading = loading;
exports.log = log;
exports.message = message;
exports.node = node;
exports.overlayimage = overlayimage;
exports.png = png;
exports.progressbar = progressbar;
exports.prompt = prompt;
exports.question = question;
exports.radiobutton = radiobutton;
exports.radioset = radioset;
exports.screen = screen;
exports.scrollablebox = scrollablebox;
exports.scrollabletext = scrollabletext;
exports.table = table;
exports.terminal = terminal;
exports.text = text;
exports.video = video;
