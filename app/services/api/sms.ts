import type {
  SmsApiResponse,
  SmsDispatch,
  SmsDispatchList,
  SmsDispatchQuery,
  SmsDispatchStats,
  SmsEventBinding,
  SmsEventCode,
  SmsTemplatePayload,
  SmsTemplateSummary,
} from '~/types/sms'

const request = async <T>(path: string, options: Parameters<typeof $fetch<T>>[1] = {}) => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')
  return await $fetch<T>(`${config.public.apiBaseUrl}/admin/sms${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token.value}`, ...options.headers },
  })
}

const toQuery = (query: SmsDispatchQuery) => {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  })
  const value = params.toString()
  return value ? `?${value}` : ''
}

export const smsApi = {
  listTemplates: () => request<SmsApiResponse<SmsTemplateSummary[]>>('/templates'),
  getTemplate: (id: number) => request<SmsApiResponse<SmsTemplateSummary>>(`/templates/${id}`),
  createTemplate: (body: SmsTemplatePayload) => request<SmsApiResponse<SmsTemplateSummary>>('/templates', { method: 'POST', body }),
  updateTemplate: (id: number, body: Partial<SmsTemplatePayload>) => request<SmsApiResponse<SmsTemplateSummary>>(`/templates/${id}`, { method: 'PATCH', body }),
  listEvents: () => request<SmsApiResponse<SmsEventBinding[]>>('/events'),
  updateEvent: (eventCode: SmsEventCode, body: { templateId?: number; isEnabled?: boolean }) => request<SmsApiResponse<SmsEventBinding['binding']>>(`/events/${eventCode}`, { method: 'PATCH', body }),
  listDispatches: (query: SmsDispatchQuery = {}) => request<SmsApiResponse<SmsDispatchList>>(`/dispatches${toQuery(query)}`),
  getStats: (query: SmsDispatchQuery = {}) => request<SmsApiResponse<SmsDispatchStats>>(`/dispatches/stats${toQuery(query)}`),
  getDispatch: (id: number) => request<SmsApiResponse<SmsDispatch>>(`/dispatches/${id}`),
  retryDispatch: (id: number) => request<SmsApiResponse<SmsDispatch>>(`/dispatches/${id}/retry`, { method: 'POST' }),
  checkStatus: (id: number) => request<SmsApiResponse<SmsDispatch>>(`/dispatches/${id}/check-status`, { method: 'POST' }),
}
