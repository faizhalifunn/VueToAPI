<template>
  <div class="relative">

    <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-screen text-white">
  <svg class="animate-spin h-12 w-12 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
  <p class="text-xl font-semibold">Loading game data...</p>
</div>

    <!-- ✅ Konten utama -->
    <div
      v-else class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f1f4b] to-[#132b5c] text-white pt-12 pb-16"
    >
      <div
        class="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 w-full max-w-[95%] border border-white/10"
      >
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">Game Results</h2>
          <h2 class="text-2xl font-bold">{{ gameCode }}</h2>
        </div>

        <!-- ✅ Tab Navigation (Sticky + Back Button) -->
        <div
          class="gap-1 flex items-center justify-start overflow-x-auto pb-2 mb-4 border-b border-white/30 sticky top-0 bg-white/5 z-20 px-4 pt-2"
        >
          <button
            @click="activeTab = 'summary'"
            :class="[
              'px-4 py-2 font-medium rounded-lg',
              activeTab === 'summary'
                ? 'bg-[#00A8C6] text-white'
                : 'bg-gray-400 hover:bg-gray-700',
            ]"
          >
            End Summary
          </button>



          <button
            v-for="round in availableRounds"
            :key="round"
            @click="activeTab = round"
            :class="[
              'px-4 py-2 font-medium rounded-lg',
              activeTab === round
                ? 'bg-[#00A8C6] text-white'
                : 'bg-gray-400 hover:bg-gray-700',
            ]"
          >
            {{ round }}
          </button>

          <button
  @click="activeTab = 'charts'"
  :class="[ 'px-4 py-2 font-medium rounded-lg', activeTab === 'charts' ? 'bg-[#00A8C6] text-white' : 'bg-white/10 hover:bg-white/20']"
>
  Round Charts
</button>

        </div>

        <!-- ✅ Summary Tab -->
        <div v-if="activeTab === 'summary'">
          <div class="border-t border-white/30">
            <div
              class="grid grid-cols-7 gap-2 items-center py-2 border-b bg-cyan-300/10 border-white/10 text-center text-lg font-extrabold"
            >
              <span font-extrabold>No.</span>
              <span font-extrabold>Team</span>
              <span font-extrabold>Total Contribution Margin</span>
              <span font-extrabold>Level 3 Employees</span>
              <span font-extrabold>Active Customers</span>
              <span font-extrabold>Achievement Stars</span>
              <span font-extrabold>Final Contribution Margin</span>
            </div>
            <div
              v-for="(team, index) in sortedTeams"
              :key="index"
              class="grid grid-cols-7 gap-2 items-center py-2 border-b border-white/10 text-center"
            >
              <span class="font-semibold">{{ index + 1 }}</span>
              <span class="font-medium">{{ team.teamName || "N/A" }}</span>
              <span class="font-mono">{{
                formatNumber(team.endResult.baseContributionMargin)
              }}</span>
              <span class="font-mono">{{
                formatNumber(team.endResult.level3EmployeesCount)
              }}</span>
              <span class="font-mono font-bold">{{
                formatNumber(team.endResult.ActiveCustomers)
              }}</span>
              <span class="font-mono font-bold">{{
                formatNumber(team.endResult.totalAchievementStar)
              }}</span>
              <span class="font-mono font-bold">{{
                formatNumber(team.endResult.FinalContributionMargin)
              }}</span>
            </div>
          </div>

          <div class="chart-container mt-6">
            <canvas ref="summaryChart"></canvas>
          </div>
        </div>

        <!-- ✅ Round Tab -->
        <div
    v-if="activeTab !== 'summary' && Object.keys(teamRoundData).length"
    class="w-full overflow-x-auto bg-white p-4 text-gray-800"
  >
    <table class="min-w-full table-fixed border-collapse border border-gray-300 bg-white">
      <colgroup>
        <col class="w-64">
        <col v-for="team in Object.keys(teamRoundData)" :key="team"/>
      </colgroup>
      <thead>
        <tr class="h-10 bg-gray-50">
          <th class="px-4 text-left font-semibold">Variable</th>
          <th
            v-for="team in Object.keys(teamRoundData)"
            :key="team"
            class="px-4 text-center font-semibold"
          >
            {{ team }}
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- 1) Interest -->
        <tr class="h-12 border-t">
          <td class="px-4">Productive Interest</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-pi'"
            class="px-4 text-right"
          >
            {{ formatPercent(teamRoundData[team].ProductiveInterest) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Consumptive Interest</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-ci'"
            class="px-4 text-right"
          >
            {{ formatPercent(teamRoundData[team].ConsumptiveInterest) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Inter Office Interest</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-ioi'"
            class="px-4 text-right"
          >
            {{ formatPercent(teamRoundData[team].InterOfficeInterest) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Fund Interest</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-fi'"
            class="px-4 text-right"
          >
            {{ formatPercent(teamRoundData[team].FundInterest) }}
          </td>
        </tr>

        <!-- 2) Loans & Fees -->
        <tr class="h-12 border-t">
          <td class="px-4">Productive Loan</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-pl'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].ProductiveLoan) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Consumptive Loan</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-cl'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].ConsumptiveLoan) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Fund</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-fund'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].Fund) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Insurance</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-ins'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].Insurance) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Credit Card</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-cc'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].CreditCard) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Inter Office Account Borrow</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-iob'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].InterOfficeAccountBorrow) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Inter Office Account Placement</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-iop'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].InterOfficeAccountPlacement) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Net Interest Income</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-nii'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].NetInterestIncome) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Fee Based Income</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-fbi'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].FeeBasedIncome) }}
          </td>
        </tr>

        <!-- 3) Operational Costs -->
        <tr class="h-12 border-t">
          <td class="px-4">Total Salary</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-sal'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].TotalSalary) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Development Cost</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-dev'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].DevelopmentCost) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Marketing Cost</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-mkt'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].MarketingCost) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Operational Cost</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-opcost'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].OperationalCost) }}
          </td>
        </tr>

        <!-- 4) Ratios & Employee -->
        <tr class="h-12 border-t">
          <td class="px-4">Total Employees</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-te'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].TotalEmployees) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">CM per Employee</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-cmpe'"
            class="px-4 text-right"
          >
            {{ formatPercent(teamRoundData[team].CMPerEmployee) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Cost Efficiency Ratio (%)</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-cer'"
            class="px-4 text-right"
          >
            {{ formatPercent(teamRoundData[team].CostEfficiencyRatio) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Net Interest Margin (%)</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-nim'"
            class="px-4 text-right"
          >
            {{ formatPercent(teamRoundData[team].NetInterestMargin) }}
          </td>
        </tr>

        <!-- 5) Achievement & Contribution -->
        <tr class="h-12 border-t">
          <td class="px-4">Achievement Star</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-as'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].AchievementStar) }}
          </td>
        </tr>
        <tr class="h-12 border-t">
          <td class="px-4">Contribution Margin</td>
          <td
            v-for="team in Object.keys(teamRoundData)"
            :key="team+'-cm'"
            class="px-4 text-right"
          >
            {{ formatNumber(teamRoundData[team].ContributionMargin) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

        <!-- ✅ Tambahkan ini setelah Round Tab -->
        <div v-if="activeTab === 'charts'" class="mt-6">
  <h3 class="text-2xl font-bold mb-4 text-center p-5">Round-by-Round Parameter Charts</h3>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div
      v-for="(key, index) in trackedParameters"
      :key="key"
      class="chart-container border rounded-xl bg-white p-4 text-black shadow"
    >
      <h4 class="text-lg font-semibold mb-2 text-center">{{ key }}</h4>
      <canvas :ref="el => parameterChartRefs[index] = el"></canvas>
    </div>
  </div>
</div>

<!-- ✅ Loading Spinner -->
<div v-if="isLoading" class="flex flex-col items-center justify-center min-h-screen text-white">
  <svg class="animate-spin h-12 w-12 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
  <p class="text-xl font-semibold">Loading game data...</p>
</div>


        <!-- ✅ Export Button -->
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
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import Chart from "chart.js/auto";
import { useRouter } from "vue-router";

const API_BASE_URL = "https://api-fastify-pi.vercel.app";
const router = useRouter();
const gameCode = localStorage.getItem("gameCode");

const activeTab = ref("summary");
const summaryChart = ref(null);
const roundChart = ref(null);
const summaryChartInstance = ref(null);
const roundChartInstance = ref(null);

const teams = ref([]);
const gameData = ref(null);
const availableRounds = ref([]);
const chartCategories = [
  "Pro Interest",
  "Con Interest",
  "Head Interest",
  "Out Interest",
  "DevelompentCost",
  "MarketingCost",
  "Insurance",
  "ProductiveLoan",
  "InterOfficeAccountBorrow",
  "ConsumptiveLoan",
  "CreditCard",
  "Pendapatan Fee Based",
  "Total Salary",
  "Fund",
  "InterOfficeAccountPlacement",
];

const trackedParameters = [
  'ProductiveLoan',
  'ConsumptiveLoan',
  'Fund',
  'MarketingCost',
  'DevelompentCost',
  'OperationalCost',
  'Insurance',
  'CreditCard',
  'FeeBasedIncome',
  'NetInterestIncome'
];

const parameterChartRefs = [];
const parameterChartInstances = [];
const isLoading = ref(true);


watch(activeTab, async (val) => {
  if (val === 'charts') {
    await nextTick();
    drawAllParameterCharts();
  }
});

const formatNumber = (num) =>
  isNaN(Number(num)) ? "0" : Number(num).toLocaleString("en-US");
const formatPercent = (value) => {
  return value != null ? value.toFixed(2) + "%" : "-";
};
const goBack = () => router.go(-1);

const sortedTeams = computed(() => {
  const teamsObject = gameData.value?.teams || {};
  return Object.entries(teamsObject)
    .map(([teamName, rounds], index) => {
      const endResult = rounds["EndResult"] || {};
      return {
        index,
        teamName,
        endResult,
        roundData: rounds, // semua data per round
      };
    })
    .sort(
      (a, b) => (b.endResult.TotalScore || 0) - (a.endResult.TotalScore || 0)
    );
});

const teamRoundData = computed(() => {
  if (!gameData.value || activeTab.value === "summary") return {};
  const round = activeTab.value;
  const result = {};
  Object.entries(gameData.value.teams || {}).forEach(([team, rounds]) => {
    if (rounds[round]) result[team] = rounds[round];
  });
  return result;
});

watch(activeTab, async (val) => {
  await nextTick();
  if (val === "summary") drawSummaryChart();
  else if (availableRounds.value.includes(val)) drawRoundChart(val);
});

onMounted(async () => {
  if (!gameCode) return router.replace("/");
  await fetchEndResult();
  await fetchAllGameData();
  if (availableRounds.value.length) {
    activeTab.value = "summary";
    drawSummaryChart();
  }
  isLoading.value = false;

await nextTick(); // pastikan DOM canvas siap
drawSummaryChart(); // pastikan grafik digambar setelah DOM tersedia

});


onBeforeUnmount(() => {
  if (summaryChartInstance.value) summaryChartInstance.value.destroy();
  if (roundChartInstance.value) roundChartInstance.value.destroy();
});

async function fetchEndResult() {
  try {
    const res = await fetch(`${API_BASE_URL}/game/result?gameCode=${gameCode}`);
    const data = await res.json();
    if (data?.message?.includes("retrieved")) teams.value = data.teams || [];
  } catch (err) {
    alert(err.message);
  }
}

async function fetchAllGameData() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/game/allresult?gameCode=${gameCode}`
    );
    const data = await res.json();
    if (data?.message?.includes("retrieved")) {
      gameData.value = data.data;
      const firstTeam = Object.values(data.data?.teams || {})[0];
      const rounds = Object.keys(firstTeam).filter((k) =>
        k.startsWith("Round ")
      );
      availableRounds.value = rounds.sort(
        (a, b) => parseInt(a.split(" ")[1]) - parseInt(b.split(" ")[1])
      );
    }
  } catch (err) {
    alert(err.message);
  }
}


function drawSummaryChart() {
  if (!summaryChart.value || !teams.value.length) return;
  const ctx = summaryChart.value.getContext("2d");
  if (!ctx) return;

  if (summaryChartInstance.value) summaryChartInstance.value.destroy();

  const allRounds = new Set();
  teams.value.forEach((team) =>
    (team.rounds || []).forEach((r) => allRounds.add(r.round))
  );
  const sortedRounds = [...allRounds].sort();

  const datasets = teams.value.map((team) => {
    const color = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
    return {
      label: team.team,
      data: sortedRounds.map((r) => {
        const match = (team.rounds || []).find((x) => x.round === r);
        return match ? match.ContributionMargin : 0;
      }),
      borderColor: color,
      backgroundColor: color + "40",
      fill: false,
      tension: 0.3,
    };
  });

  summaryChartInstance.value = new Chart(ctx, {
    type: "line",
    data: { labels: sortedRounds, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Contribution Points" },
        },
        x: { title: { display: true, text: "Rounds" } },
      },
      plugins: {
        legend: { position: "bottom" },
        tooltip: { mode: "index", intersect: false },
      },
    },
  });
}

function drawRoundChart(roundKey) {
  if (!roundChart.value || !gameData.value?.teams) return;
  const ctx = roundChart.value.getContext("2d");
  if (!ctx) return;

  if (roundChartInstance.value) roundChartInstance.value.destroy();

  const datasets = Object.entries(gameData.value.teams || {}).map(
    ([teamName, rounds]) => {
      const roundData = rounds[roundKey] || {};
      const color = `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`;
      return {
        label: teamName,
        data: chartCategories.map(
          (label) => Number(roundData[label.replace(/\s/g, "")]) || 0
        ),
        borderColor: color,
        backgroundColor: color + "40",
        tension: 0.3,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    }
  );

  roundChartInstance.value = new Chart(ctx, {
    type: "line",
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
          title: { display: true, text: "Parameter" },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "Value" },
        },
      },
      plugins: {
        tooltip: { mode: "index", intersect: false },
        legend: { position: "bottom" },
      },
    },
  });
}
function drawAllParameterCharts() {
  if (!parameterChartRefs.length || !gameData.value?.teams) return;

  parameterChartInstances.forEach(instance => instance?.destroy());
  parameterChartInstances.length = 0;

  trackedParameters.forEach((param, i) => {
    const ctx = parameterChartRefs[i]?.getContext('2d');
    if (!ctx) return;

    const datasets = Object.entries(gameData.value.teams || {}).map(([teamName, rounds]) => {
      const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      const values = availableRounds.value.map(round => {
        const roundData = rounds[round] || {};
        return Number(roundData[param]) || 0;
      });
      return {
        label: teamName,
        data: values,
        borderColor: color,
        backgroundColor: color + '40',
        tension: 0.3,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });

    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: availableRounds.value,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          y: { beginAtZero: true },
          x: { title: { display: true, text: 'Rounds' } },
        },
      },
    });

    parameterChartInstances.push(chartInstance);
  });
}

async function exportToExcel() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/game/Excelresult?gameCode=${gameCode}`
    );
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
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

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th,
td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
  vertical-align: middle;
  word-break: break-word;
}

th {
  font-weight: 600;
  font-size: 0.65rem;
  background-color: #f0f0f0;
  color: #111;
}

td {
  font-size: 0.75rem;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

.flex-overflow-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 1rem;
  gap: 1.5rem;
  justify-content: center;
}

.card-container {
  flex: 0 0 auto;
  min-width: 720px;
  max-width: 720px;
  border-radius: 0.75rem;
}

@media (max-width: 768px) {
  .card-container {
    min-width: 90vw;
    max-width: 90vw;
  }

  th,
  td {
    font-size: 0.7rem;
    padding: 6px;
  }

  h3 {
    font-size: 1rem;
  }
}
</style>
