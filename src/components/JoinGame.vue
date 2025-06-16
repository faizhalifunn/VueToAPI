<template>
  <div
  class="h-screen w-screen bg-gradient-to-br from-[#2C3E68] to-[#0D1B2A] flex flex-col items-center justify-center relative"
  >

    <!-- Tombol Back -->
      <button
      @click="goBack"
      class="absolute top-4 left-4 bg-[#00A8C6] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2C3E68] transition hover:scale-105 shadow-md"
    >
      ← Back
    </button>

    <!-- Logo -->
    <div class="mb-6">
      <img :src="logo" alt="logo" class="w-20 h-20 rounded-full shadow-lg" />
    </div>

    <!-- Box Join Game -->
    <div
      class="bg-white/10 backdrop-blur-md text-white rounded-3xl shadow-2xl p-10 flex flex-col items-center space-y-6 w-[340px] border border-white/20"
    >

      <!-- Judul -->
      <h2 class="text-white text-lg font-semibold tracking-wide">Join Game</h2>

      <!-- Input Game Code -->
      <input
        v-model="joinGameCode"
        type="text"
        placeholder="Enter Code"
        class="w-full px-4 py-2 text-center rounded-full border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <!-- Link Enter -->
      <p
        @click="joinGame"
        class="text-white text-base font-medium cursor-pointer hover:text-[#56C1FF] transition hover:underline"
      >
        {{ isProcessing ? "Processing..." : "Enter →" }}
      </p>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref } from "vue";
import logo from "@/assets/nupmk-logo.png"; // ✅ Logo di src/assets/

export default {
  name: "JoinPage",
  setup() {
    const router = useRouter();
    const isProcessing = ref(false);
    const joinGameCode = ref("");

    const goBack = () => {
      router.go(-1);
    };

    const joinGame = async () => {
      if (isProcessing.value || !joinGameCode.value.trim()) {
        alert("Please enter a valid game code!");
        return;
      }

      isProcessing.value = true;
      localStorage.removeItem("gameCode");

      try {
        const response = await fetch(
          `https://api-fastify-pi.vercel.app/game/getgame/${joinGameCode.value}`,
          { method: "GET" }
        );
        const result = await response.json();

        if (result.message === "Game retrieved successfully") {
          const gameCode = result.data.gameData.gameCode;
          const userRole = localStorage.getItem("userRole");

          localStorage.setItem("gameCode", gameCode);

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

    return {
      joinGame,
      isProcessing,
      joinGameCode,
      goBack,
      logo,
    };
  },
};
</script>

<style>
.loading-spinner {
  display: inline-block;
  border: 3px solid white;
  border-top: 3px solid transparent;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
