<template>
    <div class="h-screen flex items-center justify-center bg-black">
      <div class="bg-gray-200 rounded-2xl shadow-md p-6 w-full max-w-sm">
        <label class="block text-lg font-semibold text-black mb-2">Team Name :</label>
        <input
          v-model="teamName"
          type="text"
          placeholder="Enter team name"
          class="w-full p-2 rounded-lg border text-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
        <button
          @click="joinGame"
          :disabled="loading"
          class="w-full bg-black text-white text-lg font-semibold py-2 rounded-lg hover:bg-gray-800 transition mt-4"
        >
          {{ loading ? "Joining..." : "Join Game" }}
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  
  export default {
    name: "JoinGame",
    setup() {
      const teamName = ref("");
      const loading = ref(false);
      const router = useRouter();
  
      const joinGame = async () => {
        if (!teamName.value.trim()) {
          alert("Team name is required!");
          return;
        }
  
        const gameCode = localStorage.getItem("gameCode");
        if (!gameCode) {
          alert("Game code not found! Please rejoin the game.");
          return;
        }
  
        const payload = {
          gameCode: gameCode,
          teamName: teamName.value,
        };
  
        loading.value = true;
  
        try {
          const response = await fetch("https://api-fastify-pi.vercel.app/game/addteam", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
  
          if (!response.ok) {
            throw new Error("Failed to join game. Try again!");
          }
  
          // Simpan teamName ke localStorage
          localStorage.setItem("teamName", teamName.value);
  
          // Redirect ke /player/wait
          router.push("/player/wait");
        } catch (error) {
          alert(error.message);
        } finally {
          loading.value = false;
        }
      };
  
      return { teamName, joinGame, loading };
    },
  };
  </script>
  
  <style>
  /* Tambahan styling opsional */
  </style>
  