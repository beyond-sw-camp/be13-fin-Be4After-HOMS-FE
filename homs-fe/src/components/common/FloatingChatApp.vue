<template>
  <div class="fixed bottom-6 right-6 z-50">
    <button @click="toggleChat"
      class="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition-all duration-300">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd"
          d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.508 12.27 2 11.104 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9a1 1 0 100 2h6a1 1 0 100-2H7z"
          clip-rule="evenodd" />
      </svg>
    </button>

    <Transition name="chat-slide-fade">
      <div v-if="isOpen"
        class="fixed bottom-22 right-6 w-80 md:w-200 h-150 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
        <div class="bg-orange-500 text-white p-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold">채팅</h3>
          <button @click="toggleChat" class="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex flex-1 overflow-hidden">
          <div class="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div v-for="chatRoom in chatRooms" :key="chatRoom.id" @click="selectChatRoom(chatRoom.id)" :class="{
              'bg-orange-100 border-l-4 border-orange-500': selectedChatRoomId === chatRoom.id,
              'hover:bg-gray-50': selectedChatRoomId !== chatRoom.id
            }" class="p-3 cursor-pointer transition-colors duration-200">
              <p class="font-semibold text-gray-800 truncate">{{ chatRoom.name }}</p>
              <p class="text-sm text-gray-500 truncate">{{ chatRoom.lastMessage }}</p>
            </div>
          </div>

          <div class="w-2/3 flex flex-col">
            <div class="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div v-if="selectedChatRoom">
                <div v-for="message in selectedChatRoom.messages" :key="message.id" :class="{
                  'text-right': message.sender === 'me',
                  'text-left': message.sender !== 'me'
                }" class="mb-3">
                  <div :class="{
                    'bg-orange-500 text-white rounded-bl-lg': message.sender === 'me',
                    'bg-gray-300 text-gray-800 rounded-br-lg': message.sender !== 'me'
                  }" class="inline-block p-2 rounded-t-lg shadow-sm max-w-[80%]">
                    <p class="text-sm">{{ message.text }}</p>
                    <span class="text-xs opacity-75 mt-1 block">{{ message.time }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-gray-500 mt-10">
                채팅방을 선택해주세요.
              </div>
            </div>

            <div v-if="selectedChatRoom" class="border-t border-gray-200 p-3 bg-white">
              <div class="flex">
                <input v-model="newMessageText" @keyup.enter="sendMessage" type="text" placeholder="메시지를 입력하세요..."
                  class="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <button @click="sendMessage"
                  class="ml-2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';

const isOpen = ref(false);
const selectedChatRoomId = ref(null);
const newMessageText = ref('');

const chatRooms = ref([
  {
    id: 1,
    name: '고객지원팀',
    lastMessage: '안녕하세요! 무엇을 도와드릴까요?',
    messages: [
      { id: 1, text: '안녕하세요, 주문 관련 문의드립니다.', sender: 'me', time: '10:00 AM' },
      { id: 2, text: '네, 고객님. 어떤 부분이 궁금하신가요?', sender: 'support', time: '10:01 AM' },
      { id: 3, text: '제가 주문한 상품이 아직 배송이 안되고 있어요.', sender: 'me', time: '10:05 AM' },
      { id: 4, text: '주문번호를 알려주시면 확인해드리겠습니다.', sender: 'support', time: '10:06 AM' },
    ],
  },
  {
    id: 2,
    name: '프로젝트팀',
    lastMessage: '다음 미팅은 언제로 할까요?',
    messages: [
      { id: 5, text: '오늘 회의록 공유 드렸습니다.', sender: 'alex', time: '09:30 AM' },
      { id: 6, text: '확인했습니다. 수고하셨어요!', sender: 'me', time: '09:35 AM' },
      { id: 7, text: '다음 미팅은 언제로 할까요?', sender: 'alex', time: '09:40 AM' },
    ],
  },
  {
    id: 3,
    name: '친구: 김민준',
    lastMessage: '주말에 뭐해?',
    messages: [
      { id: 8, text: '민준아, 잘 지내?', sender: 'me', time: '03:00 PM' },
      { id: 9, text: '어! 오랜만이야. 잘 지내지. 너는?', sender: 'minjun', time: '03:05 PM' },
      { id: 10, text: '나도 잘 지내! 주말에 뭐해?', sender: 'me', time: '03:10 PM' },
    ],
  },
]);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (!isOpen.value) {
    selectedChatRoomId.value = null; // 채팅창 닫을 때 선택된 채팅방 초기화
  }
};

const selectChatRoom = (id) => {
  selectedChatRoomId.value = id;
  // 채팅방 선택 시 스크롤을 가장 아래로 이동
  nextTick(() => {
    const chatMessagesContainer = document.querySelector('.flex-1.p-4.overflow-y-auto');
    if (chatMessagesContainer) {
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
  });
};

const selectedChatRoom = computed(() => {
  return chatRooms.value.find((room) => room.id === selectedChatRoomId.value);
});

const sendMessage = () => {
  if (newMessageText.value.trim() === '') return;

  const currentChatRoom = selectedChatRoom.value;
  if (currentChatRoom) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    currentChatRoom.messages.push({
      id: currentChatRoom.messages.length + 1,
      text: newMessageText.value,
      sender: 'me',
      time: timeString,
    });
    currentChatRoom.lastMessage = newMessageText.value; // 마지막 메시지 업데이트
    newMessageText.value = '';

    // 메시지 전송 후 스크롤을 가장 아래로 이동
    nextTick(() => {
      const chatMessagesContainer = document.querySelector('.flex-1.p-4.overflow-y-auto');
      if (chatMessagesContainer) {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
      }
    });
  }
};
</script>

<style scoped>
/* Transition 애니메이션을 위한 CSS */
.chat-slide-fade-enter-active,
.chat-slide-fade-leave-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.chat-slide-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
  /* 아래에서 위로 올라오는 효과 */
}

.chat-slide-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
  /* 사라질 때도 아래로 내려가는 효과 */
}
</style>