<template>
  <div class="notebookPage">
    <NotesList v-bind:showAlert="showAlert" v-bind:notes="notes" v-bind:onCreateNote="handleCreateNote" v-bind:onSelectNote="handleSelectNote" v-bind:onDeleteNote="handleDeleteNote"></NotesList>
    <router-view v-if="!!$route.params.noteId" v-bind:showAlert="showAlert"></router-view>
    <div v-else class="placeholder"></div>
  </div>
</template>

<script>
  import NotesList from './components/NotesList';
  import NotesApiService from "../../services/NotesApiService";
  import { md5 } from "../../services/md5";

  export default {
    name: "notebook-page",
    props: ["showAlert", "password", "notebookId"],
    data() {
      return {
        notes: [],
      }
    },
    components: {
      NotesList
    },
    methods: {
      navigateBack: function() {
        this.$router.push('/')
      },
      loadNotes: function() {
        let vm = this
        NotesApiService.getNotes(this.notebookId.toLowerCase(), md5(this.password))
          .then(res => {
            if (res && typeof res === "object") {
              vm.notes = res;
            } else if (res && typeof res === "string" && res === "unauthorized") {
              vm.navigateBack();
              vm.showAlert("You are not authorized to access this notebook. Password wrong?");
            } else {
              vm.showAlert("An error has occurred. Sorry");
            }
          })
          .catch(() => {
            vm.showAlert("An error has occurred. Sorry.");
          });
      },
      handleCreateNote: function(note) {
        let vm = this;
        NotesApiService.addNote(this.notebookId.toLowerCase(), md5(this.password), note)
          .then(res => {
            if (res && typeof res === "object") {
              vm.notes = res.notes;
              this.$router.push({ name: 'noteseditpage', params: { noteId: res.createdId.toString(), notebookId: this.notebookId, password: this.password, showAlert: this.showAlert } })
            } else if (res && typeof res === "string" && res === "unauthorized") {
              vm.navigateBack();
              vm.showAlert("You are not authorized and cannot create new notes. Password wrong?");
            } else {
              vm.showAlert("An error has occurred. Sorry");
            }
          })
          .catch(() => {
            vm.showAlert("An error has occurred. Sorry.");
          });
      },
      handleSelectNote: function (note) {
        if (this.notebookId === undefined || !this.password || note === undefined) return;
        // We have to convert note to string, because otherwise vue-router will not route to the integer '0'
        this.$router.push({ name: 'noteseditpage', params: { noteId: note.toString(), notebookId: this.notebookId, password: this.password, showAlert: this.showAlert } })
      },
      handleDeleteNote: function (note) {
        if (this.notebookId === undefined || !this.password || note === undefined) return;
        let vm = this;
        NotesApiService.deleteNote(this.notebookId, md5(this.password), note)
          .then(res => {
            if (res && typeof res === "string" && res === "unauthorized") {
              vm.showAlert("You are not authorized and cannot delete notes. Password wrong?");
            } else if (vm.$route.params.noteId == note) {
              vm.$router.push({ name: 'notebookpage', params: { notebookId: vm.notebookId, password: vm.password, showAlert: vm.showAlert } })
            }
            vm.loadNotes()
          })
          .catch(() => {
            vm.showAlert("An error has occurred. Sorry.");
          });
      }
    },
    created() {
      if (!this.notebookId || !this.password) {
        // For now -> navigate back.
        // One could also ask the user to enter the password for this notebook
        this.navigateBack()
        return;
      }
      this.loadNotes()
    },
  }
</script>

<style>
  .notebookPage {
    display: flex;
    flex-direction: row;
    flex: 1;
  }
</style>
