<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { paymentApi } from "~/services/api/payment";
import { gatewaysApi } from "~/services/api/gateways";
import { formatCurrency } from "~/utils/formatters";
import { useConfirm } from "~/composables/useConfirm";
import { useToast } from "~/composables/useToast";
import { useCurrencyInput } from "~/composables/useCurrencyInput";
import type { Gateway } from "~/types/gateway";

useHead({
  title: "پرداخت بدهی - عماد ایران",
});

definePageMeta({
  middleware: "auth",
});

const authStore = useAuthStore();
const toast = useToast();
const { confirm } = useConfirm();

// Currency input composable
const amountInput = useCurrencyInput();

// State
const loading = ref(true);
const submitting = ref(false);
const gateways = ref<Gateway[]>([]);
const selectedGateway = ref<string>("");
const description = ref<string>("");
const iban = "IR520130100000000405012032";

const normalizeAqayePardakhtAmount = () => {
  if (selectedGateway.value !== "AQAYE_PARDAKHT") return;

  const raw = amountInput.rawValue.value;
  if (!raw) return;

  const lastDigit = raw[raw.length - 1];
  if (lastDigit === "0") return;

  amountInput.setValue(`${raw.slice(0, -1)}0`);
};

// Validation
const isValid = computed(() => {
  const amount = amountInput.numericValue.value;
  const debt = parseFloat(authStore.user?.totalDebt || "0");

  return (
    amount > 0 &&
    amount >= 10000 &&
    amount <= debt &&
    selectedGateway.value !== ""
  );
});

// Fetch active gateways
const fetchGateways = async () => {
  loading.value = true;
  try {
    await authStore.fetchProfile();
    gateways.value = await gatewaysApi.getPaymentGateways();

    if (gateways.value.length > 0) {
      selectedGateway.value = gateways.value[0].name;
    }
  } catch (error) {
    console.error("Error fetching gateways:", error);
    toast.error("خطا در دریافت درگاه‌های پرداخت");
  } finally {
    loading.value = false;
  }
};

// Handle payment
const handlePayment = async () => {
  if (!isValid.value) {
    toast.error("لطفاً تمام فیلدها را به درستی پر کنید");
    return;
  }

  const amount = amountInput.rawValue.value;
  const gateway = gateways.value.find((g) => g.name === selectedGateway.value);

  const confirmed = await confirm({
    message: `آیا از پرداخت ${formatCurrency(amount)} ریال از طریق ${
      gateway?.displayName
    } اطمینان دارید؟`,
    title: "تایید پرداخت",
    type: "warning",
  });

  if (!confirmed) return;

  submitting.value = true;
  try {
    const response = await paymentApi.initiatePayment({
      amount,
      gatewayName: selectedGateway.value,
      description: description.value || undefined,
    });

    toast.success("در حال انتقال به درگاه پرداخت...");

    setTimeout(() => {
      window.location.href = response.data.paymentUrl;
    }, 1000);
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    toast.error(error.data?.message || "خطا در ایجاد پرداخت");
    submitting.value = false;
  }
};

const copyIban = async () => {
  try {
    await navigator.clipboard.writeText(iban);
    toast.success("شماره شبا کپی شد");
  } catch (error) {
    console.error("Failed to copy IBAN:", error);
    toast.error("کپی شماره شبا انجام نشد");
  }
};

onMounted(() => {
  fetchGateways();
});

watch(selectedGateway, () => {
  normalizeAqayePardakhtAmount();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 w-full">
    <UserHeader title="پرداخت بدهی" />

    <main class="w-full !max-w-[780px] mx-auto px-4 py-8">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
        ></div>
      </div>

      <div v-else class="max-w-3xl mx-auto space-y-5">
        <!-- Current Debt Card -->
        <BaseCard class="bg-gradient-to-r from-red-500 to-red-600">
          <div class="text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm opacity-90 mb-1">بدهی فعلی شما</p>
                <p class="text-3xl font-bold" dir="ltr">
                  <span class="text-lg">ریال</span>
                  {{ formatCurrency(authStore.user?.totalDebt || "0") }}
                </p>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Amount Selection -->
        <BaseCard>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >مبلغ پرداخت (ریال):</label
            >
            <div class="flex gap-3">
              <div class="flex-1 relative">
                <input
                  :value="amountInput.displayValue.value"
                  @input="(e) => amountInput.handleInput(e)"
                  @blur="normalizeAqayePardakhtAmount"
                  type="text"
                  inputmode="numeric"
                  placeholder="مبلغ را به ریال وارد کنید"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-left"
                  dir="ltr"
                />
              </div>
              <button
                @click="() => {
                  amountInput.setValue(authStore.user?.totalDebt || '0');
                  normalizeAqayePardakhtAmount();
                }"
                class="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors duration-200 whitespace-nowrap"
              >
                کل بدهی
              </button>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="mt-6 bg-blue-50 border-blue-200 !pr-3">
          <div class="flex items-start gap-1">
            <svg
              class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div class="text-blue-900 w-full space-y-2 leading-7">
              <p class="font-semibold">
                مشتری گرامی به دلیل اختلالات بستر پرداخت، در صورت خطای درگاه
                میتوانید مبلغ مورد نظر را به شماره شبای:
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
                <span class="font-semibold">"عماد نماد اعتماد"</span> نزد بانک
                رفاه، واریز نموده و رسید واریز را در شبکه اجتماعی بله برای شماره
                زیر ارسال نمایید:
              </p>
              <div class="text-lg font-bold text-gray-900" dir="ltr">
                09905036181
              </div>
              <p class="font-semibold text-blue-800">با تشکر - عماد ایران</p>
            </div>
          </div>
        </BaseCard>

        <!-- Gateway Selection -->
        <BaseCard class="bg-gray-50">
          <h3 class="text-sm font-bold text-gray-900 mb-3">
            انتخاب درگاه پرداخت:
          </h3>

          <div
            v-if="gateways.length === 0"
            class="text-center py-4 text-gray-500 text-sm"
          >
            هیچ درگاه فعالی یافت نشد
          </div>

          <div v-else class="space-y-2">
            <label
              v-for="gateway in gateways"
              :key="gateway.name"
              :class="[
                'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                selectedGateway === gateway.name
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary/50 bg-white',
              ]"
            >
              <input
                type="radio"
                :value="gateway.name"
                v-model="selectedGateway"
                class="w-4 h-4 text-primary focus:ring-primary"
              />
              <Icon
                name="mdi:credit-card"
                size="20"
                :class="
                  selectedGateway === gateway.name
                    ? 'text-primary'
                    : 'text-gray-400'
                "
              />
              <span
                :class="
                  selectedGateway === gateway.name
                    ? 'text-primary font-bold'
                    : 'text-gray-700'
                "
              >
                {{ gateway.displayName }}
              </span>
            </label>
          </div>
        </BaseCard>

        <!-- Description (Optional) -->
        <BaseCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-900">توضیحات (اختیاری)</h2>
          </template>

          <textarea
            v-model="description"
            rows="3"
            placeholder="پرداخت قسط دوم"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          ></textarea>
        </BaseCard>

        <!-- Payment Summary -->
        <BaseCard
          v-if="amountInput.numericValue.value > 0 && selectedGateway"
          class="bg-blue-50 border-blue-200"
        >
          <div class="space-y-2">
            <h3 class="font-bold text-gray-900 mb-3">خلاصه پرداخت:</h3>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">مبلغ:</span>
              <span class="font-bold" dir="ltr"
                >ریال {{ formatCurrency(amountInput.rawValue.value) }}</span
              >
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">درگاه:</span>
              <span class="font-bold">{{
                gateways.find((g) => g.name === selectedGateway)?.displayName
              }}</span>
            </div>
            <div v-if="description" class="flex justify-between text-sm">
              <span class="text-gray-600">توضیحات:</span>
              <span class="font-bold">{{ description }}</span>
            </div>
          </div>
        </BaseCard>

        <!-- Payment Button -->
        <button
          @click="handlePayment"
          :disabled="!isValid || submitting"
          :class="[
            'w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2',
            isValid && !submitting
              ? 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed',
          ]"
        >
          <Icon
            v-if="submitting"
            name="mdi:loading"
            size="24"
            class="animate-spin"
          />
          <Icon v-else name="mdi:credit-card-check" size="24" />
          {{ submitting ? "در حال انتقال..." : "پرداخت" }}
        </button>
      </div>
    </main>
  </div>
</template>
