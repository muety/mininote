import { basicAuth } from '../utils/http'
import { encryptData, decryptData } from '../utils/crypto'

const apiBaseUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api'
    : `${import.meta.env.BASE_URL}api`

function generateError(res) {
  if (res.status === 401)
    return new Error(
      'You are not authorized to access this note. Password wrong?',
    )
  if (res.status === 404) return new Error('Resource not found')
  return new Error('An error has occurred, sorry.')
}

function headers(password) {
  let headers = new Headers()
  headers.append('Content-Type', 'application/json')
  if (password) {
    headers.append('Authorization', 'Basic ' + basicAuth('anonymous', password))
  }
  return headers
}

const api = {
  async exists(notebookId) {
    let req = new Request(`${apiBaseUrl}/notebook/${notebookId}`, {
      method: 'HEAD',
    })
    return (await fetch(req)).status === 200
  },
  async list() {
    let req = new Request(`${apiBaseUrl}/notebook`, { method: 'GET' })

    const res = await fetch(req)
    if (res.status === 200) return res.json()
    throw generateError(res)
  },
  async create(id, password) {
    let req = new Request(`${apiBaseUrl}/notebook`, {
      method: 'POST',
      body: JSON.stringify({ id, password }),
      headers: headers(),
    })

    const res = await fetch(req)
    if (res.status === 201) return res.json()
    throw generateError(res)
  },
  async update(id, password, notebook) {
    let req = new Request(`${apiBaseUrl}/notebook/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...notebook }),
      headers: headers(password),
    })

    const res = await fetch(req)
    if (res.status === 200) return {}
    throw generateError(res)
  },
  async getNotes(id, password) {
    let req = new Request(`${apiBaseUrl}/notebook/${id}/notes`, {
      method: 'GET',
      headers: headers(password),
      mode: 'cors',
    })

    const res = await fetch(req)
    if (res.status === 200) {
      return Promise.all(
        (await res.json()).map(async (note) => ({
          ...note,
          content: await decryptData(note.content, password),
          title: await decryptData(note.title, password),
        })),
      )
    }
    throw generateError(res)
  },
  async addNote(id, password, note) {
    const data = {
      ...note,
      title: await encryptData(note.title, password),
      content: await encryptData(note.content, password),
    }

    let req = new Request(`${apiBaseUrl}/notebook/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: headers(password),
    })

    const res = await fetch(req)
    if (res.status === 201) return res.json()
    throw generateError(res)
  },
  async updateNote(id, password, note) {
    const data = {
      ...note,
      title: await encryptData(note.title, password),
      content: await encryptData(note.content, password),
    }

    let req = new Request(`${apiBaseUrl}/notebook/${id}/notes/${note.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: headers(password),
    })

    const res = await fetch(req)
    if (res.status === 200) return {}
    throw generateError(res)
  },
  async deleteNote(id, password, note) {
    let req = new Request(`${apiBaseUrl}/notebook/${id}/notes/${note.id}`, {
      method: 'DELETE',
      body: null,
      headers: headers(password),
    })

    const res = await fetch(req)
    if (res.status === 200) return {}
    throw generateError(res)
  },
}

export default api
