const apiBaseUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api'
    : `${process.env.BASE_URL}api`

function generateError(res) {
  if (res.status === 401)
    return new Error(
      'You are not authorized to access this note. Password wrong?',
    )
  if (res.status === 404) return new Error('Resource not found')
  return new Error('An error has occurred, sorry.')
}

const api = {
  exists(notebookId) {
    let req = new Request(`${apiBaseUrl}/notebook/${notebookId}`, {
      method: 'HEAD',
    })
    return fetch(req).then((res) => res.status === 200)
  },
  list() {
    let req = new Request(`${apiBaseUrl}/notebook`, { method: 'GET' })
    return fetch(req).then((res) => {
      if (res.status === 200) return res.json()
      throw generateError(res)
    })
  },
  create(notebookId, passwordHash) {
    let headers = new Headers()
    headers.append('Content-Type', 'application/json')
    let req = new Request(`${apiBaseUrl}/notebook`, {
      method: 'POST',
      body: JSON.stringify({ id: notebookId, password: passwordHash }),
      headers: headers,
    })
    return fetch(req).then((res) => {
      if (res.status === 201) return res.json()
      throw generateError(res)
    })
  },
  update(notebookId, passwordHash, notebook) {
    let headers = new Headers()
    headers.append('Authorization', 'Basic ' + passwordHash)
    headers.append('Content-Type', 'application/json')
    let req = new Request(`${apiBaseUrl}/notebook/${notebookId}`, {
      method: 'PUT',
      body: JSON.stringify(notebook),
      headers: headers,
    })
    return fetch(req).then((res) => {
      if (res.status === 200) return {}
      throw generateError(res)
    })
  },
  getNotes(notebookId, passwordHash) {
    let headers = new Headers()
    headers.append('Authorization', 'Basic ' + passwordHash)
    let req = new Request(`${apiBaseUrl}/notebook/${notebookId}/notes`, {
      method: 'GET',
      headers: headers,
      mode: 'cors',
    })
    return fetch(req).then((res) => {
      if (res.status === 200) return res.json()
      throw generateError(res)
    })
  },
  addNote(notebookId, passwordHash, note) {
    let headers = new Headers()
    headers.append('Authorization', 'Basic ' + passwordHash)
    headers.append('Content-Type', 'application/json')
    let req = new Request(`${apiBaseUrl}/notebook/${notebookId}/notes`, {
      method: 'POST',
      body: JSON.stringify(note),
      headers: headers,
    })
    return fetch(req).then((res) => {
      if (res.status === 201) return res.json()
      throw generateError(res)
    })
  },
  updateNote(notebookId, passwordHash, note) {
    let headers = new Headers()
    headers.append('Authorization', 'Basic ' + passwordHash)
    headers.append('Content-Type', 'application/json')
    let req = new Request(
      `${apiBaseUrl}/notebook/${notebookId}/notes/${note.id}`,
      { method: 'PUT', body: JSON.stringify(note), headers: headers },
    )
    return fetch(req).then((res) => {
      if (res.status === 200) return {}
      throw generateError(res)
    })
  },
  deleteNote(notebookId, passwordHash, note) {
    let headers = new Headers()
    headers.append('Authorization', 'Basic ' + passwordHash)
    headers.append('Content-Type', 'application/json')
    let req = new Request(
      `${apiBaseUrl}/notebook/${notebookId}/notes/${note.id}`,
      { method: 'DELETE', body: null, headers: headers },
    )
    return fetch(req).then((res) => {
      if (res.status === 200) return {}
      throw generateError(res)
    })
  },
}

export default api
