<template>
  <div class="h-screen flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg text-neutral-800 relative">
      <h1 class="text-xl font-bold text-center mb-4">Game Created!</h1>

      <!-- Game Code Display -->
      <div class="bg-black text-white text-center py-2 rounded-lg mb-6">
        <span class="text-lg font-bold">{{ gameCode }}</span>
      </div>

      <!-- Forecast & Milestone Panels -->
      <div class="mb-6">
        <div class="flex space-x-4">
          <div class="flex-1">
            <h2 class="text-lg font-semibold mb-2">Forecast</h2>
            <div v-for="(item, idx) in forecastRounds" :key="idx" class="mb-2">
              <label class="text-sm">Round {{ idx + 1 }}</label>
              <input v-model="item.value" type="text" placeholder="Forecast..." class="w-full border px-3 py-2 rounded" />
            </div>
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-semibold mb-2">Milestone</h2>
            <div v-for="(item, idx) in milestoneRounds" :key="idx" class="mb-2">
              <label class="text-sm">Round {{ idx + 1 }}</label>
              <input v-model="item.value" type="text" placeholder="Milestone..." class="w-full border px-3 py-2 rounded" />
            </div>
          </div>
        </div>
        <div class="flex space-x-2 mt-4">
          <button @click="removeRound" :disabled="forecastRounds.length <= 1" class="flex-1 bg-red-300 py-2 rounded disabled:opacity-50">-</button>
          <button @click="addRound" class="flex-1 bg-green-300 py-2 rounded">+</button>
        </div>
      </div>

      <!-- Submit & Confirm -->
      <button @click="openConfirm" :disabled="isProcessing" class="w-full bg-black text-white py-3 rounded hover:bg-gray-800 disabled:opacity-50">
        <span v-if="isProcessing">Processing...</span>
        <span v-else>Submit &amp; Start Game</span>
      </button>

      <!-- Confirmation Modal -->
      <div v-if="showConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
          <h2 class="text-lg font-semibold mb-4 text-center">Confirm Submit</h2>
          <p class="mb-6 text-center">Submit interest before starting the game?</p>
          <div class="flex justify-between">
            <button @click="cancelConfirm" class="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button @click="openInterestForm" class="px-4 py-2 bg-blue-600 text-white rounded">Yes</button>
          </div>
        </div>
      </div>

      <!-- Interest Form Modal -->
      <div v-if="showInterest" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
          <h2 class="text-lg font-semibold mb-4 text-center">Submit Interest</h2>
          <div class="space-y-4">
            <div>
              <label>ConInterest (Bunga Konsumtif)</label>
              <input
                v-model.number="interest.conInterest"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                class="w-full border px-3 py-2 rounded"
                placeholder="0"
              />
            </div>
            <div>
              <label>ProInterest (Bunga Produktif)</label>
              <input
                v-model.number="interest.proInterest"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                class="w-full border px-3 py-2 rounded"
                placeholder="0"
              />
            </div>
            <div>
              <label>HeadInterest (Bunga Kantor Pusat)</label>
              <input
                v-model.number="interest.headInterest"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                class="w-full border px-3 py-2 rounded"
                placeholder="0"
              />
            </div>
            <div>
              <label>OutInterest (Bunga Pihak Ketiga)</label>
              <input
                v-model.number="interest.outInterest"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                class="w-full border px-3 py-2 rounded"
                placeholder="0"
              />
            </div>
          </div>
          <div class="flex justify-end mt-4">
            <button @click="cancelInterest" class="mr-2 px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button @click="submitInterest" :disabled="isProcessing" class="px-4 py-2 bg-green-600 text-white rounded">Submit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'GameCreatedModal',
  data() {
    return {
      gameCode: '',
      forecastRounds: [{ value: '' }, { value: '' }],
      milestoneRounds: [{ value: '' }, { value: '' }],
      interest: { conInterest: 0, proInterest: 0, headInterest: 0, outInterest: 0 },
      isProcessing: false,
      showConfirm: false,
      showInterest: false
    };
  },
  mounted() {
    const code = localStorage.getItem('gameCode');
    if (code) this.gameCode = code;
    else alert('gameCode not found');
  },
  methods: {
    addRound() {
      this.forecastRounds.push({ value: '' });
      this.milestoneRounds.push({ value: '' });
    },
    removeRound() {
      if (this.forecastRounds.length > 1) {
        this.forecastRounds.pop();
        this.milestoneRounds.pop();
      }
    },
    openConfirm() {
      this.showConfirm = true;
    },
    cancelConfirm() {
      this.showConfirm = false;
    },
    openInterestForm() {
      this.showConfirm = false;
      this.showInterest = true;
    },
    cancelInterest() {
      this.showInterest = false;
    },
    async submitInterest() {
      this.isProcessing = true;
      try {
        await axios.post('https://api-fastify-pi.vercel.app/game/addinterest', {
          gameCode: this.gameCode,
          ConInterest: this.interest.conInterest,
          ProInterest: this.interest.proInterest,
          HeadInterest: this.interest.headInterest,
          OutInterest: this.interest.outInterest
        });
        this.showInterest = false;
        await this.submitData();
      } catch (e) {
        console.error(e);
        alert('Error submitting interest');
      } finally {
        this.isProcessing = false;
      }
    },
    async submitData() {
      this.isProcessing = true;
      const fp = {};
      this.forecastRounds.forEach((item, idx) => {
        if (item.value.trim()) fp[`Round ${idx + 1}`] = item.value.trim();
      });
      const mp = {};
      this.milestoneRounds.forEach((item, idx) => {
        if (item.value.trim()) mp[`Round ${idx + 1}`] = item.value.trim();
      });
      try {
        const requests = [];
        if (Object.keys(fp).length) {
          requests.push(
            axios.post('https://api-fastify-pi.vercel.app/game/addforecast', { gameCode: this.gameCode, ...fp })
          );
        }
        if (Object.keys(mp).length) {
          requests.push(
            axios.post('https://api-fastify-pi.vercel.app/game/addmilestone', { gameCode: this.gameCode, ...mp })
          );
        }
        await Promise.all(requests);
        const roundStarted = await this.startGame();
        if (!roundStarted) throw new Error('Failed to start round');
        // Redirect to leaderboard route using path
        this.$router.push({ path: `/admin/${this.gameCode}` });
      } catch (e) {
        console.error(e);
        alert('Error: ' + (e.message || 'Unknown'));
      } finally {
        this.isProcessing = false;
      }
    },
    async startGame() {
      try {
        const response = await fetch("https://api-fastify-pi.vercel.app/round/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameCode: this.gameCode }),
        });
        return response.ok;
      } catch (error) {
        console.error("Error starting the game:", error);
        return false;
      }
    }
  }
};
</script>

<style>
/* No extra styles */
</style>
