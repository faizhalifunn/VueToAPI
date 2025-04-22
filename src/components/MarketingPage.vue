<template>
  <div class="h-screen flex items-center justify-center bg-black relative text-gray-800">
    <!-- 🔙 Tombol Back Berwarna Merah -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-500 transition hover:scale-105 shadow-md"
    >
      ← Back
    </button>

    <div class="bg-gray-200 rounded-2xl shadow-md p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Upgrade</h2>
        <h2 class="text-2xl font-bold">{{ currentRound }}</h2>
      </div>

      <!-- Select Team -->
      <div class="mb-4">
        <label class="text-sm font-semibold">Select team</label>
        <select v-model="selectedTeam" class="w-full p-2 border rounded-lg bg-white">
          <option value="">Select Team</option>
          <option v-for="team in teams" :key="team" :value="team">{{ team }}</option>
        </select>
      </div>

      <!-- Upgrade Facilities Cost -->
      <div class="mb-4">
        <label class="text-sm font-semibold">Upgrade Facility</label>
        <input
          v-model.number="upFacilitiesCost"
          type="number"
          placeholder="Upgrade Facility Cost"
          class="w-full p-2 border rounded-lg bg-white"
        />
      </div>

      <!-- Submit Button -->
      <div class="mt-6 flex justify-center py-4">
        <button
          @click="submitUpgrade"
          class="bg-black text-white text-lg font-semibold py-2 px-6 rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
          :disabled="isLoading || !selectedTeam"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <span>{{ isLoading ? "Processing..." : "Submit" }}</span>
        </button>
      </div>
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
    const upFacilitiesCost = ref(null);
    const isLoading = ref(false);
    const gameCode = localStorage.getItem("gameCode");

    // ✅ Fungsi kembali ke halaman sebelumnya
    const goBack = () => {
      router.go(-1);
    };

    // ✅ Fetch Round Now
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

    // ✅ Fetch Team Names
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

    // ✅ Submit Upgrade Facilities Cost
    const submitUpgrade = async () => {
      if (!selectedTeam.value || upFacilitiesCost.value === null) {
        alert("Please select a team and enter the upgrade cost.");
        return;
      }

      isLoading.value = true;

      try {
        console.log("Submitting upgrade with data:", {
          gameCode,
          teamName: selectedTeam.value,
          upFacilitiesCost: upFacilitiesCost.value,
        });

        const response = await fetch("https://api-fastify-pi.vercel.app/team/upfacility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameCode,
            teamName: selectedTeam.value,
            upFacilitiesCost: upFacilitiesCost.value,
          }),
        });

        const result = await response.json();
        console.log("API Response:", result);

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

    // 🔄 Fetch data saat halaman dimuat
    onMounted(() => {
      fetchRoundNow();
      fetchTeams();
    });

    return {
      currentRound,
      teams,
      selectedTeam,
      upFacilitiesCost,
      isLoading,
      submitUpgrade,
      goBack,
    };
  },
};
</script>

<style>
/* 🔥 Animasi Loading Spinner */
.loading-spinner {
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
