<script setup lang="ts">
import { useToast } from "~/composables/useToast";

const { t } = useI18n()

const toast = useToast();

const iban = "IR370130100000000441275655";

const copyIban = async () => {
  try {
    await navigator.clipboard.writeText(iban);
    toast.success(t('user.payment.bankTransfer.copied'));
  } catch (error) {
    console.error("Failed to copy IBAN:", error);
    toast.error(t('user.payment.bankTransfer.copyFailed'));
  }
};
</script>

<template>
  <BaseCard class="!p-4 md:!p-5 bg-blue-50 border-blue-200 !pr-3">
    <div class="flex items-start gap-1">
      <IconsOutline name="information-circle" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div class="text-blue-900 w-full space-y-2 leading-7">
        <p class="font-semibold">
          {{ $t('user.payment.bankTransfer.intro') }}
        </p>
        <div
          class="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 flex items-center justify-between gap-3"
        >
          <div
            class="text-base md:text-lg tracking-wide text-gray-900 font-semibold"
            dir="ltr"
          >
            {{ iban }}
          </div>
          <button
            type="button"
            @click="copyIban"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors duration-200"
          >
            <Icon name="mdi:content-copy" size="16" />
            {{ $t('user.payment.bankTransfer.copy') }}
          </button>
        </div>
        <p>
          {{ $t('user.payment.bankTransfer.companyPrefix') }}
          <span class="font-semibold">{{ $t('user.payment.bankTransfer.companyName') }}</span> {{ $t('user.payment.bankTransfer.instructions') }}
        </p>
        <div class="text-lg font-bold text-gray-900" dir="ltr">
          09905036181
        </div>
        <p class="font-semibold text-blue-800">
          {{ $t('user.payment.bankTransfer.thanks') }}
        </p>
      </div>
    </div>
  </BaseCard>
</template>
