<template>
  <keep-alive>
    <router-view v-if="$route.meta.keepAlive" />
  </keep-alive>
  <router-view v-if="!$route.meta.keepAlive" />
</template>

<script setup>
// import Dashboard from '@/views/Dashboard.vue';

</script>
