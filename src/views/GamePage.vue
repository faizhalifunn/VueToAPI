<template>
  <div class="h-screen flex items-center justify-center bg-gray-900">
    <div class="bg-gray-100 rounded-2xl shadow-md p-8 w-full max-w-md relative">
      <!-- Overlay untuk menunggu tim join -->
      <transition name="fade">
        <div
          v-if="isWaitingForTeam"
          class="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-md flex flex-col justify-center items-center z-10 rounded-2xl"
        >
          <div class="new-spinner"></div>
          <p class="text-white mt-4 text-lg font-semibold tracking-wide animate-pulse">
            Waiting for Team to Join...
          </p>
        </div>
      </transition>

      <!-- Jika data belum terambil, tampilkan spinner -->
      <div v-if="!isDataLoaded" class="flex justify-center items-center h-full">
        <div class="new-spinner"></div>
      </div>

      <!-- Jika data sudah terambil, tampilkan form -->
      <div v-else>
        <!-- Judul -->
        <h1 class="text-xl font-bold text-center mb-4 text-black">Game Created!</h1>

        <!-- Game Code -->
        <div class="bg-black text-white text-center py-3 rounded-lg mb-6">
          <span class="text-lg font-bold">{{ gameCode }}</span>
        </div>

        <!-- Form Judul -->
        <h2 class="text-lg font-bold text-center mb-6 text-black">Setel Bunga</h2>

        <!-- Input Form -->
        <form @submit.prevent="handleSubmit" class="grid grid-cols-1 gap-y-4">
          <div
            v-for="(label, index) in bungaData"
            :key="index"
            class="flex justify-between items-center"
          >
            <!-- Label -->
            <span class="text-gray-700 text-sm font-medium">{{ label }}</span>
            <div class="flex items-center gap-2">
              <!-- Input -->
              <input
                v-model="form[index]"
                type="number"
                class="w-24 h-10 p-2 border border-gray-300 rounded-lg text-center text-gray-600 bg-gray-50 focus:border-black focus:outline-none transition duration-300"
                min="0"
                max="100"
                required
              />
              <!-- Simbol % -->
              <span class="text-gray-700 text-sm font-medium">%</span>
            </div>
          </div>

          <!-- Tombol Submit -->
          <button
            type="submit"
            :disabled="isProcessing || isWaitingForTeam"
            class="mt-8 w-full text-white bg-black hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-3 text-center transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <span v-if="isProcessing" class="new-spinner mr-2"></span>
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
    const isDataLoaded = ref(false);
    const isWaitingForTeam = ref(false);
    const bungaData = [
      "Bunga Kredit Produktif",
      "Bunga Kredit Konsumtif",
      "Bunga Dana Pihak Ketiga",
      "Bunga Kantor Pusat",
    ];
    const form = ref([0, 0, 0, 0]);

    const fetchGameCode = async () => {
      const storedGameCode = localStorage.getItem("gameCode");
      if (storedGameCode) {
        gameCode.value = storedGameCode;
        await fetchGameData(storedGameCode);
      } else {
        router.push("/");
      }
    };

    const fetchGameData = async (code) => {
      try {
        const response = await fetch(`https://api-fastify-pi.vercel.app/game/getgame/${code}`);
        const result = await response.json();

        if (result.message === "Game retrieved successfully") {
          const gameData = result.data.gameData;
          form.value = [
            gameData.ProInterest || 0,
            gameData.ConInterest || 0,
            gameData.OutInterest || 0,
            gameData.HeadInterest || 0,
          ];
          isDataLoaded.value = true;
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };

    const handleSubmit = async () => {
      if (isProcessing.value) return;

      isProcessing.value = true;

      const interestSubmitted = await submitInterest();
      if (interestSubmitted) {
        const gameStarted = await startGame();
        if (gameStarted) {
          isWaitingForTeam.value = true;
          await new Promise((resolve) => setTimeout(resolve, 3000));
          router.push({ name: "Adminpage", params: { gameCode: gameCode.value } });
        }
      }

      isProcessing.value = false;
    };

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

    return { gameCode, bungaData, form, isProcessing, isDataLoaded, handleSubmit, isWaitingForTeam };
  },
};
</script>

<style scoped>
.new-spinner {
  border: 3px solid transparent;
  border-top: 3px solid white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
