<template>
  <div>
    <core-modal
      v-if="showDiscardModal"
      @ok="doReset"
      @discard=";(showDiscardModal = false) || (closeAfterReset = false)"
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
            <div class="flex items-center w-1/4">
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
        </div>
      </template>
      <template #ok-btn>Save</template>
    </core-modal>

    <div class="flex justify-between">
      <!-- TODO: Move logo section out of here and pull it back in via a slot -->
      <div
        class="flex-shrink-0 hidden w-1/4 text-2xl text-gray-400 md:inline"
        :class="{ hidden: state.loaded }"
      >
        <span>✎ Mini_Note</span>
        <span class="ml-1 text-xs text-green-600">BETA</span>
      </div>
      <div
        id="notebook-chooser"
        class="flex justify-center flex-grow flex-shrink relative"
      >
        <button
          type="button"
          class="px-4 rounded-r-none btn-danger hover:bg-red-800"
          @click.stop="dirty ? tryReset(true) : close()"
        >
          &#x2573;
        </button>
        <input
          v-if="!state.opening && !state.creating"
          ref="refNotebookInput"
          v-model="inputs.name"
          type="text"
          class="flex-grow flex-shrink placeholder-gray-700 rounded-l-none rounded-r-none"
          :class="{ 'rounded-r-md': state.loaded }"
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
          class="flex-grow flex-shrink placeholder-gray-700 rounded-l-none rounded-r-none"
          placeholder="Choose a password for the new notebook..."
          @keyup.enter="_createNotebook"
        />
        <input
          v-if="state.opening"
          ref="refOpenPasswordInput"
          v-model="inputs.password"
          type="password"
          class="flex-grow flex-shrink placeholder-gray-700 rounded-l-none rounded-r-none"
          placeholder="Enter password ..."
          @keyup.enter="_openNotebook"
        />
        <button
          v-if="inputs.name"
          class="ml-1 delete-btn absolute"
          style="right: 60px"
          @click.stop="deleteNotebook()"
        >
          🗑
        </button>
        <button
          v-if="!state.opening && !state.creating && !state.loaded"
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
      <div v-if="!state.loaded" class="w-fit md:w-1/4" />
      <div
        class="justify-end w-fit md:w-1/4 md:pl-0 space-x-1 flex"
        :class="{ hidden: !state.loaded }"
      >
        <button
          v-if="dirty"
          class="ml-4 px-4 btn-primary hover:bg-green-700"
          @click="saveNotes"
        >
          &#x1f4be;
        </button>
        <button
          v-if="dirty"
          class="px-4 btn-primary hover:bg-green-700"
          @click="tryReset()"
        >
          &#x21ba;
        </button>
        <button
          v-if="state.loaded"
          class="hidden md:inline-block px-4 btn-primary hover:bg-green-700"
          @click="showSettingsModal = true"
        >
          &#x2699;
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { toRefs } from 'vue'

  import { actions, getters, mutations } from '../store/types'
  import { STORE_KEY } from '../store'
  import api from '../api'

  import CoreModal from './core/CoreModal.vue'

  export default {
    components: {
      CoreModal,
    },
    inject: [STORE_KEY],
    emits: ['alert'],
    data() {
      return {
        inputs: {
          name: '',
          password: '',
          newName: '',
        },
        state: {
          opening: false,
          creating: false,
          loaded: false,
        },
        showDiscardModal: false,
        showSettingsModal: false,
        closeAfterReset: false,
        ...toRefs(this.store.state),
      }
    },
    computed: {
      [getters.DIRTY]() {
        return this.store.getters[getters.DIRTY].value
      },
    },
    watch: {
      loadNotebookId: function (newId, oldId) {
        if (newId !== '' && newId !== oldId) {
          this.inputs.name = newId
        }
      },
    },
    methods: {
      [mutations.REVERT_CHANGES]() {
        return this.store.mutations[mutations.REVERT_CHANGES](...arguments)
      },
      [mutations.SELECT_FIRST]() {
        return this.store.mutations[mutations.SELECT_FIRST](...arguments)
      },
      [mutations.RESET]() {
        return this.store.mutations[mutations.RESET](...arguments)
      },
      [actions.LIST_NOTEBOOKS]() {
        return this.store.actions[actions.LIST_NOTEBOOKS](...arguments)
      },
      [actions.LOAD_NOTEBOOK]() {
        return this.store.actions[actions.LOAD_NOTEBOOK](...arguments)
      },
      [actions.CREATE_NOTEBOOK]() {
        return this.store.actions[actions.CREATE_NOTEBOOK](...arguments)
      },
      [actions.UPDATE_NOTEBOOK]() {
        return this.store.actions[actions.UPDATE_NOTEBOOK](...arguments)
      },
      [actions.APPLY_CHANGES]() {
        return this.store.actions[actions.APPLY_CHANGES](...arguments)
      },
      deleteNotebook: function () {
        let id = this.inputs.name.toLowerCase()
        let password = prompt('Password')
        if (!password) return
        let vm = this
        this.store.actions[actions.DELETE_NOTEBOOK]({ id, password })
          .then(() => {
            vm.reset()
            vm.close()
          })
          .catch(vm.handleError)
      },
      handleError: function (err) {
        console.error(err)
        this.$emit('alert', err.message)
        this.reset()
        this.close()
      },
      tryReset: function (andClose) {
        if (!this.dirty) {
          this.reset()
          if (andClose) this.close()
        } else {
          this.closeAfterReset = andClose
          this.showDiscardModal = true
        }
      },
      doReset: function () {
        this.revertChanges()
        if (this.closeAfterReset) this.close()
        this.showDiscardModal = false
        this.closeAfterReset = false
      },
      close: function () {
        this.inputs = {
          name: '',
          password: '',
          newName: '',
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
          password: this.inputs.password,
        })
          .then(() => {
            vm.state.opening = false
            vm.state.loaded = true

            this.selectFirst()

            this.inputs.newName = this.inputs.name
          })
          .catch(vm.handleError)
      },
      _createNotebook: function () {
        let vm = this
        if (!this.inputs.name || !this.inputs.password) return

        this.createNotebook({
          id: this.inputs.name.toLowerCase(),
          password: this.inputs.password,
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
        })
          .then(() => {
            this.inputs.name = this.inputs.newName
            this.$emit('alert', 'Notebook updated.', 'success')
            this.showSettingsModal = false
          })
          .catch(vm.handleError)
      },
    },
  }
</script>

<style scoped></style>
