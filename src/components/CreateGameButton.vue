<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2C3E68] to-[#0D1B2A] px-4 font-sans relative">
    <!-- Tombol Back -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 bg-[#00A8C6] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2C3E68] transition hover:scale-105 shadow-md"
    >
      ← Back
    </button>

    <!-- Panel Utama -->
    <div class="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl px-10 py-10 flex flex-col items-center space-y-12 animate-fade-in">
      
      <!-- Create Room -->
      <div class="flex flex-col items-center w-full space-y-3">
        <h2 class="text-white text-xl font-bold">Create Room</h2>
        <button
          @click="resetAndCreateGame"
          :disabled="isProcessing"
          class="bg-gradient-to-r from-[#00A8C6] to-[#78FFE4] text-[#0D1B2A] font-semibold px-6 py-2 rounded-full shadow-md hover:scale-105 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          {{ isProcessing ? "Processing..." : "Start New Game" }}
        </button>
      </div>

      <!-- Join Game -->
      <div class="flex flex-col items-center w-full space-y-3">
        <h2 class="text-white text-xl font-bold">Join Game</h2>
        <input
          v-model="joinGameCode"
          type="text"
          placeholder="Enter Code"
          class="w-full px-4 py-2 text-center bg-white text-[#1C2541] rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8C6] transition"
        />
        <span
          @click="joinGame"
          v-if="!isProcessing"
          class="text-sm text-white font-medium cursor-pointer hover:text-[#78FFE4] transition duration-200"
        >
          Enter
        </span>
        <span v-else class="text-sm text-gray-300">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref } from "vue";

export default {
  name: "CreateGameButton",
  setup() {
    const router = useRouter();
    const isProcessing = ref(false);
    const joinGameCode = ref("");

    const goBack = () => router.go(-1);

    const resetAndCreateGame = async () => {
      if (isProcessing.value) return;
      isProcessing.value = true;
      localStorage.clear();

      try {
        const response = await fetch("https://api-fastify-pi.vercel.app/game/creategame", {
          method: "POST",
        });
        const result = await response.json();

        if (result.message === "Game created successfully") {
          const gameCode = result.data.gameCode;
          localStorage.setItem("gameCode", gameCode);
          router.push({ name: "GamePage", params: { gameCode } });
        } else {
          alert("Failed to create game.");
        }
      } catch (error) {
        console.error("Error while creating game:", error);
        alert("An error occurred.");
      } finally {
        isProcessing.value = false;
      }
    };

    const joinGame = async () => {
      if (isProcessing.value || !joinGameCode.value.trim()) {
        alert("Please enter a valid game code!");
        return;
      }

      isProcessing.value = true;
      localStorage.clear();

      try {
        const response = await fetch(
          `https://api-fastify-pi.vercel.app/game/getgame/${joinGameCode.value}`
        );
        const result = await response.json();

        if (result.message === "Game retrieved successfully") {
          const { gameCode, status } = result.data.gameData;
          localStorage.setItem("gameCode", gameCode);

          if (status === "onGoing") {
            router.push({ name: "Adminpage", params: { gameCode } });
          } else if (status === "Waiting") {
            router.push({ name: "GamePage", params: { gameCode } });
          } else {
            alert("This game has already ended.");
          }
        } else {
          alert("Game not found.");
        }
      } catch (error) {
        console.error("Error while joining game:", error);
        alert("An error occurred.");
      } finally {
        isProcessing.value = false;
      }
    };

    return {
      resetAndCreateGame,
      joinGame,
      isProcessing,
      joinGameCode,
      goBack,
    };
  },
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.6s ease-out both;
}
</style>
