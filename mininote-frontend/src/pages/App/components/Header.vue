<template>
  <header class="header">
    <Logo />
    <span class="center">
      <ControlBar v-bind:showAlert="showAlert"></ControlBar>
    </span>
    <span class="right"></span>
  </header>
</template>

<script>
  import ControlBar from "../components/ControlBar";
  import Logo from "./Logo";

  export default {
    props: ["showAlert"],
    components: {
      ControlBar,
      Logo,
    }
  }
</script>

<style scoped>
  .header {
    padding: 12px;
    display: inline-flex;
    flex-direction: row;
  }

  .header .logo {
    color: #bbb;
    font-size: 24px;
    justify-content: flex-start;
    align-items: center;
  }

  .header .logo .small {
    color: #42B983;
    font-size: 12px;
  }

  .header .center {
    justify-content: center;
    align-items: center;
  }

  .header .right {
    justify-content: flex-end;
    align-items: center;
  }

  .header > span {
    flex-grow: 1;
  }
</style>
