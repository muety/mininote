<template>
  <div>
    <b-modal id="discardModal" ref="discardModalRef" title="Save changes?" @ok="reset">You're about to discard all recent changes to your notebook. Are you sure you want to proceed?</b-modal>
    <div class="container-fluid">
      <div class="row">
        <div class="col-4"></div>
        <div class="col-4">
          <div class="input-group">
            <div class="input-group-btn">
              <button type="button" class="btn btn-danger" @click="reset" :disabled="hasChanges">🞨</button>
            </div>
            <input type="text" class="form-control" placeholder="Open or create notebook ..." v-model="notebookInput" v-if="!state.opening && !state.creating" :disabled="state.loaded">
            <input type="text" class="form-control" placeholder="Choose a password for the new notebook..." v-model="passwordInput" v-if="state.creating" autofocus>
            <input type="text" class="form-control" placeholder="Enter password ..." v-model="passwordInput" v-if="state.opening" autofocus>
            <div class="input-group-btn">
              <button type="button" class="btn btn-primary" :disabled="!notebookInput || state.loaded" @click="checkNotebookState" @keyup.enter="checkNotebookState" v-if="!state.opening && !state.creating">Open</button>
              <button type="button" class="btn btn-primary" :disabled="!passwordInput" @click="openNotebook" @keyup.enter="openNotebook" v-if="state.opening">Open</button>
              <button type="button" class="btn btn-primary" :disabled="!passwordInput" @click="createNotebook" @keyup.enter="createNotebook" v-if="state.creating">Create</button>
            </div>
          </div>
        </div>
        <div class="col-2"></div>
        <div class="col-2 action-buttons-container">
          <button class="btn btn-primary float-right" @click="updateNotebook" v-if="hasChanges">Save 💾</button>
          <button class="btn btn-primary float-right" @click="tryReset" v-if="hasChanges">Discard 🗑 </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NotesApiService from './../services/NotesApiService'
import { md5 } from './../services/md5'

export default {
  name: 'control-bar',
  props: ['hasChanges'],
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
    }
  },
  methods: {
    tryReset: function() {
      if (!this.hasChanges) this.reset()
      else this.$refs.discardModalRef.show();
    },
    reset: function() {
      this.notebookInput = ''
      this.passwordInput = ''
      this.state = {
        opening: false,
        creating: false,
        loaded: false
      }
      this.$emit('notesLoaded', null)
    },
    discardChanges: function() {
      this.notebook = JSON.parse(JSON.stringify(this.notebookInitial))
      this.$emit('notesLoaded', this.notebook)
    },
    checkNotebookState: function() {
      let vm = this
      NotesApiService.exists(this.notebookInput)
        .then(exists => {
          if (exists) vm.state.opening = true
          else vm.state.creating = true
        })
        .catch(() => {
          vm.reset()
          vm.$emit('alert', 'An error has occured. Sorry.')
        })
    },
    openNotebook: function() {
      let vm = this
      NotesApiService.getNotes(this.notebookInput.toLowerCase(), md5(this.passwordInput))
        .then(res => {
          if (res && typeof (res) === 'object') {
            vm.state.opening = false
            vm.state.loaded = true
            vm.notebook = res
            vm.notebookInitial = JSON.parse(JSON.stringify(res))
            vm.$emit('notesLoaded', res)
          }
          else if (res && typeof (res) === 'string' && res === 'unauthorized') {
            vm.$emit('alert', 'You are not authorized to access this note. Password wrong?')
          }
          else {
            vm.reset()
            vm.$emit('alert', 'An error has occured. Sorry.')
          }
        })
        .catch(() => {
          vm.reset()
          vm.$emit('alert', 'An error has occured. Sorry.')
        })
    },
    createNotebook: function() {
      let vm = this
      NotesApiService.create(this.notebookInput.toLowerCase(), md5(this.passwordInput))
        .then(res => {
          if (res) {
            vm.state.creating = false
            vm.state.loaded = true
            vm.notebook = res.notes
            vm.notebookInitial = res.notes.slice(0)
            vm.$emit('notesLoaded', res.notes)
          }
          else {
            vm.reset()
            vm.$emit('alert', 'An error has occured. Sorry.')
          }
        })
        .catch(() => {
          vm.reset()
          vm.$emit('alert', 'An error has occured. Sorry.')
        })
    },
    updateNotebook: function() {
      let vm = this
      NotesApiService.updateNotes(this.notebookInput.toLowerCase(), md5(this.passwordInput), this.notebook)
        .then(res => {
          if (res && typeof (res) === 'object') {
            vm.$emit('alert', 'Notenbook saved successfully.', 'success')
            vm.$emit('notesLoaded', res)
          }
          else if (res && typeof (res) === 'string' && res === 'unauthorized') {
            vm.$emit('alert', 'You are not authorized to access this note. Password wrong?')
          }
          else vm.$emit('alert', 'An error has occured. Sorry.')
        })
        .catch(() => {
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
