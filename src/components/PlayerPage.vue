<template>
  <div class="h-screen flex items-center justify-center bg-black relative text-gray-800">
    <!-- 🔙 Tombol Back Berwarna Merah -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-500 transition hover:scale-105 shadow-md"
    >
      ← Back
    </button>

    <!-- Form Input Data -->
    <div class="bg-gray-200 rounded-2xl shadow-md p-6 w-full max-w-2xl">
      <div class="grid grid-cols-2 gap-6">
        <!-- Kolom Kiri -->
        <div>
          <h2 class="text-2xl font-bold mb-4">Input Data</h2>
          <div v-for="(label, key) in leftInputs" :key="key" class="mb-3">
            <p class="font-semibold">• {{ label }}</p>
            <input
              v-model="formData[key]"
              type="number"
              placeholder="Enter value"
              class="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>

        <!-- Kolom Kanan -->
        <div>
          <h2 class="text-2xl font-bold mb-4">{{ currentRound }}</h2>
          <div v-for="(label, key) in rightInputs" :key="key" class="mb-3">
            <p class="font-semibold">• {{ label }}</p>
            <input
              v-model="formData[key]"
              type="number"
              placeholder="Enter value"
              class="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
      </div>

      <!-- Tombol Submit -->
      <div class="flex justify-center mt-6">
        <button
          @click="submitForm"
          :disabled="loading"
          class="bg-black text-white text-lg font-semibold py-2 px-6 rounded-lg hover:bg-gray-800 transition"
        >
          {{ loading ? "Submitting..." : "Submit" }}
        </button>
      </div>

      <!-- Pesan Sukses -->
      <div v-if="successMessage" class="mt-4 text-center text-green-700 font-semibold">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "PlayerPage",
  setup() {
    const router = useRouter();
    const formData = ref({
      KreditProduktif: "",
      KreditKonsumtif: "",
      PenempatanPusat: "",
      Giro: "",
      PinjamanPusat: "",
      Asuransi: "",
      KartuKredit: "",
      Bintang: "",
    });

    const currentRound = ref("Loading...");
    const loading = ref(false);
    const successMessage = ref("");

    // ✅ Fungsi kembali ke halaman sebelumnya
    const goBack = () => {
      router.go(-1);
    };

    // Data untuk label input
    const leftInputs = {
      KreditKonsumtif: "Kredit Konsumtif",
      PenempatanPusat: "Penempatan Pusat",
      PinjamanPusat: "Pinjaman Pusat",
      KartuKredit: "Kartu Kredit",
    };

    const rightInputs = {
      KreditProduktif: "Kredit Produktif",
      Giro: "Dana Pihak Ketiga",
      Asuransi: "Asuransi",
      Bintang: "Bintang",
    };

    // Ambil round terbaru
    const fetchCurrentRound = async () => {
      const gameCode = localStorage.getItem("gameCode");

      if (!gameCode) {
        alert("Game code not found! Please rejoin the game.");
        return;
      }

      try {
        const response = await fetch(`https://api-fastify-pi.vercel.app/round/getroundnow?gameCode=${gameCode}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch round data.");
        }

        const data = await response.json();

        if (data.rounds && data.rounds.length > 0) {
          currentRound.value = data.rounds[0].round; // Ambil round pertama dari array
        } else {
          currentRound.value = "Unknown";
        }
      } catch (error) {
        console.error("Failed to fetch round:", error);
        currentRound.value = "Error";
      }
    };

    // Submit Form
    const submitForm = async () => {
      const gameCode = localStorage.getItem("gameCode");
      const teamName = localStorage.getItem("teamName");

      if (!gameCode || !teamName) {
        alert("Game code or team name not found! Please rejoin the game.");
        return;
      }

      loading.value = true;
      successMessage.value = ""; // Reset success message sebelum submit

      const payload = {
        gameCode,
        teamName,
        ...formData.value,
      };

      try {
        // 🔹 1. Kirim data ke endpoint /round/input
        const response = await fetch("https://api-fastify-pi.vercel.app/round/input", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to submit round data. Try again!");
        }

        // 🔹 2. Setelah sukses, jalankan endpoint /round/count
        const countResponse = await fetch("https://api-fastify-pi.vercel.app/round/count", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gameCode, teamName }),
        });

        if (!countResponse.ok) {
          throw new Error("Failed to count round. Try again!");
        }

        successMessage.value = "Data successfully submitted and round counted!";

        // Reset form setelah submit
        formData.value = {
          KreditProduktif: "",
          KreditKonsumtif: "",
          PenempatanPusat: "",
          Giro: "",
          PinjamanPusat: "",
          Asuransi: "",
          KartuKredit: "",
          Bintang: "",
        };

      } catch (error) {
        alert(error.message);
      } finally {
        loading.value = false;
      }
    };

    // Panggil fetchCurrentRound saat komponen dimuat
    onMounted(fetchCurrentRound);

    return {
      formData,
      leftInputs,
      rightInputs,
      currentRound,
      loading,
      successMessage,
      submitForm,
      goBack,
    };
  },
};
</script>
