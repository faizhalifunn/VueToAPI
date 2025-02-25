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

      <!-- Chart Wrapper -->
      <div class="chart-container mt-6">
        <canvas ref="chartCanvas"></canvas>
      </div>

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="text-center text-lg font-semibold mt-4">Loading...</div>

      <!-- Export Buttons -->
      <div class="mt-4 flex justify-center gap-4">
        
        <button
          @click="exportToExcel"
          class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition hover:scale-105 shadow-md"
        >
          📥 Export to Excel
        </button>
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

    // ✅ Generate Warna Acak untuk Setiap Tim
    const getRandomColor = () => {
      return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    };

    // ✅ Draw Chart (Detail lebih jelas, tidak gepeng)
    const drawChart = () => {
      if (!chartCanvas.value) return;

      if (chartInstance) {
        chartInstance.destroy();
      }

      const ctx = chartCanvas.value.getContext("2d");

      // Ambil semua round yang tersedia
      const allRounds = new Set();
      teams.value.forEach(team => {
        team.rounds.forEach(round => allRounds.add(round.round));
      });
      const sortedRounds = [...allRounds].sort();

      // Data untuk chart
      const datasets = teams.value.map(team => ({
        label: team.team,
        data: sortedRounds.map(round => {
          const roundData = team.rounds.find(r => r.round === round);
          return roundData ? roundData.ContributionPoint : 0;
        }),
        borderColor: getRandomColor(),
        borderWidth: 2,
        fill: false,
        tension: 0.3
      }));

      // Buat chart
      chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: sortedRounds,
          datasets: datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Contribution Points" },
            },
            x: {
              title: { display: true, text: "Rounds" },
            },
          },
        },
      });
    };

    // ✅ Export to Excel (dengan API)
    const exportToExcel = async () => {
      try {
        if (!gameCode) {
          alert("No game code found!");
          return;
        }

        // Panggil API untuk mendapatkan file Excel
        const response = await fetch(`https://api-fastify-pi.vercel.app/game/Excelresult?gameCode=${gameCode}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch Excel file from the server.");
        }

        // Konversi respons ke blob
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Buat elemen <a> untuk mengunduh file
        const a = document.createElement("a");
        a.href = url;
        a.download = `EndResult_${gameCode}.xlsx`;
        document.body.appendChild(a);
        a.click();

        // Hapus elemen <a> setelah unduhan
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert("Excel file downloaded successfully!");
      } catch (error) {
        console.error("Error exporting to Excel:", error);
        alert("Failed to export to Excel. Please try again.");
      }
    };

    // Fetch data saat halaman dimuat
    onMounted(fetchEndResult);

    return { gameCode, sortedTeams, formatNumber, isLoading, chartCanvas, goBack, exportToExcel };
  },
};
</script>

<style>
.chart-container {
  width: 100%;
  max-width: 700px;
  height: 450px;
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
