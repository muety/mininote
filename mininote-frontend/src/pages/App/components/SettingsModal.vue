<template>
  <b-modal
      id="settingsModal"
      ref="settingsModalRef"
      size="lg"
      title="Settings"
      @ok="updateSettings"
      ok-title="Save">
    <div class="d-block">
      <label for="newPasswordInput">Password:</label>
      <!-- TODO: Change to password input type as soon as https://github.com/bootstrap-vue/bootstrap-vue/issues/1908 is resolved -->
      <b-form-input
          v-model="newPasswordInput"
          type="text"
          placeholder="Enter new password for this notebook."></b-form-input>
    </div>
  </b-modal>
</template>

<script>
  import NotesApiService from "../../../services/NotesApiService";
  import { md5 } from "../../../services/md5";

  export default {
    name: 'settingsmodal',
    props: [ "showAlert", "visible" ],
    data() {
      return {
        newPasswordInput: "",
      }
    },
    methods: {
      hideModal() {
        this.newPasswordInput = ''
        this.$refs.settingsModal.hide()
      },
      updateSettings: function () {
        let vm = this;
        let password = md5(this.newPasswordInput);
        NotesApiService.updateSettings(
          this.$route.params.notebookId,
          md5(this.$route.params.password),
          { password }
        )
          .then(() => {
            this.onNotebookSave()
            this.newPasswordInput = ""
          })
          .catch(() => vm.showAlert("An error has occured. Sorry."));
      },
      onNotebookSave: function(res) {
        let vm = this;
        if (res && typeof res === "object") {
          vm.showAlert("Notebook saved successfully.", "success");
          vm.$emit("notesLoaded", res);
        } else if (res && typeof res === "string" && res === "unauthorized") {
          vm.showAlert("You are not authorized to access this note. Wrong password?");
        } else vm.showAlert("An error has occured. Sorry.");
      },
    }
  };
</script>

<style>
</style>
