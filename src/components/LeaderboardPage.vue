<template>
  <div class="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#2C3E68] to-[#0D1B2A] text-white py-10 px-4 relative overflow-x-hidden">
    <!-- Tombol Back -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 bg-[#00A8C6] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2C3E68] transition hover:scale-105 shadow-md"
    >
      ← Back
    </button>

    <!-- Loading Screen -->
    <div v-if="isRefreshing" class="fixed inset-0 flex items-center justify-center bg-black text-white z-50">
      <div class="text-center">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p class="text-lg font-semibold">Refreshing...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-5xl z-10 flex flex-col gap-10 border border-white/20">
      <!-- Header -->
      <div class="bg-[#1C2541] text-white text-2xl font-bold py-2 px-4 rounded-t-lg flex justify-between items-center">
        <span>{{ round }}</span>
        <span class="text-lg font-medium">{{ gameCode }}</span>
      </div>

      <!-- Leaderboard Table -->
      <div class="bg-white/10 p-4 rounded-xl shadow-inner">
        <div class="grid grid-cols-5 gap-4 text-sm font-semibold text-white bg-[#00A8C6] px-4 py-3 rounded-t-md">
          <span class="text-left">Rank</span>
          <span class="text-left">Team Name</span>
          <span class="text-right">Contribution</span>
          <span class="text-right">Total Bintang</span>
          <span class="text-center">Action</span>
        </div>
        <div
          v-for="(team, index) in sortedLeaderboard"
          :key="index"
          class="grid grid-cols-5 gap-4 items-center bg-white text-[#1C2541] px-4 py-2 border-b border-gray-200 hover:bg-gray-100"
        >
          <span class="text-left">{{ index + 1 }}</span>
          <span class="text-left">{{ team.team || 'N/A' }}</span>
          <span class="text-right font-mono">{{ formatNumber(team.data.ContributionMargin) }}</span>
          <span class="text-right font-mono">{{ formatNumber(team.TotalBintang) }}</span>
          <button class="text-[#00A8C6] hover:text-[#2C3E68] font-bold text-center">...</button>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="bg-white/10 p-6 rounded-xl shadow-md overflow-hidden">
        <div v-if="isChartLoading" class="text-center py-4 font-semibold text-white">Loading chart...</div>
        <div v-else>
          <div v-if="!hasChartData" class="text-center py-4 text-gray-300">
            Belum ada data kontribusi untuk ditampilkan pada chart.
          </div>
          <canvas v-else ref="chartCanvas" class="w-full h-72"></canvas>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center flex-wrap gap-6">
        <button
          @click="showConfirmEndRoundModal = true"
          :disabled="isProcessing"
          class="bg-[#00A8C6] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#2C3E68] shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="isProcessing" class="loading-spinner mr-2"></span>
          <span>{{ isProcessing ? '' : 'NEXT ROUND' }}</span>
        </button>
        <button
          @click="showConfirmEndGameModal = true"
          :disabled="isProcessing"
          class="bg-red-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700 shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="isProcessing" class="loading-spinner mr-2"></span>
          <span>{{ isProcessing ? '' : 'END GAME' }}</span>
        </button>
      </div>
    </div>

    <!-- Confirm Modal -->
    <transition name="popup">
      <div v-if="showConfirmEndRoundModal || showConfirmEndGameModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-gray-800 opacity-50"></div>
        <div class="relative bg-white text-black rounded-xl shadow-lg w-[90%] max-w-md p-6 z-10 transform transition-all">
          <h3 class="text-xl font-bold mb-3">
            {{ showConfirmEndRoundModal ? 'Konfirmasi Next Round' : 'Konfirmasi End Game' }}
          </h3>
          <p class="mb-6 text-sm">
            {{ showConfirmEndRoundModal
              ? 'Apakah Anda yakin ingin melanjutkan ke ronde berikutnya?'
              : 'Apakah Anda yakin ingin mengakhiri game sekarang?' }}
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="closeModals" class="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300">
              Batal
            </button>
            <button
              @click="showConfirmEndRoundModal ? openInterestForm() : confirmEndGame()"
              class="px-4 py-2 text-sm bg-[#00A8C6] text-white rounded-md hover:bg-[#2C3E68] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              :disabled="isProcessing"
            >
              <span v-if="isProcessing && !showInterestFormModal" class="loading-spinner"></span>
              <span v-if="!isProcessing">Ya</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import Chart from 'chart.js/auto';

const router = useRouter();
const round = ref(1);
const leaderboard = ref([]);
const isProcessing = ref(false);
isProcessing.value = false;
const isRefreshing = ref(true);
const gameCode = localStorage.getItem('gameCode');
const chartCanvas = ref(null);
let chartInstance = null;
const isChartLoading = ref(true);
const hasChartData = ref(false);
const showConfirmEndRoundModal = ref(false);
const showConfirmEndGameModal = ref(false);
const showInterestFormModal = ref(false);

const interest = ref({
  gameCode,
  ConsumptiveInterest: null,
  ProductiveInterest: null,
  InterOfficeInterest: null,
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
    console.error('❌ Error fetchRoundData:', err);
  } finally {
    isRefreshing.value = false;
  }
};

const fetchChartData = async () => {
  try {
    const res = await fetch(`https://api-fastify-pi.vercel.app/game/result?gameCode=${gameCode}`);
    const data = await res.json();
    const teams = data.teams;
    const hasValidData = Array.isArray(teams) && teams.length > 0 && Array.isArray(teams[0].rounds) && teams[0].rounds.length > 0;
    if (hasValidData) {
      hasChartData.value = true;
      await nextTick();
      setTimeout(() => renderChart(teams), 0);
    } else {
      hasChartData.value = false;
    }
  } catch (err) {
    console.error('❌ Error fetchChartData:', err);
  } finally {
    isChartLoading.value = false;
  }
};

const renderChart = (teams) => {
  if (!chartCanvas.value) return;
  if (chartInstance) chartInstance.destroy();
  const ctx = chartCanvas.value.getContext('2d');
  const datasets = teams.map(t => ({
    label: t.team,
    data: t.rounds.map(r => Number(r.ContributionMargin) || 0),
    borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
    fill: false,
    tension: 0.3,
  }));
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: teams[0].rounds.map(r => `R${r.round}`),
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Contribution Points' } },
        x: { title: { display: true, text: 'Rounds' } },
      },
    },
  });
};

const openInterestForm = () => {
  showConfirmEndRoundModal.value = false;
  showInterestFormModal.value = true;
};

const submitInterest = async () => {
  const { ConsumptiveInterest, ProductiveInterest, InterOfficeInterest, OutInterest } = interest.value;
  if ([ConsumptiveInterest, ProductiveInterest, InterOfficeInterest, OutInterest].some(val => val < 0)) {
    alert("Nilai bunga tidak boleh negatif.");
    return;
  }
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
    console.error('❌ Error submitInterest:', err);
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
    console.error('❌ Error confirmEndRound:', err);
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
    console.error('❌ Error confirmEndGame:', err);
  } finally {
    isProcessing.value = false;
  }
};

const closeModals = () => {
  showConfirmEndRoundModal.value = false;
  showConfirmEndGameModal.value = false;
  showInterestFormModal.value = false;
};

onMounted(() => {
  fetchRoundData();
  fetchChartData();
});

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy();
});

const sortedLeaderboard = computed(() => leaderboard.value);
const formatNumber = num => num || 0;
</script>

<style scoped>
.loading-spinner {
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.popup-enter-active,
.popup-leave-active {
  transition: all 0.2s ease;
}
.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.popup-enter-to,
.popup-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
