<template>
  <div class="h-screen flex flex-col items-center justify-center bg-black relative">
    <!-- 🔙 Tombol Back Berwarna Merah -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-500 transition hover:scale-105 shadow-md"
    >
      ← Back
    </button>

    <!-- Kotak Join Game -->
    <div class="bg-white rounded-lg shadow-md px-6 py-6 flex flex-col items-center space-y-4 w-80">
      <h2 class="text-black font-bold text-lg">Join Game</h2>

      <!-- Input Game Code -->
      <input
        v-model="joinGameCode"
        type="text"
        placeholder="Enter Code"
        class="w-full px-4 py-2 border border-gray-300 text-black rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-gray-500"
      />

      <!-- Tombol Join -->
      <button
        @click="joinGame"
        :disabled="isProcessing"
        class="bg-black text-white font-medium text-lg px-6 py-2 rounded-full hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isProcessing" class="loading-spinner"></span>
        <span>{{ isProcessing ? "Processing..." : "Enter" }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref } from "vue";

export default {
  name: "JoinPage",
  setup() {
    const router = useRouter();
    const isProcessing = ref(false);
    const joinGameCode = ref("");

    // ✅ Fungsi kembali ke halaman sebelumnya
    const goBack = () => {
      router.go(-1);
    };

    // ✅ Fungsi untuk Join Game
    const joinGame = async () => {
      if (isProcessing.value || !joinGameCode.value.trim()) {
        alert("Please enter a valid game code!");
        return;
      }

      isProcessing.value = true; // Set tombol ke status loading

      // Bersihkan localStorage sebelum menyimpan gameCode baru
      localStorage.removeItem("gameCode");

      try {
        const response = await fetch(
          `https://api-fastify-pi.vercel.app/game/getgame/${joinGameCode.value}`,
          { method: "GET" }
        );
        const result = await response.json();

        if (result.message === "Game retrieved successfully") {
          const gameCode = result.data.gameData.gameCode;
          const userRole = localStorage.getItem("userRole"); // Ambil role dari localStorage

          // Simpan gameCode ke LocalStorage
          localStorage.setItem("gameCode", gameCode);

          // Redirect berdasarkan role
          switch (userRole) {
            case "Admin":
              router.push({ name: "Adminpage", params: { gameCode } });
              break;
            case "Player":
              router.push({ path: "/player" });
              break;
            case "Strategic":
              router.push({ path: "/strategic" });
              break;
            case "Marketing":
              router.push({ path: "/marketing" });
              break;
            default:
              alert("Invalid role. Please select a valid role before joining.");
              router.push("/"); // Redirect ke halaman utama jika role tidak valid
              break;
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

    return { joinGame, isProcessing, joinGameCode, goBack };
  },
};
</script>

<style>
/* 🔥 Animasi Loading Spinner */
.loading-spinner {
  display: inline-block;
  border: 3px solid white;
  border-top: 3px solid transparent;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
