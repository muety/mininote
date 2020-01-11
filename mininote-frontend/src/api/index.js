import { ApiError, NotFoundError, UnauthorizedError } from '../lib/errors'

const apiBaseUrl = 'http://localhost:3000/api'

function generateError(res) {
    if (res.status === 401) return new UnauthorizedError()
    if (res.status === 404) return new NotFoundError()
    return new ApiError()
}

const api = {
    exists(notebookId) {
        let req = new Request(`${apiBaseUrl}/notebook/${notebookId}`, { method: 'HEAD' })
        return fetch(req).then(res => res.status === 200)
    },
    create(notebookId, passwordHash) {
        let headers = new Headers()
        headers.append('Content-Type', 'application/json')
        let req = new Request(`${apiBaseUrl}/notebook`, { method: 'POST', body: JSON.stringify({ id: notebookId, password: passwordHash }), headers: headers })
        return fetch(req)
            .then(res => {
                if (res.status === 201) return res.json()
                return generateError(res)
            })
    },
    update(notebookId, passwordHash, notebook) {
        let headers = new Headers()
        headers.append('Authorization', 'Basic ' + passwordHash)
        headers.append('Content-Type', 'application/json')
        let req = new Request(`${apiBaseUrl}/notebook/${notebookId}`, { method: 'PUT', body: JSON.stringify(notebook), headers: headers })
        return fetch(req)
            .then(res => {
                if (res.status === 200) return {}
                else if (res.status === 401) return 'unauthorized'
                else if (res.status === 404) return 'not found'
                else return null
            })
    },
    getNotes(notebookId, passwordHash) {
        let headers = new Headers()
        headers.append('Authorization', 'Basic ' + passwordHash)
        let req = new Request(`${apiBaseUrl}/notebook/${notebookId}/notes`, { method: 'GET', headers: headers, mode: 'cors' })
        return fetch(req)
            .then(res => {
                if (res.status === 200) return res.json()
                return generateError(res)
            })
    },
    addNote(notebookId, passwordHash, note) {
        let headers = new Headers()
        headers.append('Authorization', 'Basic ' + passwordHash)
        headers.append('Content-Type', 'application/json')
        let req = new Request(`${apiBaseUrl}/notebook/${notebookId}/notes`, { method: 'POST', body: JSON.stringify(note), headers: headers })
        return fetch(req)
            .then(res => {
                if (res.status === 201) return res.json()
                return generateError(res)
            })
    },
    updateNote(notebookId, passwordHash, note) {
        let headers = new Headers()
        headers.append('Authorization', 'Basic ' + passwordHash)
        headers.append('Content-Type', 'application/json')
        let req = new Request(`${apiBaseUrl}/notebook/${notebookId}/notes/${note.id}`, { method: 'PUT', body: JSON.stringify(note), headers: headers })
        return fetch(req)
            .then(res => {
                if (res.status === 200) return {}
                else if (res.status === 401) return 'unauthorized'
                else if (res.status === 404) return 'not found'
                else return null
            })
    },
    deleteNote(notebookId, passwordHash, note) {
        let headers = new Headers()
        headers.append('Authorization', 'Basic ' + passwordHash)
        headers.append('Content-Type', 'application/json')
        let req = new Request(`${apiBaseUrl}/notebook/${notebookId}/notes/${note.id}`, { method: 'DELETE', body: null, headers: headers })
        return fetch(req)
            .then(res => {
                if (res.status === 200) return {}
                else if (res.status === 401) return 'unauthorized'
                else if (res.status === 404) return 'not found'
                else return null
            })
    }
}

export default api