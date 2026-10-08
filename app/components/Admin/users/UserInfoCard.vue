<script setup lang="ts">
import { formatCurrency } from "~/utils/formatters";
import { getUserDisplayName } from "~/func/getUserDisplayName";

defineProps<{
  user: any;
  paymentDeadlineLabel: string;
  hasPaymentDeadline: boolean;
  isLoadingPaymentDeadline: boolean;
}>();

const emit = defineEmits<{
  "open-payment-deadlines": [];
  "add-debt": [];
  "reduce-debt": [];
  "open-contact-histories": [];
  "toggle-status": [];
}>();
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
  >
    <!-- Header -->
    <div class="flex flex-col gap-4 pb-6 border-b border-gray-200 mb-6">
      <!-- User Name & Payment Deadline -->
      <div
        class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
      >
        <button
          type="button"
          @click="emit('open-payment-deadlines')"
          :disabled="isLoadingPaymentDeadline"
          class="order-1 sm:order-2 px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium text-sm border w-full sm:w-auto"
          :class="
            hasPaymentDeadline
              ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
          "
        >
          {{ paymentDeadlineLabel }}
        </button>

        <div class="order-2 sm:order-1">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            {{ getUserDisplayName(user) }}
          </h2>
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="px-3 py-1 text-sm font-medium rounded-full"
              :class="
                user.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              "
            >
              {{ user.isActive ? "فعال" : "غیرفعال" }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action Buttons - Responsive Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2"
      >
        <NuxtLink
          v-if="user.role !== 'ADMIN'"
          :to="`/admin/users/edit/${user.id}`"
          class="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-accent transition-colors duration-200 font-medium text-center text-sm"
        >
          ویرایش اطلاعات
        </NuxtLink>
        <NuxtLink
          :to="`/admin/users/phones/${user.id}`"
          class="px-4 py-2.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm"
        >
          <IconsOutline name="phone" class="w-4 h-4" />
          مدیریت شماره‌ها
        </NuxtLink>
        <button
          v-if="user.role !== 'ADMIN'"
          @click="emit('add-debt')"
          class="px-4 py-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm"
        >
          <IconsOutline name="plus" class="w-4 h-4" />
          افزودن بدهی
        </button>
        <button
          v-if="user.role !== 'ADMIN' && parseInt(user.totalDebt) > 0"
          @click="emit('reduce-debt')"
          class="px-4 py-2.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm"
        >
          <IconsOutline name="minus" class="w-4 h-4" />
          کاهش بدهی
        </button>
        <button
          @click="emit('open-contact-histories')"
          class="px-4 py-2.5 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm"
        >
          <IconsOutline name="note" class="w-4 h-4" />
          تاریخچه تماس‌ها
        </button>
        <button
          v-if="user.role !== 'ADMIN'"
          @click="emit('toggle-status')"
          class="px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium text-sm"
        >
          {{ user.isActive ? "غیرفعال کردن" : "فعال کردن" }}
        </button>
      </div>
    </div>

    <!-- User Details Grid -->
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="space-y-4">
        <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div
            class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <IconsOutline name="hashtag" class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="text-xs text-gray-600 mb-1">شناسه کاربر</p>
            <p class="text-lg font-bold text-gray-900">{{ user.id }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div
            class="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <IconsOutline name="phone" class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-xs text-gray-600 mb-1">شماره موبایل</p>
            <p class="text-lg font-bold text-gray-900" dir="ltr">
              {{ user.phoneNumber }}
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div
            class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <IconsOutline name="identification" class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-xs text-gray-600 mb-1">کد ملی</p>
            <p class="text-lg font-bold text-gray-900">
              {{ user.nationalCode }}
            </p>
          </div>
        </div>

        <div
          class="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100"
        >
          <div
            class="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <IconsOutline name="money" class="w-5 h-5 text-red-600" />
          </div>
          <div class="flex-1">
            <p class="text-xs text-gray-600 mb-1">مبلغ بدهی</p>
            <p class="text-xl font-bold text-red-600" dir="ltr">
              {{ formatCurrency(user.totalDebt, true) }}
            </p>
          </div>
          <NuxtLink
            v-if="user.role !== 'ADMIN'"
            :to="`/admin/users/debt-history/${user.id}`"
            class="px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200 text-sm font-medium whitespace-nowrap"
          >
            تاریخچه
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Dates -->
    <div class="pt-6 border-t border-gray-200 grid md:grid-cols-2 gap-4">
      <div class="flex items-center gap-2 text-sm">
        <IconsOutline name="calendar" class="w-5 h-5 text-gray-400" />
        <span class="text-gray-600">تاریخ ثبت‌نام:</span>
        <span class="font-medium text-gray-900">
          {{ new Date(user.createdAt).toLocaleDateString("fa-IR") }}
        </span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <IconsOutline name="refresh" class="w-5 h-5 text-gray-400" />
        <span class="text-gray-600">آخرین به‌روزرسانی:</span>
        <span class="font-medium text-gray-900">
          {{ new Date(user.updatedAt).toLocaleDateString("fa-IR") }}
        </span>
      </div>
    </div>
  </div>
</template>
