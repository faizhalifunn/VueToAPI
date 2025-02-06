<template>
  <div class="h-screen flex items-center justify-center bg-gray-900">
    <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
      <h2 class="text-2xl font-bold text-gray-800 text-center mb-4">Pilih Peran Anda</h2>
      
      <form @submit.prevent="submitRole" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <label
            v-for="(role, index) in roles"
            :key="index"
            class="flex flex-col items-center justify-center border-2 rounded-lg p-4 cursor-pointer transition-all duration-300"
            :class="{
              'border-gray-300 hover:border-gray-600': selectedRole !== role,
              'border-blue-500 bg-blue-100': selectedRole === role
            }"
            @click="selectedRole = role"
          >
            <component :is="role.icon" class="w-10 h-10 text-gray-700" />
            <span class="text-lg font-semibold mt-2">{{ role.label }}</span>
          </label>
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white text-lg font-semibold py-3 rounded-lg hover:bg-blue-500 transition-all"
        >
          Konfirmasi Pilihan
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref } from "vue";
import { User, Users, Briefcase, LineChart } from "lucide-vue-next"; // Import ikon dari Lucide

export default {
  name: "RoleSelection",
  setup() {
    const router = useRouter();
    const selectedRole = ref(null);

    const roles = [
      { label: "Admin", path: "/admin", icon: User },
      { label: "Player", path: "/join", icon: Users },
      { label: "Strategic", path: "/join", icon: Briefcase },
      { label: "Marketing", path: "/join", icon: LineChart },
    ];

    const submitRole = () => {
      if (!selectedRole.value) {
        alert("Pilih peran terlebih dahulu!");
        return;
      }
      localStorage.clear();
      localStorage.setItem("userRole", selectedRole.value.label);
      router.push(selectedRole.value.path);
    };

    return { roles, selectedRole, submitRole };
  },
};
</script>

