import moment from 'moment'

const storeObject = ({ context, object }) => {
  object.fetched_at = moment().toDate()
  context.commit('deleteOldObjectOccurrences', object.links.self)
  context.commit('storeObject', object)
  return object
}

export default storeObject
