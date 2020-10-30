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
      <div v-if="!loaded && notebooks.length" class="flex justify-center mt-48">
        <div class="w-1/3">
          <div>
            <h3>Your Notebooks</h3>
            <notebooks-picker
              :notebooks="notebooks"
              @notebook-selected="onNotebookSelected"
            ></notebooks-picker>
          </div>
        </div>
      </div>
      <div v-if="loaded" class="flex justify-between flex-grow mt-8 mb-4">
        <notes-picker
          @noteSelected="onNoteSelected"
          @alert="showAlert"
          @addNote="addNote"
          @deleteNote="deleteNote"
        ></notes-picker>
        <notes-editor
          v-if="selectedNoteId >= 0"
          :id="selectedNoteId"
          class="flex-grow ml-12"
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
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
  import { actions, getters, mutations, state } from '@/store/types'

  import NotesEditor from '@/components/NotesEditor'
  import NotesPicker from '@/components/NotesPicker'
  import NotebooksPicker from '@/components/NotebooksPicker'
  import ControlBar from '@/components/ControlBar'

  export default {
    components: {
      NotesEditor,
      NotesPicker,
      NotebooksPicker,
      ControlBar,
    },
    data() {
      return {
        alert: null,
      }
    },
    computed: {
      ...mapState([state.SELECTED_NOTE_ID, state.VERSION, state.NOTEBOOKS]),
      ...mapGetters([
        getters.LOADED,
        getters.SELECTED_NOTE,
        getters.DIRTY,
        getters.CURRENT_CONTENT,
        getters.NOTE_BY_ID,
      ]),
      hasChanges: function () {
        return false
      },
    },
    mounted() {
      window.addEventListener('beforeunload', this.didIntentToLeave)
      this.listNotebooks()
    },
    methods: {
      ...mapActions([actions.LIST_NOTEBOOKS]),
      ...mapMutations([
        mutations.SELECT_NOTE,
        mutations.SET_LOAD_NOTEBOOK,
        mutations.ADD_CHANGE,
      ]),
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
          payload: { ...this.noteById(id), content },
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
