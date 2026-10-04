<script setup lang="ts">
import { SMS_FORMATTER_LABELS } from '~/constants/sms'
import type { SmsTemplateFormatter, SmsTemplatePayload, SmsTemplateSummary, SmsTemplateVariable } from '~/types/sms'

const props = defineProps<{ template?: SmsTemplateSummary | null; saving?: boolean }>()
const emit = defineEmits<{ close: []; save: [payload: SmsTemplatePayload] }>()

const emptyVariable = (): SmsTemplateVariable => ({ key: '', label: '', required: true, formatter: 'TEXT' })
const form = reactive<SmsTemplatePayload>({ code: '', title: '', content: '', variables: [], isActive: true })
const validationError = ref('')

watch(
  () => props.template,
  (template) => {
    Object.assign(form, template
      ? { code: template.code, title: template.title, content: template.content, variables: template.variables.map(item => ({ ...item })), isActive: template.isActive }
      : { code: '', title: '', content: '', variables: [], isActive: true })
    validationError.value = ''
  },
  { immediate: true },
)

const addVariable = () => form.variables.push(emptyVariable())
const removeVariable = (index: number) => form.variables.splice(index, 1)
const insertVariable = (key: string) => {
  if (!key) return
  form.content += `{{${key}}}`
}

const submit = () => {
  validationError.value = ''
  if (!form.code.trim() || !form.title.trim() || !form.content.trim()) {
    validationError.value = 'کد، عنوان و متن قالب الزامی است'
    return
  }
  const keys = form.variables.map(item => item.key.trim())
  if (keys.some(key => !/^[a-zA-Z][a-zA-Z0-9]*$/.test(key))) {
    validationError.value = 'نام متغیر باید انگلیسی باشد و با حرف شروع شود'
    return
  }
  if (new Set(keys).size !== keys.length) {
    validationError.value = 'نام متغیرها نباید تکراری باشد'
    return
  }
  if (form.variables.some(item => !item.label.trim())) {
    validationError.value = 'عنوان فارسی همه متغیرها را وارد کنید'
    return
  }
  emit('save', {
    code: form.code.trim(),
    title: form.title.trim(),
    content: form.content,
    variables: form.variables.map(item => ({ ...item, key: item.key.trim(), label: item.label.trim() })),
    isActive: form.isActive,
  })
}
</script>

<template>
  <BaseModal :title="template ? 'ویرایش قالب پیامک' : 'قالب پیامک جدید'" max-width="2xl" @close="emit('close')">
    <form class="max-h-[72vh] space-y-5 overflow-y-auto pl-1" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseInput v-model="form.title" label="عنوان قابل نمایش" required placeholder="مثلاً تأیید پرداخت" />
        <BaseInput v-model="form.code" label="کد قالب" required dir="ltr" placeholder="payment_confirmed" :disabled="Boolean(template)" />
      </div>

      <div>
        <BaseTextarea v-model="form.content" label="متن پیامک" required :rows="9" placeholder="متن را بنویسید و متغیرها را به شکل {{variableName}} قرار دهید." />
        <div v-if="form.variables.length" class="mt-2 flex flex-wrap gap-2">
          <button v-for="variable in form.variables" :key="variable.key" type="button" class="rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/20" @click="insertVariable(variable.key)">
            افزودن {{ variable.label || variable.key || 'متغیر' }} به متن
          </button>
        </div>
      </div>

      <div class="rounded-xl border border-gray-200">
        <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div><h4 class="text-sm font-bold">متغیرهای قالب</h4><p class="mt-1 text-xs text-gray-500">هر متغیر تعریف‌شده باید دقیقاً در متن استفاده شود.</p></div>
          <BaseButton type="button" size="sm" variant="secondary" @click="addVariable">افزودن متغیر</BaseButton>
        </div>
        <div v-if="form.variables.length" class="space-y-3 p-4">
          <div v-for="(variable, index) in form.variables" :key="index" class="grid items-end gap-3 rounded-lg bg-gray-50 p-3 md:grid-cols-[1fr_1.3fr_1fr_auto]">
            <BaseInput v-model="variable.key" label="نام متغیر" dir="ltr" placeholder="customerFullName" />
            <BaseInput v-model="variable.label" label="عنوان فارسی" placeholder="نام و نام خانوادگی مشتری" />
            <BaseSelect v-model="variable.formatter" label="نحوه نمایش" :options="(Object.entries(SMS_FORMATTER_LABELS).map(([value, label]) => ({ value, label })) as Array<{ value: SmsTemplateFormatter; label: string }>)" />
            <BaseButton type="button" size="sm" variant="danger" @click="removeVariable(index)">حذف</BaseButton>
          </div>
        </div>
        <p v-else class="p-5 text-center text-sm text-gray-500">این قالب هنوز متغیری ندارد.</p>
      </div>

      <label class="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-4">
        <span><strong class="block text-sm">وضعیت ارسال قالب</strong></span>
        <input v-model="form.isActive" type="checkbox" class="h-5 w-5 accent-primary" />
      </label>

      <p v-if="validationError" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ validationError }}</p>
    </form>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <BaseButton variant="secondary" :disabled="saving" @click="emit('close')">انصراف</BaseButton>
        <BaseButton :loading="saving" @click="submit">ذخیره قالب</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
