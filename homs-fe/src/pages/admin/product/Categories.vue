<template>
  <div>
    <Breadcrumb />

    <!-- 루트 추가 버튼 -->
    <div class="btn-title">
      <button @click="addCategoryRoot" class="btn-create-root"> 생성 </button>
    </div>

    <!-- DynamicTable -->
    <DynamicTable :columns="categoriesColumns" :items="flatCategories" :isIndexActive=false :isLoading="isTableLoading">
      <!-- 카테고리명 셀 -->
      <template #cell-categoryName="{ item }">
        <div class="cell-category" :style="{ paddingLeft: item.level * 20 + 'px' }">
          <span v-if="item.hasChildren && item.level === 0" @click.stop="toggleFolder(item)">
            {{ openState[item.categoryId] ? '▼' : '▶' }}
          </span>
          <span v-else style="display: inline-block; width: 18px;"></span>

          <input v-model="item.categoryName" />
        </div>
      </template>

      <!-- 순번 셀 -->
      <template #cell-sortNo="{ item }">
        <div class="cell-sort">
          <input type="number" v-model.number="item.sortNo" min="1" />
        </div>
      </template>

      <!-- 버튼 셀 -->
      <template #cell-button="{ item }">
        <div class="cell-buttons">
          <!-- 버튼 클릭 시 부모 클릭 이벤트까지 작동하면 안 되어 @click.stop 사용 -->
          <button v-if="item.hasChildren && item.level < 2" @click.stop="addCategoryChild(item)"
            class="btn-create-child">
            생성
          </button>
          <button @click.stop="updateCategory(item)" class="btn-update-child">
            수정</button>
          <button @click.stop="deleteCategory(item.categoryId)" class="btn-delete-child">
            삭제</button>
        </div>
      </template>
    </DynamicTable>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import DynamicTable from "@/components/common/DynamicTable.vue";
import apiClient from "@/api";
import Breadcrumb from '@/components/common/Breadcrumb.vue';

const isTableLoading = ref(false); // 로딩 상태 관리

// 트리 구조 데이터
const categories = ref([]); // 트리 구조 데이터 관리 및 API 전송용
const flatCategories = ref([]); // 트리 구조 UI 표시용

// 트리 노드의 펼침 상태 저장
const openState = reactive({});

// 신규 생성 데이터 기억용 
const newCategoryIdSet = new Set();

// 트리 구조로 설정
const flattenTree = (nodes, level = 0, arr = []) => {
  nodes.forEach((node) => {
    if (openState[node.categoryId] === undefined)
      openState[node.categoryId] = true;

    arr.push({
      ...node, // node 객체의 속성들을 전부 풀어서 복사
      level,
      hasChildren: node.children !== undefined,
    });

    if (node.children && openState[node.categoryId]) {
      flattenTree(node.children, level + 1, arr);
    }
  });
  return arr;
};

// API 호출
const fetchData = async () => {
  isTableLoading.value = true;
  try {
    const res = await apiClient.get("/productCategory/");

    if ( res.status === 200) {
      categories.value = res.data.data;
    } else {
      categories.value = getSampleCategoryTree();
    }
  } catch (e) {
    console.error(e);
    categories.value = getSampleCategoryTree();
  }finally {
    isTableLoading.value = false; // 로딩 종료
  }
};

// 샘플 데이터 (API 응답 구조와 동일)
const getSampleCategoryTree = () => [
  {
    categoryId: 1,
    categoryName: "의류",
    sortNo: 1,
    parentId: null,
    children: [
      {
        categoryId: 3,
        categoryName: "남성 의류",
        sortNo: 1,
        parentId: 1,
      },
    ],
  },
  {
    categoryId: 2,
    categoryName: "전자제품",
    sortNo: 2,
    parentId: null,
    children: [
      {
        categoryId: 5,
        categoryName: "스마트폰",
        sortNo: 1,
        parentId: 2,
      },
    ],
  },
];

// 카테고리 변경 시 다시 tree구조 생성
watch(categories, (newVal) => {
  if (newVal) {
    flatCategories.value = flattenTree(newVal);
  }
});

// 데이터 불러오기
onMounted(() => {
  fetchData();
});

// 루트 카테고리 추가
const addCategoryRoot = () => {
  const newId = Math.floor(Math.random() * 1000000); // 랜덤 ID 

  newCategoryIdSet.add(newId);

  categories.value.push({
    categoryId: newId,
    categoryName: "새 루트 카테고리",
    sortNo: categories.value.length + 1,
    parentId: null,
    children: [],
  });

  flatCategories.value = flattenTree(categories.value);
};

// 자식 카테고리 추가
const addCategoryChild = (item) => {
  const newId = Math.floor(Math.random() * 1000000); // 랜덤 ID

  newCategoryIdSet.add(newId);  

  item.children.push({
    categoryId: newId,
    categoryName: "새 자식 카테고리",
    sortNo: item.children.length + 1,
    parentId: item.categoryId
  });

  flatCategories.value = flattenTree(categories.value);
};

// 카테고리 삭제
const deleteCategory = async (categoryId) => {
  try {
    const res = await apiClient.delete(`/productCategory/delete/${categoryId}`);
    if (res.status === 200){
      console.log("삭제 성공");
    }
    fetchData();
  } catch (error) {
    alert(error.response.data.message);
  }
};

// 카테고리 생성 및 수정
const updateCategory = async (item) => {
  const newData = {
    categoryName: item.categoryName,
    sortNo: item.sortNo,
    parentId: item.parentId,
  };

  try {
    if(newCategoryIdSet.has(item.categoryId)){
      const res = await apiClient.post("/productCategory/create", newData);
      // 201 = 요청이 성공적으로 처리되어, 새로운 리소스가 생성됨
      if (res.status === 200 || res.status === 201){
        console.log("생성 성공");
        newCategoryIdSet.delete(item.categoryId);
      }
    } else {
      const res = await apiClient.put(`/productCategory/update/${item.categoryId}`, newData);
      if (res.status === 200 || res.status === 201){
        console.log("수정 성공");
      }
    }
    fetchData();
  } catch (error) {
    alert(error.response.data.message);
  }
};

// 폴더 열기/닫기
const toggleFolder = (item) => {
  openState[item.categoryId] = !openState[item.categoryId];
  flatCategories.value = flattenTree(categories.value);
};

// 컬럼 정의
const categoriesColumns = [
  { label: "카테고리명", key: "categoryName" },
  { label: "순번", key: "sortNo" },
  { label: "", key: "button" },
];
</script>

<style>
.btn-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24px;
  padding-left: 12px;
  padding-right: 12px;
  padding-top: 12px;
  padding-bottom: 12px;
}

.cell-category {
  cursor: pointer;
}

.cell-sort {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cell-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.btn-create-root {
  background-color: #f97316;
  color: white;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  margin-right: 8px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.btn-create-root:hover {
  background-color: #c2410c;
}

.btn-create-child {
  background-color: #f97316;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
}

.btn-create-child:hover {
  background-color: #c2410c;
}

.btn-update-child {
  background-color: #9ca3af;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
}

.btn-update-child:hover {
  background-color: #6b7280;
}

.btn-delete-child {
  background-color: #f43f5e;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
}

.btn-delete-child:hover {
  background-color: #e11d48;
}
</style>