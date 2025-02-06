<template>
  <div class="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
    <div class="bg-gray-100 rounded-2xl shadow-lg p-8 w-full max-w-md">
      <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Pilih Peran Anda</h2>

      <div class="flex flex-col space-y-4">
        <!-- Tombol Navigasi dengan Ikon -->
        <button
          v-for="(role, index) in roles"
          :key="index"
          @click="selectRole(role)"
          class="w-full flex items-center justify-center bg-gray-800 text-white text-lg font-semibold py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md transform hover:scale-105"
        >
          <component :is="role.icon" class="w-6 h-6 mr-3 text-white" />
          {{ role.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { User, Users, Briefcase, LineChart } from "lucide-vue-next"; // Gunakan ikon dari Lucide

export default {
  name: "RoleSelection",
  setup() {
    const router = useRouter();

    const roles = [
      { label: "Admin", path: "/admin", icon: User },
      { label: "Player", path: "/join", icon: Users },
      { label: "Strategic", path: "/join", icon: Briefcase },
      { label: "Marketing", path: "/join", icon: LineChart },
    ];

    const selectRole = (role) => {
      localStorage.clear();
      localStorage.setItem("userRole", role.label);
      router.push(role.path);
    };

    return { roles, selectRole };
  },
};
</script>

