<template>
  <div class="notebook-list">
    <span>
      <div v-if="hasNotebookList">
        <span class="header">Existing notebooks:</span>
        <b-list-group class="list">
          <b-list-group-item :key="notebook" v-for="notebook in notebooks">
            {{ notebook }}
          </b-list-group-item>
        </b-list-group>
      </div>
      <div v-else class="placeholder">
        {{ notebookPlaceholder }}
      </div>
      <NewNotebookDialog class="notebookDialogButton" v-bind:refreshNotebooks="refreshNotebooks"></NewNotebookDialog>
    </span>
  </div>
</template>

<script>
  import NewNotebookDialog from './NewNotebookDialog'

  export default {
    name: 'notebook-list',
    props: ['notebooks', 'notebookListCount', 'refreshNotebooks'],
    components: {
      NewNotebookDialog,
    },
    computed: {
      notebookPlaceholder: function() {
        let content
        if (this.notebookListCount === 0) {
          content = "your first"
        } else {
          content = "or open a"
        }
        return `Please create ${content} notebook.`
      },
      hasNotebookList: function() {
        return this.notebooks.length > 0
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .notebook-list {
    display: inline-flex;
    width: 100%;
    height: 100%;
    justify-content: center;
  }

  .notebook-list > span {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .header {
    font-size: 30px;
    color: rgb(73, 80, 87);
  }

  .list {
    width: 50vw;
    max-height: 70vh;
    padding-top: 12px;
    overflow-y: auto;
  }

  .notebookDialogButton {
    padding-top: 12px;
  }

  .placeholder {
    font-size: 40px;
    text-align: center;
    color: rgb(73, 80, 87);
  }
</style>
