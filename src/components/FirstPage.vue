<script setup>
import logo from '@/assets/nupmk-logo.png';
import { useRouter } from "vue-router";
import { ref, nextTick } from "vue";

const router = useRouter();
const isProcessing = ref(false);
const joinGameCode = ref("");
const showPlayerForm = ref(false);

const goBack = () => {
  router.go(-1);
};

const openJoinForm = async () => {
  localStorage.setItem("userRole", "Player");
  await nextTick();
  showPlayerForm.value = true;
};

const closeJoinForm = () => {
  showPlayerForm.value = false;
};

const selectRole = async (role) => {
  localStorage.setItem("userRole", role);
  await nextTick();
  console.log("Role selected:", role);

  if (role === "Admin") {
    router.push("/admin");
  } else if (role === "Strategic") {
    router.push("/Join");
  } else if (role === "Marketing") {
    router.push("/Join");
  }
};

const joinGame = async () => {
  const userRole = localStorage.getItem("userRole")?.trim();
  console.log("User Role:", userRole);

  if (!userRole || (userRole !== "Player" && userRole !== "Strategic" && userRole !== "Marketing")) {
    alert("Invalid role. Please select a valid role before joining.");
    return;
  }

  if (isProcessing.value || !joinGameCode.value.trim()) {
    alert("Please enter a valid game code!");
    return;
  }

  isProcessing.value = true;

  try {
    const response = await fetch(
      `https://api-fastify-pi.vercel.app/game/getgame/${joinGameCode.value}`,
      { method: "GET" }
    );
    const result = await response.json();

    if (result.message === "Game retrieved successfully") {
      const gameCode = result.data.gameData.gameCode;
      localStorage.setItem("gameCode", gameCode);

      switch (userRole) {
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
          router.push("/");
          break;
      }
    } else {
      alert("Game not found. Please check the game code and try again.");
    }
  } catch (error) {
    console.error("Error while joining game:", error);
    alert("An error occurred. Please try again.");
  } finally {
    isProcessing.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#2C3E68] to-[#0D1B2A] relative font-sans px-4 py-10">
    <!-- 🔙 Tombol Back -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 bg-[#00A8C6] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2C3E68] transition hover:scale-105 shadow-md"
    >
      ← Back
    </button>

    <!-- Ilustrasi -->
    <div class="flex flex-col items-center animate-fade-in -mt-60 mb-44" style="z-index:10; position:relative;">
      <img :src="logo" alt="nuPMK Logo" class="w-24 h-24 rounded-full shadow-md" />
    </div>

    <!-- Container Utama -->
    <div class="bg-white/10 backdrop-blur-md text-white rounded-3xl shadow-2xl p-10 flex flex-col items-center space-y-6 max-w-md w-full animate-fade-in border border-white/20 relative z-10">
      <!-- Tombol Play Now -->
      <button
        @click="openJoinForm"
        class="bg-[#00A8C6] text-white text-lg font-semibold px-8 py-4 rounded-full w-full hover:bg-[#2C3E68] active:scale-95 transition shadow-xl hover:shadow-2xl duration-300 tracking-wide"
      >
       Play Now
      </button>

      <!-- Pilihan Role (Admin, Strategic, Marketing) -->
      <div class="flex justify-center gap-x-6 mt-4">
  <button @click="selectRole('Admin')" class="text-white text-sm font-medium hover:text-[#00A8C6] transition duration-200 underline-offset-2 hover:underline">Admin</button>
  <button @click="selectRole('Strategic')" class="text-white text-sm font-medium hover:text-[#00A8C6] transition">Strategic</button>
  <button @click="selectRole('Marketing')" class="text-white text-sm font-medium hover:text-[#00A8C6] transition">Marketing</button>
</div>
    </div>

    <!-- Form Join Game (Modal) -->
    <div v-if="showPlayerForm" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
      <div class="bg-white rounded-xl shadow-xl p-6 w-80 animate-fade-in">
        <h2 class="text-xl font-semibold text-center mb-4 text-[#2C3E68]">🎮 Join Game</h2>
        <input
          v-model="joinGameCode"
          type="text"
          placeholder="Enter Code"
          class="w-full px-4 py-2 border border-gray-300 text-[#2C3E68] rounded-lg text-center mt-2 focus:outline-none focus:ring-2 focus:ring-[#00A8C6]"
        />
        <div class="flex justify-between mt-6">
          <span @click="closeJoinForm" class="text-gray-500 text-sm cursor-pointer hover:text-[#00A8C6] transition">Close</span>
          <span v-if="!isProcessing" @click="joinGame" class="text-[#2C3E68] text-sm font-medium cursor-pointer hover:text-[#00A8C6] transition">Enter</span>
          <span v-else class="text-[#2C3E68] text-sm">Loading...</span>
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>
@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
}
</style>
