export interface User {
  id: number
  phoneNumber: string
  nationalCode: string
  firstName: string | null
  lastName: string | null
  fullName: string | null
  role: 'USER' | 'ADMIN'
  isActive: boolean
  totalDebt: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  accessToken: string
  user: {
    id: number
    phoneNumber: string
    role: 'USER' | 'ADMIN'
    firstName: string | null
    lastName: string | null
    fullName: string | null
  }
}

export type LoginMethod = 'otp' | 'password'

export interface OtpRequestResponse {
  ok: boolean
  method?: LoginMethod
}
