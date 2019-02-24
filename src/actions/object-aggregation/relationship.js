import camelCase from 'camelcase'

const buildRelationsKey = (name, isArray) => {
  name = camelCase(name)
  if (isArray) name += 'List'
  return name
}

const findObjectByUrl = (context, url) => {
  context.dispatch('find', url)
  let foundObject = context.state.objects.filter(o => o.links.self === url)
  if (foundObject.length) {
    foundObject = foundObject[0]
  } else {
    foundObject = {}
  }
  const metaObject = {
    isLoading: context.getters.isObjectLoading(url),
    isEmpty: typeof foundObject === 'undefined'
  }
  const result = Object.assign(foundObject, metaObject)
  console.log(result)
  return result
}

const relationship = ({ object, context }) => {
  object.rel = {}

  if (!object.hasOwnProperty('relationships')) {
    object.relationships = {}
    return object
  }

  for (let key in object.relationships) {
    if (!object.relationships.hasOwnProperty(key)) continue
    let relationsKey = buildRelationsKey(key, Array.isArray(object.relationships[key]))

    const property = {
      get () {
        const content = object.relationships[key]
        if (Array.isArray(content)) {
          const result = {}
          for (let i = 0; i < content.length; i++) {
            Object.defineProperty(result, i, {
              enumerable: true,
              get () {
                return findObjectByUrl(context, content[i])
              }
            })
          }
          return result
        }
        // not array
        return findObjectByUrl(context, content)
      }
    }
    Object.defineProperty(object.rel, relationsKey, property)
    if (!object.hasOwnProperty(relationsKey)) {
      Object.defineProperty(object, relationsKey, property)
    }
  }
  return object
}

export default relationship
