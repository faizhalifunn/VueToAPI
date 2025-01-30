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
        <div class="flex justify-center space-x-4 mt-4">
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
            class="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition"
          >
            END GAME
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from "vue";
  
  export default {
    name: "AdminControlPage",
    setup() {
      const round = ref(1);
      const leaderboard = ref([]);
      const isProcessing = ref(false); // State untuk animasi loading
  
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
  
      // End round function with API call
      const endRound = async () => {
        if (isProcessing.value) return;
  
        isProcessing.value = true; // Set loading state
        const gameCode = localStorage.getItem("gameCode");
  
        try {
          const response = await fetch("https://api-fastify-pi.vercel.app/round/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ gameCode }),
          });
  
          const result = await response.json();
          if (response.ok) {
            alert(result.message); // Tampilkan pesan sukses
            window.location.reload(); // Refresh halaman setelah round bertambah
          } else {
            alert("Failed to end the round. Please try again.");
          }
        } catch (error) {
          console.error("Error ending round:", error);
          alert("An error occurred while ending the round.");
        } finally {
          isProcessing.value = false; // Reset loading state
        }
      };
  
      // End game function (dummy for now)
      const endGame = () => {
        alert("Game ended! Implement API call here.");
      };
  
      // Fetch data when component is mounted
      onMounted(() => {
        fetchRoundData();
      });
  
      return { round, sortedLeaderboard, formatNumber, endRound, endGame, isProcessing };
    },
  };
  </script>
  
  <style>
  /* Animasi Loading */
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
  