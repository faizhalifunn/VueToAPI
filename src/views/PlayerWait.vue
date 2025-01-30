<template>
    <div class="h-screen flex items-center justify-center bg-black text-gray-800">
      <div class="bg-gray-200 rounded-2xl shadow-md p-6 w-full max-w-md text-center">
        <!-- Pesan Saat Status "Waiting" -->
        <template v-if="gameStatus === 'Waiting'">
          <p class="font-semibold mb-6 text-3xl">Waiting...</p>
          <p class="text-lg font-semibold mb-6">Tunggu sampai Admin memulai game nya!</p>
  
          <!-- Animasi Gelombang -->
          <div class="wave-animation p-10">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </template>
  
        <!-- Tampilan Saat Status "onGoing" -->
        <template v-else-if="gameStatus === 'onGoing'">
          <p class="font-semibold mb-6 text-3xl">Game Dimulai!</p>
          <p class="text-lg font-semibold mb-6">Tunggu sampai pemain kembali dari fasilitator</p>
  
          <!-- Animasi Gelombang -->
          <div class="wave-animation p-10">
            <span></span>
            <span></span>
            <span></span>
          </div>
  
          <!-- Tombol Next -->
          <div class="mt-8">
            <button
              @click="goToNextPage"
              class="bg-black text-white text-lg font-semibold py-2 px-6 rounded-lg hover:bg-gray-800 transition"
            >
              Next ...
            </button>
          </div>
        </template>
  
        <!-- Animasi Loading Saat Mengambil Data -->
        <template v-else>
          <p class="font-semibold mb-6 text-3xl">Loading...</p>
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
  
      // ✅ Fetch Game Status
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
  
      // ✅ Redirect ke halaman berikutnya
      const goToNextPage = () => {
        router.push("/player/input");
      };
  
      // 🔄 Fetch status game saat halaman dimuat
      onMounted(fetchGameStatus);
  
      return {
        gameStatus,
        goToNextPage,
      };
    },
  };
  </script>
  
  <style>
  /* 🔄 Animasi Gelombang */
  .wave-animation {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
  
  .wave-animation span {
    width: 12px;
    height: 12px;
    background-color: gray;
    border-radius: 50%;
    animation: waveMove 1.5s infinite ease-in-out;
  }
  
  .wave-animation span:nth-child(1) {
    animation-delay: 0s;
  }
  .wave-animation span:nth-child(2) {
    animation-delay: 0.2s;
  }
  .wave-animation span:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes waveMove {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  /* 🔄 Animasi Loading Spinner */
  .loading-spinner {
    border: 3px solid gray;
    border-top: 3px solid transparent;
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
  