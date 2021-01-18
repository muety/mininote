<template>
  <div class="flex space-x-4">
    <div
      v-if="showEditor"
      class="flex flex-grow w-1/2 pt-1 pb-1 pl-1 bg-gray-100 rounded-md"
    >
      <textarea
        :value="content"
        class="flex-grow px-4 py-3 bg-gray-100 resize-none"
        @input="onInput"
      ></textarea>
      <div class="flex items-center">
        <button
          class="p-1 rounded-r-none btn-primary btn-editor hidden lg:inline"
          @click="toggleEditor()"
        >
          ◀
        </button>
      </div>
    </div>
    <div class="hidden lg:flex flex-grow w-1/2 bg-gray-100 rounded-md">
      <div class="flex items-center">
        <button
          v-show="!showEditor"
          class="p-1 rounded-l-none btn-primary btn-editor"
          @click="toggleEditor()"
        >
          ▶
        </button>
      </div>
      <div
        class="flex-grow px-4 py-3 text-compiled"
        v-html="textCompiled"
      ></div>
    </div>
  </div>
</template>

<script>
  import marked from 'marked'
  import createDOMPurify from 'dompurify'

  const DOMPurify = createDOMPurify(window)

  let timeout = null

  export default {
    props: {
      content: {
        type: String,
        required: true,
      },
      id: {
        type: Number,
        required: true,
      },
      dirty: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        showEditor: true,
      }
    },
    computed: {
      textCompiled() {
        return DOMPurify.sanitize(marked.parse(this.content))
      },
    },
    methods: {
      onInput: function (e) {
        let vm = this
        clearTimeout(timeout)
        timeout = setTimeout(function () {
          vm.$emit('content-update', { content: e.target.value, id: vm.id })
        }, 500)
      },
      toggleEditor: function () {
        this.showEditor = !this.showEditor
      },
    },
  }
</script>

<style>
  .text-compiled h1 {
    @apply text-3xl;
  }

  .text-compiled h2 {
    @apply text-2xl;
  }

  .text-compiled h3 {
    @apply text-xl text-gray-800;
  }

  .text-compiled h4 {
    @apply text-lg;
  }

  .text-compiled h6 {
    @apply text-sm font-semibold;
  }

  .text-compiled ul {
    @apply list-disc list-inside;
  }

  .text-compiled ol {
    @apply list-decimal list-inside;
  }
</style>
