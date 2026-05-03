// UserPhone types
export interface UserPhone {
  id: number
  userId: number
  phoneNumber: string
  label: string | null
  createdAt: string
}

export interface AddUserPhoneDto {
  phoneNumber: string
  label?: string
}

export interface UpdateUserPhoneDto {
  phoneNumber?: string
  label?: string
}
