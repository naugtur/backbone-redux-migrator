import jsdom from 'jsdom'
const { window } = new jsdom.JSDOM(`<html></html>`);
import Backbone from 'backbone'
global.window = window
global.document = window.document
global.Backbone = Backbone
global.window.Backbone = Backbone
