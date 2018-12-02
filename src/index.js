const localStore = require('./store');
const deepmerge = require('deepmerge').default;

module.exports = (store) => {
  return deepmerge(localStore, store);
};