<template>
  <div class="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-300">
      <!-- Judul dengan font modern & lebih user-friendly -->
      <h2 class="text-2xl font-semibold text-gray-900 text-center mb-10 tracking-wide font-poppins">
        Pilih <span class="text-blue-500">Peran</span> Anda
      </h2>

      <!-- Container tombol dengan lebih banyak jarak -->
      <div class="grid grid-cols-1 gap-5">
        <button
          v-for="(role, index) in roles"
          :key="index"
          @click="selectRole(role)"
          class="w-full flex items-center justify-start px-6 py-3 bg-gray-800 text-white text-lg font-medium rounded-lg shadow-md transition-all duration-300 hover:bg-blue-500 hover:scale-105 hover:shadow-lg"
        >
          <component :is="role.icon" class="w-6 h-6 text-white mr-4" />
          <span class="flex-1 text-left">{{ role.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { User, Users, Briefcase, LineChart } from "lucide-vue-next";

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

<!-- Import Google Font Poppins -->
<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap");

.font-poppins {
  font-family: "Poppins", sans-serif;
}
</style>
