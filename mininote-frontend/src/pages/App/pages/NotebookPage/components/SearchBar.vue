<template>
  <div class="search-container">
    <div class="input-group">
      <div class="input-group-prepend input-group-text">
        &#x1F50D;
      </div>
      <input type="text" class="form-control" placeholder="Search ..." v-model="query" @change="handleFilterChange">
    </div>
  </div>
</template>

<script>
  export default {
    props: ['onFilterChange'],
    data() {
      return {
        query: "",
      }
    },
    methods: {
      handleFilterChange: function (event) {
        this.onFilterChange(event.target.value)
      }
    },
  }
</script>

<style>
  .search-container {
    margin-bottom: 20px;
  }
</style>
