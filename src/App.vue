<script setup>
import Navbar from './components/Navbar.vue'
import { onMounted } from 'vue';
import { useUserStore } from './store/useUserStore';

const userStore = useUserStore();

onMounted(() => {
  // Check if a user session exists in localStorage
  const storedUser = localStorage.getItem('user');

  if (storedUser) {
    // If it exists, set the store's state from local storage
    userStore.userData = JSON.parse(storedUser);
  }
});
</script>

<template>
  <div>
    <!-- The Navbar stays here on every page -->
    <Navbar/> 

    <!-- The router-view is the placeholder for your page content -->
    <router-view></router-view>
  </div>
</template>

<style scoped>

</style>