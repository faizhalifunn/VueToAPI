<template>
  <div class="h-screen flex items-center justify-center bg-black p-6 relative">
    <!-- Overlay Loading Global -->
    <div
      v-if="isLoading"
      class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50"
    >
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      <span class="mt-4 text-white text-2xl font-bold">Loading...</span>
    </div>

    <!-- Tombol Back -->
    <button
      @click="goBack"
      class="absolute top-6 left-6 bg-red-600 text-white py-2 px-4 rounded-md font-bold hover:bg-red-700 transition duration-300"
    >
      ← Back
    </button>

    <!-- Form Pengisian Data -->
    <div
      class="bg-white text-black rounded-xl shadow-lg p-8 w-full max-w-3xl border border-gray-600"
      :class="{'pointer-events-none': isLoading}"
    >
      <div class="grid grid-cols-2 gap-8 items-start">
        <!-- Kolom Kiri -->
        <div>
          <h2 class="text-3xl font-bold mb-6 text-black">Input Data</h2>
          <div v-for="(label, key) in leftInputs" :key="key" class="mb-5">
            <p class="text-left font-bold text-black">{{ label.text }}</p>
            <input
              v-model="formData[key]"
              type="text"
              class="w-full p-3 rounded-md border font-bold shadow-sm focus:outline-none focus:ring-2"
              :class="getInputClass(key)"
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- Kolom Kanan -->
        <div>
          <!-- Header round menggunakan data dari API -->
          <h2 class="text-3xl font-bold mb-6 text-right text-black">
            <span v-if="isLoading">Loading...</span>
            <span v-else>{{ currentRound }}</span>
          </h2>
          <div v-for="(label, key) in rightInputs" :key="key" class="mb-5">
            <p class="text-left font-bold text-black">{{ label.text }}</p>
            <input
              v-model="formData[key]"
              type="text"
              class="w-full p-3 rounded-md border border-gray-400 font-bold shadow-sm focus:outline-none focus:ring-2 bg-gray-100"
              :disabled="isLoading"
            />
          </div>
        </div>
      </div>

      <div class="mt-6">
        <p class="font-bold text-black">Kartu Kredit</p>
        <input
          v-model="formData.KartuKredit"
          type="text"
          class="w-full p-3 rounded-md border border-gray-400 font-bold shadow-sm focus:outline-none focus:ring-2 bg-gray-100"
          :disabled="isLoading"
        />
      </div>

      <div class="mt-6">
        <p class="font-bold text-black">Asuransi</p>
        <input
          v-model="formData.Asuransi"
          type="text"
          class="w-full p-3 rounded-md border border-gray-400 font-bold shadow-sm focus:outline-none focus:ring-2 bg-gray-100"
          :disabled="isLoading"
        />
      </div>

      <div class="mt-6">
        <p class="font-bold text-black">Bintang</p>
        <input
          v-model="formData.Bintang"
          type="text"
          class="w-full p-3 rounded-md border border-gray-400 font-bold shadow-sm focus:outline-none focus:ring-2 bg-gray-100"
          :disabled="isLoading"
        />
      </div>

      <!-- Tombol Submit -->
      <div class="flex justify-center mt-10">
        <button
          @click="submitForm"
          :disabled="isLoading"
          class="bg-black text-white text-xl font-bold py-3 px-12 rounded-md hover:bg-gray-800 transition duration-300 shadow-lg"
        >
          <span v-if="isLoading">Loading...</span>
          <span v-else>Submit</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

export default {
  setup() {
    const router = useRouter();
    const isLoading = ref(true);
    const formData = ref({
      KreditKonsumtif: "",
      KreditProduktif: "",
      KartuKredit: "",
      Asuransi: "",
      DanaPihakKetiga: "",
      PenempatanPusat: "",
      PinjamanPusat: "",
      Bintang: "",
    });

    const leftInputs = {
      KreditKonsumtif: { text: "Kredit Konsumtif" },
      KreditProduktif: { text: "Kredit Produktif" },
    };

    const rightInputs = {
      DanaPihakKetiga: { text: "Dana Pihak Ketiga (Fund)" },
      PenempatanPusat: { text: "Penempatan atau Peminjaman Pusat" },
    };

    const getInputClass = (key) => {
      if (key === "KreditKonsumtif") {
        return "bg-red-100 focus:ring-red-600 border-red-400";
      } else if (key === "KreditProduktif") {
        return "bg-green-100 focus:ring-green-600 border-green-400";
      } else {
        return "bg-gray-100 focus:ring-gray-600 border-gray-400";
      }
    };

    const submitForm = () => {
      alert("Form submitted! (Dummy action)");
    };

    const goBack = () => {
      router.go(-1);
    };

    const currentRound = ref("Round - n");

    onMounted(() => {
      const gameCode = localStorage.getItem("gameCode");
      if (!gameCode) {
        console.error("gameCode tidak ditemukan di localStorage.");
        currentRound.value = "GameCode not found";
        isLoading.value = false;
        return;
      }
      axios
        .get(`https://api-fastify-pi.vercel.app/round/getroundnow?gameCode=${gameCode}`)
        .then((response) => {
          if (response.data && response.data.rounds && response.data.rounds.length > 0) {
            currentRound.value = response.data.rounds[0].round;
          }
        })
        .catch((error) => {
          console.error("Error fetching current round:", error);
          currentRound.value = "Error";
        })
        .finally(() => {
          isLoading.value = false;
        });
    });

    return {
      formData,
      leftInputs,
      rightInputs,
      submitForm,
      goBack,
      getInputClass,
      currentRound,
      isLoading,
    };
  },
};
</script>

<style>
/* Anda bisa menambahkan animasi atau styling tambahan di sini jika perlu */
</style>
