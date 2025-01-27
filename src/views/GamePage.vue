<template>
  <div class="h-screen flex items-center justify-center bg-gray-900">
    <div class="bg-gray-100 rounded-2xl shadow-md p-8 w-full max-w-md">
      <!-- Judul -->
      <h1 class="text-xl font-bold text-center mb-4 text-black">Game Created!</h1>

      <!-- Game Code -->
      <div class="bg-black text-white text-center py-2 rounded-lg mb-6">
        <span class="text-lg font-bold">{{ gameCode }}</span>
      </div>

      <!-- Form Judul -->
      <h2 class="text-lg font-bold text-center mb-6 text-black">Setel Bunga</h2>

      <!-- Input Form -->
      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 gap-y-2">
        <div
          v-for="(label, index) in bungaData"
          :key="index"
          class="grid grid-cols-[1fr_auto_auto] items-center gap-x-4"
        >
          <!-- Label -->
          <span class="text-gray-700 text-sm font-medium">{{ label }}</span>
          <!-- Input -->
          <input
            v-model="form[index]"
            type="number"
            class="w-24 h-10 p-4 border border-gray-300 rounded-lg text-center text-lg text-gray-600 bg-gray-50 shadow-sm"
            min="0"
            max="100"
            required
          />
          <!-- Simbol % -->
          <span class="text-gray-700 text-sm font-medium">%</span>
        </div>

        <!-- Tombol Submit -->
        <button
          type="submit"
          :disabled="isProcessing"
          class="mt-8 w-full text-white bg-black hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-3 text-center disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="isProcessing" class="loading-spinner mr-2"></span>
          <span>{{ isProcessing ? 'Processing...' : 'Submit & Start Game' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
  name: "GamePage",
  setup() {
    // Game Code
    const gameCode = ref("Loading...");
    const isProcessing = ref(false);

    // Data bunga
    const bungaData = [
      "Bunga Kredit Produktif",
      "Bunga Kredit Konsumtif",
      "Bunga Dana Pihak Ketiga",
      "Bunga Kantor Pusat",
    ];

    // Form data bunga
    const form = ref(bungaData.map(() => 0)); // Semua nilai bunga awalnya 0

    // Fetch gameCode
    const fetchGameCode = async () => {
      const storedGameCode = localStorage.getItem("gameCode"); // Cek apakah gameCode sudah ada di LocalStorage
      if (storedGameCode) {
        // Jika gameCode ada, gunakan dari LocalStorage
        gameCode.value = storedGameCode;
        return;
      }

      // Jika tidak ada gameCode, buat game baru
      try {
        const response = await fetch("https://api-fastify-pi.vercel.app/game/creategame", {
          method: "POST",
        });
        const result = await response.json();
        if (result.message === "Game created successfully") {
          const newGameCode = result.data.gameCode;

          // Simpan gameCode ke LocalStorage
          localStorage.setItem("gameCode", newGameCode);

          // Set nilai gameCode
          gameCode.value = newGameCode;
        } else {
          gameCode.value = "Error";
        }
      } catch (error) {
        console.error("Error fetching game code:", error);
        gameCode.value = "Error";
      }
    };

    // Submit bunga data
    const submitInterest = async () => {
      try {
        const response = await fetch("https://api-fastify-pi.vercel.app/game/addinterest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gameCode: gameCode.value,
            ProInterest: form.value[0],
            ConInterest: form.value[1],
            OutInterest: form.value[2],
            HeadInterest: form.value[3],
          }),
        });
        const result = await response.json();
        if (response.ok) {
          console.log("Interest submitted successfully");
          return true;
        } else {
          alert("Failed to submit interest. Please try again.");
          return false;
        }
      } catch (error) {
        console.error("Error submitting interest:", error);
        alert("An error occurred while submitting interest.");
        return false;
      }
    };

    // Start game
    const startGame = async () => {
      try {
        const response = await fetch("https://api-fastify-pi.vercel.app/round/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gameCode: gameCode.value }),
        });
        const result = await response.json();
        if (response.ok) {
          alert(result.message); // Tampilkan pesan sukses
        } else {
          alert("Failed to start the game. Please try again.");
        }
      } catch (error) {
        console.error("Error starting the game:", error);
        alert("An error occurred while starting the game.");
      }
    };

    // Handle submit & start
    const handleSubmit = async () => {
      if (isProcessing.value) return;

      isProcessing.value = true;
      const interestSubmitted = await submitInterest(); // Jalankan submit interest terlebih dahulu
      if (interestSubmitted) {
        await startGame(); // Lanjutkan ke start game jika submit interest berhasil
      }
      isProcessing.value = false;
    };

    onMounted(() => {
      fetchGameCode();
    });

    return { gameCode, bungaData, form, isProcessing, handleSubmit };
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
