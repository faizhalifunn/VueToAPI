<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2C3E68] to-[#0D1B2A] relative text-white font-sans p-6">
    <!-- 🔙 Tombol Back -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-500 transition hover:scale-105 shadow-md"
    >
      ← Back
    </button>

    <!-- Kotak Form -->
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl px-8 py-6 w-full max-w-3xl border border-white/20">
      <!-- Header -->
      <h2 class="text-3xl font-bold mb-2 text-center">Marketing</h2>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold">Upgrade</h2>
        <h2 class="text-base font-medium text-white/70">Round {{ currentRound }}</h2>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitUpgrade">
        <div class="flex flex-col sm:flex-row gap-4 pb-4">
          <!-- Select Team -->
          <div class="flex flex-col w-full sm:w-1/2">
            <label class="text-sm font-semibold mb-1">Team Name</label>
            <select
              v-model="selectedTeam"
              class="p-3 rounded-lg bg-white/10 backdrop-blur-sm text-black border border-white/30 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#00A8C6]"
            >
              <option value="">Select Team</option>
              <option
                v-for="team in teams"
                :key="team"
                :value="team"
              >
                {{ team }}
              </option>
            </select>
          </div>

          <!-- Marketing Cost -->
          <div class="flex flex-col w-full sm:w-1/2">
            <label class="text-sm font-semibold mb-1">Marketing Cost</label>
            <input
              v-model.number="MarketingCost"
              type="number"
              placeholder="Marketing Cost"
              class="p-3 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/30 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#00A8C6]"
            />
          </div>
        </div>

        <!-- Tombol Submit -->
        <div class="flex justify-center mt-6">
          <button
            type="submit"
            class="bg-[#00A8C6] text-white font-bold text-lg py-2 px-8 rounded-xl hover:brightness-110 transition flex items-center gap-2 shadow-lg"
            :disabled="isLoading || !selectedTeam"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span>{{ isLoading ? 'Processing...' : 'Submit' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "UpgradePage",
  setup() {
    const router = useRouter();
    const currentRound = ref("Loading...");
    const teams = ref([]);
    const selectedTeam = ref("");
    const MarketingCost = ref(null);
    const isLoading = ref(false);
    const gameCode = localStorage.getItem("gameCode");

    const goBack = () => {
      router.go(-1);
    };

    const fetchRoundNow = async () => {
      try {
        const response = await fetch(
          `https://api-fastify-pi.vercel.app/round/getroundnow?gameCode=${gameCode}`
        );
        const data = await response.json();
        currentRound.value = data.rounds?.[0]?.round || "Unknown";
      } catch (error) {
        console.error("Error fetching round:", error);
      }
    };

    const fetchTeams = async () => {
      try {
        const response = await fetch(
          `https://api-fastify-pi.vercel.app/team/getteamnames?gameCode=${gameCode}`
        );
        const data = await response.json();
        teams.value = data || [];
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    const submitUpgrade = async () => {
      if (!selectedTeam.value || MarketingCost.value === null) {
        alert("Please select a team and enter the upgrade cost.");
        return;
      }

      const isTeamValid = teams.value.includes(selectedTeam.value);
      if (!isTeamValid) {
        alert("Invalid team name. Please select a valid team.");
        return;
      }

      isLoading.value = true;

      try {
        const response = await fetch("https://api-fastify-pi.vercel.app/team/upfacility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameCode,
            teamName: selectedTeam.value,
            MarketingCost: MarketingCost.value,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to submit upgrade.");
        }

        alert("Upgrade submitted successfully!");
      } catch (error) {
        alert(`Error: ${error.message}`);
        console.error("Error submitting upgrade:", error);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      fetchRoundNow();
      fetchTeams();
    });

    return {
      currentRound,
      teams,
      selectedTeam,
      MarketingCost,
      isLoading,
      submitUpgrade,
      goBack,
    };
  },
};
</script>

<style>
.loading-spinner {
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top: 3px solid #00A8C6;
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
