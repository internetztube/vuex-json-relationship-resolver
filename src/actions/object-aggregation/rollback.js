import handleObject from '../handle-object'

const rollback = ({ object, context }) => {
  object._restoreOriginalStore = JSON.stringify(object.originalBody)
  object.rollback = () => {
    // eslint-disable-next-line no-use-before-define
    const data = JSON.parse(object._restoreOriginalStore)
    const object = handleObject(data, context)
    return object
  }
  return object
}

export default rollback
