<template>
    <div class="h-screen flex items-center justify-center bg-black text-gray-800">
      <!-- Card -->
      <div class="bg-gray-200 rounded-2xl shadow-md p-6 w-full max-w-md text-center">
        <!-- Teks Informasi -->
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
      </div>
    </div>
  </template>
  
  <script>
  import { useRouter } from "vue-router";
  
  export default {
    name: "LoadingPage",
    setup() {
      const router = useRouter();
  
      // Fungsi untuk redirect ke halaman /player/input
      const goToNextPage = () => {
        router.push("/player/input");
      };
  
      return { goToNextPage };
    },
  };
  </script>
  
  <style>
  /* Animasi Gelombang */
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
  </style>
  