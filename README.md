# backbone-redux-migrator
[![Build Status](https://travis-ci.org/naugtur/backbone-redux-migrator.svg?branch=master)](https://travis-ci.org/naugtur/backbone-redux-migrator)

A tool for migrating from Backbone stack to react+redux without disturbing the project or putting it on hold for a rewrite.

Lets Backbone and Redux apps coexist, so you can write new features in redux and continue with regular releases while a rewrite is progressing.

## Migration path

*Initial state:*
You have a Backbone or Backbone+Marionette app to migrate away from

0. Learn how redux works, at least a tiny bit (embrace a world where inheritance and event emitters are not the way)
1. Create a redux app and embed it in your old stack
2. Rewrite one view to redux
  - use as many components as you want in place of one complex view
  - use one-way data flow in redux and fetch the data separately, forget Backbone models
  - use migrator's simple view generator to plug your redux app in Backbone and point to the right component
3. Delete old view, delete its model if nothing else uses it
4. If any Backbone views left, goto 2
5. With all the app rewritten, remove Backbone routing and layout. Replace `Chooser` with router of your choice

*Final state:*
All features rewritten to redux, project is still alive, people stopped avoiding your job offers.

One more tip: You don't have to rewrite your whole single page app, just split it into more apps. People will accept a page load when going from main application to settings.

## Installation
```
npm install backbone-redux-migrator
```
backbone-redux-migrator requires `react` and `react-redux` installed in the project. It's not listing them as dependencies in package.json, so you don't end up having duplicated dependencies when you use a different version of react or old version of `npm`.

## Usage

In your main redux app entrypoint reduxMain.js
```js
/* all the redux dependencies would also be here */
import {ConnectedChooser, Choice} from "backbone-redux-migrator/Chooser"
import migrator from "backbone-redux-migrator"

//I bet you have a nicer way to pass it to Backbone app, but I didn't want to add a build system in readme
window.Backbone.reduxApp = migrator({/*options*/}, function(renderRoot, choiceReducer){

  const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);
  store = createStoreWithMiddleware(combineReducers({
      /* your reducers here */
      choice: choiceReducer
  }));

  ReactDOM.render(
      <Provider store={ store }>
          <ConnectedChooser>
            <Choice name="home">
              <MyHomeComponent />
            </Choice>
            <Choice name="item">
              <MyItemComponent />
            </Choice>
          </ConnectedChooser>
      </Provider>,
      renderRoot
  );

  return store; //This is very important!
})
```

Now in Backbone/Marionette app just get a view and use it without a model
```js
var reduxHomeView = Backbone.reduxApp.getView("home")
var reduxHomeViewMarionetteCompatible = Backbone.reduxApp.getView("home", Backbone.Marionette.ItemView)
```

How do I render a parametrized item view if I can only choose components by name?
The redux way - by setting it in store using an action.
```js
Backbone.reduxApp.dispatchAction({ type: SET_ITEM, item: itemId })
```

### Chooser use pattern

`ConnectedChooser` is using `connect` from `react-redux` to automatically retrieve the choice from your store. If you decide to use a different key in your store instead of `choice` you can import `Chooser` and wrap it in `connect` on your own. You can also use `Chooser` directly. It requires you to pass `chosen` property.


## QYMH
Questions You Might Have

### Why not pass full routing path from Backbone to redux?

That would require forcing consumers of this library to use react-router (or any other router I integrate with, but not their choice). Letting Backbone app dispatch actions seems like a good replacement and is much more versatile. Any parametrized route can be a field in store instead.

With the right reducers in place, one can even push content of a fetched model into the redux app to save some http requests using `dispatchAction`. But this is only recommended if you're in the process of rewriting multiple views to react+redux and some still need the model.

### How do I pass data from Backbone app to redux app so that it doesn't have to be fetched twice?

See paragraph above :)

### How does this compare to Backbone-React mixins/bridges?

When they were first created, react mixins/bridges for Backbone were very promising. They enabled a lot of good rewrites of ugly views to reusable Rect components, but they didn't eliminate the complexity of 2way bindings. Many projects found them to be a dead-end, with all the component lifecycle functions to connect to models and mistakes in event handling causing bursts of re-renders.

This migrator package is aiming at letting you build a new redux app inside existing codebase, but in total isolation in terms of data flows. Backbone keeps the routing (and probably main layout) while your redux rewrite is growing.

Also, backbone-redux-migrator is sooo much simpler.

### How do I communicate from redux to Backbone?

`window.location` updates to change route. Hopefully you won't need anything else.

I didn't find a way to communicate back that wouldn't introduce unwanted dependencies or "magic" into your nice new redux app. But if I figure it out, I'll let you know.


## Roadmap

- continue to look for ways to let redux app use a router of any kind
- add helpful warnings
- add examples
- write tests to encourage collaboration
- add a way to communicate from redux to Backbone with which it's not easy to shoot yourself in a foot.
