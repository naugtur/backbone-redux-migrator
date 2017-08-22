import migrator, {CHOICE_ACTION} from '../'
import './helpers/pretendBrowser.js'
import tinyStub from './helpers/tinyStub.js'
import should from 'should'
import Backbone from 'backbone'

// Backbone creates a jQuery instance to wrap raw elements, but nothing in this repo uses it.
// Some jQuery implementation needs to be there anyway to create a View.
// The only required part of the API is $(DOMElement)[0] === DOMElement
Backbone.$ = Array // shortest jQuery replacement ever


describe('migrator factory', () => {
  const fakeStore = {dispatch: () => {}} // store enough for me
  it('should throw if callback doesnt return store', () => {
    should.throws(() => migrator({}, () => {
      return {}
    }))
  })
  it('should call the callback with expected input', () => {
    migrator({}, (renderRoot, choiceReducer) => {
      renderRoot.should.have.property('nodeName', 'DIV')
      choiceReducer.should.be.type('function')
      return fakeStore
    })
  })
  it('should pass a correct choiceReducer to the callback', () => {
    migrator({}, (renderRoot, choiceReducer) => {
      choiceReducer(undefined, {type: 'whatever'}).should.eql('')
      choiceReducer('', {type: CHOICE_ACTION, chosen: 'foo'}).should.eql('foo')
      choiceReducer('bar', {type: CHOICE_ACTION, chosen: 'foo'}).should.eql('foo')
      choiceReducer('foo', {type: 'some other action', chosen: 'foo'}).should.eql('foo')
      return fakeStore
    })
  })

  describe('migrator instance API', () => {
    var api,
      mockDomNode,
      dispatchStub,
      appendChildStub,
      getStateStub,
      renderRoot

    beforeEach(() => {
      renderRoot = null
      dispatchStub = tinyStub()
      getStateStub = tinyStub(_ => ({'key': 'value'}))
      appendChildStub = tinyStub()
      api = migrator({}, (_renderRoot) => {
        renderRoot = _renderRoot
        return {
          dispatch: dispatchStub,
          getState: getStateStub
        }
      })
      mockDomNode = global.document.createElement('div')
      mockDomNode.appendChild = appendChildStub
    })

    it('should create view class which renders by appending renderRoot to its el', () => {
      const View = api.getView('test', Backbone.View)
      const view = new View({el: mockDomNode})
      view.render()
      dispatchStub.calls.length.should.eql(1, 'expected dispatch called once')
      appendChildStub.calls.length.should.eql(1, 'expected appendChild called once')
      dispatchStub.calls[0][0].should.have.property('type', CHOICE_ACTION)
      dispatchStub.calls[0][0].should.have.property('chosen', 'test')
      appendChildStub.calls[0][0].should.eql(renderRoot)
    })
    it('should call render from super', () => {
      const superRenderStub = tinyStub()
      const View = api.getView('test', Backbone.View.extend({
        render: superRenderStub
      }))
      const view = new View({el: mockDomNode})
      view.render()
      superRenderStub.calls.length.should.eql(1, 'expected super render called once')
      dispatchStub.calls.length.should.eql(1, 'expected dispatch called once')
      appendChildStub.calls.length.should.eql(1, 'expected appendChild called once')
      appendChildStub.calls[0][0].should.eql(renderRoot)
    })
    it('should support Marionette event based render flow', () => {
      const View = api.getViewMarionetteCompat('test', Backbone.View.extend({
        render: function(){
          this.onRender()
        }
      }))
      const view = new View({el: mockDomNode})
      view.render()
      dispatchStub.calls.length.should.eql(1, 'expected dispatch called once')
      appendChildStub.calls.length.should.eql(1, 'expected appendChild called once')
      appendChildStub.calls[0][0].should.eql(renderRoot)
    })
    it('should return a populated model', () => {
      const mapStateToModelStub = tinyStub((state) => (state))
      const Model = api.getModelReadonly(mapStateToModelStub)
      const model = new Model()
      model.get('key').should.eql('value')
      getStateStub.calls.length.should.eql(1, 'expected getState called once')
      mapStateToModelStub.calls.length.should.eql(1, 'expected mapStateToModel called once')
      model.fetch()
      model.get('key').should.eql('value')
      getStateStub.calls.length.should.eql(2, 'expected getState called twice after additional fetch')
      mapStateToModelStub.calls.length.should.eql(2, 'expected mapStateToModel called twice after additional fetch')
    })
  })
})
