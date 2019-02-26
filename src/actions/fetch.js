import handleObject from './handle-object'

const fetchMethod = (context, customHelpers, endpoint) => {
  return new Promise((mainResolve, mainReject) => {
    context.commit('setObjectLoading', endpoint)
    let headers = {}

    let httpClient = (endpoint) => {
      return new Promise((resolve, reject) => {
        if (customHelpers.hasOwnProperty('requestOptions')) headers = customHelpers.requestOptions(context.rootState, {endpoint})
        fetch(endpoint, headers).then((response) => {
          if (!response.ok) {
            mainReject(response)
            return;
          }
          return response.json().then(body => {
            resolve(body);
          });
        })
      });
    }

    if (customHelpers.hasOwnProperty('httpClient')) {
      const customHttpClient = customHelpers.httpClient(context.rootState, {endpoint});
      if (customHttpClient) {
        httpClient = customHttpClient;
      }
    }

    httpClient(endpoint).then(body => {
      context.commit('setObjectDoneLoading', endpoint)
      if (customHelpers.hasOwnProperty('onRequestFailed')) return customHelpers.onRequestFailed(context.rootState, {
        endpoint,
        response
      })
      context.commit('setObjectDoneLoading', endpoint)
      if (Array.isArray(body.data)) {
        const result = []
        for (let i = 0; i < body.data.length; i++) {
          result.push(handleObject(body.data[i], context))
        }
        mainResolve(result);
        return
      }
      const object = handleObject(body.data, context)
      mainResolve(object);
    }).catch(response => {
      reject();
      context.commit('setObjectDoneLoading', endpoint)
    })
  })
}

export default fetchMethod
