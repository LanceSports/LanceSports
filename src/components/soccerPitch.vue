<script setup>
import { onMounted, ref } from 'vue'
import Navbar from './Navbar.vue'

const canvasRef = ref(null)

// Player formation (same as before)
const formation = ref([
  { x: 50, y: 80, number: 1 },  
  { x: 20, y: 70, number: 2 },  
  { x: 40, y: 70, number: 3 },
  { x: 60, y: 70, number: 4 },
  { x: 80, y: 70, number: 5 },
  { x: 30, y: 60, number: 6 },
  { x: 50, y: 60, number: 7 },
  { x: 70, y: 60, number: 8 },
  { x: 20, y: 55, number: 9 },
  { x: 50, y: 55, number: 10 },
  { x: 80, y: 55, number: 11 }
])

// Example commentary remarks
const remarks = ref([
  { time: '00:12', text: 'Kick-off! The game has started.' },
  { time: '05:34', text: 'Goal attempt by player 9, blocked by goalkeeper.' },
  { time: '12:45', text: 'Yellow card for player 4.' },
  { time: '22:10', text: 'Corner kick for the home team.' }
])

function drawField(ctx, width, height) {
  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Grass background
  ctx.fillStyle = '#3495eb'
  ctx.fillRect(0, 0, width, height)

  // White lines
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 2

  // Outer boundaries
  ctx.strokeRect(0, 0, width, height)

  // Center line
  ctx.beginPath()
  ctx.moveTo(0, height/2);
  ctx.lineTo(height,height/2 )
  ctx.stroke()

  // Center circle
  ctx.beginPath()
  ctx.arc(width / 2, height / 2, width * 0.1, 0, 2 * Math.PI)
  ctx.stroke()

  // Goals (small rectangles)
  const goalWidth = width * 0.1
  const goalHeight = height * 0.02
  ctx.strokeRect(width / 2 - goalWidth / 2, 0, goalWidth, goalHeight) // Top goal
  ctx.strokeRect(width / 2 - goalWidth / 2, height - goalHeight, goalWidth, goalHeight) // Bottom goal
}

function drawPlayers(ctx, width, height) {
  formation.value.forEach(player => {
    const px = (player.x / 100) * width
    const py = (player.y / 100) * height
    const radius = 12

    // Draw player circle
    ctx.fillStyle = 'red' // gold color
    ctx.beginPath()
    ctx.arc(px, py, radius, 0, 2 * Math.PI)
    ctx.fill()

    // Player number
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(player.number, px, py)
  })
}

onMounted(() => {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  drawField(ctx, width, height)
  drawPlayers(ctx, width, height)
})
</script>

<template>
    <Navbar/>
  <div class="p-4 flex gap-6">
    <!-- Soccer field -->
    <div>
      <canvas ref="canvasRef" width="600" height="900" class="border border-gray-400 rounded"></canvas>
    </div>

    <!-- Sidebar -->
    <aside class="w-64 space-y-6">
      <!-- Fixtures -->
      <div class="bg-green-100 rounded p-4">
        <h2 class="text-xl font-serif mb-4">Other Live Fixtures </h2>
        <ul class="space-y-2">
          <li v-for="(game, index) in games" :key="index" class="hover:bg-green-200 font-serif p-2 rounded">
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
      </div>

      <!-- Commentary -->
      <div class="bg-gray-100 rounded p-4 h-64 overflow-y-auto">
        <h2 class="text-xl font-serif mb-4">Live Commentary</h2>
        <ul class="space-y-2">
          <li v-for="(remark, index) in remarks" :key="index" class="text-sm">
            <span class="font-bold">{{ remark.time }}</span>: {{ remark.text }}
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>
