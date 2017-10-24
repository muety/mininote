<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col editor-container">
        <textarea :value="note.content" @input="onInput"></textarea>
      </div>
      <div class="col editor-container result-container">
        <div v-html="textCompiled"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from './../services/marked'

let timeout = null;

export default {
  name: 'notes-editor',
  props: ['note'],
  data() {
    return {}
  },
  computed: {
    textCompiled() { return marked(this.note.content) }
  },
  methods: {
    onInput: function(e) {
      let vm = this
      clearTimeout(timeout)
      timeout = setTimeout(function() {
        vm.note.content = e.target.value
      }, 500)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
textarea {
  border: 0;
  width: 100%;
  height: 100%;
  resize: none;
  outline: none;
}

.editor-container {
  height: calc(100vh - 110px);
  margin: 20px;
  padding: 20px;
  border-radius: 0.25rem;
  background-color: #fff;
}

.result-container {
  overflow: auto;
}
</style>
