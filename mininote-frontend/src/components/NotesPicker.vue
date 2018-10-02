<template>
  <div class="picker-container">
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
      </li>
    </ul>
    <div class="input-group new-note-input">
      <input type="text" class="form-control" placeholder="Add note ..." v-model="newNoteInput" @keyup.enter="addNote">
      <div class="input-group-btn">
        <button type="button" class="btn btn-primary" :disabled="!newNoteInput" @click="addNote">&#x2b;</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'notes-picker',
  props: ['notes'],
  data() {
    return {
      selectedNoteId: this.notes.reduce((acc, n) => Math.min(acc, n.id), Number.MAX_VALUE),
      query: '',
      newNoteInput: ''
    }
  },
  computed: {
    filteredNotes: function() {
      let vm = this;
      return this.query === '' ? this.notes : this.notes.filter(n => {
        let pattern = new RegExp(this.query, 'gi')
        return pattern.test(n.title)
      })
    }
  },
  methods: {
    selectNote: function(noteId) {
      this.selectedNoteId = noteId
      this.$emit('noteSelected', noteId)
    },
    addNote: function() {
      if (!this.newNoteInput) return
      let note = {
        id: this.notes.reduce((acc, n) => Math.max(acc, n.id), 0) + 1,
        title: this.newNoteInput,
        content: ''
      }
      this.$emit('addNote', note)
      this.newNoteInput = ''
      this.selectedNoteId = note.id
      this.$emit('noteSelected', this.selectedNoteId)
    },
    deleteNote: function(note) {
      this.$emit('deleteNote', note)
      this.selectedNoteId = this.notes.reduce((acc, n) => n.id !== note.id ? Math.max(acc, n.id) : acc, 0)
      this.$emit('noteSelected', this.selectedNoteId)
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
