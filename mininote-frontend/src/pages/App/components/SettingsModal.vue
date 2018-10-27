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
  import NotesApiService from "../services/NotesApiService";
  import { md5 } from "../services/md5";

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
          .then((res) => {
            this.onNotebookSave(res)
            this.newPasswordInput = ""
          })
          .catch(() => vm.showAlert("An error has occured. Sorry."));
      },
      onNotebookSave: function(res) {
        if (res && typeof res === "object") {
          this.showAlert("Notebook saved successfully.", "success");
          // Set the new password -> Navigate to the overview page with new password set
          this.$router.push({ name: 'notebookpage', params: { notebookId: this.$route.params.notebookId, password: this.newPasswordInput, showAlert: this.showAlert } })
        } else if (res && typeof res === "string" && res === "unauthorized") {
          this.showAlert("You are not authorized to access this note. Wrong password?");
        } else this.showAlert("An error has occured. Sorry.");
      },
    }
  };
</script>

<style>
</style>
