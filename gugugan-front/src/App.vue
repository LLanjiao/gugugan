<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<style scoped>
/* 全局默认主题变量 */
:root {
  --bg-color: white;         /* 背景色 */
  --text-color: black;       /* 文字颜色 */
  --border-color: black;     /* 边框颜色 */
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
