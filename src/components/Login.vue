<script setup>
import { googleSdkLoaded } from 'vue3-google-login'
import { useUserStore } from '../store/useUserStore'
import { storeToRefs } from 'pinia'

// Composables
const userStore = useUserStore()

const { clientId } = storeToRefs(userStore)
const { fetchUserDataFrom } = userStore
console.log(clientId.value);


// Methods
const signInWithGoogle = () => {
  googleSdkLoaded(google => {
    google.accounts.oauth2
      .initCodeClient({
        client_id: clientId.value,
        scope: 'email profile openid',
        redirect_uri: import.meta.env.VITE_APP_REDIRECT_URL,
        callback: response => {
          if (response.code)
            fetchUserDataFrom(response.code)
        },
      })
      .requestCode()
  })
}
</script>

<template> 
  <div class="h-screen flex items-center justify-center">
  <form class="bg-white p-8 rounded shadow-md">
    <label for="username" class="block text-gray-700 text-sm font-bold mb-2">Username:</label>
    <input type="text" id="username" name="username" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">

    <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password:</label>
    <input type="password" id="password" name="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-6">

    <button type="submit" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Submit</button>
      <button type="button" @click="signInWithGoogle" class="text-white w-full  bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between mr-2 mb-2"><svg class="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>Sign up with Google<div></div></button>
  </form>
</div>
</template>


