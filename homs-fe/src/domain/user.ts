// 이 파일은 예시 파일입니다. 개발시 삭제 후 진행해 주세요

  export type SignInDto = {
    userName: string
    password: string
  }
  
  export type SignInResponseDto = {
    statusCode: number;
    message: string;
    data: {
      accessToken: string;
      refreshToken: string;
      userId : number;
    };
  }

  export type UserRole = 'ROLE_ADMIN' | 'ROLE_USER';

  export interface UserProfile {
    userId: number
    userName: string;
    managerName: string;
    managerEmail: string;
    managerPhone: string;
    createdAt: string;
    updatedAt: string;
    role: UserRole;
    company: number;
    department: number;
  }