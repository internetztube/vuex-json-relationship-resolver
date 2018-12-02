const camelCase = require('camelcase');
const moment = require('moment');

/**
 * Basically this fetcher 
 */

module.exports = (context, path) => {

  const fetchApiObject = (path) => {
    return new Promise((resolve, reject) => {
      if (typeof path !== "string") return;
      const url = buildRequestUrl(path);

      if (context.getters.isApiResourceLoading(url)) return;
      context.commit('setApiResourceLoading', url);

      fetch(url).then((response) => {
        return response.json().then(body => {
          context.commit('setApiResourceDoneLoading', url);
          
          if (response.status === 200) {
            const responseBody = JSON.stringify(body.data);
            const apiObject = injectFunctionalityIntoObject(body.data);
            apiObject.responseBody = responseBody;
            context.commit('storeApiObject', apiObject);
            resolve(apiObject);
          } else {
            reject(response);
          }
        });
      });
    });
  };

  const findApiObjectByUrl = (url) => {
    const foundObjects = context.state.apiObjects.filter(o => o.links.self === url);
    if (!foundObjects.length) {
      if (context.getters.isApiResourceLoading(url)) return;
      fetchApiObject(url);
    }
    // ???
    let foundObject = null;
    for (let i = 0; i < context.state.apiObjects.length; i++) {
      if (context.state.apiObjects[i].links.self === url) {
        foundObject = context.state.apiObjects[i];
        break;
      }
    }
    if (!foundObject) return;
    if (foundObject.refetch_at.getTime() < new Date().getTime()) {
      fetchApiObject(foundObject.links.self);
    }
    return foundObject;
  };

  const buildRequestUrl = (path) => {
    let url = window.apiBaseUrl + path;
    if (path.indexOf(window.apiBaseUrl) >= 0) url = path;
    return url;
  };

  const buildRelationsKey = (name, isArray) => {
    name = camelCase(name);
    if (isArray) name += 'List';
    return name;
  };

  const injectSaveFunctionalityIntoObject = (apiObject) => {
    apiObject.save = (parameters) => new Promise((resolve, reject) => {
      fetch(apiObject.links.self, {
        method: 'PUT',
        body: JSON.stringify(apiObject),
        headers: { 'Content-Type': 'application/json' }
      })
        .then((response) => {
          return response.json().then(body => {
            if (response.ok) {
              const responseBody = JSON.stringify(body.data);
              const apiObject = injectFunctionalityIntoObject(body.data);
              apiObject.responseBody = responseBody;
              context.commit('storeApiObject', apiObject);
              resolve(apiObject);
              return;
            }
            if (response.status === 422) {
              apiObject.rollback();
              reject(body.errors);
            } else {
              reject(response);
            }
          })
        });
    });
    return apiObject;
  };

  const injectRestoreFunctionalityIntoObject = (apiObject) => {
    apiObject.rollback = () => {
      const data = JSON.parse(apiObject.responseBody)
      const apiObjectLocal = injectFunctionalityIntoObject(data);
      apiObjectLocal.responseBody = apiObject.responseBody;
      context.commit('storeApiObject', apiObjectLocal);
      return apiObjectLocal;
    };
    return apiObject;
  };

  const injectAttributesGetterSetterIntoObject = (apiObject) => {
    for (let key in apiObject.attributes) {
      if (!apiObject.attributes.hasOwnProperty(key)) continue;
      if (apiObject.hasOwnProperty(key)) continue;
      Object.defineProperty(apiObject, key, {
        get() {
          return apiObject.attributes[key];
        },
        set(value) {
          return apiObject.attributes[key] = value;
        }
      });
    }
    return apiObject;
  };

  const injectRelationshipGetterIntoObject = (apiObject) => {
    if (!apiObject.hasOwnProperty('relationships')) return apiObject;
    apiObject['rel'] = {};

    for (let key in apiObject.relationships) {
      if (!apiObject.relationships.hasOwnProperty(key)) continue;
      let relationsKey = buildRelationsKey(key, Array.isArray(apiObject.relationships[key]));

      const objectProperty = {
        get() {
          const url = apiObject.relationships[key];
          if (Array.isArray(url)) {
            const result = {};
            for (let i = 0; i < url.length; i++) {
              Object.defineProperty(result, i, {
                enumerable: true,
                get() {
                  return findApiObjectByUrl(url[i]);
                }
              });
            }
            return result;
          }
          const result = findApiObjectByUrl(url);
          if (!result) return null;
          return result;
        }
      };

      Object.defineProperty(apiObject['rel'], relationsKey, objectProperty);
      if (!apiObject.hasOwnProperty(relationsKey)) {
        Object.defineProperty(apiObject, relationsKey, objectProperty);
      }
    }
    return apiObject;
  };

  const injectFunctionalityIntoObject = (apiObject) => {
    apiObject = injectSaveFunctionalityIntoObject(apiObject);
    apiObject = injectRestoreFunctionalityIntoObject(apiObject);
    apiObject = injectAttributesGetterSetterIntoObject(apiObject);
    apiObject = injectRelationshipGetterIntoObject(apiObject);
    return apiObject;
  };

  fetchApiObject(path);
};
