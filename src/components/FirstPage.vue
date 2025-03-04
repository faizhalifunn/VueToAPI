<template>
  <div class="h-screen flex flex-col items-center justify-center bg-black relative">
    <!-- 🔙 Tombol Back -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-500 transition hover:scale-105 shadow-md"
    >
      ← Back
    </button>

    <!-- Container Utama -->
    <div class="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center space-y-8 w-96">
      <!-- Tombol Play Now -->
      <button
        @click="openJoinForm"
        class="bg-black text-white text-lg font-semibold px-8 py-4 rounded-full w-full hover:bg-gray-800 transition shadow-lg"
      >
        Play Now
      </button>

      <!-- Pilihan Role (Admin, Strategic, Marketing) -->
      <div class="flex justify-center gap-x-8 mt-6 pt-4">
        <button @click="selectRole('Admin')" class="text-black text-sm font-medium hover:underline">Admin</button>
        <button @click="selectRole('Strategic Facilitator')" class="text-black text-sm font-medium hover:underline">
          Strategic
        </button>
        <button @click="selectRole('Marketing Facilitator')" class="text-black text-sm font-medium hover:underline">
          Marketing
        </button>
      </div>
    </div>

    <!-- Form Join Game (Modal) -->
    <div v-if="showPlayerForm" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-80">
        <h2 class="text-lg font-semibold text-center mb-4 text-gray-900 pb-1">Join Game</h2>
        <input
          v-model="joinGameCode"
          type="text"
          placeholder="Enter Code"
          class="w-full px-4 py-2 border border-gray-300 text-black rounded-lg text-center mt-2"
        />
        <div class="flex justify-between mt-6 pt-1">
          <span
            @click="closeJoinForm"
            class="text-gray-600 text-sm cursor-pointer hover:underline transition"
          >
            Close
          </span>
          <span
            v-if="!isProcessing"
            @click="joinGame"
            class="text-black text-sm cursor-pointer hover:underline transition"
          >
            Enter
          </span>
          <span v-else class="text-black text-sm">
            Loading...
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref, nextTick } from "vue";

export default {
  name: "HomePage",
  setup() {
    const router = useRouter();
    const isProcessing = ref(false);
    const joinGameCode = ref("");
    const showPlayerForm = ref(false);

    // Fungsi kembali ke halaman sebelumnya
    const goBack = () => {
      router.go(-1);
    };

    // Fungsi buka form Join Game
    const openJoinForm = async () => {
      localStorage.setItem("userRole", "Player");
      await nextTick();
      showPlayerForm.value = true;
    };

    // Fungsi menutup form Join Game
    const closeJoinForm = () => {
      showPlayerForm.value = false;
    };

    // Fungsi memilih role (Strategic & Marketing diarahkan ke form masing-masing)
    const selectRole = async (role) => {
      localStorage.setItem("userRole", role);
      await nextTick();
      console.log("Role selected:", role);
      
      if (role === "Admin") {
        router.push("/admin"); // Admin ke halaman New Game
      } else if (role === "Strategic Facilitator") {
        router.push("/Join"); // Strategic ke form input
      } else if (role === "Marketing Facilitator") {
        router.push("/Join"); // Marketing ke form input
      }
    };

    // Fungsi untuk Join Game (Player, Strategic, dan Marketing sekarang bisa join)
    const joinGame = async () => {
      const userRole = localStorage.getItem("userRole")?.trim();
      console.log("User Role:", userRole);

      if (!userRole || (userRole !== "Player" && userRole !== "Strategic Facilitator" && userRole !== "Marketing Facilitator")) {
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
            case "Strategic Facilitator":
              router.push({ path: "/strategic" });
              break;
            case "Marketing Facilitator":
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

    return { goBack, openJoinForm, closeJoinForm, joinGame, selectRole, isProcessing, joinGameCode, showPlayerForm };
  },
};
</script>
