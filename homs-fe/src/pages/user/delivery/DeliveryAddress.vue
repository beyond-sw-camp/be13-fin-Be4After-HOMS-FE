<template>
  <div>
    <!-- 제목 -->
    <div class="btn-title">
      <span>배송지 관리</span>
    </div>

    <!-- 검색바 -->
    <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :buttons="actionButtons"/>

    <!-- DynamicTable -->
    <DynamicTable :columns="deliveryColumns" :items="delivery" :showCheckbox="true" >
      <!-- 배송지 명 셀 -->
      <template #cell-deliveryName="{ item }">
        {{ item.deliveryName }} 
      </template>

      <!-- 납품 장소 셀 -->
      <template #cell-streetAddress="{ item }">
        {{ item.streetAddress }} 
      </template>   

      <!-- 상세 주소 셀 -->
      <template #cell-detailedAddress="{ item }">
        {{ item.detailedAddress }} 
      </template>   

      <!-- 버튼 셀 -->
      <template #cell-button="{ item }">
        <div class="cell-buttons">
          <button @click="updateClick(item)" class="btn-update">
            수정
          </button>
          <button @click="deleteClick(item.addressId)" class="btn-delete">
            삭제
          </button>
        </div>
      </template>
    </DynamicTable>

    <DeliveryAddressModal :visible="showCheckModal" :data="selectedDelivery" :selectedCompanyId="selectedCompanyId" @confirm="confirmCheckTaxInvoice" @cancel="cancelCheckTaxInvoice"></DeliveryAddressModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import SearchBox from '@/components/common/SaerchBar.vue';
import DynamicTable from "@/components/common/DynamicTable.vue";
import apiClient from "@/api";
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/states/auth';
import DeliveryAddressModal from '@/components/common/modal/DeliveryAddressModal.vue';

const { t } = useI18n()
const authstore = useAuthStore();

const delivery = ref([]);
const selectedCompanyId = ref(null);
const showCheckModal = ref(false);
const selectedDelivery = ref(null); // 선택된 항목

// ------- 검색바 --------
const handleSearch = (searchData) => {
  searchQuery.value = searchData.searchQuery;
  pageSize.value = searchData.size;
  currentPage.value = 1;
  fetchData();
};

// 검색 필터 목록
const handleSelectOption = ref([
  { value: "", label: "전체" },
]);

// 액션 버튼 정의
const actionButtons = ref([
  {
    label: t('btn.add'),
    color: "bg-orange-500 hover:bg-orange-700",
    action: () => showCheckModal.value = true,
    allowedRoles: ["user"]
  },
]);

const confirmCheckTaxInvoice = () => {
  showCheckModal.value = false
  selectedDelivery.value = null;

  fetchData();
}

const cancelCheckTaxInvoice = () => {
  showCheckModal.value = false
  selectedDelivery.value = null;
}

// 수정
const updateClick = (item) => {
  showCheckModal.value = true;
  selectedDelivery.value = item;
  selectedCompanyId.value = null;
};

// 삭제
const deleteClick = async (addressId) => {
  try {
    const res = await apiClient.delete(`/deliveryAdd/delete/${addressId}`);
    if (res.status === 200){
    }
    fetchData();
  } catch (error) {
    alert(error.response.data.message);
  }
};

// 컬럼 정의
const deliveryColumns = [
  { label: "배송지 명", key: "deliveryName" },
  { label: "납품 장소", key: "streetAddress" },
  { label: "상세 주소", key: "detailedAddress" },
  { label: "", key: "button" },
];

// API 호출 (companyId 용 한번만 태움 댐)
const fetchData_company = async () => {
  try {
    const res = await apiClient.get(`/admin/user/${authstore.user.userId}`);

    if (res.status === 200) {
      selectedCompanyId.value = res.data.data.companyId;
    }
  } catch (e) {
    console.error(e);
  }
};

// API 호출
const fetchData = async () => {
  if(selectedCompanyId.value != null)
  {
    try {
      const res = await apiClient.get(`deliveryAdd/${selectedCompanyId.value}`);

      if (res.status === 200) {
        delivery.value = res.data.data;
      }
    } catch (e) {
      console.error(e);
    }
  }
};

// 초기 데이터 로딩
onMounted(async () => {
  await fetchData_company();  // companyId 먼저 불러옴
  await fetchData();          // companyId가 설정된 후에 호출
});
</script>

<style>
.btn-update {
  background-color: #9ca3af;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
}

.btn-update:hover {
  background-color: #6b7280;
}

.btn-delete {
  background-color: #9ca3af;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
}

.btn-delete:hover {
  background-color: #6b7280;
}
</style>