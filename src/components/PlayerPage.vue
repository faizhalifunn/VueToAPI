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
      <!-- Grid 2 kolom -->
      <div class="grid grid-cols-2 gap-8 items-start">
        <!-- Kolom Kiri -->
        <div>
          <h2 class="text-3xl font-bold mb-6 text-black">Input Data</h2>
          <div v-for="(label, key) in leftInputs" :key="key" class="mb-5">
            <p class="text-left font-bold text-black">{{ label.text }}</p>
            <input
              v-model="formData[key]"
              type="number"
              class="w-full p-3 rounded-md border font-bold shadow-sm focus:outline-none focus:ring-2"
              :class="getInputClass(key)"
              :disabled="isLoading"
            />
            <!-- Contoh validasi sederhana -->
            <p v-if="formData[key] === ''" class="text-red-600 text-sm mt-1">Harap isi field ini</p>
          </div>
        </div>

        <!-- Kolom Kanan -->
        <div>
          <h2 class="text-3xl font-bold mb-6 text-right text-black">
            <span v-if="isLoading">Loading...</span>
            <span v-else>{{ currentRound }}</span>
          </h2>
          <div v-for="(label, key) in rightInputs" :key="key" class="mb-5">
            <p class="text-left font-bold text-black">{{ label.text }}</p>
            <input
              v-model="formData[key]"
              type="number"
              class="w-full p-3 rounded-md border border-gray-400 font-bold shadow-sm focus:outline-none focus:ring-2 bg-gray-100"
              :disabled="isLoading"
            />
            <p v-if="formData[key] === ''" class="text-red-600 text-sm mt-1">Harap isi field ini</p>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-8 items-start mt-8">
        <div class="mb-5">
          <p class="font-bold text-black">Penempatan Pusat</p>
          <input
            v-model="formData.PenempatanPusat"
            type="number"
            class="w-full p-3 rounded-md border font-bold shadow-sm focus:outline-none focus:ring-2"
            :class="{'bg-gray-300 cursor-not-allowed': !isPenempatanEnabled || isLoading}"
            :disabled="!isPenempatanEnabled || isLoading"
          />
          <p v-if="!isPenempatanEnabled" class="text-gray-600 text-sm mt-1">
            Dana Pihak Ketiga lebih besar dari Total Kredit
          </p>
        </div>

        <div>
          <p class="font-bold text-black">Peminjaman Pusat</p>
          <input
            v-model="formData.PinjamPusat"
            type="number"
            class="w-full p-3 rounded-md border font-bold shadow-sm focus:outline-none focus:ring-2"
            :class="{'bg-gray-300 cursor-not-allowed': !isPeminjamanEnabled || isLoading}"
            :disabled="!isPeminjamanEnabled || isLoading"
          />
          <p v-if="!isPeminjamanEnabled" class="text-gray-600 text-sm mt-1">
            Dana Pihak Ketiga lebih kecil dari Total Kredit
          </p>
        </div>
      </div>
      <!-- Input Kartu Kredit, Asuransi, Bintang -->
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

      <!-- Bagian Penempatan Pusat & Peminjaman Pusat -->
      

      <!-- Tombol Submit -->
      <div class="flex justify-center mt-10 pt-4">
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

export default {
  setup() {
    const router = useRouter();
    const isLoading = ref(true);

    // Data dari front end
    const formData = ref({
      KreditKonsumtif: 0,
      KreditProduktif: 0,
      KartuKredit: "",
      Asuransi: "",
      DanaPihakKetiga: 0, // ini akan menjadi Giro di payload
      PenempatanPusat: 0, // input Penempatan Pusat
      PeminjamanPusat: 0,     // input Peminjaman Pusat
      Bintang: "",
    });

    // Kolom kiri/kanan untuk menampilkan label
    const leftInputs = {
      KreditKonsumtif: { text: "Kredit Konsumtif" },
      KreditProduktif: { text: "Kredit Produktif" },
    };

    const rightInputs = {
      DanaPihakKetiga: { text: "Dana Pihak Ketiga (Fund)" },
    };

    // totalKredit => untuk memutuskan Penempatan / Peminjaman
    const totalKredit = computed(() => {
      return Number(formData.value.KreditKonsumtif) + Number(formData.value.KreditProduktif);
    });

    // Jika DPK < total kredit => Penempatan aktif
    const isPenempatanEnabled = computed(() => {
      return formData.value.DanaPihakKetiga > totalKredit.value;
    });

    // Jika DPK > total kredit => Peminjaman aktif
    const isPeminjamanEnabled = computed(() => {
      return formData.value.DanaPihakKetiga < totalKredit.value;
    });

    // Styling input
    const getInputClass = (key) => {
      if (key === "KreditKonsumtif") {
        return "bg-red-100 focus:ring-red-600 border-red-400";
      } else if (key === "KreditProduktif") {
        return "bg-green-100 focus:ring-green-600 border-green-400";
      } else {
        return "bg-gray-100 focus:ring-gray-600 border-gray-400";
      }
    };

    // Menangani round dari API
    const currentRound = ref("Round - n");

    onMounted(() => {
      const gameCode = localStorage.getItem("gameCode");
      if (!gameCode) {
        console.error("gameCode tidak ditemukan di localStorage.");
        currentRound.value = "GameCode not found";
        isLoading.value = false;
        return;
      }

      // Memanggil API: get round
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

    // Submit form ke endpoint /round/input
    const submitForm = async () => {
    isLoading.value = true;
    
    try {
      const gameCode = localStorage.getItem("gameCode");
      const teamName = localStorage.getItem("teamName");

      if (!gameCode || !teamName) {
        throw new Error("gameCode atau teamName tidak ditemukan di localStorage");
      }

      // Tentukan mana yang dipakai => Penempatan / Peminjaman
      let penempatanAtauPeminjamanValue = 0;
      if (isPenempatanEnabled.value) {
        penempatanAtauPeminjamanValue = Number(formData.value.PenempatanPusat) || 0;
      } else if (isPeminjamanEnabled.value) {
        penempatanAtauPeminjamanValue = Number(formData.value.PinjamPusat) || 0;
      }

      // 🔹 Buat payload dengan memastikan semua angka dikonversi ke Number
      const payload = {
        gameCode: gameCode,
        teamName: teamName,
        KreditProduktif: Number(formData.value.KreditProduktif) || 0,
        KreditKonsumtif: Number(formData.value.KreditKonsumtif) || 0,
        Giro: Number(formData.value.DanaPihakKetiga) || 0, // DPK -> Giro
        PenempatanAtauPeminjaman: penempatanAtauPeminjamanValue,
        Asuransi: Number(formData.value.Asuransi) || 0,
        KartuKredit: Number(formData.value.KartuKredit) || 0,
        Bintang: Number(formData.value.Bintang) || 0,
      };

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

      console.log("Submit success:", await response.json());

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

      console.log("Round counted successfully:", await countResponse.json());

      alert("Data successfully submitted and round counted!");

      // 🔹 Reset form setelah submit
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
      console.error("Submit error:", error);
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      isLoading.value = false;
    }
};



    // Tombol kembali
    const goBack = () => {
      router.go(-1);
    };

    return {
      formData,
      leftInputs,
      rightInputs,
      totalKredit,
      isPenempatanEnabled,
      isPeminjamanEnabled,
      getInputClass,
      currentRound,
      isLoading,
      submitForm,
      goBack,
    };
  },
};
</script>

<style>
/* Tambahan style jika diperlukan */
</style>
