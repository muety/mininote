<template>
  <div>
    <b-modal id="discardModal" ref="discardModalRef" title="Save changes?" @ok="discardChanges">You're about to discard all recent changes to your notebook. Are you sure you want to proceed?</b-modal>
    <div class="container-fluid">
      <div class="row">
        <div class="col-4"></div>
        <div class="col-4">
          <div class="input-group">
            <div class="input-group-btn">
              <button type="button" class="btn btn-danger" @click="reset" :disabled="hasChanges">&#x2573;</button>
            </div>
            <input type="text" class="form-control" placeholder="Open or create notebook ..." ref="refNotebookInput" v-model="notebookInput" v-if="!state.opening && !state.creating" :disabled="state.loaded" @keyup.enter="checkNotebookState" autofocus>
            <input type="password" class="form-control" placeholder="Choose a password for the new notebook..." ref="refCreatePasswordInput" v-model="passwordInput" v-if="state.creating" @keyup.enter="createNotebook">
            <input type="password" class="form-control" placeholder="Enter password ..." ref="refOpenPasswordInput" v-model="passwordInput" v-if="state.opening" @keyup.enter="openNotebook">
            <div class="input-group-btn">
              <button type="button" class="btn btn-primary" :disabled="!notebookInput || state.loaded" @click="checkNotebookState" v-if="!state.opening && !state.creating">Open</button>
              <button type="button" class="btn btn-primary" :disabled="!passwordInput" @click="openNotebook" v-if="state.opening">Open</button>
              <button type="button" class="btn btn-primary" :disabled="!passwordInput" @click="createNotebook" v-if="state.creating">Create</button>
            </div>
          </div>
        </div>
        <div class="col-2"></div>
        <div class="col-2 action-buttons-container">
          <button class="btn btn-primary float-right" @click="updateNotebook" v-if="hasChanges">&#x1f4be;</button>
          <button class="btn btn-primary float-right" @click="tryReset" v-if="hasChanges">&#x21ba;</button>
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
  props: ['hasChanges', 'notes'],
  data() {
    return {
      notebookInput: '',
      passwordInput: '',
      state: {
        opening: false,
        creating: false,
        loaded: false
      }
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
      setTimeout(() => this.$refs.refNotebookInput.focus(), 0)
    },
    discardChanges: function() {
      this.$emit('discardChanges', this.notes)
    },
    checkNotebookState: function() {
      let vm = this
      if (!this.notebookInput) return
      NotesApiService.exists(this.notebookInput.toLowerCase())
        .then(exists => {
          if (exists) {
            vm.state.opening = true
            setTimeout(() => vm.$refs.refOpenPasswordInput.focus(), 0)
          }
          else {
            vm.state.creating = true
            setTimeout(() => vm.$refs.refCreatePasswordInput.focus(), 0)
          }
        })
        .catch(() => {
          vm.reset()
          vm.$emit('alert', 'An error has occured. Sorry.')
        })
    },
    openNotebook: function() {
      let vm = this
      if (!this.notebookInput || !this.passwordInput) return
      NotesApiService.getNotes(this.notebookInput.toLowerCase(), md5(this.passwordInput))
        .then(res => {
          if (res && typeof (res) === 'object') {
            vm.state.opening = false
            vm.state.loaded = true
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
      if (!this.notebookInput || !this.passwordInput) return
      NotesApiService.create(this.notebookInput.toLowerCase(), md5(this.passwordInput))
        .then(res => {
          if (res) {
            vm.state.creating = false
            vm.state.loaded = true
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
      NotesApiService.updateNotes(this.notebookInput.toLowerCase(), md5(this.passwordInput), this.notes)
        .then(res => {
          if (res && typeof (res) === 'object') {
            vm.$emit('alert', 'Notebook saved successfully.', 'success')
            vm.$emit('notesLoaded', res)
          }
          else if (res && typeof (res) === 'string' && res === 'unauthorized') {
            vm.$emit('alert', 'You are not authorized to access this note. Wrong password?')
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
