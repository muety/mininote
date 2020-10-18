<template>
  <div class="picker-container">
    <b-modal id="renameModal" ref="renameModalRef" size="md" title="Rename Note" @ok="updateNote" ok-title="Save">
      <b-container fluid>
        <b-row>
          <b-col sm="3">
            <label for="newNameInput">Name:</label>
          </b-col>
          <b-col>
            <b-form-input id="newNameInput" type="text" placeholder="Enter new name for this note." v-model="inputs.newName" />
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
    <div class="search-container">
      <div class="input-group">
        <div class="input-group-prepend" id="sizing-addon1">
          <span class="input-group-text">&#x1F50D;</span>
        </div>
        <input type="text" class="form-control" placeholder="Search ..." v-model="query">
      </div>
    </div>

    <ul class="list-group">
      <li v-for="n in filteredNotes" :key="n.id" class="list-group-item" :class="{ active: selectedNoteId == n.id }" @click="selectNote(n.id)">
        {{ n.title }}
        <span class="delete-btn" @click.stop="deleteNote(n)">🗑</span>
        <span class="rename-btn" v-b-modal.renameModal>✏️</span>
      </li>
    </ul>
    <div class="input-group new-note-input">
      <input type="text" class="form-control" placeholder="Add note ..." v-model="newNoteInput" @keyup.enter="addNote">
      <div class="input-group-btn">
        <button type="button" class="btn btn-primary no-rounded-left" :disabled="!newNoteInput" @click="addNote">&#x2b;</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'notes-picker',
  data() {
    return {
      query: '',
      newNoteInput: '',
      inputs: {
        newName: ''
      }
    }
  },
  computed: {
    ...mapState({
      notebook: state => state.notebook,
      selectedNoteId: state => state.selectedNoteId
    }),
    ...mapGetters([
      'notes', 'currentTitle', 'selectedNote'
    ]),
    filteredNotes: function() {
      let filtered = this.query === '' ? [...this.notes] : this.notes.filter(n => {
        let pattern = new RegExp(this.query, 'gi')
        return pattern.test(n.title)
      })
      return filtered.sort((el1, el2) => (el1.title < el2.title) ? -1 : (el1.title > el2.title) ? 1 : 0)
    },
  },
  methods: {
    ...mapMutations([
      'selectNote'
    ]),
    handleError: function(err) {
      this.$emit('alert', err.message)
      this.reset();
    },
    reset: function() {
      this.newNoteInput = ''
    },
    addNote: function() {
      if (!this.newNoteInput) return

      let note = {
        id: this.notes.reduce((acc, n) => Math.max(acc, n.id), 0) + 1024 + 1,
        title: this.newNoteInput,
        content: ''
      }

      this.$store.commit('addChange', { type: 'add', payload: note })
      this.$store.commit('selectNote', note.id)
      this.newNoteInput = ''
    },
    updateNote: function() {
      this.$store.dispatch('updateNote', { ...this.selectedNote, title: this.inputs.newName })
        .then(() => this.$emit('alert', 'Note saved.', 'success'))
        .catch(this.handleError)
    },
    deleteNote: function(note) {
      this.$store.commit('addChange', { type: 'delete', payload: note })
      if (this.selectedNoteId === note.id) {
        this.$store.commit('selectFirst')
      }
    }
  },
  created () {
    this.$store.commit('selectFirst')
  },
  watch: {
    'selectedNoteId': function () {
      this.inputs.newName = this.currentTitle
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.picker-container {
  margin-top: 20px;
}

.picker-container ul {
  overflow-y: auto;
  max-height: calc(100vh - 240px)
}

.picker-container li.active {
  background-color: #42B983;
  border-color: #42B983;
}

.picker-container li .delete-btn {
  float: right;
}

.picker-container li .rename-btn {
  float: right;
  margin-right: 10px;
}

.picker-container .search-container {
  margin-bottom: 20px;
}

.picker-container .list-group-item {
  padding: 0.35rem 0.75rem;
  cursor: pointer;
}

.picker-container .new-note-input {
  margin-top: 20px;
}
</style>
