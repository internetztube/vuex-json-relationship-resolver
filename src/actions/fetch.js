import handleObject from './handle-object'

const fetchMethod = (context, customHelpers, endpoint) => {
  return new Promise((resolve, reject) => {
    context.commit('setObjectLoading', endpoint)
    let headers = {}
    if (customHelpers.hasOwnProperty('requestOptions')) headers = customHelpers.requestOptions(context.rootState, { endpoint })

    fetch(endpoint, headers)
      .then((response) => {
        if (!response.ok) {
          context.commit('setObjectDoneLoading', endpoint)
          if (customHelpers.hasOwnProperty('onRequestFailed')) return customHelpers.onRequestFailed(context.rootState, { endpoint, response })
          return
        }
        return response.json().then(body => {
          context.commit('setObjectDoneLoading', endpoint)
          if (Array.isArray(body.data)) {
            const result = []
            for (let i = 0; i < body.data.length; i++) {
              result.push(handleObject(body.data[i], context))
            }
            return result
          }
          return handleObject(body.data, context)
        })
      })
      .catch((response) => {
        if (customHelpers.hasOwnProperty('onRequestNetworkError')) customHelpers.onRequestNetworkError(context.rootState, { endpoint, response })
      })
  })
}

export default fetchMethod
