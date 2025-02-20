<template>
  <div class="h-screen flex items-center justify-center bg-black p-6 relative">
    <!-- Tombol Back -->
    <button 
      @click="goBack" 
      class="absolute top-6 left-6 bg-red-600 text-white py-2 px-4 rounded-md font-bold hover:bg-red-700 transition duration-300"
    >
      ← Back
    </button>

    <!-- Form Pengisian Data -->
    <div class="bg-white text-black rounded-xl shadow-lg p-8 w-full max-w-3xl border border-gray-600">
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
            />
          </div>
        </div>

        <!-- Kolom Kanan -->
        <div>
          <h2 class="text-3xl font-bold mb-6 text-right text-black">Round - n</h2>
          <div v-for="(label, key) in rightInputs" :key="key" class="mb-5">
            <p class="text-left font-bold text-black">{{ label.text }}</p>
            <input
              v-model="formData[key]"
              type="text"
              class="w-full p-3 rounded-md border border-gray-400 font-bold shadow-sm focus:outline-none focus:ring-2 bg-gray-100"
            />
          </div>
        </div>
      </div>
      
      <div class="mt-6">
        <p class="font-bold text-black">Kartu Kredit</p>
        <input v-model="formData.KartuKredit" type="text"
               class="w-full p-3 rounded-md border border-gray-400 font-bold shadow-sm focus:outline-none focus:ring-2 bg-gray-100" />
      </div>

      <div class="mt-6">
        <p class="font-bold text-black">Asuransi</p>
        <input v-model="formData.Asuransi" type="text"
               class="w-full p-3 rounded-md border border-gray-400 font-bold shadow-sm focus:outline-none focus:ring-2 bg-gray-100" />
      </div>

      <div class="mt-6">
        <p class="font-bold text-black">Bintang</p>
        <input v-model="formData.Bintang" type="text"
               class="w-full p-3 rounded-md border border-gray-400 font-bold shadow-sm focus:outline-none focus:ring-2 bg-gray-100" />
      </div>
      
      <!-- Tombol Submit -->
      <div class="flex justify-center mt-10">
        <button
          @click="submitForm"
          class="bg-black text-white text-xl font-bold py-3 px-12 rounded-md hover:bg-gray-800 transition duration-300 shadow-lg"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router"; // Import router untuk navigasi

export default {
  setup() {
    const router = useRouter(); // Inisialisasi router
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
      KreditKonsumtif: { text: "Kredit Konsumtif" }, // Tulisan hitam, box merah
      KreditProduktif: { text: "Kredit Produktif" }, // Tulisan hitam, box hijau
    };

    const rightInputs = {
      DanaPihakKetiga: { text: "Dana Pihak Ketiga (Fund)" }, // Hitam
      PenempatanPusat: { text: "Penempatan atau Peminjaman Pusat" }, // Hitam
    };

    // ✅ Fungsi untuk menentukan warna input berdasarkan kategori
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

    // ✅ Fungsi kembali ke halaman sebelumnya dengan router
    const goBack = () => {
      router.go(-1);
    };

    return { formData, leftInputs, rightInputs, submitForm, goBack, getInputClass };
  },
};
</script>

<style>
/* Tambahan styling jika diperlukan */
</style>
