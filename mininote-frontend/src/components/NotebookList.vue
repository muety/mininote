<template>
  <div>
    <span class="header">Existing notebooks:</span>
    <b-list-group class="list">
      <b-list-group-item :key="notebook" v-for="notebook in notebooks">
        {{ notebook }}
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
  export default {
    name: 'notebook-list',
    props: ['notebooks'],
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .header {
    font-size: 30px;
    color: rgb(73, 80, 87);
  }

  .list {
    padding-top: 12px;
  }
</style>
