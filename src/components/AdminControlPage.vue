<template>
  <div class="h-screen flex flex-col items-center justify-center bg-black relative">
    <!-- 🔙 Tombol Back -->
    <button
      @click="goBack"
      class="absolute top-8 left-8 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition z-50"
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

    <div v-else class="bg-white rounded-2xl shadow-md p-6 w-full max-w-2xl">
      <!-- Round Header -->
      <div class="bg-black text-white text-2xl font-bold py-2 px-4 rounded-t-lg text-center">
        {{ round }}
      </div>

      <!-- Leaderboard -->
      <div class="bg-gray-200 p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold text-black mb-4">Leaderboard</h2>
        <div class="grid grid-cols-[1fr_2fr_1fr_auto] gap-2 text-sm font-medium text-gray-950 mb-2">
          <span>Rank</span>
          <span>Team Name</span>
          <span>Contribution</span>
          <span></span>
        </div>

        <!-- List Leaderboard -->
        <div
          v-for="(team, index) in sortedLeaderboard"
          :key="index"
          class="grid grid-cols-[1fr_2fr_1fr_auto] gap-2 items-center bg-gray-300 py-2 px-4 rounded-lg mb-2"
        >
          <span class="font-semibold text-gray-700">{{ index + 1 }}</span>
          <span class="font-medium text-gray-700">{{ team.team || "N/A" }}</span>
          <span class="font-mono text-gray-700">{{ formatNumber(team.data.ContributionPoint) }}</span>
          <button class="text-gray-700 font-bold">•••</button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center space-x-4 mt-4 pt-5 gap-10">
        <button
          @click="endRound"
          :disabled="isProcessing"
          class="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="isProcessing" class="loading-spinner mr-2"></span>
          <span>{{ isProcessing ? "Processing..." : "END ROUND" }}</span>
        </button>

        <button
          @click="endGame"
          :disabled="isProcessing"
          class="text-white px-6 bg-red-900 py-2 rounded-lg font-medium hover:bg-gray-600 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
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

    // ✅ Fungsi kembali ke halaman sebelumnya
    const goBack = () => {
      router.go(-1);
    };

    // Fetch round data and leaderboard
    const fetchRoundData = async () => {
      const gameCode = localStorage.getItem("gameCode");
      if (!gameCode) {
        alert("No game code found. Redirecting...");
        window.location.href = "/";
        return;
      }

      try {
        const response = await fetch(`https://api-fastify-pi.vercel.app/round/getroundnow?gameCode=${gameCode}`);
        const result = await response.json();

        if (result.message === "Highest rounds retrieved successfully.") {
          round.value = result.rounds[0]?.round || 1;
          leaderboard.value = result.rounds || [];
        } else {
          alert("Failed to fetch leaderboard data.");
        }
      } catch (error) {
        console.error("Error fetching round data:", error);
        alert("An error occurred while fetching leaderboard.");
      } finally {
        setTimeout(() => {
          isRefreshing.value = false;
        }, 1000);
      }
    };

    // Format numbers with leading zeros
    const formatNumber = (num) => {
      return num ? num.toString().padStart(5, "0") : "00000";
    };

    // Sort leaderboard based on ContributionPoint (descending order)
    const sortedLeaderboard = computed(() => {
      return [...leaderboard.value].sort((a, b) => {
        return (b.data.ContributionPoint || 0) - (a.data.ContributionPoint || 0);
      });
    });

    onMounted(() => {
      fetchRoundData();
    });

    return { round, sortedLeaderboard, formatNumber, goBack, isProcessing, isRefreshing };
  },
};
</script>
