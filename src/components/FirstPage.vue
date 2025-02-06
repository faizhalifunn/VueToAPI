<template>
  <div class="h-screen flex items-center justify-center bg-black">
    <div class="bg-gray-200 rounded-2xl shadow-md p-8 w-full max-w-md">
      <div class="flex flex-col space-y-4">
        <!-- Tombol Navigasi -->
        <button
          v-for="(role, index) in roles"
          :key="index"
          @click="selectRole(role)"
          class="w-full bg-gray-800 text-white text-lg font-semibold py-3 rounded-lg hover:bg-gray-700 transition"
        >
          {{ role.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  name: "RoleSelection",
  setup() {
    const router = useRouter();

    // Daftar Role dengan Path
    const roles = [
      { label: "Admin", path: "/admin" },
      { label: "Player", path: "/join" },
      { label: "Strategic", path: "/join" },
      { label: "Marketing", path: "/join" },
    ];

    // Fungsi untuk memilih role dan membersihkan localStorage
    const selectRole = (role) => {
      localStorage.clear(); // Membersihkan semua data di localStorage
      localStorage.setItem("userRole", role.label); // Simpan role ke localStorage
      router.push(role.path); // Redirect ke halaman sesuai role
    };

    return { roles, selectRole };
  },
};
</script>

<style>
/* Menambahkan margin antar tombol jika dibutuhkan */
button {
  margin-bottom: 10px;
}
</style>
