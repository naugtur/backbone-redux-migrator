const CHOICE_ACTION = '@@BB_REDUX_MIGRATOR_CHOICE'

function choiceReducer (state, action) {
  if (typeof state === 'undefined') {
    return ''
  }
  if (action.type === CHOICE_ACTION) {
    return action.chosen
  } else {
    return state
  }
}

function bbReduxMigratorInit (options, reduxAppMain) {
  const renderRoot = (options.renderRoot
        ? options.renderRoot
        : document.createElement('div'))

  const store = reduxAppMain(renderRoot, choiceReducer)
  if (!store || typeof store.dispatch !== 'function') {
    throw Error(`Migrator couldn't access store. Please make sure you return store from your main redux setup function`)
  }

  return {
    dispatchAction: function (action) {
      store.dispatch(action)
    },
    getView: function (name, constructorOverride) {
      const Parent = constructorOverride || options.viewsConstructor || Backbone.View
      return Parent.extend({
        render: function () {
          Parent.prototype.render.call(this)
          this.el.appendChild(renderRoot)
          store.dispatch({type: CHOICE_ACTION, chosen: name})
          return this
        }
      })
    },
    getViewMarionetteCompat: function (name, constructorOverride) {
      const Parent = constructorOverride || options.viewsConstructor
      return Parent.extend({
        onRender: function () {
          this.el.appendChild(renderRoot)
          store.dispatch({type: CHOICE_ACTION, chosen: name})
        },
        onDestroy: function () {
          store.dispatch({type: CHOICE_ACTION, chosen: null})
        }
      })
    },
    getModelReadonly: function (fetcherFunction, constructorOverride) {
      const Parent = constructorOverride || options.modelsConstructor || Backbone.Model
      return Parent.extend({
        initialize: function () {
          if (Parent.prototype.initialize) {
            Parent.prototype.initialize.call(this)
          }
          this.fetch()
        },
        fetch: function (options) {
          const state = fetcherFunction(store.getState())
          if (!this.set(state, options)) { return false }
          options && options.success && options.success(state)
        }
      })
    }
  }
}

export default bbReduxMigratorInit
export {CHOICE_ACTION}
