import type { UserPhone, AddUserPhoneDto, UpdateUserPhoneDto } from '~/types/userPhone'

/**
 * User Phones API Service (Admin only)
 */
export const userPhonesApi = {
  /**
   * Get all phone numbers for a user
   * GET /admin/users/:userId/phones
   */
  async getUserPhones(userId: number): Promise<UserPhone[]> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: UserPhone[] }>(
      `${baseURL}/admin/users/${userId}/phones`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      }
    )

    return response.data
  },

  /**
   * Add a phone number to user
   * POST /admin/users/:userId/phones
   */
  async addUserPhone(userId: number, dto: AddUserPhoneDto): Promise<UserPhone> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; message: string; data: UserPhone }>(
      `${baseURL}/admin/users/${userId}/phones`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        },
        body: dto
      }
    )

    return response.data
  },

  /**
   * Update a phone number
   * PUT /admin/users/phones/:phoneId
   */
  async updateUserPhone(phoneId: number, dto: UpdateUserPhoneDto): Promise<UserPhone> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; message: string; data: UserPhone }>(
      `${baseURL}/admin/users/phones/${phoneId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.value}`
        },
        body: dto
      }
    )

    return response.data
  },

  /**
   * Delete a phone number
   * DELETE /admin/users/phones/:phoneId
   */
  async deleteUserPhone(phoneId: number): Promise<void> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    await $fetch<{ success: boolean; message: string }>(
      `${baseURL}/admin/users/phones/${phoneId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      }
    )
  }
}
