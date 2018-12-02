# Vuex JSON API relationship resolver

## Installation
```
npm i internetztube/vuex-json-relationship-resolver
```

## API Endpoints

## Usage

store.js
```js
const {storeInjector} = require('vuex-json-relationship-resolver');

let store = {
  getter: {...},
  mutations: {...},
  actions: {...},
  ...
};
store = storeInjector(store);

module.exports = store;
```

component.vue
```html
<template>
  <div v-if="user">
    <pre>{{ user }}</pre>
    <span v-for="post in user.posts" v-if="post">
      <pre>{{ post }}</pre>
    </span>
  </div>
</template>

<script>
  const {mapObject} = require('vuex-json-relationship-resolver');

  module.exports = {
    computed: {
      ...mapObject({user: {type: 'user', isArray: false}});
    },
    mounted() {
      this.$store.dispatch('fetch', 'http://demo.test/api/user/1');
    }
  }
</script>
```

### Schema
```json
{
  "data": {
    "id": 1,
    "type": "user",
    "attributes": {
      "firstname": "John",
      "lastname": "Doe",
    },
    "relationships": {
      "posts": [
        "http://demo.test/api/post/1",
        "http://demo.test/api/post/2",
      ],
      "address": "http://demo.test/api/address/1",
    },
    "links": {
      "self": "http://demo.test/api/user/1",
    }
  }
}
```

## Reserved vuex functions and properties
*Actually you won't really need them, but you should ba aware of them because of name collisions.*

### Getter
* `isApiResourceLoading`

### Mutations
* `setApiResourceLoading`
* `setApiResourceDoneLoading`
* `storeApiObject`

# Actions
* `fetch`
* `clearApiObjects`
* `apiObjectByUrl`
