/**
 * Blob 데이터를 받아 파일로 다운로드합니다.
 * @param blob - 다운로드할 Blob 데이터.
 * @param filename - 다운로드될 파일의 이름.
 */
function downloadBlob(blob: Blob, filename: string): void {
    // 임시 URL 생성
    const url: string = URL.createObjectURL(blob);

    // 가상 <a> 태그 생성 및 다운로드
    const link: HTMLAnchorElement = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);

    // DOM에 link 요소를 추가합니다.
    document.body.appendChild(link);

    // <a> 태그 클릭을 통해 다운로드 시작
    link.click();

    // 임시 URL 해제
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
}

/**
 * API 응답으로부터 파일 이름(Content-Disposition 헤더)을 파싱합니다.
 * @param headers - 응답 헤더 객체. (AxiosResponse.headers는 Record<string, string> 타입과 유사)
 * @param defaultFilename - 파일 이름을 찾지 못했을 때 사용할 기본 파일 이름.
 * @returns 파싱된 파일 이름 또는 기본 파일 이름.
 */
function getFilenameFromHeaders(headers: Record<string, string | number | boolean>, defaultFilename = "download.bin"): string {
    // headers 객체 타입 및 반환값 타입 명시
    // headers['content-disposition']은 string | number | boolean 일 수 있으므로 string으로 단언하거나 nullish coalescing 사용
    const contentDisposition: string | undefined = headers["content-disposition"]?.toString();

    if (!contentDisposition) {
        return defaultFilename;
    }

    let filename: string = defaultFilename; // filename 변수 타입 명시

    // RFC 5987 (filename*=UTF-8'') 형식 처리
    const filenameStarMatch: RegExpExecArray | null = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(contentDisposition); // 매치 결과 타입
    if (filenameStarMatch && filenameStarMatch[1]) {
        try {
            filename = decodeURIComponent(filenameStarMatch[1].replace(/"/g, ""));
        } catch (e: unknown) {
            // 에러 객체 타입 명시
            console.warn("UTF-8 filename decoding failed, trying simple filename.", e); // 에러 객체도 함께 로깅
        }
    } else {
        // filename="..." 또는 filename=... 형식 처리
        const filenameMatch: RegExpExecArray | null = /filename="([^"]+)"|filename=([^;]+)/i.exec(contentDisposition); // 매치 결과 타입
        if (filenameMatch && (filenameMatch[1] || filenameMatch[2])) {
            try {
                // filenameMatch[1] 또는 [2]가 undefined일 수 있으므로 nullish coalescing 사용
                filename = decodeURIComponent(filenameMatch[1] || filenameMatch[2] || "");
            } catch (e: unknown) {
                // 에러 객체 타입 명시
                console.warn("Simple filename decoding failed, using default filename.", e); // 에러 객체도 함께 로깅
            }
        }
    }

    // Content-Type 헤더를 사용하여 기본 파일 이름의 확장자를 추론하는 로직 추가 (선택 사항)
    // 이 로직은 defaultFilename이 사용될 때만 의미가 있습니다.
    if (filename === defaultFilename) {
        const contentType: string | undefined = headers["content-type"]?.toString();
        if (contentType) {
            if (contentType.includes("application/pdf")) {
                filename = "download.pdf";
            } else if (contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
                filename = "download.xlsx";
            } else if (contentType.includes("image/")) {
                // 이미지 타입이라면 일반적인 확장자 추론
                const imageExt = contentType.split("/")[1];
                if (imageExt) {
                    filename = `download.${imageExt}`;
                }
            }
            // 다른 MIME 타입에 대한 추가적인 추론 로직을 여기에 추가할 수 있습니다.
        }
    }
    return filename;
}

export {downloadBlob, getFilenameFromHeaders};
