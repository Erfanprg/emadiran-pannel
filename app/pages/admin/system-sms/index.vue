<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { SmsSection } from '~/components/Admin/sms/SmsNavigation.vue'

useHead({ title: 'مدیریت پیامک‌ها - عماد ایران' })
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

if (!authStore.isAdmin) navigateTo('/dashboard')

const isSection = (value: unknown): value is SmsSection =>
  value === 'dispatches' || value === 'templates' || value === 'events'

const section = ref<SmsSection>(isSection(route.query.section) ? route.query.section : 'dispatches')

watch(section, value => {
  router.replace({ query: value === 'dispatches' ? {} : { section: value } })
})
</script>

<template>
  <div class="min-h-screen w-full bg-gray-50">
    <AdminHeader title="مدیریت پیامک‌ها" />
    <main class="mx-auto max-w-[1400px] px-4 py-8">
      <AdminSmsNavigation v-model="section" />
      <AdminSmsDispatchesPanel v-if="section === 'dispatches'" />
      <AdminSmsTemplatesPanel v-else-if="section === 'templates'" />
      <AdminSmsEventsPanel v-else />
    </main>
  </div>
</template>
