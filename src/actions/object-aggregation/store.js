import handleObject from '../handle-object'

const save = ({ object, context }) => {
  object._restoreOriginalStore = JSON.stringify(object.originalBody)

  object.save = () => new Promise((resolve, reject) => {
    fetch(object.links.self, {
      method: 'PUT',
      body: JSON.stringify(object),
      headers: { 'Content-Type': 'application/json' }
    })
      .then((response) => {
        return response.json().then(body => {
          if (response.ok) {
            const responseBody = JSON.stringify(body.data)
            handleObject(responseBody)
            resolve()
            return
          }
          if (response.status === 422) {
            object.rollback()
            reject(body.errors)
          } else {
            reject(response)
          }
        })
      })
  })
}

export default save
