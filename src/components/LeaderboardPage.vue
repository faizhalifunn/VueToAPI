<template>
  <div class="h-screen flex flex-col items-center justify-center bg-black relative">
    <!-- Tombol Back -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-500 transition hover:scale-105 shadow-md"
    >
      ← Back
    </button>

    <!-- Loading Screen -->
    <div v-if="isRefreshing" class="fixed inset-0 flex items-center justify-center bg-black text-white">
      <div class="text-center">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p class="text-lg font-semibold">Refreshing...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="bg-white rounded-2xl shadow-md p-6 w-full max-w-3xl z-10">
      <!-- Header -->
      <div class="bg-black text-white text-2xl font-bold py-2 px-4 rounded-t-lg flex justify-between items-center">
        <span>{{ round }}</span>
        <span class="text-lg font-medium">{{ gameCode }}</span>
      </div>



      <!-- Leaderboard Table -->
      <div class="bg-gray-200 p-2 rounded-lg shadow-md">
        <!-- <nav class="pb-2 ps-2">
  <ul class="flex justify-between text-gray-600 font-medium text-m px-2">
    <li><a href="#" @click="showComponent('leaderboard')" class="hover:text-blue-500">Leaderboard</a></li>
    <li><a href="#" @click="showComponent('chart')" class="hover:text-blue-500">Chart</a></li>
    <li><a href="#" @click="showComponent('round')" class="hover:text-blue-500">Round</a></li>
    <li><a href="#" @click="showComponent('info')" class="hover:text-blue-500">Info</a></li>
  </ul>
</nav> -->


        <div class="grid grid-cols-5 gap-4 text-sm font-bold text-gray-900 bg-gray-300 px-4 py-2 rounded-md border-b border-gray-400">
          <span class="text-left">Rank</span>
          <span class="text-left">Team Name</span>
          <span class="text-right">Contribution</span>
          <span class="text-right">Total Bintang</span>
          <span class="text-center"></span>
        </div>
        <div
          v-for="(team, index) in sortedLeaderboard"
          :key="index"
          class="grid grid-cols-5 gap-4 items-center bg-gray-300 px-4 py-2 rounded-lg mb-2"
        >
          <span class="font-semibold text-gray-700 text-left">{{ index + 1 }}</span>
          <span class="font-medium text-gray-700 text-left">{{ team.team || 'N/A' }}</span>
          <span class="font-mono text-gray-700 text-center">{{ formatNumber(team.data.ContributionPoint) }}</span>
          <span class="font-mono text-gray-700 text-center">{{ formatNumber(team.TotalBintang) }}</span>
          <button class="text-gray-700 font-bold text-center">•••</button>
        </div>
      </div>

      <!-- Chart -->
      <div class="bg-gray-200 p-6 rounded-lg shadow-md mt-4">
        <div v-if="isChartLoading" class="text-center py-4 font-semibold text-gray-700">Loading chart...</div>
        <canvas ref="chartCanvas" v-else class="w-full h-64"></canvas>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center space-x-4 mt-4 pt-5 gap-10">
        <button
          @click="showConfirmEndRoundModal = true"
          :disabled="isProcessing"
          class="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="isProcessing" class="loading-spinner mr-2"></span>
          <span>{{ isProcessing ? 'Processing...' : 'NEXT ROUND' }}</span>
        </button>
        <button
          @click="showConfirmEndGameModal = true"
          :disabled="isProcessing"
          class="text-white px-6 bg-red-900 py-2 rounded-lg font-medium hover:bg-gray-600 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="isProcessing" class="loading-spinner mr-2"></span>
          <span>{{ isProcessing ? 'Processing...' : 'END GAME' }}</span>
        </button>
      </div>
    </div>

    <!-- Confirm Next Round / End Game Modal -->
    <transition name="popup">
      <div v-if="showConfirmEndRoundModal || showConfirmEndGameModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-gray-800 opacity-50"></div>
        <div class="relative bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 z-10 transform transition-all text-neutral-600">
          <h3 class="text-xl font-semibold mb-4">
            {{ showConfirmEndRoundModal ? 'Konfirmasi Next Round' : 'Konfirmasi End Game' }}
          </h3>
          <p class="mb-6">
            {{ showConfirmEndRoundModal
              ? 'Apakah Anda yakin ingin melanjutkan ke ronde berikutnya?'
              : 'Apakah Anda yakin ingin mengakhiri game sekarang?' }}
          </p>
          <div class="flex justify-end space-x-4">
            <button @click="closeModals" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">
              Batal
            </button>
            <button
              @click="showConfirmEndRoundModal ? openInterestForm() : confirmEndGame()"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isProcessing"
            >
              <span v-if="isProcessing && !showInterestFormModal" class="loading-spinner mr-2"></span>
              <span>{{ isProcessing ? 'Processing...' : 'Ya' }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Interest Form Modal -->
    <transition name="popup">
      <div v-if="showInterestFormModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-gray-800 opacity-50"></div>
        <div class="relative bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 z-10 transform transition-all text-neutral-600">
          <h3 class="text-xl font-semibold mb-4">Submit Interest</h3>
          <form @submit.prevent="submitInterest">
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Bunga Konsumtif (%)</label>
              <input
                type="number"
                v-model.number="interest.ConInterest"
                class="w-full px-3 py-2 border rounded"
                placeholder="Masukkan bunga konsumtif"
                required
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Bunga Produktif (%)</label>
              <input
                type="number"
                v-model.number="interest.ProInterest"
                class="w-full px-3 py-2 border rounded"
                placeholder="Masukkan bunga produktif"
                required
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Bunga Kantor Pusat (%)</label>
              <input
                type="number"
                v-model.number="interest.HeadInterest"
                class="w-full px-3 py-2 border rounded"
                placeholder="Masukkan bunga kantor pusat"
                required
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Bunga Pihak Ketiga (%)</label>
              <input
                type="number"
                v-model.number="interest.OutInterest"
                class="w-full px-3 py-2 border rounded"
                placeholder="Masukkan bunga pihak ketiga"
                required
              />
            </div>
            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="closeModals"
                class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                :disabled="isProcessing"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isProcessing"
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isProcessing" class="loading-spinner mr-2"></span>
                <span>{{ isProcessing ? 'Submitting...' : 'Submit' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Chart from 'chart.js/auto';
import LeaderboardChart from './LeaderboardChart.vue';


export default {

  data() {
    return {
      currentComponent: 'leaderboard',  // Default component
    };
  },
  components: {
    LeaderboardChart,
  },
  methods: {
    showComponent(component) {
      this.currentComponent = component;
    }
  },

  name: 'AdminControlPage',
  setup() {
    const router = useRouter();
    const round = ref(1);
    const leaderboard = ref([]);
    const isProcessing = ref(false);
    const isRefreshing = ref(true);
    const gameCode = localStorage.getItem('gameCode');
    const chartCanvas = ref(null);
    let chartInstance = null;
    const isChartLoading = ref(true);

    // Modal state
    const showConfirmEndRoundModal = ref(false);
    const showConfirmEndGameModal = ref(false);
    const showInterestFormModal = ref(false);

    // Interest form data
    const interest = ref({
      gameCode,
      ConInterest: null,
      ProInterest: null,
      HeadInterest: null,
      OutInterest: null,
    });
    

    const goBack = () => router.go(-1);

    const fetchRoundData = async () => {
      if (!gameCode) return;
      try {
        const res = await fetch(`https://api-fastify-pi.vercel.app/round/getroundnow?gameCode=${gameCode}`);
        const data = await res.json();
        if (data.message === 'Highest rounds retrieved successfully.') {
          round.value = data.rounds[0]?.round || 1;
          leaderboard.value = data.rounds;
        }
      } catch (err) {
        console.error(err);
      } finally {
        isRefreshing.value = false;
      }
    };

    const openInterestForm = () => {
      showConfirmEndRoundModal.value = false;
      showInterestFormModal.value = true;
    };

    const submitInterest = async () => {
      isProcessing.value = true;
      try {
        await fetch('https://api-fastify-pi.vercel.app/game/addinterest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(interest.value),
        });
        showInterestFormModal.value = false;
        await confirmEndRound();
      } catch (err) {
        console.error(err);
      } finally {
        isProcessing.value = false;
      }
    };

    const confirmEndRound = async () => {
      isProcessing.value = true;
      try {
        await fetch('https://api-fastify-pi.vercel.app/round/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameCode }),
        });
        location.reload();
      } catch (err) {
        console.error(err);
      } finally {
        isProcessing.value = false;
      }
    };

    const confirmEndGame = async () => {
      isProcessing.value = true;
      try {
        await fetch('https://api-fastify-pi.vercel.app/Game/End', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameCode }),
        });
        router.push('/endResult');
      } catch (err) {
        console.error(err);
      } finally {
        isProcessing.value = false;
      }
    };

    const closeModals = () => {
      showConfirmEndRoundModal.value = false;
      showConfirmEndGameModal.value = false;
      showInterestFormModal.value = false;
    };

    const fetchChartData = async () => {
      try {
        const res = await fetch(`https://api-fastify-pi.vercel.app/game/result?gameCode=${gameCode}`);
        const data = await res.json();
        if (data.message === 'End result retrieved successfully.') {
          renderChart(data.teams);
        }
      } catch (err) {
        console.error(err);
      } finally {
        isChartLoading.value = false;
      }
    };

    const renderChart = (teams) => {
      if (!chartCanvas.value) return;
      if (chartInstance) chartInstance.destroy();
      const ctx = chartCanvas.value.getContext('2d');
      const datasets = teams.map(t => ({ label: t.team, data: t.rounds.map(r => r.ContributionPoint), borderColor: `hsl(${Math.random()*360},70%,50%)`, fill: false, tension: 0.3 }));
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: teams[0]?.rounds.map(r => r.round) || [], datasets },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Contribution Points' } }, x: { title: { display: true, text: 'Rounds' } } } }
      });
    };

    onMounted(() => {
      fetchRoundData();
      fetchChartData();
    });
    onBeforeUnmount(() => {
      if (chartInstance) chartInstance.destroy();
    });

    return {
      round,
      sortedLeaderboard: computed(() => leaderboard.value),
      formatNumber: num => num || 0,
      goBack,
      isProcessing,
      isRefreshing,
      showConfirmEndRoundModal,
      showConfirmEndGameModal,
      showInterestFormModal,
      openInterestForm,
      submitInterest,
      confirmEndGame,
      closeModals,
      interest,
      gameCode,
      chartCanvas,
      isChartLoading,
    };
  },
};
</script>

<style>
.loading-spinner {
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Popup animation */
.popup-enter-active, .popup-leave-active { transition: all 200ms ease; }
.popup-enter-from, .popup-leave-to { opacity: 0; transform: scale(0.9); }
.popup-enter-to, .popup-leave-from { opacity: 1; transform: scale(1); }
</style>
