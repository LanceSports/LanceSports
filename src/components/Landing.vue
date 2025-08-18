<script setup>
import { ref } from 'vue'
import siya from '../assets/siya.jpg'
import cole from '../assets/cole.avif'
import pitch from './soccerPitch.vue'
import {useUserStore} from '../store/useUserStore'
import { storeToRefs } from 'pinia'


const {userData} = useUserStore();

const sports = ref([
  {
    sport: 'Soccer',
    image: cole,
    headline: 'Relive the Club World Cup final once more',
    link: 'https://youtu.be/A3t_uUgTm5k?si=BisNvMRddYZAf7C6'
  },
  {
    sport: 'Rugby',
    image: siya,
    headline: 'Relive the Springbok Rugby World Cup victory again',
    link: 'https://youtu.be/FykXCpCuhNM?si=qiCeIZIcRJAFVki-'
  },
])

const games = ref([
    {sport:'Football',time:'Sun, 17 Aug 15:00 ',fixture:'Chelsea vs Crystal Palace', league: 'Premier League', link:'./soccerPitch.vue'},
    {sport: 'Rugby', time: 'Sun, 17 Aug 15:00',fixture:'Springboks vs Wallabies', league: 'The Rugby Championship', link:''}
])
</script>

<template>
  <div class="flex px-4 py-6 gap-6">
    <!-- Main content -->
    <section class="flex-1 space-y-6">
    <h1 v-if="userData.name"> Welcome, {{ userData.name }} </h1>
      <h1 v-else class="text-2xl font-serif mb-4">
        The Future of Sports, all in one place.
      </h1>

      <ul class="space-y-6">
        <li v-for="sport in sports" :key="sport.sport" class="bg-white rounded shadow p-4 flex flex-col md:flex-row gap-4">
          <img
            :src="sport.image"
            :alt="`Image of ${sport.sport}`"
            class="w-full md:w-64 h-48 object-cover rounded"
          />
          <div class="flex flex-col justify-between">
            <h2 class="font-serif text-lg mb-2">{{ sport.headline }}</h2>
            <a
              :href="sport.link"
              class="text-blue-500 hover:underline font-medium mt-auto"
            >
              See more
            </a>
          </div>
        </li>
      </ul>
    </section>

    <!-- Sidebar -->
    <aside class="w-64 bg-purple-100 rounded p-4">
  <h2 class="text-xl font-serif mb-4">Fixtures</h2>
  <ul class="space-y-2">
    <li v-for="(game, index) in games" :key="index" class="hover:bg-purple-200 font-serif p-2 rounded">
      <h3>
        <a :href="game.link" target="_blank" class="text-blue-600 hover:underline">
          {{ game.sport }}
        </a>
      </h3>
      <h3>
        <a :href="game.link" target="_blank" class="text-blue-600 hover:underline">
          {{ game.fixture }}
        </a>
      </h3>
      <h3>League: {{ game.league }}</h3>
      <h3>Time: {{ game.time }}</h3>
    </li>
  </ul>
</aside>

  </div>
</template>
