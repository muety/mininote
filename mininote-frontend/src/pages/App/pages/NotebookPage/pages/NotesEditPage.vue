<template>
  <div class="noteseditpage">
    <b-modal id="recentChangesModal" ref="recentChangesModalRef" title="Save changes?" @ok="_handleDirtyNoteSave" @cancel="_handleDirtyNoteDiscard" ok-title="Yes" cancel-title="No">You're have unsaved changes to this note. Do you want to save them?</b-modal>
    <transition name="collapse">
      <div v-if="showEditor" class="col editor-container">
        <button class="btn btn-primary btn-editor" @click="toggleEditor()">◀</button>
        <textarea :value="note.content" @input="onInput"></textarea>
      </div>
    </transition>
    <div class="col editor-container result-container">
      <transition name="fade">
        <button class="btn btn-primary btn-results" @click="toggleEditor()" v-if="!showEditor">▶</button>
      </transition>
      <div v-html="textCompiled"></div>
    </div>
  </div>
</template>

<script>
  import NotesApiService from "../../../../../services/NotesApiService";
  import { md5 } from "../../../../../services/md5";
  import { marked } from "../../../../../services/marked";

  let timeout = null;

  let prevKeyHandler;

  export default {
    name: 'notesEditPage',
    props: ['notebookId', 'password', 'noteId', 'showAlert'],
    data() {
      return {
        note: { content: "", dirty: false },
        showEditor: true,
      }
    },
    computed: {
      textCompiled() { return marked(this.note.content) }
    },
    methods: {
      navigateBack: function () {
        this.$router.go(-1)
      },
      toggleEditor: function() {
        this.showEditor = !this.showEditor;
      },
      onInput: function(e) {
        let vm = this
        clearTimeout(timeout)
        timeout = setTimeout(function() {
          vm.note.content = e.target.value
          vm.note.dirty = true
        }, 500)
      },
      handleSaveEvent: function(event) {
        if (event.keyCode === 83 && (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)) {
          event.preventDefault();
          this.saveNoteData();
        }
        return false;
      },
      saveNoteData: function() {
        let vm = this
        NotesApiService.updateNote(this.notebookId.toLowerCase(), md5(this.password), this.noteId, this.note.content)
          .then(res => {
            if (res && typeof res === "object") {
              vm.notes = res;
              vm.showAlert("Note saved.", "success");
            } else if (res && typeof res === "string" && res === "unauthorized") {
              this.navigateBack();
              vm.showAlert("You are not authorized and cannot modify notes. Password wrong?");
            } else {
              vm.showAlert("An error has occurred. Sorry");
            }
          })
      },
      loadNoteData: function() {
        if (this.notebookId === undefined || !this.password || this.noteId === undefined) {
          // For now -> navigate back.
          // One could also ask the user to enter the password for this notebook
          this.navigateBack()
          return;
        }

        let vm = this

        NotesApiService.getNote(this.notebookId.toLowerCase(), md5(this.password), this.noteId)
          .then(res => {
            if (res && typeof res === "object") {
              vm.note = res;
            } else if (res && typeof res === "string" && res === "unauthorized") {
              this.navigateBack();
              vm.showAlert("You are not authorized to access this note. Password wrong?");
            } else {
              vm.showAlert("An error has occurred. Sorry");
            }
          })
          .catch(() => {
            vm.showAlert("An error has occurred. Sorry.");
          });
      },
      _handleNoteDirty: function(next) {
        if (this.note.dirty) {
          this.next = next
          this.$refs.recentChangesModalRef.show()
          return
        }
        next()
      },
      _handleDirtyNoteSave: function() {
        this.saveNoteData()
        this.next()
        this.next = undefined
      },
      _handleDirtyNoteDiscard: function() {
        this.next()
        this.next = undefined
      },
    },
    created() {
      this.loadNoteData()
      // Global save-handler
      document.addEventListener("keydown", this.handleSaveEvent);
    },
    watch: {
      '$route': 'loadNoteData'
    },
    beforeDestroy() {
      prevKeyHandler = document.removeEventListener("keydown", this.handleSaveEvent);
    },
    beforeRouteLeave(to, from, next) {
      this._handleNoteDirty(next)
    },
    beforeRouteUpdate(to, from, next) {
      this._handleNoteDirty(next)
    },
  }
</script>

<style scoped>
  .noteseditpage {
    width: 100%;
    display: flex;
    flex-direction: row;
    height: 100%;
  }

  textarea {
    border: 0;
    width: 100%;
    height: 100%;
    resize: none;
    outline: none;
  }

  .editor-container {
    margin: 20px;
    padding: 20px;
    border-radius: 0.25rem;
    background-color: #fff;
  }

  .result-container {
    overflow: auto;
  }

  .collapse-enter-active, .collapse-leave-active {
    transition: flex-grow .35s linear;
  }

  .collapse-leave, .collapse-enter-to {
    flex-grow: 1;
  }

  .collapse-enter, .collapse-leave-to {
    flex-grow: 0;
  }

  .fade-enter-active, .fade-enter-leave {
    transition: opacity .35s linear;
  }

  .fade-leave, .fade-enter-to {
    opacity: 1;
  }

  .fade-leave-to, .fade-enter {
    opacity: 0;
  }
</style>
