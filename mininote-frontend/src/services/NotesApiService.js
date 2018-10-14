const apiBaseUrl = 'http://localhost:8081/api/'

export default {
    list: function() {
        let req = new Request(apiBaseUrl + 'notebook', { method: 'GET' })
        return fetch(req)
            .then(res => {
                if (res.status === 200) {
                    return res.json()
                } else if (res.status === 204) {
                    return { count: res.body }
                } else {
                    return []
                }

            })
    },
    exists: function(notebookId) {
        let req = new Request(apiBaseUrl + 'notebook/' + notebookId, { method: 'HEAD' })
        return fetch(req)
            .then(res => {
                return res.status === 200
            })
    },
    create: function(notebookId, passwordHash) {
        let headers = new Headers()
        headers.append('Content-Type', 'application/json')
        let req = new Request(apiBaseUrl + 'notebook', { method: 'POST', body: JSON.stringify({ id: notebookId, password: passwordHash }), headers: headers })
        return fetch(req)
            .then(res => {
                if (res.status === 201) return res.json()
                else return null
            })
    },
    addNote: function(notebookId, passwordHash, note) {
      let headers = new Headers()
      headers.append('Authorization', 'Basic ' + passwordHash)
      let req = new Request(`${apiBaseUrl}notebook/${notebookId}/${note}`,
        {
          method: 'POST',
          headers: headers
        })
      return fetch(req)
          .then(res => {
            if (res.status === 200) return res.json()
            else if (res.status === 401) return 'unauthorized'
            else return null
          })
    },
    getNote: function(notebookId, passwordHash, noteId) {
      let headers = new Headers()
      headers.append('Authorization', 'Basic ' + passwordHash)
      let req = new Request(`${apiBaseUrl}notebook/${notebookId}/${noteId}`, { method: 'GET', headers: headers, mode: 'cors' })
      return fetch(req)
        .then(res => {
          if (res.status === 200) return res.json()
          else if (res.status === 401) return 'unauthorized'
          else return null
        })
    },
    updateNote: function(notebookId, passwordHash, noteId, content) {
      let headers = new Headers()
      headers.append('Authorization', 'Basic ' + passwordHash)
      headers.append('Content-Type', 'application/json')
      let req = new Request(`${apiBaseUrl}notebook/${notebookId}/${noteId}`, { method: 'PUT', headers: headers, mode: 'cors', body: JSON.stringify({content: content}) })
      return fetch(req)
        .then(res => {
          if (res.status === 200) return res.json()
          else if (res.status === 401) return 'unauthorized'
          else return null
        })
    },
    deleteNote: function(notebookId, passwordHash, noteId) {
      let headers = new Headers()
      headers.append('Authorization', 'Basic ' + passwordHash)
      let req = new Request(`${apiBaseUrl}notebook/${notebookId}/${noteId}`, { method: 'DELETE', headers: headers, mode: 'cors' })
      return fetch(req)
        .then(res => {
          if (res.status === 200) return true
          else if (res.status === 401) return 'unauthorized'
          else return null
        })
    },
    getNotes: function(notebookId, passwordHash) {
        let headers = new Headers()
        headers.append('Authorization', 'Basic ' + passwordHash)
        let req = new Request(apiBaseUrl + 'notebook/' + notebookId + '/notes/', { method: 'GET', headers: headers, mode: 'cors' })
        return fetch(req)
            .then(res => {
                if (res.status === 200) return res.json()
                else if (res.status === 401) return 'unauthorized'
                else return null
            })
    },
    updateNotes: function(notebookId, passwordHash, notes) {
        let headers = new Headers()
        headers.append('Authorization', 'Basic ' + passwordHash)
        headers.append('Content-Type', 'application/json')
        let req = new Request(apiBaseUrl + 'notebook/' + notebookId + '/notes', { method: 'PUT', body: JSON.stringify(notes), headers: headers })
        return fetch(req)
            .then(res => {
                if (res.status === 200) return res.json()
                else if (res.status === 401) return 'unauthorized'
                else return null
            })
    },
    updateSettings: function(notebookId, passwordHash, settings) {
        let headers = new Headers()
        headers.append('Authorization', 'Basic ' + passwordHash)
        headers.append('Content-Type', 'application/json')
        let req = new Request(apiBaseUrl + 'notebook/' + notebookId + '/settings', { method: 'PUT', body: JSON.stringify(settings), headers: headers, mode: 'cors' })
        return fetch(req)
            .then(res => {
                if (res.status === 200) return res.json()
                else if (res.status === 401) return 'unauthorized'
                else return null
            })
    }
}
