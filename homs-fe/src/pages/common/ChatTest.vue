<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <!-- 1. 헤더 -->
    <header class="flex items-center px-4 py-2 bg-blue-600 text-white">
      <button
        class="mr-3 text-2xl focus:outline-none"
        @click="goBack()"
      >
        ←
      </button>
      <h2 class="text-lg font-semibold">
        채팅방: <span v-if="roomId">{{ roomId }}</span><span v-else>생성 중...</span>
      </h2>
    </header>

    <!-- 2. 메시지 목록 -->
    <section
      ref="messagesContainer"
      class="flex-1 overflow-auto px-4 py-2 space-y-3"
    >
      <div
        v-for="msg in messages"
        :key="msg.messageId"
        class="flex flex-col max-w-[70%]"
        :class="msg.senderId === currentUserId ? 'ml-auto items-end' : 'mr-auto items-start'"
      >
        <!-- 보낸 사람 표시 -->
        <span
          class="text-xs text-gray-500"
        >
          {{ msg.senderId === currentUserId ? '나' : otherUserIdLabel }}
        </span>
        <!-- 메시지 내용 -->
        <div
          class="relative px-3 py-2 rounded-lg"
          :class="msg.senderId === currentUserId ? 'bg-green-200' : 'bg-white border border-gray-200'"
        >
          <p class="text-sm text-gray-800">
            {{ msg.content }}
          </p>
          <span
            class="absolute bottom-0 right-1 text-[10px] text-gray-500"
          >
            {{ formatTime(msg.sentAt) }}
          </span>
        </div>
      </div>
    </section>

    <!-- 3. 입력 영역 -->
    <footer class="flex items-center px-4 py-2 bg-gray-200">
      <input
        v-model="inputMessage"
        @keyup.enter="sendMessage()"
        type="text"
        placeholder="메시지를 입력하세요..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        class="ml-3 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none"
        @click="sendMessage()"
      >
        전송
      </button>
    </footer>
  </div>
</template>

<script>
import axios from 'axios'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

function zeroPad(num) {
  return num < 10 ? '0' + num : num
}

export default {
  name: 'ChatTest',
  props: {
    otherUserId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      roomId: null,
      stompClient: null,
      messages: [],
      inputMessage: '',
      currentUserId: null,
      jwtToken: null,
      otherUserIdLabel: ''
    }
  },
  created() {
    this.jwtToken = localStorage.getItem('accessToken') || ''
    if (!this.jwtToken) {
      alert('로그인 정보가 없습니다. 로그인 후 다시 시도해주세요.')
      this.$router.push({ name: 'login' })
      return
    }

    this.currentUserId = localStorage.getItem('userId')
    if (!this.currentUserId) {
      const payload = JSON.parse(atob(this.jwtToken.split('.')[1]))
      this.currentUserId = payload.sub
      localStorage.setItem('userId', this.currentUserId)
    }

    this.otherUserIdLabel = 'User ' + this.otherUserId
    this.createOrEnterRoom()
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    formatTime(isoString) {
      if (!isoString) return ''
      const d = new Date(isoString)
      const hh = zeroPad(d.getHours())
      const mm = zeroPad(d.getMinutes())
      return `${hh}:${mm}`
    },
    createOrEnterRoom() {
      const baseUrl = import.meta.env.VITE_API_URL || ''
      axios
        .post(
          `${baseUrl}/chat/room?otherUserId=${this.otherUserId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.jwtToken}`
            }
          }
        )
        .then((res) => {
          this.roomId = res.data.roomId
          this.loadOldMessages()
          this.connectWebSocket()
        })
        .catch((err) => {
          console.error('채팅방 생성/조회 오류:', err)
          alert('채팅방을 불러오는 중 오류가 발생했습니다.')
          this.$router.back()
        })
    },
    loadOldMessages() {
      const baseUrl = import.meta.env.VITE_API_URL || ''
      axios
        .get(`${baseUrl}/chat/room/${this.roomId}/messages`, {
          headers: {
            Authorization: `Bearer ${this.jwtToken}`
          }
        })
        .then((res) => {
          this.messages = res.data
          this.scrollToBottom()
        })
        .catch((err) => {
          console.error('과거 메시지 로드 오류:', err)
        })
    },
    connectWebSocket() {
      const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/v1$/, '')
      const socket = new SockJS(`${baseUrl}/ws-stomp`)
      this.stompClient = Stomp.over(socket)

      this.stompClient.connect(
        { Authorization: `Bearer ${this.jwtToken}` },
        () => {
          this.stompClient.subscribe(
            `/sub/chat/room/${this.roomId}`,
            (frame) => {
              const body = JSON.parse(frame.body)
              this.messages.push(body)
              this.scrollToBottom()
            }
          )
        },
        (error) => {
          console.error('WebSocket 연결 실패:', error)
        }
      )
    },
    sendMessage() {
      const text = this.inputMessage.trim()
      if (!text || !this.roomId) return

      const payload = {
        messageId: null,
        roomId: this.roomId,
        senderId: null,
        content: text,
        sentAt: null
      }
      this.stompClient.send(
        '/pub/sendMessage',
        {},
        JSON.stringify(payload)
      )
      this.inputMessage = ''
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    }
  }
}
</script>


