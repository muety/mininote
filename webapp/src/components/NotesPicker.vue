<template>
  <div class="picker-container">
    <core-modal
      v-if="showRenameModal"
      @ok="_updateNote"
      @discard="showRenameModal = false"
    >
      <template #header>Rename Note</template>
      <template #main>
        <div class="flex flex-col">
          <div class="flex">
            <div class="w-1/4">
              <label for="newNameInput">Name:</label>
            </div>
            <div class="w-3/4">
              <input
                id="newNameInput"
                v-model="inputs.newName"
                type="text"
                placeholder="Enter new name for this note."
                class="w-full bg-gray-100 focus:shadow-outline"
                style="border: 1px solid #cbd5e0"
              />
            </div>
          </div>
        </div>
      </template>
      <template #ok-btn>Save</template>
    </core-modal>

    <div class="flex mb-8">
      <span
        class="flex items-center px-4 bg-gray-300 border-r border-gray-400 rounded-l-md"
        >&#x1F50D;</span
      >
      <input
        v-model="query"
        type="text"
        class="placeholder-gray-700 rounded-l-none"
        placeholder="Search ..."
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
          <span class="ml-1 delete-btn" @click.stop="_deleteNote(n)">🗑</span>
          <span class="mr-1 rename-btn" @click="showRenameModal = true"
            >✏️</span
          >
        </div>
      </li>
    </ul>
    <div class="flex mt-8">
      <input
        v-model="newNoteInput"
        type="text"
        class="placeholder-gray-700 rounded-r-none"
        placeholder="Add note ..."
        @keyup.enter="_addNote"
      />
      <button
        type="button"
        class="px-4 rounded-l-none btn-primary"
        :disabled="!newNoteInput"
        @click="_addNote"
      >
        &#x2b;
      </button>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
  import { actions, getters, mutations } from '@/store/types'

  import CoreModal from '@/components/core/CoreModal'

  export default {
    components: {
      CoreModal,
    },
    emits: ['alert', 'notebook-selected'],
    data() {
      return {
        query: '',
        newNoteInput: '',
        inputs: {
          newName: '',
        },
        showRenameModal: false,
      }
    },
    computed: {
      ...mapState({
        notebook: (state) => state.notebook,
        selectedNoteId: (state) => state.selectedNoteId,
      }),
      ...mapGetters([
        getters.NOTES,
        getters.CURRENT_TITLE,
        getters.SELECTED_NOTE,
      ]),
      filteredNotes: function () {
        let filtered =
          this.query === ''
            ? [...this.notes]
            : this.notes.filter((n) => {
                let pattern = new RegExp(this.query, 'gi')
                return pattern.test(n.title)
              })
        return filtered.sort((el1, el2) =>
          el1.title < el2.title ? -1 : el1.title > el2.title ? 1 : 0,
        )
      },
    },
    watch: {
      selectedNoteId: function () {
        this.inputs.newName = this.currentTitle
      },
    },
    mounted() {
      this.selectFirst()
    },
    methods: {
      ...mapMutations([
        mutations.SELECT_NOTE,
        mutations.SELECT_FIRST,
        mutations.ADD_CHANGE,
      ]),
      ...mapActions([actions.UPDATE_NOTE]),
      handleError: function (err) {
        this.$emit('alert', err.message)
        this.reset()
      },
      reset: function () {
        this.newNoteInput = ''
      },
      _addNote: function () {
        if (!this.newNoteInput) return

        let note = {
          id: this.notes.reduce((acc, n) => Math.max(acc, n.id), 0) + 1024 + 1,
          title: this.newNoteInput,
          content: '',
        }

        this.addChange({ type: 'add', payload: note })
        this.selectNote(note.id)
        this.newNoteInput = ''
      },
      _updateNote: function () {
        this.updateNote({
          ...this.selectedNote,
          title: this.inputs.newName,
        })
          .then(() => {
            this.$emit('alert', 'Note saved.', 'success')
            this.showRenameModal = false
          })
          .catch(this.handleError)
      },
      _deleteNote: function (note) {
        this.addChange({ type: 'delete', payload: note })
        if (this.selectedNoteId === note.id) {
          this.selectFirst()
        }
      },
    },
  }
</script>

<style scoped>
  .note-active {
    @apply bg-green-600 text-gray-100;
  }
</style>
