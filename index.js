const CHOICE_ACTION = '@@BB_REDUX_MIGRATOR_CHOICE'

function choiceReducer (state, action) {
  if (typeof state === 'undefined') {
    return {default: ''}
  }
  if (action.type === CHOICE_ACTION) {
    const route = action.chosen.split('/')
    if (route.length === 1) {
      return Object.assign({}, state, {
        default: route[0]
      })
    } else {
      return Object.assign({}, state, {
        [route[0]]: route[1]
      })
    }
  } else {
    return state
  }
}

function bbReduxMigratorInit (options) {
  if (!options.renderers || typeof options.renderers.default !== 'function') {
    throw Error(`renderers.default must be a function. At lest the default renderer is required.`)
  }
  const store = options.storeFactory(choiceReducer)
  if (!store || typeof store.dispatch !== 'function') {
    throw Error(`Migrator couldn't access store. Please make sure you return store from your storeFactory function`)
  }
  const roots = Object.keys(options.renderers).reduce((roots, renderer) => {
    const root = document.createElement('div')
    roots[renderer] = root
    options.renderers[renderer](store, root)
    return roots
  }, {})

  return {
    debugRenderTo: function ({choice, renderer, targetNode}) {
      renderer = renderer || 'default'
      targetNode.appendChild(roots[renderer])
      store.dispatch({type: CHOICE_ACTION, chosen: renderer +'/'+ choice})
    },
    dispatchAction: function (action) {
      store.dispatch(action)
    },
    getView: function ({choice, renderer, constructorOverride}) {
      renderer = renderer || 'default'
      const Parent = constructorOverride || options.viewsConstructor || Backbone.View
      return Parent.extend({
        render: function () {
          Parent.prototype.render.call(this)
          this.el.appendChild(roots[renderer])
          store.dispatch({type: CHOICE_ACTION, chosen: renderer +'/'+ choice})
          return this
        }
      })
    },
    getViewMarionetteCompat: function ({choice, renderer, constructorOverride}) {
      renderer = renderer || 'default'
      const Parent = constructorOverride || options.viewsConstructor
      return Parent.extend({
        onRender: function () {
          this.el.appendChild(roots[renderer])
          store.dispatch({type: CHOICE_ACTION, chosen: renderer +'/'+ choice})
        },
        onDestroy: function () {
          store.dispatch({type: CHOICE_ACTION, chosen: 'default/'})
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
