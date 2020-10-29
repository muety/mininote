<template>
  <div class="picker-container">

    <core-modal v-if="showRenameModal" @ok="updateNote" @discard="showRenameModal = false;">
      <template v-slot:header>Rename Note</template>
      <template v-slot:main>
        <div class="flex flex-col">
          <div class="flex">
            <div class="w-1/4">
              <label for="newNameInput">Name:</label>
            </div>
            <div class="w-3/4">
              <input id="newNameInput" type="text" placeholder="Enter new name for this note." v-model="inputs.newName" class="w-full bg-gray-100 focus:shadow-outline" style="border: 1px solid #CBD5E0;" />
            </div>
          </div>
        </div>
      </template>
      <template v-slot:ok-btn>Save</template>
    </core-modal>

    <div class="flex mb-8">
      <span
        class="flex items-center px-4 bg-gray-300 border-r border-gray-400 rounded-l-md"
      >&#x1F50D;</span>
      <input
        type="text"
        class="placeholder-gray-700 rounded-l-none"
        placeholder="Search ..."
        v-model="query"
      />
    </div>

    <ul>
      <li
        v-for="n in filteredNotes"
        :key="n.id"
        class="flex items-center justify-between px-4 py-2 bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md"
        :class="{ 'note-active': selectedNoteId == n.id }"
        @click="selectNote(n.id)"
      >
        {{ n.title }}
        <div class="flex flex-row-reverse">
          <span class="ml-1 delete-btn" @click.stop="deleteNote(n)">🗑</span>
          <span class="mr-1 rename-btn" @click="showRenameModal = true;">✏️</span>
        </div>
      </li>
    </ul>
    <div class="flex mt-8">
      <input
        type="text"
        class="placeholder-gray-700 rounded-r-none"
        placeholder="Add note ..."
        v-model="newNoteInput"
        @keyup.enter="addNote"
      />
      <button
        type="button"
        class="px-4 rounded-l-none btn-primary"
        :disabled="!newNoteInput"
        @click="addNote"
      >&#x2b;</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";
import CoreModal from "./core/CoreModal";

export default {
  name: "notes-picker",
  data() {
    return {
      query: "",
      newNoteInput: "",
      inputs: {
        newName: ""
      },
      showRenameModal: false,
    };
  },
  components: {
    CoreModal,
  },
  computed: {
    ...mapState({
      notebook: state => state.notebook,
      selectedNoteId: state => state.selectedNoteId
    }),
    ...mapGetters(["notes", "currentTitle", "selectedNote"]),
    filteredNotes: function() {
      let filtered =
        this.query === ""
          ? [...this.notes]
          : this.notes.filter(n => {
              let pattern = new RegExp(this.query, "gi");
              return pattern.test(n.title);
            });
      return filtered.sort((el1, el2) =>
        el1.title < el2.title ? -1 : el1.title > el2.title ? 1 : 0
      );
    }
  },
  methods: {
    ...mapMutations(["selectNote"]),
    handleError: function(err) {
      this.$emit("alert", err.message);
      this.reset();
    },
    reset: function() {
      this.newNoteInput = "";
    },
    addNote: function() {
      if (!this.newNoteInput) return;

      let note = {
        id: this.notes.reduce((acc, n) => Math.max(acc, n.id), 0) + 1024 + 1,
        title: this.newNoteInput,
        content: ""
      };

      this.$store.commit("addChange", { type: "add", payload: note });
      this.$store.commit("selectNote", note.id);
      this.newNoteInput = "";
    },
    updateNote: function() {
      this.$store
        .dispatch("updateNote", {
          ...this.selectedNote,
          title: this.inputs.newName
        })
        .then(() => {
          this.$emit("alert", "Note saved.", "success")
          this.showRenameModal = false;
        })
        .catch(this.handleError);
    },
    deleteNote: function(note) {
      this.$store.commit("addChange", { type: "delete", payload: note });
      if (this.selectedNoteId === note.id) {
        this.$store.commit("selectFirst");
      }
    }
  },
  created() {
    this.$store.commit("selectFirst");
  },
  watch: {
    selectedNoteId: function() {
      this.inputs.newName = this.currentTitle;
    }
  }
};
</script>

<style scoped>
.note-active {
  @apply bg-green-600 text-gray-100;
}
</style>
