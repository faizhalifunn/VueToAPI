<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2C3E68] to-[#0D1B2A] p-6 text-gray-500 font-sans relative">
    <!-- Loading Overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-60 backdrop-blur-md"
    >
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00A8C6]"></div>
      <span class="mt-4 text-gray-500 text-2xl font-bold">Loading...</span>
    </div>

    <!-- Back Button -->
    <button
      @click="goBack"
      class="absolute top-6 left-6 bg-blue-600 text-white py-2 px-4 rounded-xl font-bold hover:bg-red-500 transition duration-300 shadow-md"
    >
      ← Back
    </button>

    <!-- Main Form -->
    <div
      class="bg-white text-gray-500 backdrop-blur-lg shadow-white/30 rounded-2xl shadow-2xl p-8 w-full max-w-4xl border border-white/20"
      :class="{ 'pointer-events-none': isLoading }"
    >
      <div class="grid grid-cols-2 gap-8 items-start">
        <!-- Left Column -->
        <div>
          <h2 class="text-3xl font-bold mb-6">Input Data</h2>
          <div v-for="(label, key) in leftInputs" :key="key" class="mb-5">
            <p class="text-left font-semibold">{{ label.text }}</p>
            <input
              v-model="formData[key]"
              type="number"
              @keydown="preventNonNumeric"
              :placeholder="label.text"
              class="w-full p-3 rounded-md border font-bold shadow-sm focus:outline-none focus:ring-2"
              :class="[
                getInputClass(key),
                key === 'ConsumerLoan' || key === 'ProductiveLoan' ? 'text-black' : ''
              ]"
              :disabled="isLoading"
            />
            <p v-if="formData[key] === ''" class="text-red-400 text-sm mt-1">Harap isi field ini</p>
          </div>
        </div>

        <!-- Right Column -->
        <div>
          <h2 class="text-3xl font-bold mb-6 text-right">{{ isLoading ? 'Loading...' : currentRound }}</h2>
          <div v-for="(label, key) in rightInputs" :key="key" class="mb-5">
            <p class="text-left font-semibold">{{ label.text }}</p>
            <input
              v-model="formData[key]"
              type="number"
              @keydown="preventNonNumeric"
              :placeholder="label.text"
              class="w-full p-3 rounded-md border border-white/30 bg-transparent text-gray-500 placeholder-gray-500/60 font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]"
              :disabled="isLoading"
            />
            <p v-if="formData[key] === ''" class="text-red-400 text-sm mt-1">Harap isi field ini</p>
          </div>
        </div>
      </div>

      <!-- Placement & Borrow (Autofilled) -->
      <div class="grid grid-cols-2 gap-8 mt-8">
        <div>
          <p class="font-semibold">Inter Office Account (Placement)</p>
          <input
            :value="placementValue"
            type="number"
            readonly
            class="w-full p-3 rounded-md border border-white/30 bg-white/10 text-gray-500 font-bold shadow-sm cursor-not-allowed focus:outline-none"
          />
          <p v-if="placementValue > 0" class="text-green-400 text-sm mt-1">Fund &gt; Total of Loans</p>
        </div>

        <div>
          <p class="font-semibold">Inter Office Account Borrow</p>
          <input
            :value="borrowValue"
            type="number"
            readonly
            class="w-full p-3 rounded-md border border-white/30 bg-white/10 text-gray-500 font-bold shadow-sm cursor-not-allowed focus:outline-none"
          />
          <p v-if="borrowValue > 0" class="text-red-400 text-sm mt-1">Fund &lt; Total of Loans</p>
        </div>
      </div>

      <!-- Extra Fields -->
      <div class="mt-6 space-y-6">
        <div>
          <p class="font-semibold">Credit Card</p>
          <input
            v-model="formData.CreditCard"
            type="number"
            @keydown="preventNonNumeric"
            placeholder="Credit Card"
            class="w-full p-3 rounded-md border border-white/30 bg-transparent text-gray-500 placeholder-gray-500/60 font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]"
            :disabled="isLoading"
          />
        </div>

        <div>
          <p class="font-semibold">Insurance</p>
          <input
            v-model="formData.Insurance"
            type="number"
            @keydown="preventNonNumeric"
            placeholder="Insurance"
            class="w-full p-3 rounded-md border border-white/30 bg-transparent text-gray-500 placeholder-gray-500/60 font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]"
            :disabled="isLoading"
          />
        </div>

        <div>
          <p class="font-semibold">Achievement Star</p>
          <input
            v-model="formData.AchievementStar"
            type="number"
            @keydown="preventNonNumeric"
            placeholder="Achievement Star"
            class="w-full p-3 rounded-md border border-white/30 bg-transparent text-gray-500 placeholder-gray-500/60 font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]"
            :disabled="isLoading"
          />
        </div>
        <div>
          <div class="flex justify-between mt-4 bg-yellow-600/20 p-4 rounded-lg shadow-md text-gray-600">
          <h3>Refresh Page untuk menampilkan data round terbaru !</h3>
        </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex justify-center mt-10 pt-4">
        <button
          @click="submitForm"
          :disabled="isLoading"
          class="bg-[#00A8C6] text-white text-xl font-bold py-3 px-12 rounded-xl hover:brightness-110 transition duration-300 shadow-lg"
        >
          <span v-if="isLoading">Loading...</span>
          <span v-else>Submit</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  setup() {
    const router = useRouter();
    const isLoading = ref(true);

    const preventNonNumeric = (e) => {
      const allowedKeys = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End','.'];
      if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) e.preventDefault();
    };

    const formData = ref({
      ConsumerLoan: 0,
      ProductiveLoan: 0,
      DanaPihakKetiga: 0,
      CreditCard: '',
      Insurance: '',
      AchievementStar: '',
      TotalSalary: 0,
      Development: 0,
      MarketingCost: 0,
      OperationalCost: 0,
      InterestCost: 0,
      NetInterestIncome: 0,
    });

    const leftInputs = {
      ConsumerLoan: { text: 'Consumer Loan' },
      ProductiveLoan: { text: 'Productive Loan' },
    };
    const rightInputs = { DanaPihakKetiga: { text: 'Fund' } };

    const totalKredit = computed(() => Number(formData.value.ConsumerLoan) + Number(formData.value.ProductiveLoan));

    const placementValue = computed(() => {
      const diff = Number(formData.value.DanaPihakKetiga) - totalKredit.value;
      return diff > 0 ? diff : 0;
    });
    const borrowValue = computed(() => {
      const diff = totalKredit.value - Number(formData.value.DanaPihakKetiga);
      return diff > 0 ? diff : 0;
    });

    const getInputClass = (key) => {
      if (key === 'ConsumerLoan') return 'bg-red-100 focus:ring-red-600 border-red-400';
      if (key === 'ProductiveLoan') return 'bg-green-100 focus:ring-green-600 border-green-400';
      return 'bg-gray-100 focus:ring-gray-600 border-gray-400';
    };

    const validateNumericInputs = () => {
      const invalids = [];
      for (const key in formData.value) {
        const val = formData.value[key];
        if (val !== '' && val !== null && isNaN(Number(val))) invalids.push(key);
      }
      return invalids;
    };

    const currentRound = ref('Round - n');
    onMounted(() => {
      const code = localStorage.getItem('gameCode');
      if (!code) {
        currentRound.value = 'GameCode not found';
        isLoading.value = false;
        return;
      }
      axios.get(`https://api-fastify-pi.vercel.app/round/getroundnow?gameCode=${code}`)
        .then(res => {
          if (res.data.rounds?.length) currentRound.value = res.data.rounds[0].round;
        })
        .catch(() => currentRound.value = 'Error')
        .finally(() => isLoading.value = false);
    });

    const submitForm = async () => {
      isLoading.value = true;
      const invalids = validateNumericInputs();
      if (invalids.length) {
        alert(`Field berikut bukan angka:\n- ${invalids.join('\n- ')}\n\nMohon isi hanya dengan angka.`);
        isLoading.value = false;
        return;
      }

      try {
        const gameCode = localStorage.getItem('gameCode');
        const teamName = localStorage.getItem('teamName');
        if (!gameCode || !teamName) throw new Error('gameCode atau teamName tidak ditemukan');

        const penempatanAtauPeminjaman = placementValue.value > 0 ? placementValue.value : borrowValue.value;

        const payload = {
          gameCode,
          teamName,
          ProductiveLoan: Number(formData.value.ProductiveLoan) || 0,
          ConsumerLoan: Number(formData.value.ConsumerLoan) || 0,
          Fund: Number(formData.value.DanaPihakKetiga) || 0,
          PenempatanAtauPeminjaman: penempatanAtauPeminjaman,
          Insurance: Number(formData.value.Insurance) || 0,
          CreditCard: Number(formData.value.CreditCard) || 0,
          AchievementStar: Number(formData.value.AchievementStar) || 0,
          TotalSalary: Number(formData.value.TotalSalary) || 0,
          Development: Number(formData.value.Development) || 0,
          MarketingCost: Number(formData.value.MarketingCost) || 0,
          OperationalCost: Number(formData.value.OperationalCost) || 0,
          InterestCost: Number(formData.value.InterestCost) || 0,
          NetInterestIncome: Number(formData.value.NetInterestIncome) || 0,
        };

        await fetch('https://api-fastify-pi.vercel.app/round/input', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        await fetch('https://api-fastify-pi.vercel.app/round/count', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameCode, teamName })
        });

        alert('Data berhasil dikirim dan round dicatat!');
        // Reset form
        formData.value = {
          ConsumerLoan: '',
          ProductiveLoan: '',
          DanaPihakKetiga: '',
          CreditCard: '',
          Insurance: '',
          AchievementStar: '',
          TotalSalary: '',
          Development: '',
          MarketingCost: '',
          OperationalCost: '',
          InterestCost: '',
          NetInterestIncome: '',
        };
      } catch (err) {
        alert('Terjadi kesalahan: ' + err.message);
      } finally {
        isLoading.value = false;
      }
    };

    const goBack = () => router.go(-1);

    return {
      formData,
      leftInputs,
      rightInputs,
      totalKredit,
      placementValue,
      borrowValue,
      getInputClass,
      currentRound,
      isLoading,
      submitForm,
      goBack,
      validateNumericInputs,
      preventNonNumeric,
    };
  },
};
</script>
