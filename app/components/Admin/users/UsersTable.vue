<script setup lang="ts">
import { formatNumber } from '~/utils/formatters'
import { getUserDisplayName } from '~/func/getUserDisplayName'
import { ACTIVE_STATUS_BADGES, USER_ROLE_BADGES } from '~/constants/badges'
import type { AdminUser } from '~/types/admin'
import type { TableColumn } from '~/components/Base/Table.vue'

defineProps<{
  users: AdminUser[]
}>()

const emit = defineEmits<{
  'toggle-status': [user: AdminUser]
  delete: [user: AdminUser]
}>()

const columns: TableColumn<AdminUser>[] = [
  { key: 'id', label: 'شناسه', align: 'center' },
  {
    key: 'fullName',
    label: 'نام',
    align: 'center',
    format: (val, row) => getUserDisplayName(row)
  },
  { key: 'phoneNumber', label: 'موبایل', align: 'center' },
  { key: 'nationalCode', label: 'کد ملی', align: 'center' },
  { key: 'role', label: 'نقش', align: 'center' },
  {
    key: 'totalDebt',
    label: 'بدهی',
    align: 'center',
    format: (val) => formatNumber(val)
  },
  { key: 'isActive', label: 'وضعیت', align: 'center' }
]
</script>

<template>
  <BaseTable :columns="columns" :data="users">
    <!-- Phone Number Cell -->
    <template #cell-phoneNumber="{ value }">
      <div class="text-sm text-gray-900" dir="ltr">{{ value }}</div>
    </template>

    <!-- Role Cell -->
    <template #cell-role="{ row }">
      <BaseStatusBadge :map="USER_ROLE_BADGES" :value="row.role" />
    </template>

    <!-- Total Debt Cell -->
    <template #cell-totalDebt="{ value }">
      <div dir="ltr">{{ value }}</div>
    </template>

    <!-- Status Cell -->
    <template #cell-isActive="{ row }">
      <BaseStatusBadge :map="ACTIVE_STATUS_BADGES" :value="row.isActive" />
    </template>

    <!-- Actions -->
    <template #actions="{ row }">
      <div class="flex items-center justify-center gap-2">
        <NuxtLink
          :to="`/admin/users/${row.id}`"
          title="مشاهده جزئیات"
          class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </NuxtLink>
        <NuxtLink
          :to="`/admin/users/edit/${row.id}`"
          title="ویرایش"
          class="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors duration-200"
        >
          <IconsOutline name="edit" class="w-5 h-5" />
        </NuxtLink>
        <button
          v-if="row.role !== 'ADMIN'"
          @click="emit('toggle-status', row)"
          :title="row.isActive ? 'غیرفعال کردن' : 'فعال کردن'"
          class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
        >
          <IconsOutline name="switch-horizontal" class="w-5 h-5" />
        </button>
        <button
          @click="emit('delete', row)"
          title="حذف"
          class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <IconsOutline name="trash" class="w-5 h-5" />
        </button>
      </div>
    </template>
  </BaseTable>
</template>
