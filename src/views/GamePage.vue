<template>
  <div class="min-h-screen flex items-center justify-center bg-black px-4 py-12 relative">
    <!-- Panel Container -->
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-neutral-800 relative">
      <h1 class="text-2xl font-bold text-center mb-6">Game Created!</h1>

      <!-- Game Code Display -->
      <div class="bg-black text-white text-center py-2 rounded-lg mb-8">
        <span class="text-xl tracking-widest font-mono">{{ gameCode }}</span>
      </div>

      <!-- Forecast & Achievement Panels -->
      <div class="mb-6">
        <div class="flex flex-col md:flex-row gap-6">
          <div class="flex-1">
            <h2 class="text-lg font-semibold mb-2 text-center">Forecast</h2>
            <div v-for="(item, idx) in forecastRounds" :key="idx" class="mb-3">
              <label class="text-sm block mb-1 text-center">Round {{ idx + 1 }}</label>
              <input v-model="item.value" type="text" placeholder="Forecast..." class="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-indigo-300" />
            </div>
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-semibold mb-2 text-center">Achievement</h2>
            <div v-for="(item, idx) in milestoneRounds" :key="idx" class="mb-3">
              <label class="text-sm block mb-1 text-center">Round {{ idx + 1 }}</label>
              <input v-model="item.value" type="text" placeholder="Achievement..." class="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-indigo-300" />
            </div>
          </div>
        </div>
        <div class="flex justify-between gap-6 mt-6">
          <button @click="removeRound" :disabled="forecastRounds.length <= 1" class="bg-red-500 text-white px-24 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 ml-12">Remove Round</button>
          <button @click="addRound" class="bg-green-500 text-white px-27 py-2 rounded-lg hover:bg-green-600">Add Round</button>
        </div>
      </div>

      <!-- Submit Button -->
      <button @click="openConfirm" :disabled="isProcessing" class="w-full bg-black text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 disabled:opacity-50">
        <span v-if="isProcessing">Processing...</span>
        <span v-else>Submit & Start Game</span>
      </button>

      <!-- Confirm Modal -->
      <div v-if="showConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
          <h2 class="text-lg font-semibold mb-4 text-center">Confirm Submit</h2>
          <p class="mb-6 text-center">Submit interest before starting the game?</p>
          <div class="flex justify-between">
            <button @click="cancelConfirm" class="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
            <button @click="openInterestForm" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Yes</button>
          </div>
        </div>
      </div>

      <!-- Interest Modal -->
      <div v-if="showInterest" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 class="text-lg font-semibold mb-4 text-center">Submit Interest</h2>
          <div class="space-y-4">
            <div v-for="(label, key) in interestLabels" :key="key">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
              <input
                v-model="interest[key]"
                type="text"
                placeholder="Masukkan nilai"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-indigo-300"
              />
            </div>
          </div>
          <div class="flex justify-end mt-6">
            <button @click="cancelInterest" class="mr-2 px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
            <button @click="submitInterest" :disabled="isProcessing" class="px-4 py-2 bg-green-600 text-white rounded-lg">Submit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const gameCode = ref('')
const forecastRounds = ref([{ value: '' }])
const milestoneRounds = ref([{ value: '' }])
const isProcessing = ref(false)
const showConfirm = ref(false)
const showInterest = ref(false)

const interest = ref({
  conInterest: '',
  proInterest: '',
  headInterest: '',
  outInterest: '',
})

const interestLabels = {
  ConsumptiveInterest: 'ConsumptiveInterest (Bunga Konsumtif)',
  ProductiveInterest: 'ProductiveInterest (Bunga Produktif)',
 InterOfficeInterest: 'InterOfficeInterest (Bunga Kantor Pusat)',
  FundInterest: 'FundInterest (Bunga Pihak Ketiga)',
}

onMounted(() => {
  const code = localStorage.getItem('gameCode')
  if (code) gameCode.value = code
  else alert('gameCode not found')
})

const addRound = () => {
  forecastRounds.value.push({ value: '' })
  milestoneRounds.value.push({ value: '' })
}

const removeRound = () => {
  if (forecastRounds.value.length > 1) {
    forecastRounds.value.pop()
    milestoneRounds.value.pop()
  }
}

const openConfirm = () => showConfirm.value = true
const cancelConfirm = () => showConfirm.value = false
const openInterestForm = () => {
  showConfirm.value = false
  showInterest.value = true
}
const cancelInterest = () => showInterest.value = false

const submitInterest = async () => {
  isProcessing.value = true
  try {
    await axios.post('https://api-fastify-pi.vercel.app/game/addinterest', {
      gameCode: gameCode.value,
      ConsumptiveInterest: interest.value.conInterest,
      ProductiveInterest: interest.value.proInterest,
      InterOfficeInterest: interest.value.InterOfficeInterest,
      OutInterest: interest.value.outInterest
    })

    const started = await startGame()
    if (!started) throw new Error('Belum ada tim yang join. Silakan tunggu sebelum memulai game.')

    showInterest.value = false
    await submitData()
  } catch (e) {
    console.error(e)
    alert('Error: ' + (e.message || 'Unknown'))
  } finally {
    isProcessing.value = false
  }
}

const startGame = async () => {
  try {
    const response = await fetch('https://api-fastify-pi.vercel.app/round/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameCode: gameCode.value }),
    })
    return response.ok
  } catch (error) {
    console.error('Error starting the game:', error)
    return false
  }
}

const submitData = async () => {
  const fp = {}
  const mp = {}

  forecastRounds.value.forEach((item, idx) => {
    if (item.value.trim()) fp[`Round ${idx + 1}`] = item.value.trim()
  })
  milestoneRounds.value.forEach((item, idx) => {
    if (item.value.trim()) mp[`Round ${idx + 1}`] = item.value.trim()
  })

  try {
    const requests = []
    if (Object.keys(fp).length) {
      requests.push(
        axios.post('https://api-fastify-pi.vercel.app/game/addforecast', {
          gameCode: gameCode.value,
          ...fp
        })
      )
    }
    if (Object.keys(mp).length) {
      requests.push(
        axios.post('https://api-fastify-pi.vercel.app/game/addAchievement', {
          gameCode: gameCode.value,
          ...mp
        })
      )
    }
    await Promise.all(requests)
    router.push({ path: `/admin/${gameCode.value}` })
  } catch (e) {
    console.error(e)
    alert('Error: ' + (e.message || 'Unknown'))
  }
}
</script>

<style scoped>
input:focus {
  outline: none;
}
</style>
