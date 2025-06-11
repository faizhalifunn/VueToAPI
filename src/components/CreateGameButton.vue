<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2C3E68] to-[#0D1B2A] font-sans px-4 py-10 relative">
    <!-- Tombol Back -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 bg-[#00A8C6] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2C3E68] transition hover:scale-105 shadow-md"
    >
      ← Back
    </button>

    <!-- Kontainer Utama -->
    <div class="flex flex-col items-center space-y-6">
      <!-- Tombol Create Game -->
      <button
        @click="resetAndCreateGame"
        :disabled="isProcessing"
        class="bg-[#00A8C6] text-white text-lg font-semibold px-8 py-4 rounded-full hover:bg-[#2C3E68] active:scale-95 transition shadow-xl hover:shadow-2xl duration-300 disabled:opacity-50"
      >
        <span v-if="isProcessing" class="loading-spinner mr-2"></span>
        <span>{{ isProcessing ? "Processing..." : "CREATE ROOM" }}</span>
      </button>

      <!-- Separator -->
      <span class="text-white text-lg font-medium">Or</span>

      <!-- Form Join Game -->
  <!-- Join Game Form -->
    <div class="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-3xl shadow-xl p-8 w-[340px] flex flex-col items-center">
      <h2 class="text-xl font-bold mb-4">Join Game</h2>
      
      <input
        v-model="joinGameCode"
        type="text"
        placeholder="Enter Code"
        class="w-full px-4 py-2 text-center bg-white text-[#1C2541] rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8C6] transition mb-3"
      />

     <button
        @click="joinGame"
        :disabled="isProcessing"
        class="bg-gradient-to-r from-[#00A8C6] to-[#78FFE4] text-[#0D1B2A] px-6 py-2 rounded-full text-sm font-semibold tracking-wide shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isProcessing" class="loading-spinner mr-2"></span>
        <span>{{ isProcessing ? "Processing..." : "Enter" }}</span>
      </button>
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
    const isProcessing = ref(false); // State untuk animasi loading
    const joinGameCode = ref(""); // State untuk input gameCode

    // Fungsi kembali ke halaman sebelumnya
    const goBack = () => {
      router.go(-1);
    };

    // Fungsi untuk mereset localStorage dan membuat game baru
    const resetAndCreateGame = async () => {
      if (isProcessing.value) return; // Cegah klik ganda
      isProcessing.value = true; // Set tombol ke status loading

      // Bersihkan localStorage
      localStorage.clear();

      // Buat game baru
      try {
        const response = await fetch("https://api-fastify-pi.vercel.app/game/creategame", {
          method: "POST",
        });
        const result = await response.json();

        if (result.message === "Game created successfully") {
          const gameCode = result.data.gameCode;

          // Simpan gameCode ke LocalStorage
          localStorage.setItem("gameCode", gameCode);

          // Redirect ke halaman baru dengan gameCode
          router.push({ name: "GamePage", params: { gameCode } });
        } else {
          console.error("Failed to create game:", result);
        }
      } catch (error) {
        console.error("Error while creating game:", error);
      } finally {
        isProcessing.value = false; // Reset tombol ke status normal
      }
    };

    // Fungsi untuk Join Game
    const joinGame = async () => {
      if (isProcessing.value || !joinGameCode.value.trim()) {
        alert("Please enter a valid game code!");
        return;
      }

      isProcessing.value = true; // Set tombol ke status loading

      // Bersihkan localStorage
      localStorage.clear();

      try {
        const response = await fetch(
          `https://api-fastify-pi.vercel.app/game/getgame/${joinGameCode.value}`,
          { method: "GET" }
        );
        const result = await response.json();

        if (result.message === "Game retrieved successfully") {
          const status = result.data.gameData.status;
          const gameCode = result.data.gameData.gameCode;

          // Simpan gameCode ke LocalStorage
          localStorage.setItem("gameCode", gameCode);

          // Redirect berdasarkan status game
          if (status === "onGoing") {
            router.push({ name: "Adminpage", params: { gameCode } });
          } else if (status === "Waiting") {
            router.push({ name: "GamePage", params: { gameCode } });
          } else {
            alert("This game has already ended. You can create or join a new one to continue playing.");
          }
        } else {
          alert("Game not found. Please check the game code and try again.");
        }
      } catch (error) {
        console.error("Error while joining game:", error);
        alert("An error occurred. Please try again.");
      } finally {
        isProcessing.value = false; // Reset tombol ke status normal
      }
    };

    return { resetAndCreateGame, joinGame, isProcessing, joinGameCode, goBack };
  },
};
</script>

<style scoped>
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