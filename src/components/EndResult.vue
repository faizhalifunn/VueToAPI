<template>
  <div class="h-screen flex items-center justify-center bg-black relative text-gray-800">
    <!-- 🔙 Tombol Back Berwarna Merah -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-500 transition hover:scale-105 shadow-md"
    >
      ← Back
    </button>

    <div class="bg-gray-200 rounded-2xl shadow-md p-6 w-full max-w-3xl">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">End Result</h2>
        <h2 class="text-2xl font-bold">{{ gameCode }}</h2>
      </div>

      <!-- Table -->
      <div class="border-t border-black">
        <div class="grid grid-cols-[1fr_2fr_2fr_1fr_2fr] gap-2 text-sm font-medium text-gray-950 py-2 border-b border-black">
          <span>Rank</span>
          <span>Team Name</span>
          <span>Contribution Point</span>
          <span>Star</span>
          <span>End Score</span>
        </div>

        <!-- List Teams -->
        <div
          v-for="(team, index) in sortedTeams"
          :key="index"
          class="grid grid-cols-[1fr_2fr_2fr_1fr_2fr] gap-2 items-center py-2 border-b border-black text-center"
        >
          <span class="font-semibold">{{ index + 1 }}</span>
          <span class="font-medium">{{ team.team || "N/A" }}</span>
          <span class="font-mono">{{ formatNumber(team.endResult.TotalContributionPoint) }}</span>
          <span class="font-mono">{{ formatNumber(team.endResult.TotalBintang) }}</span>
          <span class="font-mono font-bold">{{ formatNumber(team.endResult.TotalScore) }}</span>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="text-center text-lg font-semibold mt-4">Loading...</div>

      <!-- Chart Wrapper -->
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";

export default {
  name: "EndResultPage",
  setup() {
    const router = useRouter();
    const gameCode = localStorage.getItem("gameCode");
    const teams = ref([]);
    const isLoading = ref(true);
    const chartCanvas = ref(null);
    let chartInstance = null;

    // ✅ Fungsi kembali ke halaman sebelumnya
    const goBack = () => {
      router.go(-1);
    };

    // ✅ Fetch End Result Data
    const fetchEndResult = async () => {
      if (!gameCode) {
        alert("No game code found. Redirecting...");
        window.location.href = "/";
        return;
      }

      try {
        const response = await fetch(`https://api-fastify-pi.vercel.app/game/result?gameCode=${gameCode}`);
        const data = await response.json();

        if (data.message === "End result retrieved successfully.") {
          teams.value = data.teams || [];
          drawChart();
        } else {
          alert("Failed to fetch end result data.");
        }
      } catch (error) {
        console.error("Error fetching end result:", error);
        alert("An error occurred while fetching end result.");
      } finally {
        isLoading.value = false;
      }
    };

    // ✅ Format number
    const formatNumber = (num) => {
      return num ? num.toLocaleString("en-US") : "0"; // Format angka lebih rapi
    };

    // ✅ Sorting Leaderboard dari skor tertinggi ke terendah
    const sortedTeams = computed(() => {
      return [...teams.value].sort((a, b) => {
        return (b.endResult.TotalScore || 0) - (a.endResult.TotalScore || 0);
      });
    });

    // ✅ Draw Chart (Perubahan Contribution Point per Round)
    const drawChart = () => {
      if (!chartCanvas.value) return;

      if (chartInstance) {
        chartInstance.destroy(); // Hapus chart sebelumnya jika ada
      }

      const ctx = chartCanvas.value.getContext("2d");

      // Ambil semua round yang tersedia
      const allRounds = new Set();
      teams.value.forEach(team => {
        team.rounds.forEach(round => allRounds.add(round.round));
      });
      const sortedRounds = [...allRounds].sort(); // Urutkan round

      // Data untuk chart
      const datasets = teams.value.map(team => {
        return {
          label: team.team,
          data: sortedRounds.map(round => {
            const roundData = team.rounds.find(r => r.round === round);
            return roundData ? roundData.ContributionPoint : 0;
          }),
          borderColor: getRandomColor(),
          borderWidth: 2,
          fill: false,
          tension: 0.1
        };
      });

      // Buat chart
      chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: sortedRounds, // Label sumbu X (Round 1, Round 2, dst.)
          datasets: datasets, // Data per tim
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Contribution Points",
              },
            },
            x: {
              title: {
                display: true,
                text: "Rounds",
              },
            },
          },
        },
      });
    };

    // ✅ Generate Warna Acak untuk Setiap Tim
    const getRandomColor = () => {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    // Fetch data ketika halaman dimuat
    onMounted(fetchEndResult);

    return { gameCode, sortedTeams, formatNumber, isLoading, chartCanvas, goBack };
  },
};
</script>

<style>
/* 🔥 Pastikan Chart Tidak Membesar Tanpa Batas */
.chart-container {
  width: 100%;
  max-width: 600px; /* Ukuran maksimal chart */
  height: 400px; /* Tetapkan tinggi agar tidak membesar terus */
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
