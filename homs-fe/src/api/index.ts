import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/states/auth'
import type { 
    SignInDto,
    SignInResponseDto
} from '@/domain/user'
import router from '@/router';

const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
    withCredentials: true,
});

// 요청 인터셉터: /signin, /refresh 일 땐 건너뛰기
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url ?? ''

    // ① 로그인·리프레시 요청은 헤더 추가하지 않는다
    if (
      url.endsWith('/auth/signin') ||
      url.endsWith('/auth/refresh')
    ) {
      return config
    }

    // ② 그 외 요청만 토큰 헤더 붙이기
    const authStore = useAuthStore()
    if (authStore.accessToken) {
      config.headers!['Authorization'] = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 3) 자동 리프레시 로직을 위한 상태
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

// 5) 응답 인터셉터: 401 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // 401 에러, _retry 플래그 없고 리프레시 토큰이 있을 때만 동작
    const authStore = useAuthStore()
    if (
      error.response?.status === 401 && !originalRequest._retry && authStore.refreshToken
    ) {
      console.log('🛠 [INTERCEPTOR] 403 에러 발생 - 토큰 리프레시 시도 중')
      originalRequest._retry = true
      if (isRefreshing) {
        console.log('⏳ [INTERCEPTOR] 현재 리프레시 중 - 큐에 요청 대기')
        // 리프레시 중이면 큐에 쌓았다가 토큰 획득 후 재실행
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            console.log('✅ [INTERCEPTOR] 큐에 있던 요청 재시도')
            originalRequest.headers!['Authorization'] = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => {
            console.warn('❌ [INTERCEPTOR] 큐 재시도 실패:', err)
            Promise.reject(err)
          })
      }

      isRefreshing = true
      try {
        console.log('🔁 [INTERCEPTOR] 리프레시 토큰으로 accessToken 재요청')
        // 1) 리프레시 토큰으로 새로운 accessToken 요청
        const { data } = await apiClient.post<SignInResponseDto>(
          '/auth/refresh',
          null,
          {
            headers: {
              Authorization: `Bearer ${authStore.refreshToken}`,
            },
          }
        )

        console.log('✅ [INTERCEPTOR] accessToken 재발급 성공:', data.data.accessToken)

        // 2) 스토어에 토큰 업데이트
        authStore.setTokens(data.data.accessToken, data.data.refreshToken)
        console.log('✅ 저장된 accessToken:', authStore.accessToken)
        console.log('✅ 저장된 refreshToken:', authStore.refreshToken)

        // 3) 대기 중인 요청들 재실행 신호
        processQueue(null, data.data.accessToken)

        // 4) 원래 요청도 새로운 헤더로 재실행
        originalRequest.headers!['Authorization'] = `Bearer ${data.data.accessToken}`
        return apiClient(originalRequest)
        } catch (refreshError) {
          // 리프레시 실패 시 스토어 초기화 후 로그인 페이지로
          console.warn('❌ [INTERCEPTOR] 리프레시 실패 → 로그인 페이지로 이동')
          processQueue(refreshError, null)
          authStore.clearAuth()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
      }
    }

    // 401 외의 에러는 그대로 거절
    return Promise.reject(error)
  }
)

export default apiClient;