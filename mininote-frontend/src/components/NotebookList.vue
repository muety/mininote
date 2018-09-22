<template>
  <div class="notebook-list-element" v-if="notebooks.length !== 0">
    <span class="header">Existing notebooks:</span>
    <b-list-group class="list">
      <b-list-group-item :key="notebook" v-for="notebook in sortedNotebooks">
        {{ notebook }}
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
  import NotesApiService from "./../services/NotesApiService";

  export default {
    name: 'notebook-list',
    props: ['notebooks'],
    computed: {
      sortedNotebooks: function() {
        return this.notebooks.sort()
      },
    },
    mounted() {
      this.loadNotebooks()
    },
    methods: {
      loadNotebooks: function() {
        let vm = this;
        NotesApiService.list()
          .then(res => {
            vm.$emit("notebooksLoaded", res);
          })
          .catch(() => {
            // No need to show a message, because the user can still use the app.
          });
      },
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .notebook-list-element {
    height: 100%;
  }

  .header {
    font-size: 30px;
    color: rgb(73, 80, 87);
  }

  .list {
    height: 100%;
    overflow-x: auto;
    margin-top: 12px;
  }
</style>
