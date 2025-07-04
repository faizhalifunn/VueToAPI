
<template>
  <div class="min-h-screen  flex flex-col items-center bg-gradient-to-br from-[#2C3E68] to-[#0D1B2A] text-white py-12 px-4 relative overflow-x-hidden">
    <!-- Tombol Back -->
    <!-- <button
      @click="goBack"
      class="absolute top-4 left-4 bg-[#00A8C6] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2C3E68] transition hover:scale-105 shadow-md"
    >
      ← Back
    </button> -->

    <!-- Loading Screen -->
    <div v-if="isRefreshing" class="fixed inset-0 flex items-center justify-center bg-black text-white z-50">
      <div class="text-center">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p class="text-lg font-semibold">Refreshing...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-fit z-10 flex flex-col gap-10 border border-white/20">
      <!-- Header -->
      <div class="bg-[#1C2541] text-white text-2xl font-bold py-2 px-4 rounded-t-lg flex justify-between items-center">
        <span>{{ round }}</span>
        <span class="text-lg font-medium">{{ gameCode }}</span>
      </div>

      <!-- Leaderboard Table -->
      <div class="bg-white/10 p-2 rounded-xl shadow-md inset-shadow-2xs overflow-hidden">
        <div class="grid grid-cols-12 gap-3 items-stretch text-sm font-semibold text-white bg-[#00A8C6] px-1 py-2 rounded-t-md">
          <span class="text-center">No.</span>
          <span class="text-center">Team Name</span>
          <span class="text-center">Consumer Loan</span>
          <span class="text-center">Productive Loan</span>
          <span class="text-center">Fund</span>
          <span class="text-center">Total Salary</span>
          <span class="text-center">Marketing Cost</span>
          <span class="text-center">Net Interest Margin</span>
          <span class="text-center">Cost Efficiency Ratio</span>
          <span class="text-center">CM/Employee</span>
          <span class="text-center">Contribution Margin</span>
          <span class="text-center">Achievement Stars (total)</span>
        </div>
        <div
          v-for="(team, index) in sortedLeaderboard"
          :key="index"
          class="grid grid-cols-12 gap-3 items-stretch bg-white text-[#1C2541] px-1 py-2 border-b border-gray-200 rounded-t-md hover:bg-gray-100"
        >
          <span class="text-center">{{ index + 1 }}</span>
          <span class="text-center">{{ team.team || 'N/A' }}</span>
          <span class="text-center font-mono">{{ formatNumber(team.data.ConsumerLoan) }}</span>
          <span class="text-center font-mono">{{ formatNumber(team.data.ProductiveLoan) }}</span>
          <span class="text-center font-mono">{{ formatNumber(team.data.Fund) }}</span>
          <span class="text-center font-mono">{{ formatNumber(team.data.TotalSalary) }}</span>
          <span class="text-center font-mono">{{ formatNumber(team.data.MarketingCost) }}</span>
          <span class="text-center font-mono">{{ formatPercent(team.data.NetInterestMargin) }}</span>
          <span class="text-center font-mono">{{ formatPercent(team.data.CostEfficiencyRatio) }}</span>
          <span class="text-center font-mono">{{ formatNumber(team.data.CMPerEmployee) }}</span>
          <span class="text-center font-mono">{{ formatNumber(team.data.ContributionMargin) }}</span>
          <span class="text-center font-mono">{{ formatNumber(team.TotalAchievementStar) }}</span>
        </div>
      </div>

      <transition name="popup">
  <div v-if="showConfirmEndRoundModal" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black opacity-60 backdrop-blur-md"></div>
    <div class="relative bg-white text-black rounded-xl shadow-lg w-[90%] max-w-md p-6 z-10">
      <h3 class="text-xl font-bold mb-4 text-center">Lanjut ke Next Round?</h3>
      <div class="flex justify-end gap-3">
        <button @click="closeModals" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
        <button
          @click="confirmEndRound"
          class="px-4 py-2 bg-[#00A8C6] text-white rounded hover:bg-[#2C3E68] disabled:opacity-50"
          :disabled="isProcessing"
        >
          {{ isProcessing ? 'Processing...' : 'Confirm' }}
        </button>
      </div>
    </div>
  </div>
</transition>

<!-- Achievement & Forecast -->
<div class="bg-white/10 p-4 rounded-xl inset-shadow-xs shadow-md overflow-hidden text-[#1C2541]">
  <div v-if="isForecastLoading" class="text-center font-semibold text-black">
    Loading achievement & forecast...
  </div>
  <div v-else class="grid grid-cols-2 gap-4 text-gray-600">
    <div>
      <h4 class="text-lg font-semibold">Achievement</h4>
      <p>{{ achievement || '-' }}</p>
    </div>
    <div>
      <h4 class="text-lg font-semibold">Forecast</h4>
      <p>{{ forecast || '-' }}</p>
    </div>
  </div>
</div>

      <!-- Chart Section -->
      <div class="bg-white/10 p-6 rounded-xl inset-shadow-xs shadow-md overflow-hidden">
        <div v-if="isChartLoading" class="text-center py-4 font-semibold text-white">Loading chart...</div>
        <div v-else>
          <div v-if="!hasChartData" class="text-center py-4 text-gray-300">
            Belum ada data kontribusi untuk ditampilkan pada chart.
          </div>
          <canvas v-else ref="chartCanvas" class="w-full h-72"></canvas>
        </div>
      </div>

      <div class="text-center text-gray-600/60 mt-4 bg-yellow-600/20 p-4 rounded-lg shadow-md">
        <h3>
          Refresh Page untuk menampilkan data team terbaru !
        </h3>
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
        @click="prepareActiveCustomerInput"
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
  <div v-if="showInputCustomerModal" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black opacity-60 backdrop-blur-md"></div>
    <div class="relative bg-white text-black rounded-xl shadow-lg w-[90%] max-w-2xl p-6 z-10 overflow-y-auto max-h-[80vh]">
      <h3 class="text-xl font-bold mb-4 text-center">Input Active Customers</h3>
      <div v-for="(team, index) in teamInputs" :key="index" class="mb-4">
        <label class="block font-semibold mb-1">{{ team.teamName }}</label>
        <input
          v-model.number="teamInputs[index].activeCustomer"
          type="number"
          placeholder="Jumlah Active Customers"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#00A8C6]"
        />
      </div>
      <div class="flex justify-end gap-3 mt-4">
        <button @click="closeModals" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
        <button
          @click="submitAllCustomers"
          class="px-4 py-2 bg-[#00A8C6] text-white rounded hover:bg-[#2C3E68] disabled:opacity-50"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit & End Game' }}
        </button>
      </div>
    </div>
  </div>
</transition>


    <!-- Active Customer Input Modal -->
    <!-- <transition name="popup">
      <div v-if="showInputCustomerModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black opacity-60 backdrop-blur-md"></div>
        <div class="relative bg-white text-black rounded-xl shadow-lg w-[90%] max-w-md p-6 z-10">
          <h3 class="text-xl font-bold mb-4 text-center">Input Active Customer</h3>
          <div class="mb-4">
            <label class="block font-semibold mb-1">Team Name</label>
            <input
              v-model="teamName"
              type="text"
              placeholder="Team name"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#00A8C6]"
            />
          </div>
          <div class="mb-4">
            <label class="block font-semibold mb-1">Active Customer</label>
            <input
              v-model.number="activeCustomers"
              type="number"
              placeholder="Enter number"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#00A8C6]"
            />
          </div>
          <div class="flex justify-end gap-3">
            <button @click="closeModals" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            <button
              @click="submitCustomer"
              class="px-4 py-2 bg-[#00A8C6] text-white rounded hover:bg-[#2C3E68] disabled:opacity-50"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Submitting...' : 'Submit' }}
            </button>
          </div>
        </div>
      </div>
    </transition> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import Chart from 'chart.js/auto';

import { watch } from 'vue';

// … existing refs …
const achievement = ref('');
const forecast    = ref('');
const isForecastLoading = ref(true);

// Fungsi untuk fetch Achievement & Forecast
const fetchForecastAchievement = async () => {
  if (!gameCode || !round.value) return;
  isForecastLoading.value = true;
  try {
    const url = `https://api-fastify-pi.vercel.app/game/forecastAchievementbyround?gameCode=${gameCode}&round=${encodeURIComponent(round.value)}`;
    const res = await fetch(url);
    const data = await res.json();
    achievement.value = data.Achievement;
    forecast.value    = data.Forecast;
  } catch (err) {
    console.error('❌ Error fetchForecastAchievement:', err);
  } finally {
    isForecastLoading.value = false;
  }
};


const router = useRouter();
const round = ref(1);
const leaderboard = ref([]);
const isProcessing = ref(false);
const isRefreshing = ref(true);
const gameCode = localStorage.getItem('gameCode');
const chartCanvas = ref(null);
let chartInstance = null;
const isChartLoading = ref(true);
const hasChartData = ref(false);
const teamInputs = ref([]);

// ✅ Tambahan yang sebelumnya hilang

const showConfirmEndGameModal = ref(false);
const showInputCustomerModal = ref(false);
const teamName = ref('');
const activeCustomers = ref(null);
const isSubmitting = ref(false);
const showConfirmEndRoundModal = ref(false);


const goBack = () => router.go(-1);

const prepareActiveCustomerInput = () => {
  teamInputs.value = leaderboard.value.map(team => ({
    teamName: team.team,
    activeCustomer: 0
  }));
  showInputCustomerModal.value = true;
};


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
      labels: teams[0].rounds.map(r => `${r.round}`),
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Contribution Margin' } },
        x: { title: { display: true, text: 'Rounds' } },
      },
    },
  });
};

const confirmEndRound = async () => {
  console.log('🔁 Memulai end round...');
  isProcessing.value = true;
  try {
    const res = await fetch('https://api-fastify-pi.vercel.app/round/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameCode }),
    });
    const data = await res.json();
    console.log('✅ Response end round:', data);
    location.reload();
  } catch (err) {
    console.error('❌ Error confirmEndRound:', err);
  } finally {
    isProcessing.value = false;
    closeModals();
  }
};


const confirmEndGame = async () => {
  isProcessing.value = true;
  try {
    await fetch('https://api-fastify-pi.vercel.app/Game/NewEnd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameCode }),
    });
    router.push('/endResult');
  } catch (err) {
    console.error('❌ Error confirmEndGame:', err);
  } finally {
    isProcessing.value = false;
    closeModals();
  }
};

const submitAllCustomers = async () => {
  isSubmitting.value = true;
  try {
    for (const input of teamInputs.value) {
      await fetch('https://api-fastify-pi.vercel.app/game/addActiveCustomers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameCode,
          teamName: input.teamName,
          ActiveCustomers: input.activeCustomer
        }),
      });
    }
    closeModals();
    confirmEndGame(); // lanjut ke end game setelah submit semua
  } catch (err) {
    console.error('❌ Error submitAllCustomers:', err);
  } finally {
    isSubmitting.value = false;
  }
};


const submitCustomer = async () => {
  isSubmitting.value = true;
  try {
    await fetch('https://api-fastify-pi.vercel.app/game/inputCustomers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameCode, team: teamName.value, activeCustomer: activeCustomer.value }),
    });
    location.reload();
  } catch (err) {
    console.error('❌ Error submitCustomer:', err);
  } finally {
    isSubmitting.value = false;
    closeModals();
  }
};

const formatPercent = (value) => {
  return value != null ? value.toFixed(1) + " %" : "-";
};

const closeModals = () => {
  showConfirmEndGameModal.value = false;
  showConfirmEndRoundModal.value = false;
  showInputCustomerModal.value = false;
};


onMounted(() => {
  fetchRoundData();
  fetchChartData();
});

watch(round, (newRound) => {
  if (newRound) fetchForecastAchievement();
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
