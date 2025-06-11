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
  if (role === "Admin") {
    router.push("/admin");
  } else {
    router.push("/Join");
  }
};

const joinGame = async () => {
  const userRole = localStorage.getItem("userRole")?.trim();
  if (!userRole || !["Player", "Strategic", "Marketing"].includes(userRole)) {
    alert("Invalid role. Please select a valid role before joining.");
    return;
  }

  if (isProcessing.value || !joinGameCode.value.trim()) {
    alert("Please enter a valid game code!");
    return;
  }

  isProcessing.value = true;

  try {
    const response = await fetch(`https://api-fastify-pi.vercel.app/game/getgame/${joinGameCode.value}`);
    const result = await response.json();

    if (result.message === "Game retrieved successfully") {
      const gameCode = result.data.gameData.gameCode;
      localStorage.setItem("gameCode", gameCode);

      switch (userRole) {
        case "Player":
          router.push("/player");
          break;
        case "Strategic":
          router.push("/strategic");
          break;
        case "Marketing":
          router.push("/marketing");
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
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#2C3E68] to-[#0D1B2A] font-sans px-4 py-10 relative">
    <!-- Back Button -->
    <!-- <button
      @click="goBack"
      class="absolute top-4 left-4 bg-[#00A8C6] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2C3E68] transition hover:scale-105 shadow-md"
    >
      ← Back
    </button> -->

    <!-- Logo -->
    <div class="flex flex-col items-center animate-fade-in -mt-60 mb-44 z-10">
      <img :src="logo" alt="nuPMK Logo" class="w-24 h-24 rounded-full shadow-md" />
    </div>

    <!-- Main Container -->
    <div class="bg-white/10 backdrop-blur-md text-white rounded-3xl shadow-2xl p-10 flex flex-col items-center space-y-6 max-w-md w-full animate-fade-in border border-white/20 z-10">
      <button
        @click="openJoinForm"
        class="bg-[#00A8C6] text-white text-lg font-semibold px-8 py-4 rounded-full w-full hover:bg-[#2C3E68] active:scale-95 transition shadow-xl hover:shadow-2xl duration-300"
      >
        Play Now
      </button>

      <div class="flex justify-center gap-x-6 mt-4">
        <button @click="selectRole('Admin')" class="text-white text-sm font-medium hover:text-[#00A8C6] transition">Admin</button>
        <button @click="selectRole('Strategic')" class="text-white text-sm font-medium hover:text-[#00A8C6] transition">Strategic</button>
        <button @click="selectRole('Marketing')" class="text-white text-sm font-medium hover:text-[#00A8C6] transition">Marketing</button>
      </div>
    </div>

    <!-- Modal Join Game -->
    <div v-if="showPlayerForm" class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#2C3E68] to-[#0D1B2A] backdrop-blur-md z-50">
      <div class="bg-white/10 backdrop-blur-xl text-white rounded-3xl shadow-2xl p-8 w-[340px] flex flex-col items-center space-y-4 border border-white/10 animate-fade-in">
        <div class="flex flex-col items-center">
          <div class="bg-white rounded-full p-2 mb-2">
            <img :src="logo" alt="Gamepad Icon" class="w-10 h-10" />
          </div>
          <h2 class="text-xl font-bold">Join Game</h2>
        </div>

        <input
          v-model="joinGameCode"
          type="text"
          placeholder="Enter Code"
          class="w-full px-4 py-2 text-center bg-white text-[#1C2541] rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8C6] transition"
        />

        <div class="flex justify-between w-full gap-4 pt-2">
          <button
            @click="closeJoinForm"
            class="bg-[#00A8C6] text-white px-4 py-2 rounded-lg w-full text-sm hover:bg-[#2C3E68] active:scale-95 transition font-medium"
          >
           Close
          </button>
          <button
            v-if="!isProcessing"
            @click="joinGame"
            class="bg-[#00A8C6] text-white px-4 py-2 rounded-lg w-full text-sm hover:bg-[#2C3E68] active:scale-95 transition font-medium"
          >
            ➤ Enter
          </button>
          <span v-else class="text-sm w-full text-center py-2">Loading...</span>
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
