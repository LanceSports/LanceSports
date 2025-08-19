<script setup>
import { ref,computed,nextTick } from 'vue'
import {useUserStore} from '../store/useUserStore'
import { storeToRefs } from 'pinia'
import router from '../router'
import {googleLogout} from 'vue3-google-login'

const navOpen = ref(false)
const {userData} = useUserStore();
const loggedIn = computed(()=> !userData.value)
console.log(loggedIn.value)

const logout = () => {
  googleLogout()
  
  // clear user data and move to login screen
  localStorage.clear()
  userData.value = {}

  nextTick(() => {
    router.push('/Login')
    //window.location.reload()
  })
}
</script>

<template>
  <div>
    <!-- Mobile Navigation Section -->
    <div class="sm:hidden px-4 py-2 bg-purple-500">
      <div class="flex items-center justify-between">
        <!-- Burger/Close Button -->
        <button @click="navOpen = !navOpen" class="text-white">
          <!-- Burger icon -->
          <svg v-show="!navOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
          <!-- Close icon -->
          <svg v-show="navOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </button>
        <!-- Mobile Logo -->
        <router-link to="/" class="font-bold text-white text-xl">
          LanceSports
        </router-link>
      </div>

      <!-- Mobile Menu (toggled by navOpen) -->
      <nav v-show="navOpen" class="text-white mt-4 space-y-2">
        <!-- These are now <router-link> components -->
        <router-link to="/premier-league" class="block">Premier League</router-link>
        <router-link to="/psl" class="block">PSL</router-link>
        <router-link to="/rugby" class="block">Rugby</router-link>
        <router-link to="/cricket" class="block">Cricket</router-link>
        <!-- Login button is also a router link -->
        <router-link
    v-if="!loggedIn"
    to="/login"
    class="block bg-white text-purple-500 px-4 py-2 rounded font-semibold text-center hover:bg-purple-100 transition"
  >
    Login
  </router-link>

  <!-- Show Logout button when logged in -->
  <button
    v-else
    @click="logout"
    class="block bg-white text-purple-500 px-4 py-2 rounded font-semibold text-center hover:bg-purple-100 transition"
  >
    Logout
  </button>
      </nav>
    </div>

    <!-- Desktop Navigation Section -->
    <div class="px-4 py-2 bg-purple-500 hidden sm:block">
      <div class="flex gap-x-10 text-white items-center">
        <!-- Desktop Logo -->
        <router-link to="/" class="font-bold text-white text-xl">
          LanceSports
        </router-link>
        <!-- These are now <router-link> components -->
        <router-link to="/premier-league" class="block">Premier League</router-link>
        <router-link to="/psl" class="block">PSL</router-link>
        <router-link to="/rugby" class="block">Rugby</router-link>
        <router-link to="/cricket" class="block">Cricket</router-link>
        <!-- Login button as a router link -->
         <router-link
      v-if="!loggedIn"
      to="/login"
      class="ml-auto bg-white text-purple-500 px-4 py-2 rounded font-semibold hover:bg-purple-100 transition"
    >
      Login
    </router-link>

    <button
      v-else
      @click="logout"
      class="ml-auto bg-white text-purple-500 px-4 py-2 rounded font-semibold hover:bg-purple-100 transition"
    >
      Logout
    </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
  The router-link-active class is automatically added to the active link.
  You can use it to apply styles like a bold font or a different color
  to indicate the current page.
*/
.router-link-active {
  font-weight: bold;
}
</style>
