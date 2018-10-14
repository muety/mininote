<template>
  <div class="app">
    <Header v-bind:showAlert="showAlert"></Header>
    <main class="content">
      <span class="notification">
        <b-alert show v-if="alert && alert.variant === 'danger'" variant="danger">{{ alert.text }}</b-alert>
        <b-alert show v-if="alert && alert.variant === 'success'" variant="success">{{ alert.text }}</b-alert>
      </span>
      <router-view v-bind:showAlert="showAlert"></router-view>
    </main>
    <Footer></Footer>
  </div>
</template>

<script>
  import Header from './components/Header'
  import Footer from './components/Footer'

  export default {
    name: 'app',
    data() {
      return {
        alert: null
      }
    },
    components: {
      Header,
      Footer,
    },
    methods: {
      showAlert: function(text, variant) {
        let vm = this;
        if (!variant) variant = 'danger'
        vm.alert = { text, variant }
        setTimeout(function() {
          vm.alert = null
        }, 3000)
      }
    }
  }
</script>

<style>
  body {
    margin: 0 !important;
  }

  .app {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }

  .app a {
    color: #42B983;
    text-decoration: none;
  }

  .content {
    display: flex;
    padding: 12px;
    flex: 1 0 auto;
  }

  .btn-primary {
    background-color: #42B983;
    border-color: #42B983;
  }

  .alert {
    width: 500px;
    position: fixed;
    top: 15px;
    left: calc(50% - 250px);
    z-index: 999;
    text-align: center;
  }

</style>
