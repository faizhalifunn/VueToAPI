<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2C3E68] to-[#0D1B2A] px-4 py-12 relative font-sans">
    <div class="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-2xl text-white border border-white/20">
      <h1 class="text-2xl font-bold text-center mb-6">Game Created!</h1>

      <div class="bg-white text-[#0D1B2A] text-center py-2 rounded-lg mb-8 shadow">
        <span class="text-xl tracking-widest font-mono font-bold">{{ gameCode }}</span>
      </div>

      <!-- Form Forecast & Achievement -->
      <div class="mb-6">
        <div class="flex flex-col md:flex-row gap-6">
          <div class="flex-1">
            <h2 class="text-lg font-semibold mb-2 text-center">Forecast</h2>
            <div v-for="(item, idx) in forecastRounds" :key="idx" class="mb-3">
              <label class="text-sm block mb-1 text-center">Round {{ idx + 1 }}</label>
              <input v-model="item.value" type="text" placeholder="Forecast..." class="w-full px-3 py-2 bg-white/80 rounded-lg text-[#0D1B2A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8C6] transition" />
            </div>
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-semibold mb-2 text-center">Achievement</h2>
            <div v-for="(item, idx) in milestoneRounds" :key="idx" class="mb-3">
              <label class="text-sm block mb-1 text-center">Round {{ idx + 1 }}</label>
              <input v-model="item.value" type="text" placeholder="Achievement..." class="w-full px-3 py-2 bg-white/80 rounded-lg text-[#0D1B2A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8C6] transition" />
            </div>
          </div>
        </div>

        <!-- Round Controls -->
        <div class="flex justify-center items-center gap-56 mt-4">
          <span @click="removeRound" :class="['text-sm font-medium cursor-pointer transition text-red-400', forecastRounds.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-500']">
            Remove Round
          </span>
          <span @click="addRound" class="text-green-400 text-sm font-medium cursor-pointer hover:text-green-500 transition">
            Add Round
          </span>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="mt-10">
        <button @click="openConfirm" :disabled="isProcessing" class="w-full bg-gradient-to-r from-[#00A8C6] to-[#78FFE4] text-[#0D1B2A] py-3 rounded-md text-lg font-semibold shadow-md hover:scale-105 hover:shadow-xl transition-all duration-200 disabled:opacity-50">
          <span v-if="isProcessing">Processing...</span>
          <span v-else>Submit & Start Game</span>
        </button>
      </div>

      <!-- Confirm Modal -->
      <div v-if="showConfirm" class="fixed inset-0 flex items-center justify-center p-4 z-50 bg-gradient-to-br from-[#2C3E68]/80 to-[#0D1B2A]/80">
        <div class="bg-white/90 backdrop-blur-xl text-[#0D1B2A] rounded-2xl shadow-xl p-6 w-full max-w-sm border border-white/20">
          <h2 class="text-lg font-semibold mb-4 text-center">Confirm Submit</h2>
          <p class="mb-6 text-center">Submit interest before starting the game?</p>
          <div class="flex justify-center gap-6">
            <span @click="cancelConfirm" class="text-sm font-semibold text-[#00A8C6] cursor-pointer hover:text-red-500 transition">Cancel</span>
            <span @click="openInterestForm" class="text-sm font-semibold text-[#00A8C6] cursor-pointer hover:text-green-500 transition">Yes</span>
          </div>
        </div>
      </div>

      <!-- Interest Modal -->
      <div v-if="showInterest" class="fixed inset-0 flex items-center justify-center p-4 z-50 bg-gradient-to-br from-[#2C3E68]/80 to-[#0D1B2A]/80">
        <div class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl px-8 py-10 w-full max-w-lg text-[#0D1B2A] border border-white/20">
          <h2 class="text-xl font-semibold mb-6 text-center">Submit Interest</h2>
          <div class="space-y-5">
            <div v-for="(label, key) in interestLabels" :key="key">
              <label class="block text-sm font-medium mb-1">{{ label }}</label>
              <input v-model="interest[key]" type="text" placeholder="Masukkan nilai" class="w-full border border-gray-300 px-4 py-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8C6]" />
            </div>
          </div>
          <div class="flex justify-end mt-8 gap-6">
            <span @click="cancelInterest" class="text-sm font-semibold text-[#00A8C6] cursor-pointer hover:text-red-500 transition">Cancel</span>
            <span @click="submitInterest" :class="['text-sm font-semibold cursor-pointer transition', isProcessing ? 'opacity-50 cursor-not-allowed' : 'text-[#00A8C6] hover:text-green-500']">Submit</span>
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
  ConsumerInterest: '',
  ProductiveInterest: '',
  InterOfficeInterest: '',
  FundInterest: ''
})

const interestLabels = {
  ConsumerInterest: 'ConsumerInterest (Bunga Konsumtif)',
  ProductiveInterest: 'ProductiveInterest (Bunga Produktif)',
  InterOfficeInterest: 'InterOfficeInterest (Bunga Kantor Pusat)',
  FundInterest: 'FundInterest (Bunga Pihak Ketiga)'
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

const openConfirm = () => (showConfirm.value = true)
const cancelConfirm = () => (showConfirm.value = false)
const openInterestForm = () => {
  showConfirm.value = false
  showInterest.value = true
}
const cancelInterest = () => (showInterest.value = false)

const submitInterest = async () => {
  isProcessing.value = true
  try {
    await axios.post('https://api-fastify-pi.vercel.app/game/addinterest', {
      gameCode: gameCode.value,
      ...interest.value
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
      body: JSON.stringify({ gameCode: gameCode.value })
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
