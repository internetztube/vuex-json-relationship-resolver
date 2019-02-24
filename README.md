# Vuex JSON API relationship resolver

## Installation
```
npm i internetztube/vuex-json-relationship-resolver
```

## Usage

Since this module needs some necessarily helper, it is recommended to extract this logic into a separate file. As you can see here.

relationshipResolver.js
```js
import { module } from 'vuex-json-relationship-resolver'

const relationshipResolverOptions = {
  customHelpers: {
    buildEndpointUrl (rootState, { endpoint }) {
      if (endpoint.indexOf('http://api.test/v1/') >= 0) return endpoint
      return 'http://api.test/v1/' + endpoint
    },
    requestOptions (rootState, { endpoint }) {
      return {
        headers: {}
      }
    }
  }
}

export default module(relationshipResolverOptions)
```



store.js
```js
import relationshipResolverModule from './relationshipResolver'

let store = {
  modules: {
    rr: relationshipResolverModule
  },
  getters: {...},
  mutations: {...},
  actions: {...}
};
store = storeInjector(store)

export default store
```

component.vue
```html
<template>
  <div id="app">
    <div v-if="isUserLoading">loading</div>
    <pre v-else>{{ user }}</pre>
    <div v-if="user">
      <div v-if="user.userGroupList">
        <div v-for="(userGroup, index) in user.userGroupList" :key="index">
          <div v-if="userGroup._loading">loading</div>
          <div v-else>
            <pre>{{ userGroup }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapObject, mapObjectLoading } from 'vuex-json-relationship-resolver'

export default {
  name: 'app',
  computed: {
    ...mapObject({
      user: { type: 'user', isArray: false }
    }),
    ...mapObjectLoading({
      isUserLoading: 'user/current'
    })
  },
  created () {
    this.$store.dispatch('init')
  }
}
</script>
```

## API Endpoints

### Demo Endpoints for the example above

https://api.test/v1.0/user/311
```json
{
  "data": {
    "id": "311",
    "type": "user",
    "attributes": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "relationships": {
      "user-group": [
        "https://api.test/v1.0/user-group/3"
      ]
    },
    "links": {
      "self": "https://api.test/v1.0/user/311"
    }
  },
  "status_code": 200
}
```

https://api.test/v1.0/user-group/3
```js
{
  "data": {
    "id": 3,
    "type": "user-group",
    "attributes": {
      "name": "Admin",
      "handle": "admin"
    },
    "links": {
      "self": "https://api.test/v1.0/user-group/3"
    }
  },
  "status_code": 200
}
```
