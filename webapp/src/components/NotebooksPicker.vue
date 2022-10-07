<template>
  <div class="flex flex-col">
    <button
      v-for="n in notebooks"
      :key="n.id"
      class="flex justify-between px-4 text-gray-700 bg-gray-100 border-b border-gray-400 rounded-none first:rounded-t-md last:rounded-b-md hover:bg-gray-300 last:border-none"
      @click="chooseNotebook(n.id)"
    >
      {{ n.id }}
      <div class="flex">
        <div
          class="flex items-center px-3 py-0 text-xs font-semibold text-gray-100 bg-green-600 rounded-l-xl rounded-r-xl"
        >
          {{ n.count }}
        </div>
        <span class="ml-1 delete-btn" @click.stop="deleteNotebook(n.id)"
          >🗑</span
        >
      </div>
    </button>
  </div>
</template>

<script>
  import { STORE_KEY } from '../store'
  import { actions } from '../store/types'

  export default {
    inject: [STORE_KEY],
    props: {
      notebooks: {
        type: Array,
        required: true,
      },
    },
    emits: ['notebook-selected', 'alert'],
    methods: {
      chooseNotebook: function (id) {
        this.$emit('notebook-selected', id)
      },
      deleteNotebook: function (id) {
        let password = prompt('Password')
        let vm = this
        this.store.actions[actions.DELETE_NOTEBOOK]({ id, password })
          .then(() => {
            vm.state.loaded = true
          })
          .catch(vm.handleError)
      },
      handleError: function (err) {
        console.error(err)
        this.$emit('alert', err.message)
        this.reset()
        this.close()
      },
    },
  }
</script>

<style scoped></style>
