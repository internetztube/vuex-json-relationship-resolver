const localStore = require('./store');
const deepmerge = require('deepmerge').default;
const mapObject = require('./mapObject');

module.exports = {
  storeInjector: () => {
    return deepmerge(localStore, store);
  },
  mapObject
};