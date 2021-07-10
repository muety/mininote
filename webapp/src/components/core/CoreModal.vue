<template>
  <div
    class="
      absolute
      top-0
      left-0
      flex
      justify-center
      w-full
      h-full
      bg-black bg-opacity-50
    "
  >
    <div
      class="
        absolute
        flex flex-col
        w-1/2
        px-8
        py-2
        m-12
        bg-gray-100
        border
        rounded-lg
        shadow-lg
      "
    >
      <header class="py-4 text-lg border-b border-gray-400">
        <slot name="header"></slot>
      </header>

      <main class="py-4 border-b border-gray-400">
        <slot name="main"></slot>
      </main>

      <footer class="flex justify-end py-4 space-x-2">
        <button class="btn-danger hover:bg-red-800" @click="$emit('discard')">
          <slot name="danger-btn">Discard</slot>
        </button>
        <button class="btn-primary hover:bg-green-700" @click="$emit('ok')">
          <slot name="ok-btn">OK</slot>
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
  export default {
    emits: ['ok', 'discard'],
  }
</script>
