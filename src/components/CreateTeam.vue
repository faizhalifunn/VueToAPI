x<template>
  <div class="h-screen flex items-center justify-center bg-black">
    <div class="bg-gray-200 rounded-2xl shadow-md p-6 w-full max-w-sm">
      
      <h2 class="text-lg font-semibold text-black mb-2">
        {{ savedTeamName ? "Reconnect to Team" : "Enter Team Name" }}
      </h2>

      <!-- Jika ada teamName tersimpan, tampilkan opsi reconnect -->
      <div v-if="savedTeamName">
        <p class="text-gray-700 text-center mb-4">You were in team <strong>{{ savedTeamName }}</strong></p>
        <button
          @click="reconnectTeam"
          :disabled="loading"
          class="w-full bg-black text-white text-lg font-semibold py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <span v-if="loading" class="loading-spinner mr-2"></span>
          <span>{{ loading ? "Reconnecting..." : "Reconnect" }}</span>
        </button>
        <button
          @click="resetTeam"
          class="text-gray-600 mt-2 text-sm underline w-full text-center block"
        >
          Join with a different team
        </button>
      </div>

      <!-- Jika tidak ada teamName, tampilkan input untuk memasukkan team baru -->
      <div v-else>
        <label class="block text-lg font-semibold text-black mb-2">Team Name:</label>
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
          <span v-if="loading" class="loading-spinner mr-2"></span>
          <span>{{ loading ? "Joining..." : "Join Game" }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "JoinGame",
  setup() {
    const teamName = ref("");
    const loading = ref(false);
    const router = useRouter();
    const savedTeamName = ref(localStorage.getItem("teamName")); // Cek apakah ada teamName tersimpan

    // ✅ Fungsi untuk Reconnect Team
    const reconnectTeam = async () => {
      const gameCode = localStorage.getItem("gameCode");
      if (!gameCode || !savedTeamName.value) {
        alert("Game code or team name is missing. Please join again.");
        return;
      }

      loading.value = true;

      try {
        // 🔹 Validasi apakah team masih ada di dalam game
        const response = await fetch(
          `https://api-fastify-pi.vercel.app/team/getteamnames?gameCode=${gameCode}`
        );
        const teams = await response.json();

        if (teams.includes(savedTeamName.value)) {
          // ✅ Jika team masih ada, langsung masuk ke /player/wait
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

    // ✅ Fungsi untuk Join dengan Team Baru
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
        savedTeamName.value = teamName.value;

        // Redirect ke /player/wait
        router.push("/player/wait");
      } catch (error) {
        alert(error.message);
      } finally {
        loading.value = false;
      }
    };

    // ✅ Fungsi untuk Reset Team (Ganti team)
    const resetTeam = () => {
      localStorage.removeItem("teamName");
      savedTeamName.value = null;
    };

    return { teamName, joinGame, reconnectTeam, resetTeam, loading, savedTeamName };
  },
};
</script>

<style>
/* 🔥 Spinner Animasi */
.loading-spinner {
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
