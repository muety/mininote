<template>
  <div>
    <core-modal v-if="showDiscardModal" @ok="reset" @discard="showDiscardModal = false;">
      <template v-slot:header>Save changes?</template>
      <template v-slot:main>
        <span>You're about to discard all recent changes to your notebook. Are you sure you want to proceed?</span>
      </template>
    </core-modal>

    <core-modal v-if="showSettingsModal" @ok="updateNotebook" @discard="showSettingsModal = false;">
      <template v-slot:header>Notebook Settings</template>
      <template v-slot:main>
        <div class="flex flex-col space-y-4">
          <div class="flex">
            <div class="w-1/4">
              <label for="newNameInput">Name:</label>
            </div>
            <div class="w-3/4">
              <input id="newNameInput" type="text" placeholder="Enter new name for this notebook." v-model="inputs.newName" class="w-full bg-gray-100 focus:shadow-outline" style="border: 1px solid #CBD5E0;" />
            </div>
          </div>
          <div class="flex">
            <div class="w-1/4">
              <label for="newPasswordInput">Password:</label>
            </div>
            <div class="w-3/4">
               <input id="newPasswordInput" type="password" placeholder="Enter new password for this notebook." v-model="inputs.newPassword" class="w-full bg-gray-100 focus:shadow-outline" style="border: 1px solid #CBD5E0;" />
            </div>
          </div>
        </div>
      </template>
      <template v-slot:ok-btn>Save</template>
    </core-modal>

    <div class="flex justify-between">
      <div class="w-1/4 text-2xl text-gray-400">
        <span>✎ Mini_Note</span>
        <span class="ml-1 text-xs text-green-600">BETA</span>
      </div>
      <div class="flex justify-center w-1/2" id="notebook-chooser">
        <button
          type="button"
          class="px-4 rounded-r-none btn-danger hover:bg-red-800"
          @click="close"
          :disabled="dirty"
        >&#x2573;</button>
        <input
          type="text"
          class="placeholder-gray-700 rounded-l-none rounded-r-none"
          placeholder="Open or create notebook ..."
          ref="refNotebookInput"
          v-model="inputs.name"
          v-if="!state.opening && !state.creating"
          :disabled="state.loaded"
          @keyup.enter="tryNotebook"
          autofocus
        />
        <input
          type="password"
          class="placeholder-gray-700 rounded-l-none rounded-r-none"
          placeholder="Choose a password for the new notebook..."
          ref="refCreatePasswordInput"
          v-model="inputs.password"
          v-if="state.creating"
          @keyup.enter="createNotebook"
        />
        <input
          type="password"
          class="placeholder-gray-700 rounded-l-none rounded-r-none"
          placeholder="Enter password ..."
          ref="refOpenPasswordInput"
          v-model="inputs.password"
          v-if="state.opening"
          @keyup.enter="openNotebook"
        />
        <button
          type="button"
          class="rounded-l-none btn-primary hover:bg-green-700"
          :disabled="!inputs.name || state.loaded"
          @click="tryNotebook"
          v-if="!state.opening && !state.creating"
        >Open</button>
        <button
          type="button"
          class="rounded-l-none btn-primary hover:bg-green-700"
          :disabled="!inputs.password"
          @click="openNotebook"
          v-if="state.opening"
        >Open</button>
        <button
          type="button"
          class="rounded-l-none btn-primary hover:bg-green-700"
          :disabled="!inputs.password"
          @click="createNotebook"
          v-if="state.creating"
        >Create</button>
      </div>
      <div class="flex justify-end w-1/4 space-x-1">
        <button
          class="px-4 btn-primary hover:bg-green-700"
          @click="saveNotes"
          v-if="dirty"
        >&#x1f4be;</button>
        <button class="px-4 btn-primary hover:bg-green-700" @click="tryReset" v-if="dirty">&#x21ba;</button>
        <button
          class="px-4 btn-primary hover:bg-green-700"
          v-if="state.loaded"
          @click="showSettingsModal = true"
        >&#x2699;</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../api";
import { md5 } from "../lib/md5";
import { mapState, mapGetters, mapActions } from "vuex";
import CoreModal from "./core/CoreModal";

export default {
  name: "control-bar",
  components: {
    CoreModal
  },
  data() {
    return {
      inputs: {
        name: "",
        password: "",
        newName: "",
        newPassword: ""
      },
      state: {
        opening: false,
        creating: false,
        loaded: false
      },
      showDiscardModal: false,
      showSettingsModal: false
    };
  },
  computed: {
    ...mapState({
      notebook: state => state.notebook,
      loadNotebookId: state => state.loadNotebookId
    }),
    ...mapGetters(["dirty"])
  },
  methods: {
    ...mapActions(["listNotebooks"]),
    handleError: function(err) {
      this.$emit("alert", err.message);
      this.reset();
    },
    tryReset: function() {
      if (!this.dirty) this.reset();
      else this.showDiscardModal = true;
    },
    reset: function() {
      this.$store.commit("revertChanges");
      this.showDiscardModal = false;
    },
    close: function() {
      this.inputs = {
        name: "",
        password: "",
        newName: "",
        newPassword: ""
      };
      this.state = {
        opening: false,
        creating: false,
        loaded: false
      };
      this.$store.commit("reset");
      this.listNotebooks();
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
        .dispatch("loadNotebook", {
          id: this.inputs.name.toLowerCase(),
          password: md5(this.inputs.password)
        })
        .then(() => {
          vm.state.opening = false;
          vm.state.loaded = true;
          vm.$store.commit("selectFirst");

          this.inputs.newName = this.inputs.name;
          this.inputs.newPassword = this.inputs.password;
        })
        .catch(vm.handleError);
    },
    createNotebook: function() {
      let vm = this;
      if (!this.inputs.name || !this.inputs.password) return;

      this.$store
        .dispatch("createNotebook", {
          id: this.inputs.name.toLowerCase(),
          password: md5(this.inputs.password)
        })
        .then(() => {
          vm.state.creating = false;
          vm.state.loaded = true;
        })
        .catch(vm.handleError);
    },
    saveNotes: function() {
      let vm = this;
      if (!this.inputs.name || !this.inputs.password) return;

      this.$store
        .dispatch("applyChanges")
        .then(() => this.$emit("alert", "Saved changes.", "success"))
        .catch(vm.handleError);
    },
    updateNotebook: function() {
      let vm = this;
      if (!this.inputs.name || !this.inputs.password) return;

      this.$store
        .dispatch("updateNotebook", {
          id: this.inputs.newName.toLowerCase(),
          password: md5(this.inputs.newPassword)
        })
        .then(() => {
          (this.inputs.name = this.inputs.newName),
            (this.inputs.password = this.inputs.newPassword);
          this.$emit("alert", "Notebook updated.", "success");
          this.showSettingsModal = false;
        })
        .catch(vm.handleError);
    }
  },
  watch: {
    loadNotebookId: function(newId, oldId) {
      if (newId !== "" && newId !== oldId) {
        this.inputs.name = newId;
      }
    }
  }
};
</script>

<style scoped>
</style>
