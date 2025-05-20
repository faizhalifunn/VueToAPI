<template>
  <div class="min-h-screen flex flex-col items-center bg-black py-10 px-4 relative overflow-x-hidden">
    <!-- Tombol Back -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-500 transition hover:scale-105 shadow-md"
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
    <div v-else class="bg-white rounded-2xl shadow-md p-8 w-full max-w-5xl z-10 flex flex-col gap-10">
      <!-- Header -->
      <div class="bg-black text-white text-2xl font-bold py-2 px-4 rounded-t-lg flex justify-between items-center">
        <span>{{ round }}</span>
        <span class="text-lg font-medium">{{ gameCode }}</span>
      </div>

      <!-- Leaderboard Table -->
      <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
        <div class="grid grid-cols-5 gap-4 text-sm font-semibold text-white bg-gray-600 px-4 py-3 rounded-t-md">
          <span class="text-left">Rank</span>
          <span class="text-left">Team Name</span>
          <span class="text-right">Contribution</span>
          <span class="text-right">Total Bintang</span>
          <span class="text-center">Action</span>
        </div>
        <div
          v-for="(team, index) in sortedLeaderboard"
          :key="index"
          class="grid grid-cols-5 gap-4 items-center bg-white px-4 py-2 border-b border-gray-200 hover:bg-gray-100"
        >
          <span class="text-gray-800 text-left">{{ index + 1 }}</span>
          <span class="text-gray-800 text-left">{{ team.team || 'N/A' }}</span>
          <span class="text-gray-800 text-right font-mono">{{ formatNumber(team.data.ContributionPoint) }}</span>
          <span class="text-gray-800 text-right font-mono">{{ formatNumber(team.TotalBintang) }}</span>
          <button class="text-gray-500 hover:text-black transition font-bold text-center">•••</button>
        </div>
      </div>

      <!-- Chart -->
      <div class="bg-gray-100 p-6 rounded-lg shadow-md overflow-hidden">
  <div v-if="isChartLoading" class="text-center py-4 font-semibold text-gray-700">Loading chart...</div>
  <div v-else>
    <div v-if="!hasChartData" class="text-center py-4 text-gray-500">
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
          class="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="isProcessing" class="loading-spinner mr-2"></span>
          <span>{{ isProcessing ? 'Processing...' : 'NEXT ROUND' }}</span>
        </button>
        <button
          @click="showConfirmEndGameModal = true"
          :disabled="isProcessing"
          class="text-white px-8 py-3 bg-red-700 rounded-lg font-semibold hover:bg-red-800 shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
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
        <div class="relative bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 z-10 transform transition-all text-neutral-700">
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
              class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div class="relative bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 z-10 transform transition-all text-neutral-600 space-y-4">
          <h3 class="text-xl font-semibold">Submit Interest</h3>
          <form @submit.prevent="submitInterest">
            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">Bunga Konsumtif (%)</label>
              <input
                type="number"
                min="0"
                v-model.number="interest.ConInterest"
                :class="['w-full px-3 py-2 border rounded', interest.ConInterest < 0 ? 'border-red-500' : '']"
                placeholder="Masukkan bunga konsumtif"
                required
              />
            </div>
            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">Bunga Produktif (%)</label>
              <input
                type="number"
                min="0"
                v-model.number="interest.ProInterest"
                :class="['w-full px-3 py-2 border rounded', interest.ProInterest < 0 ? 'border-red-500' : '']"
                placeholder="Masukkan bunga produktif"
                required
              />
            </div>
            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">Bunga Kantor Pusat (%)</label>
              <input
                type="number"
                min="0"
                v-model.number="interest.HeadInterest"
                :class="['w-full px-3 py-2 border rounded', interest.HeadInterest < 0 ? 'border-red-500' : '']"
                placeholder="Masukkan bunga kantor pusat"
                required
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Bunga Pihak Ketiga (%)</label>
              <input
                type="number"
                min="0"
                v-model.number="interest.OutInterest"
                :class="['w-full px-3 py-2 border rounded', interest.OutInterest < 0 ? 'border-red-500' : '']"
                placeholder="Masukkan bunga pihak ketiga"
                required
              />
            </div>
            <div class="flex justify-end gap-3 mt-6">
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

<style>
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
  transition: all 200ms ease;
}
.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.popup-enter-to,
.popup-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>

<script>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import Chart from 'chart.js/auto';

export default {
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
    const hasChartData = ref(false);

    const showConfirmEndRoundModal = ref(false);
    const showConfirmEndGameModal = ref(false);
    const showInterestFormModal = ref(false);

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
        console.error('❌ Error fetchRoundData:', err);
      } finally {
        isRefreshing.value = false;
      }
    };

    const openInterestForm = () => {
      showConfirmEndRoundModal.value = false;
      showInterestFormModal.value = true;
    };

    const submitInterest = async () => {
      const { ConInterest, ProInterest, HeadInterest, OutInterest } = interest.value;
      if (
        ConInterest < 0 || ProInterest < 0 || HeadInterest < 0 || OutInterest < 0
      ) {
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

    const fetchChartData = async () => {
      try {
        const res = await fetch(`https://api-fastify-pi.vercel.app/game/result?gameCode=${gameCode}`);
        const data = await res.json();
        console.log("📦 DATA TEAMS:", data.teams);

        const valid = data.message === 'End result retrieved successfully.' &&
                      data.teams.length &&
                      data.teams[0].rounds?.length;

        if (valid) {
          hasChartData.value = true;
          await nextTick();
          renderChart(data.teams);
        } else {
          console.warn("❌ Tidak ada data yang valid untuk chart");
        }
      } catch (err) {
        console.error("❌ Error fetchChartData:", err);
      } finally {
        isChartLoading.value = false;
      }
    };

    const renderChart = (teams) => {
      console.log("🎯 chartCanvas.value =", chartCanvas.value);
      if (!teams.length || !teams[0].rounds || !teams[0].rounds.length) {
        console.warn("❌ Tidak ada data rounds valid untuk chart.");
        return;
      }
      if (!chartCanvas.value) {
        console.error("❌ Canvas belum tersedia!");
        return;
      }
      if (chartInstance) chartInstance.destroy();

      const ctx = chartCanvas.value.getContext('2d');
      const datasets = teams.map(t => ({
        label: t.team,
        data: t.rounds.map(r => Number(r.ContributionPoint) || 0),
        borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
        fill: false,
        tension: 0.3,
      }));

      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: teams[0]?.rounds.map(r => r.round) || [],
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Contribution Points' },
            },
            x: {
              title: { display: true, text: 'Rounds' },
            },
          },
        },
      });

      console.log("✅ Chart berhasil dirender!");
    };

    onMounted(() => {
      fetchRoundData();
      fetchChartData();
    });

    onBeforeUnmount(() => {
      if (chartInstance) chartInstance.destroy();
    });

    return {
      hasChartData,
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
