<template>
  <div class="picker-container">
    <b-list-group>
      <b-list-group-item button v-for="n in notebooks" :key="n.id" @click="chooseNotebook(n.id)" class="d-flex justify-content-between align-items-center">
        {{ n.id }}
        <b-badge variant="primary" pill>{{ n.count }}</b-badge>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import { md5 } from '../lib/md5'
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'notes-picker',
  props: ['notebooks'],
  computed: {},
  methods: {
    chooseNotebook: function(id) {
      this.$emit('notebookSelected', id)
    }
  },
  created () {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.picker-container {
  margin-top: 20px;
}

.picker-container ul {
  overflow-y: auto;
  max-height: calc(100vh - 240px)
}

.picker-container .badge-primary {
  background-color: #42B983;
}

.picker-container .list-group-item {
  padding: 0.35rem 0.75rem;
  cursor: pointer;
}
</style>
