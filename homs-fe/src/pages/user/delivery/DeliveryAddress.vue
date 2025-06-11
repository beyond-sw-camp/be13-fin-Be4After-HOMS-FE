<template>
  <div>
    <Breadcrumb />


    <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :buttons="actionButtons" />

    <DynamicTable :columns="deliveryColumns" :items="delivery" :isLoading="isTableLoading">
      <template #actions="{ item }">
        <div class="flex space-x-2">
          <button @click="updateClick(item)"
            class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">
            수정
          </button>
          <button @click="deleteClick(item.addressId)"
            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm">
            삭제
          </button>
        </div>
      </template>
    </DynamicTable>

    <!-- 페이지 네비 -->
    <PageNav :currentPage="Number(currentPage)" :totalPages="Number(totalPages)" />

    <!-- 배송 추가/수정 모달 -->
    <DeliveryAddressModal :visible="showCheckModal" :data="selectedDelivery" :selectedCompanyId="selectedCompanyId"
      @confirm="confirmCheckTaxInvoice" @cancel="cancelCheckTaxInvoice"></DeliveryAddressModal>
    <!-- 알람 모달 -->
    <ConfirmModal :visible="showConfirmModal" :text="modalText" :type="modalType" :alert="alertModal"
      @update:visible="showConfirmModal = $event" @confirm="confirmModal">
    </ConfirmModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import SearchBox from '@/components/common/SaerchBar.vue';
import DynamicTable from "@/components/common/DynamicTable.vue";
import apiClient from "@/api";
import PageNav from "@/components/common/PageNav.vue";
import ConfirmModal from "@/components/common/modal/ConfirmModal.vue";
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/states/auth';
import DeliveryAddressModal from '@/components/common/modal/DeliveryAddressModal.vue';
import Breadcrumb from '@/components/common/Breadcrumb.vue';

const { t } = useI18n()
const authstore = useAuthStore();

const isTableLoading = ref(false); // 로딩 상태 관리

// 고정
const currentPage = ref(1); // 현재 페이지 상태 관리
const totalPages = ref(1); // 총 페이지 수 상태 관리
const pageSize = ref(10); // 페이지당 항목 수 (고정값)

const delivery = ref([]);
const selectedCompanyId = ref(null);
const showCheckModal = ref(false);
const selectedDelivery = ref(null); // 선택된 항목

// 알람 모달 관련
const showConfirmModal = ref(false); // 알람 모달 상태
const modalText = ref(""); // 알람 모달 텍스트
const modalType = ref(""); // 알람 모달 식별 타입
const alertModal = ref(false); // 알람 모달 여부

const currentAddressId = ref();

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
    action: () => createClick(),
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

// 생성 버튼
const createClick = () => {
  showCheckModal.value = true;
  selectedDelivery.value = null;
};


// 수정
const updateClick = (item) => {
  showCheckModal.value = true;
  selectedDelivery.value = item;
};

// 삭제
const deleteClick = async (addressId) => {
  currentAddressId.value = addressId;
  alertModal.value = false;
  modalText.value = "배송지를 삭제하시겠습니까?.";
  modalType.value = "delete";
  showConfirmModal.value = true;
};

// 컬럼 정의
const deliveryColumns = [
  { label: "배송지 명", key: "deliveryName" },
  { label: "납품 장소", key: "streetAddress" },
  { label: "상세 주소", key: "detailedAddress" },
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
  isTableLoading.value = true;
  if(selectedCompanyId.value != null)
  {
    try {
      const res = await apiClient.get(`deliveryAdd/${selectedCompanyId.value}`);

      if (res.status === 200) {
        delivery.value = res.data.data;
      }
    } catch (e) {
      console.error(e);
    }finally {
        isTableLoading.value = false; // 로딩 종료
    }
  }
};

// 알림 모달에서 확인이 눌러졌을때
const confirmModal = async () => {
    if (modalType.value === "delete") {
      try {
        const res = await apiClient.delete(`/deliveryAdd/delete/${currentAddressId.value}`);
        if (res.status === 200){
          alertModal.value = true;
          showConfirmModal.value = true;
          modalText.value = "배송지가 삭제되었습니다.";
        }
      } catch (error) {
        alertModal.value = true;
        showConfirmModal.value = true;
        modalText.value = error.response.data.message;
      }
      fetchData();
    }
}

// // 선택한 행에 대한 정보 처리
// const handleRowClick = (item) => {
//   console.log(item.addressId);
//   currentAddressId.value = item.addressId; // 선택된 항목 ID 업데이트
//   // showModal.value = true;
// };

// 초기 데이터 로딩
onMounted(async () => {
  await fetchData_company();  // companyId 먼저 불러옴
  await fetchData();          // companyId가 설정된 후에 호출
});
</script>