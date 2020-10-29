<template>
  <div id="app" class="flex flex-col w-full h-full">
    <div id="alert-container" class="absolute flex justify-center w-full">
      <div
        v-if="alert"
        class="w-1/3 px-6 py-3 rounded-md"
        :class="{ 'alert-success': alert.variant === 'success', 'alert-danger': alert.variant === 'danger' }"
      >{{ alert.text }}</div>
    </div>

    <div class="flex flex-col flex-grow">
      <control-bar @alert="showAlert" :hasChanges="hasChanges"></control-bar>
      <div class="flex justify-center mt-48" v-if="!loaded && notebooks.length">
        <div class="w-1/3">
          <div>
            <h3>Your Notebooks</h3>
            <notebooks-picker :notebooks="notebooks" @notebookSelected="onNotebookSelected"></notebooks-picker>
          </div>
        </div>
      </div>
      <div class="flex justify-between flex-grow mt-8 mb-4" v-if="loaded">
        <notes-picker
          @noteSelected="onNoteSelected"
          @alert="showAlert"
          @addNote="addNote"
          @deleteNote="deleteNote"
        ></notes-picker>
        <notes-editor
          v-if="selectedNoteId >= 0"
          class="flex-grow ml-12"
          :content="currentContent"
          :id="selectedNoteId"
          :dirty="dirty"
          @alert="showAlert"
          @contentUpdate="onNoteUpdated"
        ></notes-editor>
      </div>
      <div class="flex justify-center mt-64" v-if="!loaded && !notebooks.length">
        <span class="text-3xl text-center" style="max-width: 400px;">Please create a new notebook.</span>
      </div>
    </div>
    <div class="text-xs text-gray-400 footer">
      Version {{ version }} |
      Made w/ &#x2661; by
      <a href="https://muetsch.io">Ferdinand Mütsch</a> |
      <a href="https://github.com/muety/mininote">GitHub</a>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";

import NotesEditor from "./components/NotesEditor";
import NotesPicker from "./components/NotesPicker";
import NotebooksPicker from "./components/NotebooksPicker";
import ControlBar from "./components/ControlBar";

export default {
  name: "app",
  data() {
    return {
      alert: null
    };
  },
  computed: {
    ...mapState(["selectedNoteId", "version", "notebooks"]),
    ...mapGetters([
      "loaded",
      "selectedNote",
      "dirty",
      "currentContent",
      "noteById"
    ]),
    hasChanges: function() {
      return false;
    }
  },
  components: {
    NotesEditor,
    NotesPicker,
    NotebooksPicker,
    ControlBar,
  },
  created() {
    window.addEventListener("beforeunload", this.didIntentToLeave);
    this.listNotebooks();
  },
  methods: {
    ...mapActions(["listNotebooks"]),
    onNoteSelected: function(noteId) {
      this.$store.commit("selectNote", noteId);
    },
    onNotebookSelected: function(notebookId) {
      this.$store.commit("setLoadNotebook", notebookId);
    },
    addNote: function(note) {
      this.notes.push(note);
    },
    deleteNote: function(note) {
      this.notes.splice(this.notes.indexOf(note), 1);
    },
    discardChanges: function() {
      this.notes = JSON.parse(JSON.stringify(this.notesInitial));
    },
    showAlert: function(text, variant) {
      let vm = this;
      if (!variant) variant = "danger";
      vm.alert = { text, variant };
      setTimeout(function() {
        vm.alert = null;
      }, 3000);
    },
    onNoteUpdated: function({ content, id }) {
      this.$store.commit("addChange", {
        type: "update",
        payload: { ...this.noteById(id), content }
      });
    },
    didIntentToLeave: function(event) {
      if (this.hasChanges) {
        // Cancel the event as stated by the standard.
        event.preventDefault();
        // Chrome requires returnValue to be set.
        event.returnValue = "";
      }
    }
  }
};
</script>

<style>
.alert-success {
  @apply bg-green-600 text-gray-300 border-green-700;
}

.alert-danger {
  @apply bg-red-700 text-gray-300 border-red-800;
}
</style>