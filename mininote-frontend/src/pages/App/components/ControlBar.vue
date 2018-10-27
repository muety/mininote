<template>
  <div class="input-group">
    <div class="input-group-btn">
      <button type="button" class="btn btn-danger" @click="closeNotebook" :disabled="!state.opened">&#x2573;</button>
    </div>
    <input type="text" class="form-control" disabled :value="$route.params.notebookId" v-if="state.opened" />
    <input type="text" class="form-control" placeholder="Enter name to open notebook" v-model="notebookNameInput" ref="refNotebookInput" @keyup.enter="checkNotebookState" autofocus v-if="!state.opening && !state.opened" />
    <input type="password" class="form-control" :placeholder="passwordInputPlaceholder" v-model="notebookPasswordInput" ref="refOpenPasswordInput" @keyup.enter="openNotebook" v-if="state.opening" />
    <button type="button" class="btn btn-primary" :disabled="!notebookPasswordInput" @click="openNotebook" v-if="!state.opened">Open</button>
    <div class="input-group-btn action-buttons-container">
      <button @click="$root.$emit('bv::show::modal', 'settingsModal')" v-if="state.opened" class="btn btn-primary float-right">&#x2699;</button>
      <SettingsModal id="settingsModal" :showAlert="showAlert" />
    </div>
  </div>
</template>

<script>
  import SettingsModal from "./SettingsModal";
  import NotesApiService from "../services/NotesApiService";

  export default {
    name: 'control-bar',
    props: ['showAlert'],
    components: {
      SettingsModal,
    },
    data() {
      return {
        state: {
          opened: false,
          opening: false,
          loaded: false,
        },
        modal: {
          settings: false,
        },
        notebookNameInput: "",
        notebookPasswordInput: "",
      };
    },
    computed: {
      passwordInputPlaceholder: function() {
        return `Enter password for notebook ${this.notebookNameInput}`
      }
    },
    methods: {
      checkNotebookState: function() {
        let vm = this;
        if (!this.notebookNameInput) return;
        NotesApiService.exists(this.notebookNameInput.toLowerCase())
          .then(exists => {
            if (exists) {
              vm.state.opening = true;
              setTimeout(() => vm.$refs.refOpenPasswordInput.focus(), 0);
            } else {
              vm.showAlert(`The notebook '${this.notebookNameInput}' does not exist.`);
            }
          })
          .catch(() => {
            vm.reset();
            vm.showAlert("An error has occurred. Sorry.")
          });
      },
      openNotebook: function() {
        if (!this.notebookNameInput || !this.notebookPasswordInput) return;
        this.$router.push({ name: 'notebookpage', params: { notebookId: this.notebookNameInput, password: this.notebookPasswordInput, showAlert: this.showAlert } })
        this.reset()
        this.state.opened = true
      },
      reset: function() {
        this.notebookNameInput = ""
        this.notebookPasswordInput = ""
        this.state = {
          opening: false,
          loaded: false,
        }
        this.modal.settings = false
      },
      closeNotebook: function () {
        if (this.state.opened) {
          this.$router.push('/')
        }
        this.reset()
      },
    },
  }
</script>

<style scoped>
  input {
    border: 0;
  }
</style>
