<template>
  <div>
    <b-button @click="showModal">
      Add notebook
    </b-button>
    <b-modal
        ref="newNotebookDialogRef"
        ok-title="Create"
        @hide="hideModal"
        @ok="createNewNotebook"
        title="Add notebook">
      <div class="d-block">
        <label for="notebookName">Notebook name:</label>
        <b-form-input
            v-model="notebookName"
            type="text"
            placeholder="Enter the name of the notebook"></b-form-input>
        <label for="notebookPassword">Password:</label>
        <!-- TODO: Change to password input type as soon as https://github.com/bootstrap-vue/bootstrap-vue/issues/1908 is resolved -->
        <b-form-input
            v-model="notebookPassword"
            type="text"
            placeholder="Enter the password for the notebook"></b-form-input>
      </div>
    </b-modal>
  </div>
</template>

<script>
  import NotesApiService from "../../../../../services/NotesApiService";
  import { md5 } from "../../../../../services/md5";

  export default {
    props: ['refreshNotebooks'],
    data() {
      return {
        notebookName: '',
        notebookPassword: '',
      }
    },
    methods: {
      createNewNotebook() {
        if (!this.notebookName || !this.notebookPassword) return;
        NotesApiService.create(this.notebookName, md5(this.notebookPassword))
        this.refreshNotebooks()
      },
      showModal() {
        this.$refs.newNotebookDialogRef.show()
      },
      hideModal() {
        this.notebookName = ''
        this.notebookPassword = ''
      }
    },
  }
</script>

<style>
</style>
