const mapObjectLoading = function (values) {
  const result = []
  for (let key in values) {
    if (!values.hasOwnProperty(key)) continue

    let value = values[key];
    if (typeof value === 'function') value = value(this);

    result[key] = {
      get () {
        return this.$store.getters['rr/isObjectLoading'](value)
      }
    }
  }
  return result
}

export default mapObjectLoading
