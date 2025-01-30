<template>
    <div class="h-screen flex items-center justify-center bg-black text-gray-800">
      <div class="bg-gray-200 rounded-2xl shadow-md p-6 w-full max-w-md">
        <!-- Round n -->
        <h2 class="text-2xl font-bold mb-4">Round {{ currentRound }}</h2>
  
        <!-- Select Team -->
        <div class="mb-4">
          <label class="text-sm font-semibold">Select Team</label>
          <select v-model="selectedTeam" class="w-full p-2 border rounded-lg bg-white">
            <option value="">None</option>
            <option v-for="team in teams" :key="team" :value="team">{{ team }}</option>
          </select>
        </div>
  
        <!-- Hire Employee -->
        <div class="mb-4">
          <label class="text-sm font-semibold">Hire</label>
          <select v-model="selectedHire" class="w-full p-2 border rounded-lg bg-white">
            <option value="">None</option>
            <option v-for="employee in hireEmployees" :key="employee.id" :value="employee.id">
              {{ employee.id }}
            </option>
          </select>
        </div>
  
        <!-- Train Employee -->
        <div class="mb-4">
          <label class="text-sm font-semibold">Train</label>
          <select v-model="selectedTrain" class="w-full p-2 border rounded-lg bg-white">
            <option value="">None</option>
            <option v-for="employee in trainEmployees" :key="employee.id" :value="employee.id">
              {{ employee.id }}
            </option>
          </select>
        </div>
  
        <!-- Fire Employee -->
        <div class="mb-4">
          <label class="text-sm font-semibold">Fire</label>
          <select v-model="selectedFire" class="w-full p-2 border rounded-lg bg-white">
            <option value="">None</option>
            <option v-for="employee in fireEmployees" :key="employee.id" :value="employee.id">
              {{ employee.id }}
            </option>
          </select>
        </div>
  
        <!-- Submit Button with Loading Animation -->
        <div class="mt-6 flex justify-center">
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
      const hireEmployees = ref([]);
      const trainEmployees = ref([]);
      const fireEmployees = ref([]);
      const selectedTeam = ref("");
      const selectedHire = ref("");
      const selectedTrain = ref("");
      const selectedFire = ref("");
      const isLoading = ref(false);
      const gameCode = localStorage.getItem("gameCode");
  
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
  
      // ✅ Fetch Employees (Level 1 for Hire)
      const fetchEmployees = async () => {
        try {
          const response = await fetch("https://api-fastify-pi.vercel.app/game/getemployees");
          const data = await response.json();
          hireEmployees.value = data.employees.filter((emp) => emp.level === 1);
        } catch (error) {
          console.error("Error fetching employees:", error);
        }
      };
  
      // ✅ Fetch Employees for Train and Fire
      const fetchTeamEmployees = async () => {
        if (!selectedTeam.value) {
          trainEmployees.value = [];
          fireEmployees.value = [];
          return;
        }
        try {
          const response = await fetch(
            `https://api-fastify-pi.vercel.app/team/getemployee?gameCode=${gameCode}&teamName=${selectedTeam.value}`
          );
          const data = await response.json();
          trainEmployees.value = data.employees || [];
          fireEmployees.value = data.employees || [];
        } catch (error) {
          console.error("Error fetching team employees:", error);
        }
      };
  
      // 🔄 Update Train and Fire Employees when selectedTeam changes
      watch(selectedTeam, fetchTeamEmployees);
  
      // ✅ Submit Actions (Hire, Train & Fire) with Loading
      const submitActions = async () => {
  isLoading.value = true;
  try {
    if (selectedHire.value && selectedHire.value !== "") {
      await fetch("https://api-fastify-pi.vercel.app/team/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameCode,
          teamName: selectedTeam.value,
          employeeId: selectedHire.value,
        }),
      });
    }

    if (selectedTrain.value && selectedTrain.value !== "") {
      await fetch("https://api-fastify-pi.vercel.app/team/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameCode,
          teamName: selectedTeam.value,
          employeeId: selectedTrain.value,
        }),
      });
    }

    if (selectedFire.value && selectedFire.value !== "") {
      await fetch("https://api-fastify-pi.vercel.app/team/fireemployee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameCode,
          teamName: selectedTeam.value,
          employeeId: selectedFire.value,
        }),
      });
    }

    alert("Actions successfully submitted!");
  } catch (error) {
    alert("Error submitting actions");
    console.error(error);
  } finally {
    isLoading.value = false;
    window.location.reload(); // 🔄 Refresh halaman setelah selesai
  }
};

  
      // 🔄 Fetch all initial data
      onMounted(() => {
        fetchRoundNow();
        fetchTeams();
        fetchEmployees();
      });
  
      return {
        currentRound,
        teams,
        hireEmployees,
        trainEmployees,
        fireEmployees,
        selectedTeam,
        selectedHire,
        selectedTrain,
        selectedFire,
        isLoading,
        submitActions,
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
    margin-right: 8px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>
  