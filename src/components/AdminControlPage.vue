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
    <div v-else class="bg-white rounded-2xl shadow-md p-6 w-full max-w-3xl">
      <!-- **Header: Round di Kiri, GameCode di Kanan** -->
      <div class="bg-black text-white text-2xl font-bold py-2 px-4 rounded-t-lg flex justify-between items-center">
        <span>{{ round }}</span>
        <span class="text-lg font-medium">{{ gameCode }}</span>
      </div>

      <!-- Leaderboard Table -->
      <div class="bg-gray-200 p-6 rounded-lg shadow-md">
        <div class="grid grid-cols-5 gap-4 text-sm font-bold text-gray-900 bg-gray-300 px-4 py-2 rounded-md border-b border-gray-400">
          <span class="text-left">Rank</span>
          <span class="text-left">Team Name</span>
          <span class="text-right">Contribution</span>
          <span class="text-right">Total Bintang</span>
          <span class="text-center"></span> <!-- Placeholder -->
        </div>

        <div
          v-for="(team, index) in sortedLeaderboard"
          :key="index"
          class="grid grid-cols-5 gap-4 items-center bg-gray-300 px-4 py-2 rounded-lg mb-2"
        >
          <span class="font-semibold text-gray-700 text-left">{{ index + 1 }}</span>
          <span class="font-medium text-gray-700 text-left">{{ team.team || "N/A" }}</span>
          <span class="font-mono text-gray-700 text-center">{{ formatNumber(team.data.ContributionPoint) }}</span>
          <span class="font-mono text-gray-700 text-center">{{ formatNumber(team.TotalBintang) }}</span>
          <button class="text-gray-700 font-bold text-center">•••</button>
        </div>

        
      </div>

      <!-- Dropdown Forecast & Milestone -->
      <div class="flex justify-evenly gap-3 py-2 text-gray-600">
        <select v-model="selectedMilestone" class="p-3 rounded-lg bg-gray-100 border border-gray-400 shadow-sm">
          <option value="" disabled>Select this round Milestone</option>
          <option value="no milestone">No Milestone</option>
          <option v-for="milestone in milestones" :key="milestone.id" :value="milestone.id">
            {{ milestone.note }}
          </option>
        </select>

        <select v-model="selectedForecast" class="p-3 rounded-lg bg-gray-100 border border-gray-400 shadow-sm">
          <option value="" disabled>Select this round Forecast</option>
          <option value="no forecast">No Forecast</option>
          <option v-for="forecast in forecasts" :key="forecast.id" :value="forecast.id">
            {{ forecast.note }}
          </option>
        </select>
      </div>
      

      <!-- Buttons -->
      <div class="flex justify-center space-x-4 mt-4 pt-5 gap-10">
        <!-- END ROUND -->
        <button @click="confirmEndRound" :disabled="isProcessing" class="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed">
          <span v-if="isProcessing" class="loading-spinner mr-2"></span>
          <span>{{ isProcessing ? "Processing..." : "END ROUND" }}</span>
        </button>

        <!-- END GAME -->
        <button @click="confirmEndGame" :disabled="isProcessing" class="text-white px-6 bg-red-900 py-2 rounded-lg font-medium hover:bg-gray-600 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed">
          <span v-if="isProcessing" class="loading-spinner mr-2"></span>
          <span>{{ isProcessing ? "Processing..." : "END GAME" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "AdminControlPage",
  setup() {
    const router = useRouter();
    const round = ref(1);
    const leaderboard = ref([]);
    const isProcessing = ref(false);
    const isRefreshing = ref(true);

    const gameCode = localStorage.getItem("gameCode");
    const selectedMilestone = ref("");
    const selectedForecast = ref("");
    const milestones = ref([]);
    const forecasts = ref([]);

    const goBack = () => {
      router.go(-1);
    };

    // 🔹 Fetch Round Data & Leaderboard
    const fetchRoundData = async () => {
      if (!gameCode) return;

      try {
        const response = await fetch(`https://api-fastify-pi.vercel.app/round/getroundnow?gameCode=${gameCode}`);
        const result = await response.json();
        if (result.message === "Highest rounds retrieved successfully.") {
          round.value = result.rounds[0]?.round || 1;
          leaderboard.value = result.rounds || [];
        }
      } catch (error) {
        console.error("Error fetching round data:", error);
      } finally {
        isRefreshing.value = false;
      }
    };

    // 🔹 Fetch Forecast & Milestone Data
    const fetchDropdownData = async () => {
      try {
        const forecastRes = await fetch("https://api-fastify-pi.vercel.app/game/getforecast");
        const milestoneRes = await fetch("https://api-fastify-pi.vercel.app/game/getmilestone");

        const forecastData = await forecastRes.json();
        const milestoneData = await milestoneRes.json();

        forecasts.value = forecastData.map(f => ({ id: f.id, note: f.Note }));
        milestones.value = milestoneData.map(m => ({ id: m.id, note: m.Note }));
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    // 🔹 Set Round API sebelum END ROUND / END GAME
    const setRound = async () => {
      if (!selectedMilestone.value || !selectedForecast.value) {
        alert("Please select a milestone and forecast before proceeding.");
        return false;
      }

      try {
        const response = await fetch("https://api-fastify-pi.vercel.app/round/setround", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameCode,
            milestoneId: selectedMilestone.value,
            forecastId: selectedForecast.value,
          }),
        });

        return response.ok;
      } catch (error) {
        console.error("Error setting round:", error);
        return false;
      }
    };

    // 🔹 END ROUND
    const confirmEndRound = async () => {
      if (await setRound()) {
        await fetch("https://api-fastify-pi.vercel.app/round/add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gameCode }) });
        location.reload();
      }
    };

    // 🔹 END GAME
    const confirmEndGame = async () => {
      if (await setRound()) {
        await fetch("https://api-fastify-pi.vercel.app/Game/End", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gameCode }) });
        router.push("/endResult");
      }
    };

    onMounted(() => {
      fetchRoundData();
      fetchDropdownData();
    });

    return { round, sortedLeaderboard: computed(() => leaderboard.value), formatNumber: (num) => num || 0, goBack, isProcessing, isRefreshing, confirmEndRound, confirmEndGame, selectedMilestone, selectedForecast, milestones, forecasts, gameCode };
  },
};
</script>
