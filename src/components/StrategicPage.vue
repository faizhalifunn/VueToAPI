<template>
  <div class="h-screen flex items-center justify-center bg-black text-gray-800">
    <div class="bg-gray-200 rounded-2xl shadow-md p-6 w-full max-w-md">
      <!-- Header -->
      <div class="flex justify-center items-center mb-4">
        <h1 class="text-3xl font-bold">Strategic</h1>
      </div>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Round {{ currentRound }}</h2>
        <span class="text-xl font-bold">{{ gameCode }}</span>
      </div>

      <!-- Select Team -->
      <div class="mb-4">
        <label class="text-sm font-semibold">Select Team</label>
        <select v-model="selectedTeam" class="w-full p-2 border rounded-lg bg-white">
          <option disabled value="">
            {{ teams.length === 0 ? "Loading teams..." : "Select Team" }}
          </option>
          <option v-for="team in teams" :key="team" :value="team">
            {{ team }} {{ submittedTeams.includes(team) ? "(submitted)" : "" }}
          </option>
        </select>
      </div>

      <!-- Hire -->
      <div class="mb-4">
        <label class="text-sm font-semibold">Hire</label>
        <select v-model="selectedHire" class="w-full p-2 border rounded-lg bg-white">
          <option value="">None</option>
          <option v-for="employee in hireEmployees" :key="employee.id" :value="employee.id">
            {{ employee.id }}
          </option>
        </select>
      </div>

      <!-- Train -->
      <div class="mb-4">
        <label class="text-sm font-semibold">Train</label>
        <select v-model="selectedTrain" class="w-full p-2 border rounded-lg bg-white">
          <option value="">None</option>
          <option v-for="employee in trainEmployees" :key="employee.id" :value="employee.id">
            {{ employee.id }}
          </option>
        </select>
      </div>

      <!-- Fire -->
      <div class="mb-4">
        <label class="text-sm font-semibold">Fire</label>
        <select v-model="selectedFire" class="w-full p-2 border rounded-lg bg-white">
          <option value="">None</option>
          <option v-for="employee in fireEmployees" :key="employee.id" :value="employee.id">
            {{ employee.id }}
          </option>
        </select>
      </div>

      <!-- Submit Button -->
      <div class="mt-6 flex justify-center py-2">
        <button
          @click="submitActions"
          class="bg-black text-white text-lg font-semibold py-2 px-6 rounded-lg hover:bg-gray-800 transition flex items-center"
          :disabled="isLoading || (!selectedHire && !selectedTrain && !selectedFire)"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? "Processing..." : "Submit" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from "vue";

export default {
  name: "HireTrainFirePage",
  setup() {
    const currentRound = ref("Loading...");
    const teams = ref([]);
    const submittedTeams = ref([]);
    const hireEmployees = ref([]);
    const trainEmployees = ref([]);
    const fireEmployees = ref([]);
    const selectedTeam = ref("");
    const selectedHire = ref("");
    const selectedTrain = ref("");
    const selectedFire = ref("");
    const isLoading = ref(false);
    const gameCode = ref(localStorage.getItem("gameCode") || "");

    const fetchRoundNow = async () => {
      try {
        const res = await fetch(
          `https://api-fastify-pi.vercel.app/round/getroundnow?gameCode=${gameCode.value}`
        );
        const data = await res.json();
        currentRound.value = data.rounds?.[0]?.round || "Unknown";
      } catch (err) {
        console.error("Error fetching round:", err);
      }
    };

    const fetchTeams = async () => {
      try {
        const res = await fetch(
          `https://api-fastify-pi.vercel.app/team/getteamnames?gameCode=${gameCode.value}`
        );
        const data = await res.json();
        teams.value = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Error fetching teams:", err);
      }
    };

    const checkSubmittedTeamsManually = async () => {
      submittedTeams.value = [];
      const roundNum = typeof currentRound.value === 'string' ? currentRound.value.match(/\d+/)?.[0] : currentRound.value;
      for (const team of teams.value) {
        try {
          const res = await fetch(
            `https://firestore.googleapis.com/v1/projects/boardtest-48f8e/databases/(default)/documents/games/${gameCode.value}/${team}/Round ${roundNum}`
          );
          const data = await res.json();
          if (!data.error) {
            submittedTeams.value.push(team);
          }
        } catch (err) {
          console.error(`Error checking team ${team}:`, err);
        }
      }
    };

    const fetchEmployees = async () => {
      try {
        const res = await fetch(`https://api-fastify-pi.vercel.app/game/getemployees`);
        const data = await res.json();
        hireEmployees.value = data.employees.filter(emp => emp.level === 1);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    const fetchTeamEmployees = async () => {
      if (!selectedTeam.value) {
        trainEmployees.value = [];
        fireEmployees.value = [];
        return;
      }
      try {
        const res = await fetch(
          `https://api-fastify-pi.vercel.app/team/getemployee?gameCode=${gameCode.value}&teamName=${selectedTeam.value}`
        );
        const data = await res.json();
        trainEmployees.value = data.employees || [];
        fireEmployees.value = data.employees || [];
      } catch (err) {
        console.error("Error fetching team employees:", err);
      }
    };

    watch(selectedTeam, fetchTeamEmployees);

    const submitActions = async () => {
      isLoading.value = true;
      try {
        if (selectedHire.value) {
          await fetch(`https://api-fastify-pi.vercel.app/team/hire`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gameCode: gameCode.value,
              teamName: selectedTeam.value,
              employeeId: selectedHire.value,
            }),
          });
        }

        if (selectedTrain.value) {
          await fetch(`https://api-fastify-pi.vercel.app/team/promote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gameCode: gameCode.value,
              teamName: selectedTeam.value,
              employeeId: selectedTrain.value,
            }),
          });
        }

        if (selectedFire.value) {
          await fetch(`https://api-fastify-pi.vercel.app/team/fireemployee`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gameCode: gameCode.value,
              teamName: selectedTeam.value,
              employeeId: selectedFire.value,
            }),
          });
        }

        alert("Actions submitted successfully!");
      } catch (err) {
        alert("Error submitting actions.");
        console.error(err);
      } finally {
        isLoading.value = false;
        window.location.reload();
      }
    };

    onMounted(async () => {
      await fetchRoundNow();
      await fetchTeams();
      await fetchEmployees();
      await checkSubmittedTeamsManually();
    });

    return {
      currentRound,
      teams,
      submittedTeams,
      hireEmployees,
      trainEmployees,
      fireEmployees,
      selectedTeam,
      selectedHire,
      selectedTrain,
      selectedFire,
      isLoading,
      submitActions,
      gameCode,
    };
  },
};
</script>

<style>
.loading-spinner {
  border: 3px solid white;
  border-top: 3px solid transparent;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
