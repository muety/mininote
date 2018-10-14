<template>
  <div>
    <SearchBar v-bind:onFilterChange="handleFilterChange"></SearchBar>
    <ul class="list-group">
      <li v-for="n in filteredNotes" :key="n.id" class="list-group-item" :class="{ active: selectedNoteId === n.id }" @click="handleSelectNote(n.id)">
        {{ n.title }}
        <span class="delete-btn" @click.stop="handleDeleteNote(n)">🗑</span>
      </li>
    </ul>
    <div class="input-group new-note-input">
      <input type="text" class="form-control" placeholder="Add note ..." v-model="newNoteNameInput" @keyup.enter="addNote">
      <div class="input-group-btn">
        <button type="button" class="btn btn-primary" :disabled="!newNoteNameInput" @click="addNote">&#x2b;</button>
      </div>
    </div>
  </div>
</template>

<script>
  import SearchBar from './SearchBar';

  export default {
    props: ['notes', 'onCreateNote', 'onSelectNote', 'onDeleteNote'],
    data() {
      return {
        query: "",
        selectedNoteId: "",
        newNoteNameInput: "",
      }
    },
    components: {
      SearchBar,
    },
    computed: {
      filteredNotes: function() {
        if (!this.notes || this.notes.length === 0) {
          return [];
        }
        return this.query === '' ? this.notes : this.notes.filter(n => {
          let pattern = new RegExp(this.query, 'gi')
          return pattern.test(n.title)
        })
      }
    },
    methods: {
      addNote: function() {
        this.onCreateNote(this.newNoteNameInput)
        this.newNoteNameInput = ""
      },
      handleFilterChange: function (newFilter) {
        this.query = newFilter
      },
      handleSelectNote: function(noteId) {
        this.onSelectNote(noteId)
      },
      handleDeleteNote: function(note) {
        this.onDeleteNote(note.id)
      },
    },
    watch:{
      $route (to, from){
        if (this.$route.params.noteId) {
          this.selectedNoteId = parseInt(this.$route.params.noteId)
        } else {
          this.selectedNoteId = ""
        }
      }
    }
  }
</script>

<style scoped>
  ul {
    max-height: calc(100vh - 240px);
    overflow-y: auto;
  }

  li.active {
    background-color: #42B983;
    border-color: #42B983;
  }

  li .delete-btn {
    float: right;
  }

  .list-group-item {
    padding: 0.35rem 0.75rem;
    cursor: pointer;
  }

  .new-note-input {
    margin-top: 20px;
  }
</style>
