import { defineStore } from 'pinia';
import apiClient from '@/api';
import { useAuthStore } from '@/states/auth';

interface DeliveryItem {
  orderCode: string;
  companyName: string;
  deliveryName: string;
  orderDate: string;
  deliveryDate: string;
  waybill: string;
  deliveryStatus: string;
}

interface StatusCounts {
  BEFORE: number;
  SHIPPING: number;
  COMPLETED: number;
  COLLECT: number;
}

export const useDeliveryStore = defineStore('delivery', {
  state: () => ({
    statusCounts: {
      BEFORE: 0,
      SHIPPING: 0,
      COMPLETED: 0,
      COLLECT: 0,
    } as StatusCounts,
    deliveryList: [] as DeliveryItem[],
  }),
  actions: {
    mapDeliveryStatus(deliveryStatus: string): string {
      switch (deliveryStatus) {
        case 'BEFORE': return '배송전';
        case 'SHIPPING': return '배송중';
        case 'COMPLETED': return '납품 완료';
        case 'COLLECT': return '회수';
        default: return '알 수 없음';
      }
    },

    async fetchDeliveryInfo(): Promise<void> {
      
      const authstore = useAuthStore(); // ✅ 여기서 호출해야 안전
      const userRole = authstore.isAdmin;  // 예: 'ADMIN' | 'USER'
      let url = '';

      if (userRole === true) {
        url = '/order/deliveryInfo';  // 관리자용 API
      } else {
        url = `/order/deliveryInfo/${authstore.user?.userId}`;  // 사용자용 API
      }

      const response = await apiClient.get(url);
      const data = response.data.data as any[];

      console.log('📦 API 응답 데이터:', data);

      const counts: StatusCounts = {
        BEFORE: 0,
        SHIPPING: 0,
        COMPLETED: 0,
        COLLECT: 0,
      };

      data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

      this.deliveryList = data.map(item => {
        const status = item.deliveryStatus as keyof StatusCounts;
        if (counts[status] !== undefined) {
          counts[status]++;
        }

        console.log('👉 deliveryStatus:', item.deliveryStatus);
        return {
          orderCode: item.orderCode,
          companyName: item.companyName,
          deliveryName: item.deliveryName,
          orderDate: new Date(item.orderDate).toISOString().split('T')[0],
          deliveryDate: new Date(item.deliveryDate).toISOString().split('T')[0],
          waybill: item.waybill,
          deliveryStatus: this.mapDeliveryStatus(status),
        };
      });

      this.statusCounts = counts;
      console.log('✅ 계산된 카운트:', counts);
    }
  }
});
