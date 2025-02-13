<template>
  <div class="h-screen flex items-center justify-center bg-black p-6 relative">
    <!-- Tombol Back -->
    <button @click="goBack" class="absolute top-6 left-6 bg-red-600 text-white py-2 px-4 rounded-md font-bold hover:bg-red-700 transition duration-300">
      ← Back
    </button>

    <!-- Form Pengisian Data -->
    <div class="bg-white text-black rounded-xl shadow-lg p-8 w-full max-w-3xl border border-gray-600">
      <div class="grid grid-cols-2 gap-8 items-start">
        <!-- Kolom Kiri -->
        <div>
          <h2 class="text-3xl font-bold mb-6">Input Data</h2>
          <div v-for="(label, key) in leftInputs" :key="key" class="mb-5">
            <p class="text-left font-bold" :class="label.class">{{ label.text }}</p>
            <input
              v-model="formData[key]"
              type="text"
              class="w-full p-3 rounded-md border border-gray-400 bg-gray-100 text-black font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
            />
          </div>
        </div>

        <!-- Kolom Kanan -->
        <div>
          <h2 class="text-3xl font-bold mb-6 text-right">Round - n</h2>
          <div v-for="(label, key) in rightInputs" :key="key" class="mb-5">
            <p class="text-left font-bold" :class="label.class">{{ label.text }}</p>
            <input
              v-model="formData[key]"
              type="text"
              class="w-full p-3 rounded-md border border-gray-400 bg-gray-100 text-black font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
            />
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-8 items-center">
        <div>
          <p class="text-green-600 font-bold">Kartu Kredit</p>
          <input v-model="formData.KartuKredit" type="text" class="w-full p-3 rounded-md border border-gray-400 bg-gray-100 text-black font-bold shadow-sm" />
        </div>
        <div>
          <p class="font-bold">Bintang</p>
          <input v-model="formData.Bintang" type="text" class="w-full p-3 rounded-md border border-gray-400 bg-gray-100 text-black font-bold shadow-sm" />
        </div>
      </div>
      
      <div class="mt-6">
        <p class="text-green-600 font-bold">Asuransi</p>
        <input v-model="formData.Asuransi" type="text" class="w-full p-3 rounded-md border border-gray-400 bg-gray-100 text-black font-bold shadow-sm" />
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

export default {
  setup() {
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
      KreditKonsumtif: { text: "Kredit Konsumtif", class: "text-green-600 font-bold" },
      KreditProduktif: { text: "Kredit Produktif", class: "text-green-600 font-bold" },
    };

    const rightInputs = {
      DanaPihakKetiga: { text: "Dana Pihak Ketiga (Fund)", class: "text-red-600 font-bold" },
      PenempatanPusat: { text: "Penempatan/Peminjaman Pusat", class: "text-green-600 font-bold" },
    };

    const submitForm = () => {
      alert("Form submitted! (Dummy action)");
    };

    const goBack = () => {
      alert("Back button clicked! (Dummy action)");
    };

    return { formData, leftInputs, rightInputs, submitForm, goBack };
  },
};
</script>
