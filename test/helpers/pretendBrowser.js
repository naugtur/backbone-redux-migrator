import jsdom from 'jsdom'
import Backbone from 'backbone'

export default function pretendBrowser(done){
  jsdom.env('<html></html>', (err, window) => {
    global.window = window
    global.document = window.document
    global.Backbone = Backbone
    global.window.Backbone = Backbone
    done()
  })
}
