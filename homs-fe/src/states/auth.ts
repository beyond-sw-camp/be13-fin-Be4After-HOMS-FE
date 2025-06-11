import {defineStore} from "pinia";
import {type UserProfile} from "@/domain/user";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: localStorage.getItem("accessToken") || "",
    refreshToken: localStorage.getItem("refreshToken") || "",
    user: null as UserProfile | null,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === "ROLE_ADMIN",
    isUser: (state) => state.user?.role === "ROLE_USER",
    isLoggedIn: (state) => !!state.accessToken,
  },
  actions: {
    setTokens(access: string, refresh: string) {
      this.accessToken = access;
      this.refreshToken = refresh;
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
    },
    setUser(user: UserProfile) {
      this.user = user;
    },
    clearAuth() {
      this.accessToken = "";
      this.refreshToken = "";
      this.user = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
  persist: true,
});
