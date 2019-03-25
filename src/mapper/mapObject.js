const mapObject = function (values) {
  const result = []
  for (let key in values) {
    if (!values.hasOwnProperty(key)) continue

    result[key] = {
      get () {
        const result = this.$store.state.rr.objects.filter(o => o.type === values[key].type)
        if (!result.length) return null
        if (typeof values[key].filter !== "undefined") {
          Object.keys(values[key].filter).forEach((indexKey) => {
            let value = values[key].filter[indexKey]();
            if (Array.isArray(value)) {
              value = result.filter(o => value.indexOf(o[indexKey]) >= 0)
            } else {
              value = result.filter(o => o[indexKey] == value)
            }
          })
        }
        if (values[key].isArray) return result
        return result[0]
      }
    }
  }
  return result
}

export default mapObject
