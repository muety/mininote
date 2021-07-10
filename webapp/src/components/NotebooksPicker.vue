<template>
  <div class="flex flex-col">
    <button
      v-for="n in notebooks"
      :key="n.id"
      class="
        flex
        justify-between
        px-4
        text-gray-700
        bg-gray-100
        border-b border-gray-400
        rounded-none
        first:rounded-t-md
        last:rounded-b-md
        hover:bg-gray-300
        last:border-none
      "
      @click="chooseNotebook(n.id)"
    >
      {{ n.id }}
      <div
        class="
          flex
          items-center
          px-3
          py-0
          text-xs
          font-semibold
          text-gray-100
          bg-green-600
          rounded-l-xl rounded-r-xl
        "
      >
        {{ n.count }}
      </div>
    </button>
  </div>
</template>

<script>
  export default {
    props: {
      notebooks: {
        type: Array,
        required: true,
      },
    },
    emits: ['notebook-selected'],
    methods: {
      chooseNotebook: function (id) {
        this.$emit('notebook-selected', id)
      },
    },
  }
</script>

<style scoped></style>
