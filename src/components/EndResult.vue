<template>
  <div>
    <!-- ✅ Tombol Back tetap fixed di kiri atas -->
    <button
      @click="goBack"
      class="fixed top-4 left-4 z-[9999] bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-500 transition hover:scale-105 shadow-lg"
    >
      ← Back
    </button>

    <!-- ✅ Konten utama diberi padding top agar tidak tertutup tombol -->
    <div class="min-h-screen flex flex-col items-center justify-center bg-black text-gray-800 pt-20 pb-16">
      <div class="bg-gray-200 rounded-2xl shadow-md p-6 w-full max-w-[95%]">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">Game Results</h2>
          <h2 class="text-2xl font-bold">{{ gameCode }}</h2>
        </div>

        <!-- Tab Navigation -->
        <div class="flex overflow-x-auto pb-2 mb-4 border-b border-gray-400 sticky top-0 bg-gray-200 z-20">
          <button
            @click="activeTab = 'summary'"
            :class="[ 'px-4 py-2 font-medium rounded-t-lg mr-1', activeTab === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400']"
          >
            End Summary
          </button>

          <button
            v-for="round in availableRounds"
            :key="round"
            @click="activeTab = round"
            :class="[ 'px-4 py-2 font-medium rounded-t-lg mr-1', activeTab === round ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400']"
          >
            {{ round }}
          </button>
        </div>

        <!-- Summary Tab -->
        <div v-if="activeTab === 'summary'">
          <div class="border-t border-black">
            <div class="grid grid-cols-[1fr_2fr_2fr_1fr_2fr] gap-2 text-sm font-medium text-gray-950 py-2 border-b border-black">
              <span>Rank</span>
              <span>Team Name</span>
              <span>Contribution Point</span>
              <span>AchievementStar</span>
              <span>End Score</span>
            </div>
            <div
              v-for="(team, index) in sortedTeams"
              :key="index"
              class="grid grid-cols-[1fr_2fr_2fr_1fr_2fr] gap-2 items-center py-2 border-b border-black text-center"
            >
              <span class="font-semibold">{{ index + 1 }}</span>
              <span class="font-medium">{{ team.team || 'N/A' }}</span>
              <span class="font-mono">{{ formatNumber(team.endResult.TotalContributionPoint) }}</span>
              <span class="font-mono">{{ formatNumber(team.endResult.TotalAchievementStar) }}</span>
              <span class="font-mono font-bold">{{ formatNumber(team.endResult.TotalScore) }}</span>
            </div>
          </div>

          <div class="chart-container mt-6">
            <canvas ref="summaryChart"></canvas>
          </div>
        </div>

        <!-- Round Tab -->
        <div v-if="activeTab !== 'summary' && Object.keys(teamRoundData).length">
          <div class="flex-overflow-container">
            <div
              v-for="(teamData, teamName) in teamRoundData"
              :key="teamName"
              class="card-container p-4"
            >
              <h3 class="text-xl font-bold text-center mb-2">{{ teamName }}</h3>
              <table class="w-full text-sm mb-4 border border-gray-300">
                <thead class="bg-gray-100">
                  <tr>
                    <th>Pro Interest</th>
                    <th>Con Interest</th>
                    <th>Head Interest</th>
                    <th>Out Interest</th>
                    <th>Development</th>
                    <th>MarketingCost</th>
                    <th>AchievementStar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ formatNumber(teamData.ProInterest) }}</td>
                    <td>{{ formatNumber(teamData.ConInterest) }}</td>
                    <td>{{ formatNumber(teamData.HeadInterest) }}</td>
                    <td>{{ formatNumber(teamData.OutInterest) }}</td>
                    <td>{{ formatNumber(teamData.Development) }}</td>
                    <td>{{ formatNumber(teamData.MarketingCost) }}</td>
                    <td>{{ formatNumber(teamData.TotalAchievementStar) }}</td>
                  </tr>
                </tbody>
              </table>

              <table class="w-full text-sm mb-4 border border-gray-300">
                <thead class="bg-gray-100">
                  <tr>
                    <th>Insurance</th>
                    <th>ProductiveLoan</th>
                    <th>InterOfficeAccountBorrow</th>
                    <th>ConsumptiveLoan</th>
                    <th>CreditCard</th>
                    <th>Pendapatan Fee Based</th>
                    <th>Total Salary</th>
                    <th>Fund</th>
                    <th>InterOfficeAccountPlacement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ formatNumber(teamData.Insurance) }}</td>
                    <td>{{ formatNumber(teamData.ProductiveLoan) }}</td>
                    <td>{{ formatNumber(teamData.InterOfficeAccountBorrow) }}</td>
                    <td>{{ formatNumber(teamData.ConsumptiveLoan) }}</td>
                    <td>{{ formatNumber(teamData.KartuKredit) }}</td>
                    <td>{{ formatNumber(teamData.FeeBasedIncome) }}</td>
                    <td>{{ formatNumber(teamData.TotalSalary) }}</td>
                    <td>{{ formatNumber(teamData.Fund) }}</td>
                    <td>{{ formatNumber(teamData.InterOfficeAccountPlacement) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="chart-container mt-6">
            <canvas ref="roundChart"></canvas>
          </div>
        </div>

        <!-- Export Button -->
        <div class="mt-6 flex justify-center gap-4">
          <button
            @click="exportToExcel"
            class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition hover:scale-105 shadow-md"
          >
            🗓 Export to Excel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import { useRouter } from 'vue-router';

const API_BASE_URL = 'https://api-fastify-pi.vercel.app';
const router = useRouter();
const gameCode = localStorage.getItem('gameCode');

const activeTab = ref('summary');
const summaryChart = ref(null);
const roundChart = ref(null);
const summaryChartInstance = ref(null);
const roundChartInstance = ref(null);

const teams = ref([]);
const isLoading = ref(false);
const gameData = ref(null);
const availableRounds = ref([]);
const chartCategories = [
  'Pro Interest', 'Con Interest', 'Head Interest', 'Out Interest',
  'Development', 'MarketingCost', 'Insurance', 'ProductiveLoan',
  'InterOfficeAccountBorrow', 'ConsumptiveLoan', 'CreditCard',
  'Pendapatan Fee Based', 'Total Salary', 'Fund', 'InterOfficeAccountPlacement'
];

const formatNumber = (num) => isNaN(Number(num)) ? '0' : Number(num).toLocaleString('en-US');
const goBack = () => router.go(-1);

const sortedTeams = computed(() =>
  [...teams.value].sort((a, b) => (b.endResult?.TotalScore || 0) - (a.endResult?.TotalScore || 0))
);

const teamRoundData = computed(() => {
  if (!gameData.value || activeTab.value === 'summary') return {};
  const round = activeTab.value;
  const result = {};
  Object.entries(gameData.value.teams || {}).forEach(([team, rounds]) => {
    if (rounds[round]) result[team] = rounds[round];
  });
  return result;
});

watch(activeTab, async (val) => {
  await nextTick();
  if (val === 'summary') drawSummaryChart();
  else if (availableRounds.value.includes(val)) drawRoundChart(val);
});

onMounted(async () => {
  if (!gameCode) return router.replace('/');
  await fetchEndResult();
  await fetchAllGameData();
  if (availableRounds.value.length) {
    activeTab.value = 'summary';
    drawSummaryChart();
  }
});

onBeforeUnmount(() => {
  if (summaryChartInstance.value) summaryChartInstance.value.destroy();
  if (roundChartInstance.value) roundChartInstance.value.destroy();
});

async function fetchEndResult() {
  try {
    const res = await fetch(`${API_BASE_URL}/game/result?gameCode=${gameCode}`);
    const data = await res.json();
    if (data?.message?.includes('retrieved')) teams.value = data.teams || [];
  } catch (err) {
    alert(err.message);
  }
}

async function fetchAllGameData() {
  try {
    const res = await fetch(`${API_BASE_URL}/game/allresult?gameCode=${gameCode}`);
    const data = await res.json();
    if (data?.message?.includes('retrieved')) {
      gameData.value = data.data;
      const firstTeam = Object.values(data.data?.teams || {})[0];
      const rounds = Object.keys(firstTeam).filter(k => k.startsWith('Round '));
      availableRounds.value = rounds.sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]));
    }
  } catch (err) {
    alert(err.message);
  }
}

function drawSummaryChart() {
  if (!summaryChart.value || !teams.value.length) return;
  const ctx = summaryChart.value.getContext('2d');
  if (summaryChartInstance.value) summaryChartInstance.value.destroy();

  const allRounds = new Set();
  teams.value.forEach((team) => (team.rounds || []).forEach((r) => allRounds.add(r.round)));
  const sortedRounds = [...allRounds].sort();

  const datasets = teams.value.map((team) => {
    const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    return {
      label: team.team,
      data: sortedRounds.map((r) => {
        const match = (team.rounds || []).find((x) => x.round === r);
        return match ? match.ContributionPoint : 0;
      }),
      borderColor: color,
      backgroundColor: color + '40',
      fill: false,
      tension: 0.3,
    };
  });

  summaryChartInstance.value = new Chart(ctx, {
    type: 'line',
    data: { labels: sortedRounds, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Contribution Points' } },
        x: { title: { display: true, text: 'Rounds' } },
      },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { mode: 'index', intersect: false },
      },
    }
  });
}

function drawRoundChart(roundKey) {
  if (!roundChart.value || !gameData.value?.teams) return;
  const ctx = roundChart.value.getContext('2d');
  if (roundChartInstance.value) roundChartInstance.value.destroy();

  const datasets = Object.entries(gameData.value.teams || {}).map(([teamName, rounds]) => {
    const roundData = rounds[roundKey] || {};
    const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    return {
      label: teamName,
      data: chartCategories.map(label => Number(roundData[label.replace(/\s/g, '')]) || 0),
      borderColor: color,
      backgroundColor: color + '40',
      tension: 0.3,
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6,
    };
  });

  roundChartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartCategories,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { maxRotation: 60, minRotation: 45 },
          title: { display: true, text: 'Parameter' },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Value' },
        },
      },
      plugins: {
        tooltip: { mode: 'index', intersect: false },
        legend: { position: 'bottom' },
      },
    },
  });
}

async function exportToExcel() {
  try {
    const res = await fetch(`${API_BASE_URL}/game/Excelresult?gameCode=${gameCode}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GameResults_${gameCode}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert(err.message);
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  min-width: 700px;
  height: 450px;
  overflow-x: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

button.fixed {
  pointer-events: auto;
}

/* Tabel */
th,
td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
  vertical-align: middle;
  white-space: normal;
  word-break: break-word;
}

th {
  font-weight: 600;
  font-size: 0.6rem;
  background-color: #f5f5f5;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

/* Canvas force full size */
canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Container scroll horizontal */
.flex-overflow-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 1rem;
  gap: 1.5rem;
}

/* Kartu per tim */
.card-container {
  flex: 0 0 auto;
  margin-bottom: 1rem;
  min-width: 750px;
  max-width: 750px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 0.75rem;
}

/* Responsif */
@media (max-width: 768px) {
  .card-container {
    min-width: 90vw;
    max-width: 90vw;
  }

  th,
  td {
    font-size: 0.75rem;
    padding: 6px;
  }

  h3 {
    font-size: 1rem;
  }
}
</style>