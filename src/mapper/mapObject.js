const mapObject = function (values) {
  const result = []
  for (let key in values) {
    if (!values.hasOwnProperty(key)) continue

    result[key] = {
      get () {
        const result = this.$store.state.rr.objects.filter(o => o.type === values[key].type)
        if (values[key].isArray) return result
        if (!result.length) return null
        return result[0]
      }
    }
  }
  return result
}

export default mapObject
