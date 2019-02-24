const attributesGetterSetter = ({ object, context }) => {
  for (let key in object.attributes) {
    if (!object.attributes.hasOwnProperty(key)) continue
    if (object.hasOwnProperty(key)) continue
    Object.defineProperty(object, key, {
      get () {
        return object.attributes[key]
      },
      set (value) {
        object.attributes[key] = value
      }
    })
  }
  return object
}

export default attributesGetterSetter
