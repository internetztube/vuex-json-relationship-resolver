import objectRelationshipAggregator from './object-aggregation/relationship'
import objectAttributesGetterSetter from './object-aggregation/attributes-getter-setter'
import objectRollback from './object-aggregation/rollback'
import storeObject from './store-object'

const handleObject = (object, context) => {
  object = objectRollback({ object, context }) // must be first in chain!
  object = objectRelationshipAggregator({ object, context })
  object = objectAttributesGetterSetter({ object, context })

  object = storeObject({ object, context })
  return object
}

export default handleObject
