<template>
  <div class="h-screen flex items-center justify-center">
    <button
      @click="resetAndCreateGame"
      :disabled="isProcessing"
      class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      <span v-if="isProcessing" class="loading-spinner mr-2"></span>
      <span>{{ isProcessing ? 'Processing...' : 'Create Game' }}</span>
    </button>
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

    return { resetAndCreateGame, isProcessing };
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
