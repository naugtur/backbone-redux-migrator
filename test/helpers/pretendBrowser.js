import jsdom from 'jsdom'

export default function pretendBrowser(done){
  jsdom.env('<html></html>', (err, window) => {
    global.window = window
    global.document = window.document
    done()
  })
}
