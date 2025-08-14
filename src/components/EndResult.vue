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

        <!-- ✅ Tab Navigation -->
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

        <!-- ✅ Summary Tab (KPI versi PM) -->
        <div v-if="activeTab === 'summary'">
          <div class="border-t border-white/30 overflow-x-auto">
            <!-- Header Grid -->
            <div
              class="grid gap-2 items-center py-2 border-b bg-cyan-300/10 border-white/10 text-center text-lg font-extrabold min-w-[1400px]"
              :style="{ gridTemplateColumns: `repeat(${2 + kpiFields.length}, minmax(160px, 1fr))` }"
            >
              <span>No.</span>
              <span>Team</span>
              <span v-for="f in kpiFields" :key="'h-'+f.key">{{ f.label }}</span>
            </div>
            <!-- Rows -->
            <div
              v-for="(team, index) in sortedTeams"
              :key="team.teamName || index"
              class="grid gap-2 items-center py-2 border-b border-white/10 text-center min-w-[1400px]"
              :style="{ gridTemplateColumns: `repeat(${2 + kpiFields.length}, minmax(160px, 1fr))` }"
            >
              <span class="font-semibold">{{ index + 1 }}</span>
              <span class="font-medium">{{ team.teamName || "N/A" }}</span>

              <span
                v-for="f in kpiFields"
                :key="team.teamName+'-'+f.key"
                class="font-mono"
                :class="[
                  f.key === 'ContributionMargin' ? 'font-bold' : '',
                  f.key === 'AchievementStar' ? 'font-bold' : ''
                ]"
              >
                {{ formatByType(team.endResult[f.key], f.type) }}
              </span>
            </div>
          </div>

          <div class="chart-container mt-6">
            <canvas ref="summaryChart"></canvas>
          </div>
        </div>

        <!-- ✅ Round Tab (HANYA KPI PM) -->
        <div
          v-if="activeTab !== 'summary' && Object.keys(teamRoundData).length && activeTab !== 'charts'"
          class="w-full overflow-x-auto bg-white p-4 text-gray-800"
        >
          <table class="min-w-full table-fixed border-collapse border border-gray-300 bg-white">
            <colgroup>
              <col class="w-64">
              <col v-for="team in Object.keys(teamRoundData)" :key="team"/>
            </colgroup>
            <thead>
              <tr class="h-10 bg-gray-50">
                <th class="px-4 text-left font-semibold">Variable / KPI</th>
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
              <tr v-for="f in kpiFields" :key="'row-'+f.key" class="h-12 border-t">
                <td class="px-4">{{ f.label }}</td>
                <td
                  v-for="team in Object.keys(teamRoundData)"
                  :key="'cell-'+team+'-'+f.key"
                  class="px-4 text-right"
                >
                  {{ formatByType(teamRoundData[team][f.key], f.type) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ✅ Charts Tab -->
        <div v-if="activeTab === 'charts'" class="mt-6">
          <h3 class="text-2xl font-bold mb-4 text-center p-5">Round-by-Round Parameter Charts</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(f, index) in trackedChartFields"
              :key="f.key"
              class="chart-container border rounded-xl bg-white p-4 text-black shadow"
            >
              <h4 class="text-lg font-semibold mb-2 text-center">{{ f.label }}</h4>
              <canvas :ref="el => parameterChartRefs[index] = el"></canvas>
            </div>
          </div>
        </div>

        <!-- (Duplikat) Loading biarkan -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-screen text-white">
          <svg class="animate-spin h-12 w-12 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <p class="text-xl font-semibold">Loading game data...</p>
        </div>

        <!-- Export -->
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
const summaryChartInstance = ref(null);

// Disisakan (legacy) untuk kompatibilitas
const roundChart = ref(null);
const roundChartInstance = ref(null);

const teams = ref([]);
const gameData = ref(null);
const availableRounds = ref([]);
const isLoading = ref(true);

/* =========================
   KPI SESUAI LIST PM
   label (UI), key (API), type ('nominal' | 'percentage')
   ========================= */
const kpiFields = [
  { label: "Productive Loan",                  key: "ProductiveLoan",               type: "nominal"    },
  { label: "Consumer Loan",                    key: "ConsumerLoan",                 type: "nominal"    },
  { label: "Total Loan",                       key: "TotalLoan",                    type: "nominal"    },
  { label: "Total Fund",                       key: "Fund",                         type: "nominal"    },
  { label: "Inter Office Account (placement)", key: "InterOfficeAccountPlacement",  type: "nominal"    },
  { label: "Inter Office Account (borrow)",    key: "InterOfficeAccountBorrow",     type: "nominal"    },
  { label: "Total Interest Income",            key: "TotalInterestIncome",          type: "nominal"    },
  { label: "Total Interest Expense",           key: "TotalInterestExpense",         type: "nominal"    },
  { label: "Net Interest Income",              key: "NetInterestIncome",            type: "nominal"    },
  { label: "Total FBI",                        key: "FeeBasedIncome",               type: "nominal"    },
  { label: "Total Income",                     key: "TotalIncome",                  type: "nominal"    },
  { label: "Total Operational Cost",           key: "OperationalCost",              type: "nominal"    },
  { label: "Contribution Margin",              key: "ContributionMargin",           type: "nominal"    },
  { label: "Net Interest Margin",              key: "NetInterestMargin",            type: "percentage" },
  { label: "Cost Efficiency Ratio",            key: "CostEfficiencyRatio",          type: "percentage" },
  { label: "Loan to Deposit Ratio",            key: "LoanToDepositRatio",           type: "percentage" },
  { label: "CM per Employee",                  key: "CMPerEmployee",                type: "nominal"    },
  { label: "Achievement Stars",                key: "AchievementStar",              type: "nominal"    },
];

// Chart: subset KPI nominal
const trackedChartFields = [
  { label: "Productive Loan", key: "ProductiveLoan", type: "nominal" },
  { label: "Consumer Loan", key: "ConsumerLoan", type: "nominal" },
  { label: "Total Loan", key: "TotalLoan", type: "nominal" },
  { label: "Total Fund", key: "Fund", type: "nominal" },
  { label: "IOA (placement)", key: "InterOfficeAccountPlacement", type: "nominal" },
  { label: "IOA (borrow)", key: "InterOfficeAccountBorrow", type: "nominal" },
  { label: "Net Interest Income", key: "NetInterestIncome", type: "nominal" },
  { label: "Total FBI", key: "FeeBasedIncome", type: "nominal" },
  { label: "Total Income", key: "TotalIncome", type: "nominal" },
  { label: "Total Operational Cost", key: "OperationalCost", type: "nominal" },
  { label: "Contribution Margin", key: "ContributionMargin", type: "nominal" },
  { label: "CM per Employee", key: "CMPerEmployee", type: "nominal" },
];

// Refs & instances untuk charts
const parameterChartRefs = [];
const parameterChartInstances = [];

watch(activeTab, async (val) => {
  if (val === 'charts') {
    await nextTick();
    drawAllParameterCharts();
  }
});

const formatNumber = (num) =>
  isNaN(Number(num)) ? "0" : Number(num).toLocaleString("en-US");
const formatPercent = (value) =>
  value != null && !isNaN(value) ? Number(value).toFixed(2) + "%" : "-";
const formatByType = (val, type) => {
  if (val === null || val === undefined || val === '') return '-';
  return type === 'percentage' ? formatPercent(val) : formatNumber(val);
};

// ✅ Sort by ContributionMargin desc
const sortedTeams = computed(() => {
  const teamsObject = gameData.value?.teams || {};
  return Object.entries(teamsObject)
    .map(([teamName, rounds], index) => {
      const endResult = { ...(rounds["EndResult"] || {}) };

      // Fallback ringan bila field total belum disediakan API
      if (endResult.TotalLoan == null) {
        endResult.TotalLoan =
          (Number(endResult.ProductiveLoan) || 0) + (Number(endResult.ConsumerLoan) || 0);
      }
      if (endResult.NetInterestIncome == null) {
        endResult.NetInterestIncome =
          (Number(endResult.TotalInterestIncome) || 0) - (Number(endResult.TotalInterestExpense) || 0);
      }
      if (endResult.TotalIncome == null) {
        endResult.TotalIncome =
          (Number(endResult.NetInterestIncome) || 0) + (Number(endResult.FeeBasedIncome) || 0);
      }

      return { index, teamName, endResult, roundData: rounds };
    })
    .sort((a, b) =>
      (b.endResult.ContributionMargin || 0) - (a.endResult.ContributionMargin || 0)
    );
});

// ✅ Data per-round (hanya KPI PM)
const teamRoundData = computed(() => {
  if (!gameData.value || activeTab.value === "summary" || activeTab.value === "charts") return {};
  const round = activeTab.value;
  const result = {};
  Object.entries(gameData.value.teams || {}).forEach(([team, rounds]) => {
    if (rounds[round]) {
      const r = { ...(rounds[round] || {}) };

      // Fallback ringan
      if (r.TotalLoan == null) {
        r.TotalLoan = (Number(r.ProductiveLoan) || 0) + (Number(r.ConsumerLoan) || 0);
      }
      if (r.NetInterestIncome == null) {
        r.NetInterestIncome =
          (Number(r.TotalInterestIncome) || 0) - (Number(r.TotalInterestExpense) || 0);
      }
      if (r.TotalIncome == null) {
        r.TotalIncome = (Number(r.NetInterestIncome) || 0) + (Number(r.FeeBasedIncome) || 0);
      }

      result[team] = r;
    }
  });
  return result;
});

watch(activeTab, async (val) => {
  await nextTick();
  if (val === "summary") drawSummaryChart();
});

onMounted(async () => {
  if (!gameCode) return router.replace("/");
  await fetchEndResult();
  await fetchAllGameData();

  if (availableRounds.value.length) {
    activeTab.value = "summary";
    await nextTick();
    drawSummaryChart();
  }

  isLoading.value = false;
  await nextTick();
  drawSummaryChart();
});

onBeforeUnmount(() => {
  if (summaryChartInstance.value) summaryChartInstance.value.destroy();
  parameterChartInstances.forEach((inst) => inst?.destroy());
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

/** Summary Chart: Contribution Margin per round (per team) */
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
        return match ? Number(match.ContributionMargin) || 0 : 0;
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
        y: { beginAtZero: true, title: { display: true, text: "Contribution Margin" } },
        x: { title: { display: true, text: "Rounds" } },
      },
      plugins: {
        legend: { position: "bottom" },
        tooltip: { mode: "index", intersect: false },
      },
    },
  });
}

/* ===== Legacy round chart (tidak dipakai) ===== */
const chartCategories = []; // <-- SATU KALI saja, biar nggak error duplikasi

function drawRoundChart(roundKey) {
  if (!roundChart.value || !gameData.value?.teams) return;
  if (!chartCategories.length) return;
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

/** KPI charts per-round (subset nominal) */
function drawAllParameterCharts() {
  parameterChartInstances.forEach((inst) => inst?.destroy());
  parameterChartInstances.length = 0;

  trackedChartFields.forEach((f, i) => {
    const ctx = parameterChartRefs[i]?.getContext('2d');
    if (!ctx) return;

    const datasets = Object.entries(gameData.value?.teams || {}).map(([teamName, rounds]) => {
      const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      const values = availableRounds.value.map(roundKey => {
        const rd = rounds[roundKey] || {};
        let v = rd[f.key];
        // fallback agar chart tetap tampil jika API belum kirim field total
        if (f.key === "TotalLoan" && (v == null || v === "")) {
          v = (Number(rd.ProductiveLoan) || 0) + (Number(rd.ConsumerLoan) || 0);
        }
        if (f.key === "NetInterestIncome" && (v == null || v === "")) {
          v = (Number(rd.TotalInterestIncome) || 0) - (Number(rd.TotalInterestExpense) || 0);
        }
        if (f.key === "TotalIncome" && (v == null || v === "")) {
          v = (Number(rd.NetInterestIncome) || 0) + (Number(rd.FeeBasedIncome) || 0);
        }
        return Number(v) || 0;
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

    const chartInst = new Chart(ctx, {
      type: 'line',
      data: { labels: availableRounds.value, datasets },
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

    parameterChartInstances.push(chartInst);
  });
}

async function exportToExcel() {
  try {
    const res = await fetch(`${API_BASE_URL}/game/Excelresult?gameCode=${gameCode}`);
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