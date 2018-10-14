<template>
  <NotebookList :notebooks="notebooks" v-bind:refreshNotebooks="loadNotebooks"></NotebookList>
</template>

<script>
  import NotesApiService from "../../../../services/NotesApiService";

  import NotebookList from './components/NotebookList'

  export default {
    name: 'notebooklistpage',
    data() {
      return {
        notebooks: [],
      }
    },
    components: {
      NotebookList,
    },
    mounted() {
      this.loadNotebooks()
    },
    methods: {
      loadNotebooks: function() {
        let vm = this;
        NotesApiService.list()
          .then(res => {
            vm.notebooks = res
          })
          .catch(() => {
            // Noting to do if the loading failes. Simply show no list!
          })
      }
    },
  }
</script>

<style>
</style>
