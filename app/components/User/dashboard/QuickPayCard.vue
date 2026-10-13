<template>
  <BaseCard class="bg-gradient-to-r from-primary to-accent">
    <div
      class="flex flex-col md:flex-row items-center justify-between text-white p-2"
    >
      <div class="mb-4 md:mb-0">
        <h3 class="text-xl font-bold mb-2">پرداخت سریع</h3>
        <p class="text-white/90">برای پرداخت بدهی خود اقدام کنید</p>
      </div>
      <NuxtLink
        to="/dashboard/payment/new"
        class="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
      >
        <Icon name="mdi:credit-card-plus" size="20" />
        پرداخت بدهی
      </NuxtLink>
    </div>
  </BaseCard>
</template>
