import {ref, computed} from "vue";
import {defineStore} from "pinia";

type UserRole = "ROLE_ADMIN" | "ROLE_USER";

export const userStore = defineStore('user', () => {
  const role = ref<UserRole|"">('')

  const isAdmin = computed(() => role.value === 'ROLE_ADMIN') 

  function setRole(newRole: UserRole) {
    role.value = newRole;
  }

  return {role, isAdmin, setRole};
});
