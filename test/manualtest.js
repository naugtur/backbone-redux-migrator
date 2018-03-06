import migrator, {ConnectedChooser, Choice, CHOICE_ACTION} from '../'
import './helpers/pretendBrowser.js'
import tinyStub from './helpers/tinyStub.js'
import Backbone from 'backbone'

//I bet you have a nicer way to pass it to Backbone app, but I didn't want to add a build system in readme
window.Backbone.reduxApp = migrator({
  storeFactory: (choiceReducer) => {
    const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);
    store = createStoreWithMiddleware(combineReducers({
        /* your reducers here */
        choice: choiceReducer
    }));
    return store;//This is very important!
  },
  renderers: {
    default:(store, renderRoot) => {

      ReactDOM.render(
          <Provider store={ store }>
              <ConnectedChooser>
                <Choice name="default/home">
                  <MyHomeComponent />
                </Choice>
                <Choice name="default/item">
                  <MyItemComponent />
                </Choice>
              </ConnectedChooser>
          </Provider>,
          renderRoot
      );

  }
})
