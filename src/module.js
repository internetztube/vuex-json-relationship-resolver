import fetchMethod from './actions/fetch'
import handleObject from './actions/handle-object';

const generator = (options) => {
  const customHelpers = typeof options === 'object' && typeof options.customHelpers === 'object' ? options.customHelpers : []

  return {
    namespaced: true,
    state: {
      objects: [],
      loadingObjects: []
    },
    mutations: {
      deleteOldObjectOccurrences (state, url) {
        const oldObjects = state.objects.filter(o => o.links.self === url)

        const main = (object) => {
          const index = state.objects.indexOf(object)
          if (index > -1) {
            state.objects.splice(index, 1)
          }
        }

        for (let i = 0; i < oldObjects.length; i++) {
          main(oldObjects[i])
        }
      },
      storeObject (state, object) {
        state.objects.push(object)
      },
      setObjectLoading (state, url) {
        if (!(state.loadingObjects.indexOf(url) >= 0)) {
          state.loadingObjects.push(url)
        }
      },
      setObjectDoneLoading (state, url) {
        const index = state.loadingObjects.indexOf(url)
        if (index > -1) {
          state.loadingObjects.splice(index, 1)
        }
      }
    },
    getters: {
      isObjectLoading: (state, getters, rootState) => {
        return (endpoint) => {
          if (customHelpers.hasOwnProperty('buildEndpointUrl')) endpoint = customHelpers.buildEndpointUrl(rootState, { endpoint })
          return state.loadingObjects.indexOf(endpoint) >= 0
        }
      }
    },
    actions: {
      processObject(context, object) {
        return handleObject(object, context);
      },
      find (context, endpoint) {
        if (!endpoint) return null;
        if (customHelpers.hasOwnProperty('buildEndpointUrl')) endpoint = customHelpers.buildEndpointUrl(context.rootState, { endpoint })
        const foundObjects = context.state.objects.filter(o => o.links.self === endpoint)
        if (!foundObjects.length) {
          if (context.getters.isObjectLoading(endpoint)) return
          return fetchMethod(context, customHelpers, endpoint)
        }
        return foundObjects;
      }
    }
  }
}

export default generator
