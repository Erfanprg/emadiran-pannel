<script setup lang="ts">
import { formatCurrency } from '~/utils/formatters'

defineProps<{
  fullName: string
  phoneNumber: string
  totalDebt: string
}>()
</script>

<template>
  <BaseCard class="bg-gradient-to-r from-primary to-accent">
    <div class="text-white p-4">
      <div class="flex flex-col md:flex-row items-center gap-6">
        <!-- User Icon -->
        <!-- <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Icon name="mdi:account-circle" size="64" class="text-white" />
        </div> -->

        <!-- User Info -->
        <div class="flex-1 text-center md:text-right">
          <h2 class="text-2xl font-bold">{{ fullName }}</h2>
          <p class="text-white/90 " dir="ltr">{{ phoneNumber }}</p>
        </div>

        <!-- Debt Display -->
        <div class="bg-white/10 backdrop-blur rounded-lg p-4 text-center md:text-right min-w-[200px]">
          <p class="text-sm text-white/80 mb-1">{{ $t('user.profile.header.totalDebt') }}</p>
          <p class="text-2xl font-bold" dir="ltr">
            <span class="text-sm">{{ $t('global.currency.rial') }}</span>
            {{ formatCurrency(totalDebt) }}
          </p>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
