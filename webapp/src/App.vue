<template>
  <div id="app" class="flex flex-col w-full h-full">
    <div id="alert-container" class="absolute flex justify-center w-full">
      <div
        v-if="alert"
        class="w-1/3 px-6 py-3 rounded-md"
        :class="{
          'alert-success': alert.variant === 'success',
          'alert-danger': alert.variant === 'danger',
        }"
      >
        {{ alert.text }}
      </div>
    </div>

    <div class="flex flex-col flex-grow">
      <control-bar :has-changes="hasChanges" @alert="showAlert"></control-bar>
      <div
        v-if="!loaded && notebooks.length"
        class="flex justify-center mt-20 sm:mt-32 md:mt-48"
      >
        <div class="w-full md:w-1/2 lg:w-1/3">
          <div>
            <h3>Your Notebooks</h3>
            <notebooks-picker
              :notebooks="notebooks"
              @notebook-selected="onNotebookSelected"
            ></notebooks-picker>
          </div>
        </div>
      </div>
      <div
        v-if="loaded"
        class="flex flex-col md:flex-row justify-between flex-grow mt-8 mb-4"
      >
        <notes-picker
          @noteSelected="onNoteSelected"
          @alert="showAlert"
          @addNote="addNote"
          @deleteNote="deleteNote"
        ></notes-picker>
        <notes-editor
          v-if="selectedNoteId >= 0"
          :id="selectedNoteId"
          class="flex-grow md:ml-12"
          :content="currentContent"
          :dirty="dirty"
          @alert="showAlert"
          @content-update="onNoteUpdated"
        ></notes-editor>
      </div>
      <div
        v-if="!loaded && !notebooks.length"
        class="flex justify-center mt-64"
      >
        <span class="text-3xl text-center" style="max-width: 400px"
          >Please create a new notebook.</span
        >
      </div>
    </div>
    <div class="text-xs text-gray-400 footer">
      Version {{ version }} | Made w/ &#x2661; by
      <a href="https://muetsch.io">Ferdinand Mütsch</a> |
      <a href="https://github.com/muety/mininote">GitHub</a>
    </div>
  </div>
</template>

<script>
  import { toRefs } from 'vue'
  import { actions, getters, mutations } from './store/types'

  import { STORE_KEY } from './store'

  import NotesEditor from './components/NotesEditor.vue'
  import NotesPicker from './components/NotesPicker.vue'
  import NotebooksPicker from './components/NotebooksPicker.vue'
  import ControlBar from './components/ControlBar.vue'

  const notebookHashRe = /^#\/notebook\/([a-z0-9_-]+)$/g

  function parseNotebookUrl() {
    // attempt to parse a requested notebook name from the url's hash
    const match = [...location.hash.matchAll(notebookHashRe)]
    return match && match.length && match[0].length == 2 ? match[0][1] : null
  }

  export default {
    components: {
      NotesEditor,
      NotesPicker,
      NotebooksPicker,
      ControlBar,
    },
    inject: [STORE_KEY],
    data() {
      return {
        alert: null,
        ...toRefs(this.store.state),
      }
    },
    computed: {
      [getters.LOADED]() {
        return this.store.getters[getters.LOADED].value
      },
      [getters.SELECTED_NOTE]() {
        return this.store.getters[getters.SELECTED_NOTE].value
      },
      [getters.DIRTY]() {
        return this.store.getters[getters.DIRTY].value
      },
      [getters.CURRENT_CONTENT]() {
        return this.store.getters[getters.CURRENT_CONTENT].value
      },
      [getters.NOTES]() {
        return this.store.getters[getters.NOTES].value
      },
      hasChanges() {
        return false
      },
    },
    async mounted() {
      window.addEventListener('beforeunload', this.didIntentToLeave)

      await this.listNotebooks()

      this.tryOpenFromUrl()
    },
    methods: {
      async [actions.LIST_NOTEBOOKS]() {
        return this.store.actions[actions.LIST_NOTEBOOKS](...arguments)
      },
      [mutations.SELECT_NOTE]() {
        return this.store.mutations[mutations.SELECT_NOTE](...arguments)
      },
      [mutations.SET_LOAD_NOTEBOOK]() {
        return this.store.mutations[mutations.SET_LOAD_NOTEBOOK](...arguments)
      },
      [mutations.ADD_CHANGE]() {
        return this.store.mutations[mutations.ADD_CHANGE](...arguments)
      },
      [mutations.RESET]() {
        return this.store.mutations[mutations.RESET](...arguments)
      },
      getNoteById: function (noteId) {
        return this.notes.find((n) => n.id === noteId)
      },
      onNoteSelected: function (noteId) {
        this.selectNote(noteId)
      },
      onNotebookSelected: function (notebookId) {
        this.setLoadNotebook(notebookId)
      },
      addNote: function (note) {
        this.notes.push(note)
      },
      deleteNote: function (note) {
        this.notes.splice(this.notes.indexOf(note), 1)
      },
      discardChanges: function () {
        this.notes = JSON.parse(JSON.stringify(this.notesInitial))
      },
      showAlert: function (text, variant) {
        let vm = this
        if (!variant) variant = 'danger'
        vm.alert = { text, variant }
        setTimeout(function () {
          vm.alert = null
        }, 3000)
      },
      onNoteUpdated: function ({ content, id }) {
        this.addChange({
          type: 'update',
          payload: { ...this.getNoteById(id), content },
        })
      },
      didIntentToLeave: function (event) {
        if (this.hasChanges) {
          // Cancel the event as stated by the standard.
          event.preventDefault()
          // Chrome requires returnValue to be set.
          event.returnValue = ''
        }
      },
      tryOpenFromUrl: function () {
        const initialNotebookId = parseNotebookUrl()
        const initialNotebook = this.notebooks.some(
          (n) => n.id === initialNotebookId,
        )
        if (initialNotebook) {
          this.onNotebookSelected(initialNotebookId)
        }
      },
    },
  }
</script>

<style>
  .alert-success {
    @apply bg-green-600 text-gray-300 border-green-700;
  }

  .alert-danger {
    @apply bg-red-700 text-gray-300 border-red-800;
  }
</style>
