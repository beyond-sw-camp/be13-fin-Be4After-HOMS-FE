// src/utils/imageUtils.ts (이전에 만든 유틸리티 파일이라고 가정)
// 파일이 있다면 이 파일에 추가하세요.

/**
 * Blob 데이터를 받아 화면에 표시할 이미지 URL을 생성합니다.
 * 이 URL은 사용 후 반드시 revokeObjectURL()로 해제해야 메모리 누수를 방지할 수 있습니다.
 * @param imageBlob - 표시할 이미지 Blob 데이터.
 * @returns 이미지 Blob을 가리키는 임시 URL.
 */
export function createImageURL(imageBlob: Blob): string {
    return URL.createObjectURL(imageBlob);
}

/**
 * 이전에 createImageURL()로 생성된 임시 URL을 해제하여 브라우저 메모리에서 해제합니다.
 * 컴포넌트가 unmounted 되거나 더 이상 이미지가 필요 없을 때 호출하는 것이 중요합니다.
 * @param url - 해제할 이미지 URL.
 */
export function revokeImageURL(url: string): void {
    URL.revokeObjectURL(url);
}

/**
 * 주어진 S3 객체 키를 사용하여 백엔드 API로부터 이미지를 로드하고,
 * 화면에 표시할 수 있는 임시 URL을 반환합니다.
 * @param apiClient - Axios 인스턴스 (또는 fetch API를 래핑한 클라이언트).
 * @param s3Key - S3 객체 키 (예: 'notices/image.png').
 * @returns 이미지 URL Promise<string | null>. 실패 시 null 반환.
 */
export async function loadAndCreateImageURL(
    apiClient: any, // 또는 AxiosInstance 타입 지정
    s3Key: string
): Promise<string | null> {
    if (!s3Key) {
        console.warn("S3 Key가 비어 있습니다.");
        return null;
    }

    try {
        // S3 키를 URL 인코딩하여 안전하게 전달
        const encodedKey = encodeURIComponent(s3Key);
        const response = await apiClient.get(`/files/view?key=${encodedKey}`, {
            responseType: "blob", // **이미지 데이터를 Blob으로 받도록 설정**
        });

        if (response.data instanceof Blob) {
            return createImageURL(response.data);
        } else {
            console.error("응답 데이터가 Blob이 아닙니다:", response.data);
            return null;
        }
    } catch (error) {
        console.error(`이미지 로드 실패 (Key: ${s3Key}):`, error);
        return null;
    }
}
