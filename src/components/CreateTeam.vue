<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#2C3E68] to-[#0D1B2A] font-sans px-4 py-10 relative">
    <!-- 🔙 Tombol Back -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-500 transition hover:scale-105 shadow-lg"
    >
      ← Back
    </button>

    <div class="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-white">
      <h2 class="text-xl font-bold text-center mb-4">
        {{ savedTeamName ? "Reconnect to Team" : "Enter Team Name" }}
      </h2>

      <!-- Jika ada teamName tersimpan -->
      <div v-if="savedTeamName">
        <p class="text-center mb-4">You were in team <strong>{{ savedTeamName }}</strong></p>
        <button
          @click="reconnectTeam"
          :disabled="loading"
          class="w-full bg-[#00A8C6] text-white text-lg font-semibold py-2 rounded-xl hover:brightness-110 transition"
        >
          <span v-if="loading" class="loading-spinner-white mr-2"></span>
          <span>{{ loading ? "Reconnecting..." : "Reconnect" }}</span>
        </button>
        <button
          @click="resetTeam"
          class="text-white/70 mt-3 text-sm underline w-full text-center block"
        >
          Join with a different team
        </button>
      </div>

      <!-- Jika tidak ada teamName -->
      <div v-else>
        <label class="block text-lg font-semibold mb-2">Team Name:</label>
       <input
        v-model="teamName"
        type="text"
        placeholder="Enter team name"
        class="w-full p-3 rounded-xl border border-white/30 bg-transparent text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#00A8C6]"
      />

       <!-- Versi tulisan Join Game, bukan button -->
      <div class="mt-4 text-center">
        <span
          @click="joinGame"
          class="inline-block text-[#00A8C6] text-lg font-semibold underline hover:opacity-80 cursor-pointer transition"
        >
          {{ loading ? "Joining..." : "Join Game" }}
        </span>
        <span v-if="loading" class="loading-spinner-white ml-2 align-middle"></span>
      </div>
      </div>
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
    const savedTeamName = ref(localStorage.getItem("teamName"));

    const goBack = () => {
      router.go(-1);
    };

    const reconnectTeam = async () => {
      const gameCode = localStorage.getItem("gameCode");
      if (!gameCode || !savedTeamName.value) {
        alert("Game code or team name is missing. Please join again.");
        return;
      }

      loading.value = true;

      try {
        const response = await fetch(
          `https://api-fastify-pi.vercel.app/team/getteamnames?gameCode=${gameCode}`
        );
        const teams = await response.json();

        if (teams.includes(savedTeamName.value)) {
          alert(`Reconnected to team: ${savedTeamName.value}`);
          router.push("/player/wait");
        } else {
          alert("Your team was not found. Please join again with a new team name.");
          resetTeam();
        }
      } catch (error) {
        console.error("Error reconnecting:", error);
        alert("An error occurred. Please try again.");
      } finally {
        loading.value = false;
      }
    };

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

        localStorage.setItem("teamName", teamName.value);
        savedTeamName.value = teamName.value;

        router.push("/player/wait");
      } catch (error) {
        alert(error.message);
      } finally {
        loading.value = false;
      }
    };

    const resetTeam = () => {
      localStorage.removeItem("teamName");
      savedTeamName.value = null;
    };

    return {
      teamName,
      joinGame,
      reconnectTeam,
      resetTeam,
      loading,
      savedTeamName,
      goBack,
    };
  },
};
</script>

<style>
/* Spinner Putih */
.loading-spinner-white {
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
