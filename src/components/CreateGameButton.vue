<template>
  <div class="h-screen flex flex-col items-center justify-center bg-black space-y-8 relative">
    <!-- 🔙 Tombol Back Berwarna Merah -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-500 transition hover:scale-105 shadow-md"
    >
      ← Back
    </button>

    <!-- Tombol Create Game -->
    <button
      @click="resetAndCreateGame"
      :disabled="isProcessing"
      class="text-white bg-black border-2 border-white font-bold text-lg px-8 py-3 rounded-xl shadow-md hover:bg-gray-800 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span v-if="isProcessing" class="loading-spinner mr-2"></span>
      <span>{{ isProcessing ? "Processing..." : "CREATE ROOM" }}</span>
    </button>

    <!-- Text Separator -->
    <span class="text-gray-400 font-medium text-lg py-2">Or</span>

    <!-- Input dan Tombol Join Game -->
    <div class="bg-white rounded-lg shadow-md p-6 flex flex-col items-center space-y-4 w-80">
      <div>
        <h2 class="text-black font-bold text-lg">Join Game</h2>
        <input
        v-model="joinGameCode"
        type="text"
        placeholder="Enter Code"
        class="w-full px-4 py-2 border border-gray-300 text-black rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
      </div>
      <div class="pt-2">
        <button
          @click="joinGame"
          :disabled="isProcessing"
          class="bg-black text-white font-medium text-lg px-6 py-2 rounded-xl hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
            alert("Unknown game status. Please try again.");
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

<style>
/* Spinner Animasi */
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
