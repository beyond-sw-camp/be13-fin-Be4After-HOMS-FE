// stores/loading.ts
import {defineStore} from "pinia";

interface LoadingState {
    isLoading: boolean;
    loadingMessage: string;
}

export const useLoadingStore = defineStore("loading", {
    state: (): LoadingState => ({
        isLoading: false,
        loadingMessage: "",
    }),
    actions: {
        startLoading(message: string = "로딩 중..."): void {
            this.isLoading = true;
            this.loadingMessage = message;
        },
        endLoading(): void {
            this.isLoading = false;
            this.loadingMessage = "";
        },
    },
});
