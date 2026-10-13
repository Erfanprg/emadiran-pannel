<script setup lang="ts">
import { useToast } from "~/composables/useToast";

const toast = useToast();

const iban = "IR370130100000000441275655";

const copyIban = async () => {
  try {
    await navigator.clipboard.writeText(iban);
    toast.success("شماره شبا کپی شد");
  } catch (error) {
    console.error("Failed to copy IBAN:", error);
    toast.error("کپی شماره شبا انجام نشد");
  }
};
</script>

<template>
  <BaseCard class="!p-4 md:!p-5 bg-blue-50 border-blue-200 !pr-3">
    <div class="flex items-start gap-1">
      <IconsOutline name="information-circle" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div class="text-blue-900 w-full space-y-2 leading-7">
        <p class="font-semibold">
          مشتری گرامی به دلیل اختلالات بستر پرداخت، در صورت خطای
          درگاه می‌توانید مبلغ موردنظر را به شماره شبای:
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
            کپی
          </button>
        </div>
        <p>
          به نام شرکت
          <span class="font-semibold">"عماد نماد اعتماد"</span> نزد
          بانک رفاه، واریز نموده و رسید واریز را در شبکه اجتماعی بله
          برای شماره زیر ارسال نمایید:
        </p>
        <div class="text-lg font-bold text-gray-900" dir="ltr">
          09905036181
        </div>
        <p class="font-semibold text-blue-800">
          با تشکر - عماد ایران
        </p>
      </div>
    </div>
  </BaseCard>
</template>
