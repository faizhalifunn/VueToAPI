<template>
  <div class="h-screen flex items-center justify-center bg-black">
    <div class="bg-white rounded-2xl shadow-md p-6 w-full max-w-2xl">
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
          class="grid grid-cols-[1fr_2fr_1fr_auto] gap-2 items-center bg-gray-300 py-2 px-4 rounded-lg mb-2 outline-2"
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

    // Fetch round data and leaderboard
    const fetchRoundData = async () => {
      const gameCode = localStorage.getItem("gameCode");
      if (!gameCode) {
        alert("No game code found. Redirecting...");
        window.location.href = "/"; // Redirect jika tidak ada gameCode
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

    // ✅ END GAME: Panggil `/round/countall` lalu redirect ke `/endresult`
    const endGame = async () => {
      if (isProcessing.value) return;
      isProcessing.value = true;
      const gameCode = localStorage.getItem("gameCode");

      try {
        console.log("Ending game and counting rounds for game:", gameCode);
        
        // 🔹 1. Jalankan endpoint `/round/countall`
        const response = await fetch("https://api-fastify-pi.vercel.app/Game/End", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameCode }),
        });

        const result = await response.json();
        console.log("API Response:", result);

        if (!response.ok) {
          throw new Error(result.message || "Failed to end game.");
        }

        alert("Game ended successfully! Redirecting to end result...");

        // 🔹 2. Redirect ke `/endresult`
        router.push("/endresult");
      } catch (error) {
        alert(`Error: ${error.message}`);
        console.error("Error ending game:", error);
      } finally {
        isProcessing.value = false;
      }
    };

    // END ROUND Placeholder
    const endRound = async () => {
      alert("End round feature is not implemented yet.");
    };

    // Fetch data saat halaman dimuat
    onMounted(() => {
      fetchRoundData();
    });

    return { round, sortedLeaderboard, formatNumber, endRound, endGame, isProcessing };
  },
};
</script>

<style>
/* 🔥 Animasi Loading Spinner */
.loading-spinner {
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
