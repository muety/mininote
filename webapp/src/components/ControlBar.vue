<template>
  <div>
    <core-modal
      v-if="showDiscardModal"
      @ok="doReset"
      @discard="showDiscardModal = false"
    >
      <template #header>Save changes?</template>
      <template #main>
        <span
          >You're about to discard all recent changes to your notebook. Are you
          sure you want to proceed?</span
        >
      </template>
    </core-modal>

    <core-modal
      v-if="showSettingsModal"
      @ok="_updateNotebook"
      @discard="showSettingsModal = false"
    >
      <template #header>Notebook Settings</template>
      <template #main>
        <div class="flex flex-col space-y-4">
          <div class="flex">
            <div class="w-1/4">
              <label for="newNameInput">Name:</label>
            </div>
            <div class="w-3/4">
              <input
                id="newNameInput"
                v-model="inputs.newName"
                type="text"
                placeholder="Enter new name for this notebook."
                class="w-full bg-gray-100 focus:shadow-outline"
                style="border: 1px solid #cbd5e0"
              />
            </div>
          </div>
          <div class="flex">
            <div class="w-1/4">
              <label for="newPasswordInput">Password:</label>
            </div>
            <div class="w-3/4">
              <input
                id="newPasswordInput"
                v-model="inputs.newPassword"
                type="password"
                placeholder="Enter new password for this notebook."
                class="w-full bg-gray-100 focus:shadow-outline"
                style="border: 1px solid #cbd5e0"
              />
            </div>
          </div>
        </div>
      </template>
      <template #ok-btn>Save</template>
    </core-modal>

    <div class="flex justify-between">
      <!-- TODO: Move logo section out of here and pull it back in via a slot -->
      <div class="w-1/4 text-2xl text-gray-400 flex-shrink-0 hidden md:inline" :class="{'hidden': state.loaded}">
        <span>✎ Mini_Note</span>
        <span class="ml-1 text-xs text-green-600">BETA</span>
      </div>
      <div
        id="notebook-chooser"
        class="flex justify-center md:w-1/2 flex-shrink flex-grow"
        :class="{ 'w-full': !state.loaded }"
      >
        <button
          type="button"
          class="px-4 rounded-r-none btn-danger hover:bg-red-800"
          @click="dirty ? tryReset() : close()"
        >
          &#x2573;
        </button>
        <input
          v-if="!state.opening && !state.creating"
          ref="refNotebookInput"
          v-model="inputs.name"
          type="text"
          class="placeholder-gray-700 rounded-l-none rounded-r-none flex-grow flex-shrink"
          placeholder="Open or create notebook ..."
          :disabled="state.loaded"
          autofocus
          @keyup.enter="_tryNotebook"
        />
        <input
          v-if="state.creating"
          ref="refCreatePasswordInput"
          v-model="inputs.password"
          type="password"
          class="placeholder-gray-700 rounded-l-none rounded-r-none flex-grow flex-shrink"
          placeholder="Choose a password for the new notebook..."
          @keyup.enter="_createNotebook"
        />
        <input
          v-if="state.opening"
          ref="refOpenPasswordInput"
          v-model="inputs.password"
          type="password"
          class="placeholder-gray-700 rounded-l-none rounded-r-none flex-grow flex-shrink"
          placeholder="Enter password ..."
          @keyup.enter="_openNotebook"
        />
        <button
          v-if="!state.opening && !state.creating"
          type="button"
          class="rounded-l-none btn-primary hover:bg-green-700"
          :disabled="!inputs.name || state.loaded"
          @click="_tryNotebook"
        >
          Open
        </button>
        <button
          v-if="state.opening"
          type="button"
          class="rounded-l-none btn-primary hover:bg-green-700"
          :disabled="!inputs.password"
          @click="_openNotebook"
        >
          Open
        </button>
        <button
          v-if="state.creating"
          type="button"
          class="rounded-l-none btn-primary hover:bg-green-700"
          :disabled="!inputs.password"
          @click="_createNotebook"
        >
          Create
        </button>
      </div>
      <div class="hidden md:flex justify-end w-1/4 space-x-1" :class="{ 'hidden': !state.loaded }">
        <button
          v-if="dirty"
          class="px-4 btn-primary hover:bg-green-700"
          @click="saveNotes"
        >
          &#x1f4be;
        </button>
        <button
          v-if="dirty"
          class="px-4 btn-primary hover:bg-green-700"
          @click="tryReset"
        >
          &#x21ba;
        </button>
        <button
          v-if="state.loaded"
          class="px-4 btn-primary hover:bg-green-700"
          @click="showSettingsModal = true"
        >
          &#x2699;
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { md5 } from '../lib/md5'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { actions, getters, mutations } from '../store/types'

import api from '../api'

import CoreModal from './core/CoreModal.vue'

export default {
  components: {
    CoreModal,
  },
  emits: ['alert'],
  data() {
    return {
      inputs: {
        name: '',
        password: '',
        newName: '',
        newPassword: '',
      },
      state: {
        opening: false,
        creating: false,
        loaded: false,
      },
      showDiscardModal: false,
      showSettingsModal: false,
    }
  },
  computed: {
    ...mapState({
      notebook: (state) => state.notebook,
      loadNotebookId: (state) => state.loadNotebookId,
    }),
    ...mapGetters([getters.DIRTY]),
  },
  watch: {
    loadNotebookId: function (newId, oldId) {
      if (newId !== '' && newId !== oldId) {
        this.inputs.name = newId
      }
    },
  },
  methods: {
    ...mapMutations([
      mutations.REVERT_CHANGES,
      mutations.SELECT_FIRST,
      mutations.RESET,
    ]),
    ...mapActions([
      actions.LIST_NOTEBOOKS,
      actions.LOAD_NOTEBOOK,
      actions.CREATE_NOTEBOOK,
      actions.UPDATE_NOTEBOOK,
      actions.APPLY_CHANGES,
    ]),
    handleError: function (err) {
      this.$emit('alert', err.message)
      this.reset()
      this.close()
    },
    tryReset: function () {
      if (!this.dirty) this.reset()
      else this.showDiscardModal = true
    },
    doReset: function () {
      this.revertChanges()
      this.showDiscardModal = false
    },
    close: function () {
      this.inputs = {
        name: '',
        password: '',
        newName: '',
        newPassword: '',
      }
      this.state = {
        opening: false,
        creating: false,
        loaded: false,
      }
      this.reset()
      this.listNotebooks()
      setTimeout(() => this.$refs.refNotebookInput.focus(), 0)
    },
    _tryNotebook: function () {
      let vm = this
      if (!this.inputs.name) return

      api
        .exists(this.inputs.name.toLowerCase())
        .then((exists) => {
          if (exists) {
            vm.state.opening = true
            setTimeout(() => vm.$refs.refOpenPasswordInput.focus(), 0)
          } else {
            vm.state.creating = true
            setTimeout(() => vm.$refs.refCreatePasswordInput.focus(), 0)
          }
        })
        .catch(vm.handleError)
    },
    _openNotebook: function () {
      let vm = this
      if (!this.inputs.name || !this.inputs.password) return

      this.loadNotebook({
        id: this.inputs.name.toLowerCase(),
        password: md5(this.inputs.password),
      })
        .then(() => {
          vm.state.opening = false
          vm.state.loaded = true

          this.selectFirst()

          this.inputs.newName = this.inputs.name
          this.inputs.newPassword = this.inputs.password
        })
        .catch(vm.handleError)
    },
    _createNotebook: function () {
      let vm = this
      if (!this.inputs.name || !this.inputs.password) return

      this.createNotebook({
        id: this.inputs.name.toLowerCase(),
        password: md5(this.inputs.password),
      })
        .then(() => {
          vm.state.creating = false
          vm.state.loaded = true
        })
        .catch(vm.handleError)
    },
    saveNotes: function () {
      let vm = this
      if (!this.inputs.name || !this.inputs.password) return

      this.applyChanges()
        .then(() => this.$emit('alert', 'Saved changes.', 'success'))
        .catch(vm.handleError)
    },
    _updateNotebook: function () {
      let vm = this
      if (!this.inputs.name || !this.inputs.password) return

      this.updateNotebook({
        id: this.inputs.newName.toLowerCase(),
        password: md5(this.inputs.newPassword),
      })
        .then(() => {
          ;(this.inputs.name = this.inputs.newName),
            (this.inputs.password = this.inputs.newPassword)
          this.$emit('alert', 'Notebook updated.', 'success')
          this.showSettingsModal = false
        })
        .catch(vm.handleError)
    },
  },
}
</script>

<style scoped></style>
