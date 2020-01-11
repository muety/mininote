<template>
  <div>
    <b-modal id="discardModal" ref="discardModalRef" title="Save changes?" @ok="reset">You're about to discard all recent changes to your notebook. Are you sure you want to proceed?</b-modal>
    <b-modal id="settingsModal" ref="settingsModalRef" size="lg" title="Notebook Settings" @ok="updateNotebook" ok-title="Save">
      <b-container fluid>
        <b-row>
          <b-col sm="3">
            <label for="newNameInput">Name:</label>
          </b-col>
          <b-col>
            <b-form-input id="newNameInput" type="text" placeholder="Enter new name for this notebook." v-model="inputs.newName" />
          </b-col>
        </b-row>
        <b-row style="margin-top: 15px">
          <b-col sm="3">
            <label for="newPasswordInput">Password:</label>
          </b-col>
          <b-col>
            <b-form-input id="newPasswordInput" type="password" placeholder="Enter new password for this notebook." v-model="inputs.newPassword" />
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
    <div class="container-fluid">
      <div class="row">
        <div class="col-4"></div>
        <div class="col-4">
          <div class="input-group" id="notebook-chooser">
            <div class="input-group-btn">
              <button type="button" class="btn btn-danger" @click="close" :disabled="dirty">&#x2573;</button>
            </div>
            <input type="text" class="form-control" placeholder="Open or create notebook ..." ref="refNotebookInput" v-model="inputs.name" v-if="!state.opening && !state.creating" :disabled="state.loaded" @keyup.enter="tryNotebook" autofocus />
            <input type="password" class="form-control" placeholder="Choose a password for the new notebook..." ref="refCreatePasswordInput" v-model="inputs.password" v-if="state.creating" @keyup.enter="createNotebook" />
            <input type="password" class="form-control" placeholder="Enter password ..." ref="refOpenPasswordInput" v-model="inputs.password" v-if="state.opening" @keyup.enter="openNotebook" />
            <div class="input-group-btn">
              <button type="button" class="btn btn-primary" :disabled="!inputs.name || state.loaded" @click="tryNotebook" v-if="!state.opening && !state.creating">Open</button>
              <button type="button" class="btn btn-primary" :disabled="!inputs.password" @click="openNotebook" v-if="state.opening">Open</button>
              <button type="button" class="btn btn-primary" :disabled="!inputs.password" @click="createNotebook" v-if="state.creating">Create</button>
            </div>
          </div>
        </div>
        <div class="col-2"></div>
        <div class="col-2 action-buttons-container">
          <button class="btn btn-primary float-right" @click="saveNotes" v-if="dirty">&#x1f4be;</button>
          <button class="btn btn-primary float-right" @click="tryReset" v-if="dirty">&#x21ba;</button>
          <button class="btn btn-primary float-right" v-if="state.loaded" v-b-modal.settingsModal>&#x2699;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../api";
import { md5 } from "../lib/md5";
import { mapState, mapGetters } from "vuex";
import { ApiError, UnauthorizedError, NotFoundError } from "../lib/errors";

export default {
  name: "control-bar",
  data() {
    return {
      inputs: {
        name: '',
        password: '',
        newName: '',
        newPassword: ''
      },
      state: {
        opening: false,
        creating: false,
        loaded: false
      }
    };
  },
  computed: {
    ...mapState({
      notebook: state => state.notebook
    }),
    ...mapGetters(["dirty"])
  },
  methods: {
    handleError: function(err) {
      if (err instanceof UnauthorizedError) this.$emit('alert', 'You are not authorized to access this note. Password wrong?')
      else if (err instanceof NotFoundError) this.$emit('alert', 'Resource not found')
      else this.$emit('alert', 'An error has occured. Sorry.')
      this.reset();
    },
    tryReset: function() {
      if (!this.dirty) this.reset();
      else this.$refs.discardModalRef.show();
    },
    reset: function() {
      this.$store.commit('revertChanges');
    },
    close: function() {
      this.inputs = {
        name: '',
        password: '',
        newName: '',
        newPassword: ''
      };
      this.state = {
        opening: false,
        creating: false,
        loaded: false
      };
      this.$store.commit('reset');
      setTimeout(() => this.$refs.refNotebookInput.focus(), 0);
    },
    tryNotebook: function() {
      let vm = this;
      if (!this.inputs.name) return;

      api
        .exists(this.inputs.name.toLowerCase())
        .then(exists => {
          if (exists) {
            vm.state.opening = true;
            setTimeout(() => vm.$refs.refOpenPasswordInput.focus(), 0);
          } else {
            vm.state.creating = true;
            setTimeout(() => vm.$refs.refCreatePasswordInput.focus(), 0);
          }
        })
        .catch(() => vm.handleError(null));
    },
    openNotebook: function() {
      let vm = this;
      if (!this.inputs.name || !this.inputs.password) return;

      this.$store
        .dispatch('loadNotebook', {
          id: this.inputs.name.toLowerCase(),
          password: md5(this.inputs.password)
        })
        .then(res => {
          vm.state.opening = false;
          vm.state.loaded = true;
          vm.$store.commit('selectFirst');

          this.inputs.newName = this.inputs.name;
          this.inputs.newPassword = this.inputs.password;
        })
        .catch(vm.handleError);
    },
    createNotebook: function() {
      let vm = this;
      if (!this.inputs.name || !this.inputs.password) return;

      this.$store
        .dispatch('createNotebook', {
          id: this.inputs.name.toLowerCase(),
          password: md5(this.inputs.password)
        })
        .then(res => {
          vm.state.creating = false;
          vm.state.loaded = true;
        })
        .catch(vm.handleError);
    },
    saveNotes: function() {
      let vm = this;
      if (!this.inputs.name || !this.inputs.password) return;

      this.$store.dispatch('applyChanges').catch(vm.handleError);
    },
    updateNotebook: function() {
      let vm = this
      if (!this.inputs.name || !this.inputs.password) return;

      this.$store.dispatch('updateNotebook', { id: this.inputs.newName.toLowerCase(), password: md5(this.inputs.newPassword) })
        .then(() => {
          this.inputs.name = this.inputs.newName,
          this.inputs.password = this.inputs.newPassword
        })
        .catch(vm.handleError)
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
