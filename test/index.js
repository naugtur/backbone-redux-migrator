import migrator, {CHOICE_ACTION} from '../'
import pretendBrowser from './helpers/pretendBrowser.js'
import should from 'should'

const fakeStore = {dispatch: () => {}} // store enough for me

describe('migrator factory', () => {
  before(pretendBrowser)
  it('should throw if callback doesnt return store', () => {
    should.throws(() => migrator({}, () => {
      return {}
    }))
  })
  it('should call the callback with expected input', () => {
    migrator({}, (renderRoot, choiceReducer) => {
      renderRoot.should.have.property('nodeName','DIV')
      choiceReducer.should.be.type('function')
      return fakeStore
    })
  })
  it('should pass a correct choiceReducer to the callback', () => {
    migrator({}, (renderRoot, choiceReducer) => {
      choiceReducer(undefined, {type: 'whatever'}).should.eql('')
      choiceReducer('', {type: CHOICE_ACTION, chosen:'foo'}).should.eql('foo')
      choiceReducer('bar', {type: CHOICE_ACTION, chosen:'foo'}).should.eql('foo')
      choiceReducer('foo', {type: 'some other action', chosen:'foo'}).should.eql('foo')
      return fakeStore
    })
  })
})
