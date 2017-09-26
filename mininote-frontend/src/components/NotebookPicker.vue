<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-4"></div>
      <div class="col-4">
        <div class="input-group">
          <div class="input-group-btn">
            <button type="button" class="btn btn-danger" @click="reset" :disabled="hasChanged">🞨</button>
          </div>
          <input type="text" class="form-control" placeholder="Open or create notebook ..." v-model="notebookInput" v-if="!state.opening && !state.creating" :disabled="state.loaded">
          <input type="text" class="form-control" placeholder="Choose a password ..." v-model="passwordInput" v-if="state.creating" autofocus>
          <input type="text" class="form-control" placeholder="Enter password ..." v-model="passwordInput" v-if="state.opening" autofocus>
          <div class="input-group-btn">
            <button type="button" class="btn btn-primary" :disabled="!notebookInput || state.loaded" @click="checkNotebookState" v-if="!state.opening && !state.creating">Open</button>
            <button type="button" class="btn btn-primary" :disabled="!passwordInput" @click="openNotebook" v-if="state.opening">Open</button>
            <button type="button" class="btn btn-primary" :disabled="!passwordInput" @click="createNotebook" v-if="state.creating">Create</button>
          </div>
        </div>
      </div>
      <div class="col-2"></div>
      <div class="col-2 action-buttons-container">
        <button class="btn btn-primary float-right" @click="updateNotebook" v-if="hasChanged">Save 💾</button>
        <button class="btn btn-primary float-right" @click="discardChanges" v-if="hasChanged">Discard 🗑 </button>
      </div>
    </div>
  </div>
</template>

<script>
import { md5 } from './../services/md5'

const apiBaseUrl = 'https://api.myjson.com/bins/'

export default {
  name: 'notebook-picker',
  data() {
    return {
      notebookInput: '',
      passwordInput: '',
      state: {
        opening: false,
        creating: false,
        loaded: false
      },
      notebookInitial: [],
      notebook: []
    }
  },
  computed: {
    notebookLoaded: function() {
      return false
    },
    hasChanged: function() {
      if (this.notebook.length !== this.notebookInitial.length) return true
      let changed = false
      for (let i = 0; i < this.notebook.length; i++) {
        if (this.notebook[i].title !== this.notebookInitial[i].title || this.notebook[i].content !== this.notebookInitial[i].content) changed = true
      }
      return changed
    }
  },
  methods: {
    reset: function() {
      this.notebookInput = ''
      this.passwordInput = ''
      this.state = {
        opening: false,
        creating: false,
        loaded: false
      }
      this.$emit('notesLoaded', [])
    },
    discardChanges: function() {
      this.notebook = JSON.parse(JSON.stringify(this.notebookInitial))
      this.$emit('notesLoaded', this.notebook)
    },
    updateNotebook: function() {
      console.log(this.notebook.map(n => n.content))
    },
    checkNotebookState: function() {
      let vm = this
      let req = new Request(apiBaseUrl + this.notebookInput.toLowerCase(), { method: 'HEAD' })
      fetch(req)
        .then(res => {
          if (res.status === 200) vm.state.opening = true
          else if (res.status === 404) vm.state.creating = true
          else vm.$emit('alert', 'An error has occured. Sorry.')
        })
        .catch(() => {
          vm.reset()
          vm.$emit('alert', 'An error has occured. Sorry.')
        })
    },
    openNotebook: function() {
      let vm = this
      let headers = new Headers()
      headers.append('Authorization', 'Basic ' + md5(this.passwordInput))
      let req = new Request(apiBaseUrl + this.notebookInput.toLowerCase(), { method: 'GET', headers: headers })
      fetch(req)
        .then(res => {
          if (res.status === 200) return res.json()
          else if (res.status === 401) return this.$emit('alert', 'You are not authorized to view this note.')
          else {
            vm.reset()
            vm.$emit('alert', 'An error has occured. Sorry.')
          }
        })
        .then(res => {
          vm.state.opening = false
          vm.state.loaded = true
          vm.notebook = res
          vm.notebookInitial = JSON.parse(JSON.stringify(res))
          vm.$emit('notesLoaded', res)
        })
        .catch(() => {
          vm.reset()
          vm.$emit('alert', 'An error has occured. Sorry.')
        })
    },
    createNotebook: function() {
      let vm = this
      let body = {
        title: this.notebookInput.toLowerCase(),
        password: md5(this.passwordInput),
        content: ''
      }
      let req = new Request(apiBaseUrl, { method: 'POST', body: JSON.stringify(body) })
      fetch(req)
        .then(res => {
          if (res.status === 201) return res.json()
          else {
            vm.reset()
            vm.$emit('alert', 'An error has occured. Sorry.')
          }
        })
        .then(res => {
          vm.state.creating = false
          vm.state.loaded = true
          vm.notebook = res
          vm.notebookInitial = res.slice(0)
          vm.$emit('notesLoaded', res)
        })
        .catch(() => {
          vm.reset()
          vm.$emit('alert', 'An error has occured. Sorry.')
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.action-buttons-container button {
  margin-left: 5px;
}
</style>
