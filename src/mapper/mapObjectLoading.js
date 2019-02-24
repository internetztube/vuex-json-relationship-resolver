const mapObjectLoading = function (values) {
  const result = []
  for (let key in values) {
    if (!values.hasOwnProperty(key)) continue

    result[key] = {
      get () {
        return this.$store.getters['rr/isObjectLoading'](values[key])
      }
    }
  }
  return result
}

export default mapObjectLoading
