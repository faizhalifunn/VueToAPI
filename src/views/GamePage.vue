<template>
  <div class="h-screen flex items-center justify-center bg-gray-900">
    <div class="bg-gray-100 rounded-2xl shadow-md p-8 w-full max-w-md">
      <!-- Jika data belum terambil, tampilkan spinner -->
      <div v-if="!isDataLoaded" class="flex justify-center items-center h-full">
        <div class="loading-spinner"></div>
      </div>

      <!-- Jika data sudah terambil, tampilkan form -->
      <div v-else>
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
            <span>{{ isProcessing ? "Processing..." : "Submit & Start Game" }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "GamePage",
  setup() {
    const router = useRouter();
    const gameCode = ref("");
    const isProcessing = ref(false);
    const isDataLoaded = ref(false); // Tambahkan state untuk memastikan data terambil
    const bungaData = [
      "Bunga Kredit Produktif",
      "Bunga Kredit Konsumtif",
      "Bunga Dana Pihak Ketiga",
      "Bunga Kantor Pusat",
    ];
    const form = ref([0, 0, 0, 0]); // Nilai default diisi dengan 0

    // Fetch gameCode dari LocalStorage
    const fetchGameCode = async () => {
      const storedGameCode = localStorage.getItem("gameCode");
      if (storedGameCode) {
        gameCode.value = storedGameCode;
        await fetchGameData(storedGameCode); // Fetch data game
      } else {
        router.push("/"); // Redirect jika tidak ada gameCode
      }
    };

    // Fetch data game dari API
    const fetchGameData = async (code) => {
      try {
        const response = await fetch(`https://api-fastify-pi.vercel.app/game/getgame/${code}`);
        const result = await response.json();

        if (result.message === "Game retrieved successfully") {
          const gameData = result.data.gameData;

          // Set nilai bunga dari data API
          form.value = [
            gameData.ProInterest || 0,
            gameData.ConInterest || 0,
            gameData.OutInterest || 0,
            gameData.HeadInterest || 0,
          ];

          isDataLoaded.value = true; // Set data sebagai sudah terambil
        } else {
          alert("Failed to retrieve game data. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
        alert("An error occurred while fetching game data.");
      }
    };

    // Fungsi Submit & Start Game
    const handleSubmit = async () => {
      if (isProcessing.value) return;

      isProcessing.value = true;

      const interestSubmitted = await submitInterest(); // Submit interest
      if (interestSubmitted) {
        const gameStarted = await startGame(); // Start game
        if (gameStarted) {
          router.push({ name: "Adminpage", params: { gameCode: gameCode.value } }); // Redirect ke AdminPage
        }
      }

      isProcessing.value = false;
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
        return response.ok;
      } catch (error) {
        console.error("Error submitting interest:", error);
        return false;
      }
    };

    // Start game
    const startGame = async () => {
      try {
        const response = await fetch("https://api-fastify-pi.vercel.app/round/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameCode: gameCode.value }),
        });
        return response.ok;
      } catch (error) {
        console.error("Error starting the game:", error);
        return false;
      }
    };

    onMounted(() => {
      fetchGameCode();
    });

    return { gameCode, bungaData, form, isProcessing, isDataLoaded, handleSubmit };
  },
};
</script>

<style>
.loading-spinner {
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
