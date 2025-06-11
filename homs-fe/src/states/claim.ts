import {defineStore} from "pinia";
import apiClient from "@/api";

export interface ClaimSummary {
  cancel: number;
  complete: number;
  exchange: number;
}

interface ClaimItem {
  claimStatus: string;
}

export const useClaimStore = defineStore("claim", {
  state: () => ({
    claimSummary: {
      cancel: 0,
      complete: 0,
      exchange: 0,
    } as ClaimSummary,
  }),
  actions: {
    updateSummary(summary: ClaimSummary) {
      this.claimSummary = {...summary};
    },

    async fetchClaimSummary() {
      try {
        const response = await apiClient.get(`claim/`);
        console.log(response);

        const content: ClaimItem[] = response.data.data.content;

        const summary = {
          cancel: content.filter((item) => item.claimStatus === "CANCEL")
            .length,
          exchange: content.filter((item) => item.claimStatus === "EXCHANGE")
            .length,
          complete: content.filter((item) => item.claimStatus === "COMPLETE")
            .length,
        };

        content.forEach((item) => console.log(item.claimStatus));

        this.updateSummary(summary); // API 형식에 맞게 수정 필요
      } catch (error) {
        console.error("클레임 요약 데이터 조회 실패:", error);
      }
    },
  },
});
