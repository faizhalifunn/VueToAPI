<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2C3E68] to-[#0D1B2A] text-white font-sans px-4 py-10">
    <div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-white/20">
      
      <!-- Status: Waiting -->
      <template v-if="gameStatus === 'Waiting'">
        <p class="font-bold mb-6 text-3xl">Waiting...</p>
        <p class="text-lg font-medium mb-6">Tunggu sampai Admin memulai game-nya!</p>
        <div class="wave-animation p-10">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </template>

      <!-- Status: onGoing -->
      <template v-else-if="gameStatus === 'onGoing'">
        <p class="font-bold mb-6 text-3xl">Game Dimulai!</p>
        <p class="text-lg font-medium mb-6">Tunggu sampai pemain kembali dari fasilitator</p>
        <div class="wave-animation p-10">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div class="mt-6">
          <button
            @click="goToNextPage"
            class="bg-[#00A8C6] text-white text-lg font-semibold py-2 px-6 rounded-xl hover:brightness-110 transition"
          >
            Next ...
          </button>
        </div>
      </template>

      <!-- Status: Loading -->
      <template v-else>
        <p class="font-bold mb-6 text-3xl">Loading...</p>
        <div class="loading-spinner"></div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "LoadingPage",
  setup() {
    const router = useRouter();
    const gameStatus = ref(null);
    const gameCode = localStorage.getItem("gameCode");

    const fetchGameStatus = async () => {
      if (!gameCode) {
        gameStatus.value = "error";
        return;
      }

      try {
        const response = await fetch(`https://api-fastify-pi.vercel.app/game/getgame/${gameCode}`);
        const data = await response.json();
        gameStatus.value = data.data?.gameData?.status || "error";
      } catch (error) {
        console.error("Error fetching game status:", error);
        gameStatus.value = "error";
      }
    };

    const goToNextPage = () => {
      router.push("/player/input");
    };

    onMounted(fetchGameStatus);

    return {
      gameStatus,
      goToNextPage,
    };
  },
};
</script>

<style scoped>
.wave-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.wave-animation span {
  width: 12px;
  height: 12px;
  background-color: #00A8C6;
  border-radius: 50%;
  animation: waveMove 1.5s infinite ease-in-out;
}

.wave-animation span:nth-child(1) { animation-delay: 0s; }
.wave-animation span:nth-child(2) { animation-delay: 0.2s; }
.wave-animation span:nth-child(3) { animation-delay: 0.4s; }

@keyframes waveMove {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.loading-spinner {
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top: 3px solid #00A8C6;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 10px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
