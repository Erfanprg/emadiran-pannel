import type { Gateway } from '~/types/gateway'

export const gatewaysApi = {
  // Get all payment gateways
  async getAll() {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: Gateway[] }>(`${baseURL}/admin/gateways`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    return response.data
  },

  // Get active gateways only
  async getActive() {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: Gateway[] }>(`${baseURL}/admin/gateways/active`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    return response.data
  },

  // Toggle gateway status (activate/deactivate)
  async toggle(name: string, isActive: boolean) {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<{ 
      success: boolean
      message: string
      data: Gateway 
    }>(`${baseURL}/admin/gateways/${name}/toggle`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: { isActive }
    })
    return response
  },

  // Get payment gateways for users (public endpoint)
  async getPaymentGateways() {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: Gateway[] }>(`${baseURL}/payments/gateways`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    return response.data
  }
}
