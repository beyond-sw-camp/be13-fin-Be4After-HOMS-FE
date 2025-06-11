<template>
  <div>
    <Breadcrumb />
    <!-- 루트 추가 버튼 -->
    <div class="btn-title">
      <button @click="addMenuRoot" class="btn-create-root"> 생성 </button>
    </div>

    <!-- DynamicTable -->
    <DynamicTable :columns="menusColumns" :items="flatMenus" :isIndexActive=false :isLoading="isTableLoading">
      <!-- 메뉴명 셀 -->
      <template #cell-menuName="{ item }">
        <div class="cell-menu" :style="{ paddingLeft: item.level * 20 + 'px' }">
          <span v-if="item.hasChildren && item.level === 0" @click.stop="toggleFolder(item)">
            {{ openState[item.menuId] ? '▼' : '▶' }}
          </span>
          <span v-else style="display: inline-block; width: 18px;"></span>

          <input v-model="item.menuName" />
        </div>
      </template>

      <!-- 순번 셀 -->
      <template #cell-sortNo="{ item }">
        <div class="cell-sort">
          <input class="sort-input" type="number" v-model.number="item.sortNo" min="1" />
        </div>
      </template>

      <!-- 경로 셀 -->
      <template #cell-path="{ item }">
        <div class="cell-path">
          <input v-if="item.level !== 0" v-model="item.path" />
        </div>
      </template>

      <!-- 이미지 셀 -->
      <!-- <template #cell-image="{ item }">
        <div class="cell-image">
            <img v-if="item.hasChildren && item.level === 0"  :src="getImageByKey(item.image)" width="80" class="w-6 h-6"/>
          <input v-if="item.hasChildren && item.level === 0" v-model="item.image" />
        </div>
      </template> -->

      <!-- 이미지 셀 -->
      <template #cell-image="{ item }">
        <div class="cell-image">
          <div v-if="item.hasChildren && item.level === 0" class="dropdown" @click="toggleDropdown(item.menuId)">
            <img :src="getImageByKey(item.image)" class="icon-preview" />
          </div>
          <div v-if="dropdownOpen[item.menuId]" class="dropdown-menu">
            <div v-for="(src, key) in imageMap" :key="key" class="dropdown-item" @click.stop="selectImage(item, key)">
              <img :src="src" alt="아이콘" class="icon-preview" />
            </div>
          </div>
        </div>
      </template>

      <!-- 구매 셀 -->
      <template #cell-buy="{ item }">
        <input v-if="item.level !== 0" type="checkbox" v-model="item.buy" class="dept-checkbox" />
      </template>

      <!-- 배송 셀 -->
      <template #cell-delivery="{ item }">
        <input v-if="item.level !== 0" type="checkbox" v-model="item.delivery" class="dept-checkbox" />
      </template>

      <!-- 자재 셀 -->
      <template #cell-materials="{ item }">
        <input v-if="item.level !== 0" type="checkbox" v-model="item.materials" class="dept-checkbox" />
      </template>

      <!-- 영업 셀 -->
      <template #cell-sales="{ item }">
        <input v-if="item.level !== 0" type="checkbox" v-model="item.sales" class="dept-checkbox" />
      </template>

      <!-- 버튼 셀 -->
      <template #cell-button="{ item }">
        <div class="cell-buttons">
          <button v-if="item.hasChildren && item.level === 0" @click.stop="addMenuChild(item)" class="btn-create-child">
            생성
          </button>
          <button @click.stop="updateMenu(item)" class="btn-update-child">
            수정
          </button>
          <button @click.stop="deleteMenu(item.menuId)" class="btn-delete-child">
            삭제
          </button>
        </div>
      </template>

    </DynamicTable>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import DynamicTable from "@/components/common/DynamicTable.vue";
import apiClient from "@/api";

// 정적 이미지 import
import icon1 from '@/assets/menu/menu-icon-1.svg';
import icon2 from '@/assets/menu/menu-icon-2.svg';
import icon3 from '@/assets/menu/menu-icon-3.svg';
import icon4 from '@/assets/menu/menu-icon-4.svg';
import icon5 from '@/assets/menu/menu-icon-5.svg';
import icon6 from '@/assets/menu/menu-icon-6.svg';
import icon7 from '@/assets/menu/menu-icon-7.svg';
import Breadcrumb from '@/components/common/Breadcrumb.vue';

const isTableLoading = ref(false); // 로딩 상태 관리

const dropdownOpen = reactive({});

const toggleDropdown = (id) => {
  dropdownOpen[id] = !dropdownOpen[id];
};

const selectImage = (item, key) => {
  item.image = key;
  dropdownOpen[item.menuId] = false;
};

// key에 따른 이미지 매핑
const imageMap = {
  '1': icon1,
  '2': icon2,
  '3': icon3,
  '4': icon4,
  '5': icon5,
  '6': icon6,
  '7': icon7,
};

// key에 따른 실제 이미지 경로 반환
const getImageByKey = (key) => {
  const trimmedKey = typeof key === 'string' ? key.trim() : '';
  const src = imageMap[trimmedKey];

  if (!src) {
    console.warn(`이미지를 찾을 수 없습니다: menu-icon-${trimmedKey}.svg`);
  }

  return src || '';
};


// 메뉴 트리 및 평탄화 데이터
const menus = ref([]); // 트리 구조 데이터 관리 및 API 전송용
const flatMenus = ref([]); // 트리 구조 UI 표시용

// 트리 노드의 펼침 상태 저장
const openState = reactive({});

// 신규 생성 데이터 기억용 
const newMenuIdSet = new Set();

// 트리 평탄화
const flattenTree = (nodes, level = 0, arr = []) => {
  nodes.forEach((node) => {
    if (openState[node.menuId] === undefined)
      openState[node.menuId] = true;

    arr.push({
      ...node,
      level,
      hasChildren: node.children !== undefined,
    });

    if (node.children && openState[node.menuId]) {
      flattenTree(node.children, level + 1, arr);
    }
  });
  return arr;
};

// API 호출
const fetchData = async () => {
  isTableLoading.value = true;
  try {
    const res = await apiClient.get("/menu/");

    if (res.status === 200) {
      menus.value = res.data.data;
    } 
  } catch (e) {
    console.error(e);
  } finally {
      isTableLoading.value = false; // 로딩 종료
  }
};

// 메뉴 변경 시 다시 tree구조 생성
watch(menus, (newVal) => {
  if (newVal) {
    flatMenus.value = flattenTree(newVal);
  }
});

// 초기 데이터 로딩
onMounted(() => {
  fetchData();
});

// 루트 메뉴 추가
const addMenuRoot = () => {
  const newId = Math.floor(Math.random() * 1000000);

  newMenuIdSet.add(newId);

  menus.value.push({
    menuId: newId,
    menuName: "새 루트 메뉴",
    sortNo: menus.value.length + 1,
    image: "1",
    children: [],
  });
  flatMenus.value = flattenTree(menus.value);
};

// 자식 메뉴 추가
const addMenuChild = (item) => {
  const newId = Math.floor(Math.random() * 1000000);
  
  newMenuIdSet.add(newId);

  item.children.push({
    menuId: newId,
    menuName: "새 자식 메뉴",
    sortNo: item.children.length + 1,
    parentId: item.menuId,
  });
  flatMenus.value = flattenTree(menus.value);
};

// 메뉴 삭제
const deleteMenu = async (menuId) => {
  try {
    const res = await apiClient.delete(`/menu/delete/${menuId}`);
    if (res.status === 200){
      console.log("삭제 성공");
    }
    fetchData();
  } catch (error) {
    alert(error.response.data.message);
  }
};

// 메뉴 수정
const updateMenu = async (item) => {
  const newData = {
    menuName: item.menuName,
    sortNo: item.sortNo,
    path: item.path,
    image: item.image,
    buy: item.buy,
    materials: item.materials,
    delivery: item.delivery,
    sales: item.sales,
    parentId: item.parentId,
  };

  try {
    let res;

    if(newMenuIdSet.has(item.menuId)){
      res = await apiClient.post("/menu/create", newData);
      // 201 = 요청이 성공적으로 처리되어, 새로운 리소스가 생성됨
      if (res.status === 200 || res.status === 201){
        console.log("생성 성공");
        newMenuIdSet.delete(item.menuId);
      }
    } else {
      res = await apiClient.put(`/menu/update/${item.menuId}`, newData);
      if (res.status === 200 || res.status === 201){
        console.log("수정 성공");
      }
    }
    // fetchData();
    window.location.reload();
  } catch (error) {
    alert(error.response.data.message);
  }
};

// 폴더 열기/닫기
const toggleFolder = (item) => {
  openState[item.menuId] = !openState[item.menuId];
  flatMenus.value = flattenTree(menus.value);
};

// 컬럼 정의
const menusColumns = [
  { label: "메뉴명", key: "menuName" },
  { label: "순번", key: "sortNo" },
  { label: "경로", key: "path" },
  { label: "이미지", key: "image" },
  { label: "구매", key: "buy" },
  { label: "배송", key: "delivery" },
  { label: "자재", key: "materials" },
  { label: "영업", key: "sales" },
  { label: "", key: "button" },
];
</script>

<style>
.btn-title {
  display: flex;
  justify-content: end;
  align-items: center;
  font-size: 24px;
  padding: 12px;
}

.cell-menu {
  cursor: pointer;
}

.cell-sort,
.cell-path {
  display: center;
  align-items: center;
  justify-content: space-between;
}

.sort-input,
.cell-sort {
  width: 50px;
}

.cell-image {
  position: relative;
  width: 60px;
}

.dropdown {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  cursor: pointer;
  padding: 4px;
  user-select: none;
}

.dropdown-arrow {
  margin-left: auto;
  padding-left: 8px;
}

.dropdown-menu {
  width: 60px;
  border: 1px solid #ccc;
  background: white;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 4px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

.icon-preview {
  width: 24px;
  height: 24px;
  margin-right: 8px;
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