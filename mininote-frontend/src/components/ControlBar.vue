<template>
  <div>
    <b-modal id="discardModal" ref="discardModalRef" title="Save changes?" @ok="discardChanges">You're about to discard all recent changes to your notebook. Are you sure you want to proceed?</b-modal>
    <b-modal id="settingsModal" ref="settingsModalRef" size="lg" title="Settings" @ok="updateSettings" ok-title="Save">
      <b-container fluid>
        <b-row>
          <b-col sm="3"><label for="newPasswordInput">Password:</label></b-col>
          <!-- TODO: Change to password input type as soon as https://github.com/bootstrap-vue/bootstrap-vue/issues/1908 is resolved -->
          <b-col><b-form-input id="newPasswordInput" type="text" placeholder="Enter new password for this notebook." v-model="settings.password"/></b-col>
        </b-row>
      </b-container>
    </b-modal>
    <div class="container-fluid">
      <div class="row">
        <div class="col-4"></div>
        <div class="col-4">
          <div class="input-group" id="notebook-chooser">
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
          <button class="btn btn-primary float-right" v-if="state.loaded" v-b-modal.settingsModal>&#x2699;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NotesApiService from "./../services/NotesApiService";
import { md5 } from "./../services/md5";

export default {
  name: "control-bar",
  props: ["hasChanges", "notes", "notesInitial"],
  data() {
    return {
      notebookInput: "",
      passwordInput: "",
      state: {
        opening: false,
        creating: false,
        loaded: false
      },
      settings: {
        password: ""
      }
    };
  },
  computed: {
    notebookLoaded: function() {
      return false;
    }
  },
  methods: {
    tryReset: function() {
      if (!this.hasChanges) this.reset();
      else this.$refs.discardModalRef.show();
    },
    reset: function() {
      this.notebookInput = "";
      this.passwordInput = "";
      this.state = {
        opening: false,
        creating: false,
        loaded: false
      };
      this.$emit("notesLoaded", null);
      setTimeout(() => this.$refs.refNotebookInput.focus(), 0);
    },
    discardChanges: function() {
      this.$emit("discardChanges", this.notes);
    },
    checkNotebookState: function() {
      let vm = this;
      if (!this.notebookInput) return;
      NotesApiService.exists(this.notebookInput.toLowerCase())
        .then(exists => {
          if (exists) {
            vm.state.opening = true;
            setTimeout(() => vm.$refs.refOpenPasswordInput.focus(), 0);
          } else {
            vm.state.creating = true;
            setTimeout(() => vm.$refs.refCreatePasswordInput.focus(), 0);
          }
        })
        .catch(() => {
          vm.reset();
          vm.$emit("alert", "An error has occured. Sorry.");
        });
    },
    openNotebook: function() {
      let vm = this;
      if (!this.notebookInput || !this.passwordInput) return;
      NotesApiService.getNotes(
        this.notebookInput.toLowerCase(),
        md5(this.passwordInput)
      )
        .then(res => {
          if (res && typeof res === "object") {
            vm.state.opening = false;
            vm.state.loaded = true;
            vm.$emit("notesLoaded", res);
          } else if (res && typeof res === "string" && res === "unauthorized") {
            vm.$emit(
              "alert",
              "You are not authorized to access this note. Password wrong?"
            );
          } else {
            vm.reset();
            vm.$emit("alert", "An error has occured. Sorry.");
          }
        })
        .catch(() => {
          vm.reset();
          vm.$emit("alert", "An error has occured. Sorry.");
        });
    },
    createNotebook: function() {
      let vm = this;
      if (!this.notebookInput || !this.passwordInput) return;
      NotesApiService.create(
        this.notebookInput.toLowerCase(),
        md5(this.passwordInput)
      )
        .then(res => {
          if (res) {
            vm.state.creating = false;
            vm.state.loaded = true;
            vm.$emit("notesLoaded", res.notes);
          } else {
            vm.reset();
            vm.$emit("alert", "An error has occured. Sorry.");
          }
        })
        .catch(() => {
          vm.reset();
          vm.$emit("alert", "An error has occured. Sorry.");
        });
    },
    updateNotebook: function() {
      let vm = this;

      let promises = []

      promises = promises.concat(this.notes
        .filter(n => n.hasOwnProperty('isNew'))
        .map(n => NotesApiService.addNote(this.notebookInput.toLowerCase(), md5(this.passwordInput), n)))

      promises = promises.concat(this.notes
        .filter(n => !n.hasOwnProperty('isNew'))
        .filter(n1 => this.notesInitial.find(n2 => n1.id === n2.id).content !== n1.content)
        .map(n => NotesApiService.updateNote(this.notebookInput.toLowerCase(), md5(this.passwordInput), n)))

      promises = promises.concat(this.notesInitial
        .filter(n1 => !this.notes.some(n2 => n1.id === n2.id))
        .map(n => NotesApiService.deleteNote(this.notebookInput.toLowerCase(), md5(this.passwordInput), n)))

      Promise.all(promises)
        .then(this.onNotebookSave)
        .catch(() => {
          vm.$emit("alert", "An error has occured. Sorry.");
        });
    },
    updateSettings: function() {
      let vm = this;
      let settings = JSON.parse(JSON.stringify(this.settings));
      settings.password = md5(settings.password);
      NotesApiService.updateSettings(
        this.notebookInput.toLowerCase(),
        md5(this.passwordInput),
        settings
      )
        .then(this.onNotebookSave)
        .catch(() => vm.$emit("alert", "An error has occured. Sorry."));
    },
    onNotebookSave: function(res) {
      let vm = this;

      if (!res || !Array.isArray(res) || res.some(r => r === null)) return vm.$emit("alert", "An error has occured. Sorry.");
      if (res.some(r => r === 'unauthorized')) return vm.$emit("alert", "You are not authorized to access this note. Wrong password?");
      if (res.some(r => r === 'not found')) return vm.$emit("alert", "Could not find requested resource.");

      let newNotes = this.notes.filter(n => n.hasOwnProperty('isNew'))
      let createdNotes = res.filter(r => r.hasOwnProperty('id'))

      for (let i in newNotes) {
        newNotes[i].id = createdNotes[i].id
        delete newNotes[i].isNew
      }

      vm.$emit("alert", "Notebook saved successfully.", "success");
      vm.$emit("notesLoaded", JSON.parse(JSON.stringify(this.notes)));
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.action-buttons-container button {
  margin-left: 5px;
}

#notebook-chooser input {
  border: 0;
}

</style>
