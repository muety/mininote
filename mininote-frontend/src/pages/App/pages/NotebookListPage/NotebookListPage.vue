<template>
  <NotebookList :notebooks="notebooks" :notebookListCount="notebookListCount" v-bind:refreshNotebooks="loadNotebooks"></NotebookList>
</template>

<script>
  import NotesApiService from "../../../../services/NotesApiService";

  import NotebookList from './components/NotebookList'

  export default {
    name: 'notebooklistpage',
    data() {
      return {
        notebooks: [],
        notebookListCount: 0,
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
            if (Array.isArray(res)) {
              vm.notebookListCount = res.length
              vm.notebooks = res
            } else {
              vm.notebookListCount = res.count
              vm.notebooks = []
            }
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
