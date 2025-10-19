<template>
  <div class="background-wrapper">
    <!-- Background iframe -->
    <iframe
      :src="backgroundPath"
      frameborder="0"
      class="background-iframe"
    ></iframe>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Path to your local HTML file in public folder
const backgroundPath = ref('/mandala.html');
</script>

<style>
.background-wrapper {
  position: fixed;
  width: 50vw;
  height: 45vh;
  overflow: hidden;
  /* border: 1px solid white; */
  z-index: -1;
  top: 0;
  margin-top: -2%;
  overflow: hidden;
}

.background-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* margin-top: -20vh; */
  border: none;
  pointer-events: none; /* Allows clicks to pass through to your content */
  z-index: -1;           /* Push iframe behind the content */
  border: 0px solid white;
  overflow: hidden;
}

.content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}
</style>
