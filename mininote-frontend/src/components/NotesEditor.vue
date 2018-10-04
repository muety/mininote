<template>
  <div class="container-fluid">
    <div class="row">
      <transition name="collapse">
        <div v-if="showEditor" class="col editor-container">
          <button class="btn btn-primary btn-editor" @click="showEditor = !showEditor">&#x21e4;</button>
          <textarea :value="note.content" @input="onInput"></textarea>
        </div>
      </transition>
      <div class="col editor-container result-container">
        <transition name="fade">
          <button class="btn btn-primary btn-results" @click="showEditor = !showEditor" v-if="!showEditor">&#x21a6;</button>
        </transition>
        <div class="text-compiled" v-html="textCompiled"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from './../services/marked'

let timeout = null;

export default {
  name: 'notes-editor',
  props: ['showEditor', 'note'],
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

.btn {
	position: absolute;
	top: 0;
	width: 20px;
	height: 100%;
	padding: 0;
}

.btn-editor {
	right: 0;
}

.btn-results {
	left: 0;
}

.result-container {
  overflow: auto;
}

.text-compiled {
	margin-left: 20px;
}

.collapse-enter-active, .collapse-leave-active {
	transition: flex-grow .35s linear;
}

.collapse-leave, .collapse-enter-to {
	flex-grow: 1;
}

.collapse-enter, .collapse-leave-to {
	flex-grow: 0;
}

.fade-enter-active, .fade-enter-leave {
	transition: opacity .35s linear;
}

.fade-leave, .fade-enter-to {
	opacity: 1;
}

.fade-leave-to, .fade-enter {
	opacity: 0;
}
</style>
