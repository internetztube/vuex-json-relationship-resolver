const fetcher = require('./fetcher');
const moment = require('moment');

const store = {
  state: {
    apiObjects: [],
    loadingResources: [],
  },
  getters: {
    isApiResourceLoading: (state) => {
      return (url) => {
        return state.loadingResources.indexOf(url) >= 0;
      };
    }
  },
  mutations: {
    setApiResourceDoneLoading(state, url) {
      const index = state.loadingResources.indexOf(url);
      if (index > -1) {
        state.loadingResources.splice(index, 1);
      }
    },
    setApiResourceLoading(state, url) {
      if (!(state.loadingResources.indexOf(url) >= 0)) {
        state.loadingResources.push(url);
      }
    },
    storeApiObject(state, apiObject) {
      const deleteApiObjectFromStore = (apiObject) => {
        const index = state.apiObjects.indexOf(apiObject);
        if (index > -1) {
          state.apiObjects.splice(index, 1);
        }
      };
      const deleteOldApiObjectOccurrences = (apiObject) => {
        const objects = state.apiObjects.filter(o => o.links.self === apiObject.links.self);
        if (objects.length <= 0) {
          return false;
        }
        for (let i = 0; i < objects.length; i++) {
          deleteApiObjectFromStore(objects[i]);
        }
      };
      apiObject.fetched_at = moment().toDate();
      apiObject.refetch_at = moment().add(1, 'm').toDate();
      deleteOldApiObjectOccurrences(apiObject);
      state.apiObjects.push(apiObject);
    }
  },
  actions: {
    fetch: function (context, path) {
      if (!Array.isArray(path)) {
        fetcher(context, path);
        return;
      }
      for (let i = 0; i < path.length; i++) {
        fetcher(context, path[i]);
      }
    },
    clearApiObjects(context) {
      context.state.apiObjects = [];
    },
    apiObjectByUrl(context, url) {
      const foundObjects = state.apiObjects.filter(o => o.links.self === url);
      if (!foundObjects.length) {
        if (getters.isApiResourceLoading(url)) return;
        context.dispatch('fetch', url);
      }
      let foundObject = null;
      for (let i = 0; i < context.state.apiObjects.length; i++) {
        if (context.state.apiObjects[i].links.self === url) {
          foundObject = context.state.apiObjects[i];
          break;
        }
      }
      if (!foundObject) return;
      if (foundObject.refetch_at.getTime() < new Date().getTime()) {
        context.dispatch('fetch', foundObject.links.self);
      }
      return foundObject;
    }
  }
};

module.exports = store;