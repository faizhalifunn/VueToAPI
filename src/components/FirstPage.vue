<template>
  <div class="h-screen flex items-center justify-center bg-black">
    <div class="bg-gray-200 rounded-2xl shadow-md p-8 w-full max-w-md">
      <form @submit.prevent="submitRole">
        <div class="flex flex-col space-y-4">
          <!-- Pilihan Role -->
          <label v-for="(role, index) in roles" :key="index" class="flex items-center space-x-2">
            <input type="radio" v-model="selectedRole" :value="role" class="cursor-pointer" />
            <span class="text-lg font-semibold text-gray-800">{{ role.label }}</span>
          </label>

          <!-- Tombol Submit -->
          <button
            type="submit"
            class="w-full bg-gray-800 text-white text-lg font-semibold py-3 rounded-lg hover:bg-gray-700 transition"
          >
            Pilih Role
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref } from "vue";

export default {
  name: "RoleSelection",
  setup() {
    const router = useRouter();
    const selectedRole = ref(null);

    const roles = [
      { label: "Admin", path: "/admin" },
      { label: "Player", path: "/join" },
      { label: "Strategic", path: "/join" },
      { label: "Marketing", path: "/join" },
    ];

    const submitRole = () => {
      if (!selectedRole.value) {
        alert("Pilih role terlebih dahulu!");
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
