<template>
  <div class="min-h-screen flex items-center justify-center bg-black relative text-gray-800 py-16">
    <!-- Back Button -->
    <button
      @click="goBack"
      class="fixed top-4 left-4 z-10 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-500 transition hover:scale-105 shadow-md"
    >
      ← Back
    </button>

    <div class="bg-gray-200 rounded-2xl shadow-md p-6 w-full max-w-5xl mx-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Game Results</h2>
        <h2 class="text-2xl font-bold">{{ gameCode }}</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="flex overflow-x-auto pb-2 mb-4 border-b border-gray-400 sticky top-0 bg-gray-200 z-20">
        <button
          @click="activeTab = 'summary'"
          :class="[
            'px-4 py-2 font-medium rounded-t-lg mr-1',
            activeTab === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400'
          ]"
        >
          End Summary
        </button>

        <button
          v-for="round in availableRounds"
          :key="round"
          @click="activeTab = round"
          :class="[
            'px-4 py-2 font-medium rounded-t-lg mr-1',
            activeTab === round ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400'
          ]"
        >
          {{ round }}
        </button>
      </div>

      <!-- Summary Content -->
      <div v-if="activeTab === 'summary'">
        <!-- Table -->
        <div class="border-t border-black">
          <div class="grid grid-cols-[1fr_2fr_2fr_1fr_2fr] gap-2 text-sm font-medium text-gray-950 py-2 border-b border-black">
            <span>Rank</span>
            <span>Team Name</span>
            <span>Contribution Point</span>
            <span>Star</span>
            <span>End Score</span>
          </div>

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
      </div>

      <!-- Round Details -->
      <div v-else-if="gameData" class="max-h-screen overflow-y-auto">
        <div
          v-for="(teamData, teamName) in teamRoundData"
          :key="teamName"
          class="mb-8"
        >
          <!-- Sticky & top-14 dihapus di sini -->
          <h3 class="text-xl font-bold bg-gray-300 p-2 rounded mb-4">
            {{ teamName }}
          </h3>

          <div class="overflow-x-auto mb-4 rounded shadow">
            <table class="w-full border-collapse bg-white">
              <thead>
                <tr>
                  <th
                    v-for="(_, key) in getFinancialMetrics(teamData)"
                    :key="key"
                    class="p-2 border border-gray-400 text-left bg-gray-100 whitespace-nowrap"
                  >
                    {{ formatMetricName(key) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    v-for="(value, key) in getFinancialMetrics(teamData)"
                    :key="key"
                    class="p-2 border border-gray-400 whitespace-nowrap"
                  >
                    {{ formatValue(value, key) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="teamData.Employees" class="mb-4">
            <h4 class="font-semibold mb-2 bg-gray-100 p-2 rounded">Employees</h4>
            <div class="overflow-x-auto rounded shadow">
              <table class="w-full border-collapse bg-white">
                <thead>
                  <tr>
                    <th class="p-2 border border-gray-400 text-left bg-gray-100">Name</th>
                    <th class="p-2 border border-gray-400 text-left bg-gray-100">Level</th>
                    <th class="p-2 border border-gray-400 text-left bg-gray-100">Salary</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(employee, empName) in teamData.Employees" :key="empName">
                    <td class="p-2 border border-gray-400">{{ employee.name }}</td>
                    <td class="p-2 border border-gray-400 text-center">{{ employee.level }}</td>
                    <td class="p-2 border border-gray-400 text-right">{{ formatNumber(employee.salary) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="text-center text-lg font-semibold mt-4">
        Loading...
      </div>

      <!-- Export to Excel -->
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import Chart from 'chart.js/auto';

/**
 * Centralize your API base URL here so you can quickly
 * switch environments or update endpoints.
 */
const API_BASE_URL = 'https://api-fastify-pi.vercel.app';

export default {
  name: 'GameResultsPage',
  setup() {
    // Constants
    const SUMMARY_TAB = 'summary';

    // Refs and State
    const router = useRouter();
    const gameCode = localStorage.getItem('gameCode');
    const teams = ref([]);
    const isLoading = ref(false);
    const chartCanvas = ref(null);
    const chartInstance = ref(null);

    // Tab handling
    const activeTab = ref(SUMMARY_TAB);

    // All game data from /game/allresult endpoint
    const gameData = ref(null);

    // Rounds available for display
    const availableRounds = ref([]);

    // ---- LIFECYCLE HOOKS ----
    onMounted(async () => {
      if (!gameCode) {
        handleError('No game code found. Redirecting...');
        router.replace('/');
        return;
      }
      await fetchEndResult();
      await fetchAllGameData();
    });

    // Ensure Chart.js instance is destroyed on unmount to avoid memory leaks
    onBeforeUnmount(() => {
      if (chartInstance.value) {
        chartInstance.value.destroy();
        chartInstance.value = null;
      }
    });

    // Redraw chart whenever we switch back to the summary tab
    watch(activeTab, (newVal) => {
      if (newVal === SUMMARY_TAB && chartCanvas.value) {
        drawChart();
      }
    });

    // ---- COMPUTED PROPERTIES ----
    const sortedTeams = computed(() => {
      return [...teams.value].sort((a, b) => {
        const scoreA = a.endResult?.TotalScore || 0;
        const scoreB = b.endResult?.TotalScore || 0;
        return scoreB - scoreA;
      });
    });

    // For the currently selected round, build a map of
    // { [teamName]: (roundData for that round) }
    const teamRoundData = computed(() => {
      if (!gameData.value || activeTab.value === SUMMARY_TAB) {
        return {};
      }
      const roundName = activeTab.value;
      const result = {};
      Object.entries(gameData.value.teams || {}).forEach(([teamName, teamRounds]) => {
        if (teamRounds[roundName]) {
          result[teamName] = teamRounds[roundName];
        }
      });
      return result;
    });

    // ---- DATA FETCHING ----
    const fetchEndResult = async () => {
      try {
        isLoading.value = true;
        const response = await fetch(`${API_BASE_URL}/game/result?gameCode=${gameCode}`);
        const data = await response.json();

        if (data?.message === 'End result retrieved successfully.') {
          teams.value = data.teams || [];
          drawChart();
        } else {
          handleError('Failed to fetch end result data.');
        }
      } catch (error) {
        handleError(error.message || 'An error occurred while fetching end result.');
      } finally {
        isLoading.value = false;
      }
    };

    const fetchAllGameData = async () => {
      try {
        isLoading.value = true;
        const response = await fetch(`${API_BASE_URL}/game/allresult?gameCode=${gameCode}`);
        const data = await response.json();

        if (data?.message?.includes('retrieved successfully')) {
          gameData.value = data.data;
          extractAvailableRounds();
        } else {
          handleError('Failed to fetch game data.');
        }
      } catch (error) {
        handleError(error.message || 'An error occurred while fetching game data.');
      } finally {
        isLoading.value = false;
      }
    };

    // ---- HELPERS ----

    function handleError(msg) {
      console.error(msg);
      // Replace this with your UI toast / modal / error display logic
      alert(msg);
    }

    function extractAvailableRounds() {
      if (!gameData.value?.teams) return;
      const allTeams = Object.values(gameData.value.teams);
      if (!allTeams.length) return;

      // We assume each team has rounds labeled "Round X"
      const firstTeam = allTeams[0];
      const rounds = Object.keys(firstTeam).filter((key) => key.startsWith('Round '));
      // Sort rounds in ascending order (Round 1, Round 2, etc.)
      rounds.sort((a, b) => {
        const numA = parseInt(a.replace('Round ', ''), 10);
        const numB = parseInt(b.replace('Round ', ''), 10);
        return numA - numB;
      });
      availableRounds.value = rounds;
    }

    function drawChart() {
      if (!chartCanvas.value) return;

      // Destroy any existing chart instance
      if (chartInstance.value) {
        chartInstance.value.destroy();
        chartInstance.value = null;
      }

      const ctx = chartCanvas.value.getContext('2d');
      const allRounds = new Set();

      // Gather all distinct rounds from each team
      teams.value.forEach((team) => {
        if (Array.isArray(team.rounds)) {
          team.rounds.forEach((r) => allRounds.add(r.round));
        }
      });

      const sortedRounds = [...allRounds].sort();

      // Prepare the datasets for each team
      const datasets = teams.value.map((team) => {
        // Assign random color for each team
        const color = getRandomColor();
        return {
          label: team.team,
          data: sortedRounds.map((roundName) => {
            const roundData = team.rounds.find((r) => r.round === roundName);
            return roundData ? roundData.ContributionPoint : 0;
          }),
          borderColor: color,
          borderWidth: 2,
          fill: false,
          tension: 0.3,
        };
      });

      chartInstance.value = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sortedRounds,
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
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
    }

    // Get random color for chart lines
    function getRandomColor() {
      return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    // Format numeric values
    function formatNumber(num) {
      if (num === undefined || num === null) return '0';
      return isNaN(Number(num)) ? num : Number(num).toLocaleString('en-US');
    }

    // Display-friendly metric key
    function formatMetricName(key) {
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());
    }

    // Format table cell values
    function formatValue(value, key) {
      if (value === '' || value === undefined || value === null) return '-';
      if (typeof value === 'number' || !isNaN(Number(value))) {
        return formatNumber(value);
      }
      return value;
    }

    // Extract financial keys from a team's round data
    function getFinancialMetrics(teamData) {
      const financialKeys = [
        'Asuransi',
        'KreditProduktif',
        'PinjamanPusat',
        'KreditKonsumtif',
        'KartuKredit',
        'PendapatanFeeBased',
        'TotalSalary',
        'Giro',
        'PenempatanPusat',
        'BiayaBunga',
        'ContributionPoint',
        'BiayaOperasional',
        'PendapatanBunga',
      ];
      const result = {};
      financialKeys.forEach((key) => {
        if (key in teamData) {
          result[key] = teamData[key];
        }
      });
      return result;
    }

    // Navigation helpers
    function goBack() {
      router.go(-1);
    }

    // Export data to Excel
    async function exportToExcel() {
      try {
        if (!gameCode) {
          handleError('No game code found!');
          return;
        }
        const response = await fetch(`${API_BASE_URL}/game/Excelresult?gameCode=${gameCode}`, {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch Excel file from the server.');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `GameResults_${gameCode}.xlsx`;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        handleError(error.message || 'Failed to export to Excel. Please try again.');
      }
    }

    // ---- RETURN ----
    return {
      // Data/Refs
      gameCode,
      teams,
      isLoading,
      chartCanvas,
      activeTab,
      gameData,
      availableRounds,

      // Computed
      sortedTeams,
      teamRoundData,

      // Methods
      SUMMARY_TAB,
      goBack,
      exportToExcel,
      formatNumber,
      formatMetricName,
      formatValue,
      getFinancialMetrics,
    };
  },
};
</script>

<style>
.chart-container {
  width: 100%;
  max-width: 700px;
  height: 450px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>