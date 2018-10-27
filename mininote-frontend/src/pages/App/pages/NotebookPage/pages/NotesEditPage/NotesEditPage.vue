<template>
  <div class="noteseditpage">
    <b-modal id="recentChangesModal" ref="recentChangesModalRef" title="Save changes?" @ok="_handleDirtyNoteSave" @cancel="_handleDirtyNoteDiscard" ok-title="Yes" cancel-title="No">You're have unsaved changes to this note. Do you want to save them?</b-modal>
    <transition name="collapse">
      <div v-if="showEditor" class="col editor-container">
        <span class="button-container button-container-editor">
          <button class="btn btn-editor btn-save" @click="saveNoteData()" title="Save note">💾</button>
          <button class="btn btn-editor btn-toggle" @click="toggleEditor()" title="Hide edit area">◀</button>
        </span>
        <div class="editor-content">
          <textarea :value="note.content" @input="onInput"></textarea>
        </div>
      </div>
    </transition>
    <div class="col result-container">
      <transition name="fade">
        <span class="button-container button-container-results" v-if="!showEditor">
          <button class="btn btn-editor btn-save" @click="saveNoteData()" title="Save note">💾</button>
          <button class="btn btn-editor btn-toggle" @click="toggleEditor()" title="Show edit area">▶</button>
        </span>
      </transition>
      <div class="result-content">
        <div v-html="textCompiled"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import NotesApiService from "../../../../services/NotesApiService";
  import { md5 } from "../../../../services/md5";
  import { marked } from "../../../../services/marked";

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

  .button-container {
    align-self: flex-start;
  }

  .btn-editor {
    background-color: white;
  }

  .btn-editor:active, .btn-editor:focus {
    box-shadow: none;
  }

  .editor-content, textarea {
    border: 0;
    width: 100%;
    height: 100%;
    resize: none;
    outline: none;
  }

  .editor-container, .result-container {
    display: flex;
    flex-direction: column;
    margin: 0 20px;
    padding: 8px;
    border-radius: 0.25rem;
    background-color: #fff;
    max-height: 85vh;
  }

  .editor-content {
    margin: 12px 0;
    padding: 0 12px;
  }

  .result-container .result-content {
    overflow-y: auto;
    margin: 12px 12px;
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
