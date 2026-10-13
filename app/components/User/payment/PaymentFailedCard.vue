<template>
  <BaseCard class="text-center">
    <div class="py-8">
      <!-- Error Icon -->
      <div class="w-24 h-24 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
        <Icon name="mdi:close-circle" size="64" class="text-red-500" />
      </div>

      <!-- Error Message -->
      <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ $t('user.paymentResult.failed.title') }}</h2>
      <p class="text-gray-600 mb-6">{{ $t('user.paymentResult.failed.message') }}</p>

      <!-- Failure Reason -->
      <!-- <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-700 text-sm">
          <strong>دلیل:</strong> {{ route.query.message || 'انصراف کاربر یا خطا در پردازش' }}
        </p>
      </div> -->

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink
          to="/dashboard/payment/new"
          class="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Icon name="mdi:refresh" size="20" />
          {{ $t('common.actions.retry') }}
        </NuxtLink>
        <NuxtLink
          to="/dashboard"
          class="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Icon name="mdi:home" size="20" />
          {{ $t('user.common.backToDashboard') }}
        </NuxtLink>
      </div>
    </div>
  </BaseCard>
</template>
