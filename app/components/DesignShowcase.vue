<template>
  <div class="p-8 bg-gray-50 min-h-screen overflow-hidden">
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-primary mb-2">{{ $t('theme.design_system') }}</h1>
      </div>

      <!-- Color Palette -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Primary & Blue Colors -->
        <div class="card">
          <h2 class="text-2xl font-semibold text-primary mb-4 w-full text-center">{{ $t('theme.primary_colors') }}</h2>
          <div class="space-y-2">
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-primary rounded"></div>
              <span class="text-sm font-mono text-gray-900">primary - #0f3057</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-secondary rounded"></div>
              <span class="text-sm font-mono text-gray-900">secondary - #008891</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-accent rounded"></div>
              <span class="text-sm font-mono text-gray-900">accent - #00587a</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-blue-dark rounded"></div>
              <span class="text-sm font-mono text-gray-900">blue-dark - #0f3057</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-blue-dark-700 rounded"></div>
              <span class="text-sm font-mono text-gray-900">blue-dark-700 - #0a2240</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-blue-light rounded"></div>
              <span class="text-sm font-mono text-gray-900">blue-light - #008891</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-blue-light-300 rounded"></div>
              <span class="text-sm font-mono text-gray-900">blue-light-300 - #00c8d4</span>
            </div>
          </div>
        </div>

        <!-- Grayscale -->
        <div class="card">
          <h2 class="text-2xl font-semibold text-primary mb-4 w-full text-center">{{ $t('theme.grayscale') }}</h2>
          <div class="space-y-2">
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-gray-900 rounded border"></div>
              <span class="text-sm font-mono text-gray-900">gray-900 - #111827</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-gray-800 rounded border"></div>
              <span class="text-sm font-mono text-gray-900">gray-800 - #1F2937</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-gray-700 rounded"></div>
              <span class="text-sm font-mono text-gray-900">gray-700 - #374151</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-gray-600 rounded"></div>
              <span class="text-sm font-mono text-gray-900">gray-600 - #4B5563</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-gray rounded"></div>
              <span class="text-sm font-mono text-gray-900">gray - #6B7280</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-white border border-gray-300 rounded"></div>
              <span class="text-sm font-mono text-gray-900">white - #FFFFFF</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Buttons Section -->
      <div class="card">
        <h2 class="text-2xl font-semibold text-primary mb-6 w-full text-center">{{ $t('designShowcase.sections.buttons') }}</h2>
        <div class="space-y-6">
          <!-- Primary Buttons -->
          <div>
            <h3 class="text-gray-900 text-sm mb-3 font-medium">Primary Button</h3>
            <div class="flex flex-wrap gap-3">
              <BaseBtn type="button" typeDesign="primary" :text="$t('global.button.save')" />
              <BaseBtn type="button" typeDesign="primary" :text="$t('global.button.continue')" :loading="true" />
              <BaseBtn type="button" typeDesign="primary" :text="$t('global.button.submit')" :disabled="true" />
            </div>
          </div>

          <!-- Outline Buttons -->
          <div>
            <h3 class="text-gray-900 text-sm mb-3 font-medium">Outline Button</h3>
            <div class="flex flex-wrap gap-3">
              <BaseBtn type="button" typeDesign="outline" :text="$t('global.button.cancel')" />
              <BaseBtn type="button" typeDesign="outline" :text="$t('global.button.back')" />
            </div>
          </div>

          <!-- Full Width Button -->
          <div>
            <h3 class="text-gray-900 text-sm mb-3 font-medium">Full Width Button</h3>
            <BaseBtn type="submit" typeDesign="full" :text="$t('global.button.login')" />
          </div>
        </div>
      </div>

      <!-- Form Components -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Text Inputs -->
        <div class="card">
          <h2 class="text-2xl font-semibold text-primary mb-6 w-full text-center">{{ $t('designShowcase.sections.inputs') }}</h2>
          <div class="space-y-4">
            <FormBaseInput v-model:modelValue="formData.text" type="text" :label="$t('common.fields.fullName')"
              :placeholder="$t('designShowcase.inputs.namePlaceholder')" :mandatory="true" />

            <FormBaseInput v-model:modelValue="formData.email" type="mobile" :label="$t('common.fields.phone')"
              placeholder="example@email.com" />

            <FormBaseInput v-model:modelValue="formData.phone" type="number" :label="$t('global.form.mobile_number')"
              placeholder="09123456789" />

            <FormBaseInput v-model:modelValue="formData.password" type="password" :label="$t('auth.loginWithPassword_title')"
              :placeholder="$t('auth.enter_password')" />

            <FormBaseInput v-model:modelValue="formData.textarea" type="textarea" :label="$t('common.fields.description')"
              :placeholder="$t('designShowcase.inputs.descriptionPlaceholder')" :row="4" />

            <FormBaseInput v-model:modelValue="formData.error" type="text" :label="$t('designShowcase.inputs.errorField')" :placeholder="$t('designShowcase.inputs.errorExample')"
              :error="$t('designShowcase.inputs.requiredError')" />
          </div>
        </div>

        <!-- Select, Radio, Checkbox, Switch -->
        <div class="card">
          <h2 class="text-2xl font-semibold text-primary mb-6 w-full text-center">{{ $t('designShowcase.sections.controls') }}</h2>
          <div class="space-y-6">
            <!-- Select Box -->
            <FormBaseSelectBox v-model:model-value="formData.city" :items="cities" typeInput="text" :label="$t('designShowcase.controls.city')"
              :placeholder="$t('designShowcase.controls.selectCity')" :mandatory="true" :disabled="false" />

            <!-- Radio Buttons -->
            <FormBaseRadioBtn v-model:model-value="formData.gender" :options="genderOptions" name="gender"
              :label="$t('designShowcase.controls.gender')" />



            <!-- Switch -->
            <div class="space-y-3">
              <FormBaseSwitch v-model:model-value="formData.notifications" :label="$t('designShowcase.controls.notifications')" />
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Notifications -->
      <div class="card">
        <h2 class="text-2xl font-semibold text-primary mb-6 w-full text-center">{{ $t('designShowcase.sections.toasts') }}</h2>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <BaseBtn 
              type="button" 
              typeDesign="primary" 
              :text="$t('designShowcase.toasts.showSuccess')"
              @click="showSuccessToast"
            />
            <BaseBtn 
              type="button" 
              typeDesign="primary" 
              :text="$t('designShowcase.toasts.showError')"
              @click="showErrorToast"
            />
            <BaseBtn 
              type="button" 
              typeDesign="outline" 
              :text="$t('designShowcase.toasts.showWarning')"
              @click="showWarningToast"
            />
            <BaseBtn 
              type="button" 
              typeDesign="outline" 
              :text="$t('designShowcase.toasts.showInfo')"
              @click="showInfoToast"
            />
          </div>
          <div class="flex justify-center pt-2">
            <BaseBtn 
              type="button" 
              typeDesign="outline" 
              :text="$t('designShowcase.toasts.clearAll')"
              @click="clearAllToasts"
            />
          </div>
        </div>
      </div>

      <!-- Border Radius Examples -->
      <div class="card">
        <h2 class="text-2xl font-semibold text-primary mb-4 w-full text-center">{{ $t('theme.border_radius') }}</h2>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary rounded mx-auto mb-2"></div>
            <span class="text-sm font-mono text-gray-900">rounded (8px)</span>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-dark rounded-full mx-auto mb-2"></div>
            <span class="text-sm font-mono text-gray-900">rounded-full (999px)</span>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-light mx-auto mb-2"></div>
            <span class="text-sm font-mono text-gray-900">no radius (0px)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { t } = useI18n()

// Toast composable
const toast = useToast()

// Toast handlers
const showSuccessToast = () => {
  toast.success(t('common.messages.success'))
}

const showErrorToast = () => {
  toast.error(t('designShowcase.toasts.errorMessage'))
}

const showWarningToast = () => {
  toast.warning(t('designShowcase.toasts.warningMessage'))
}

const showInfoToast = () => {
  toast.info(t('designShowcase.toasts.infoMessage'))
}

const clearAllToasts = () => {
  toast.clearAll()
}

// Form data - reactive state
const formData = reactive({
  text: '',
  email: '',
  phone: '',
  password: '',
  textarea: '',
  error: '',
  city: '',
  gender: 'male',
  option1: 'option1',
  option2: '',
  notifications: true,
  darkMode: false,
  disabled: false,
})
// Select options
const cities = [
  { ID: 1, name: t('designShowcase.cities.tehran') },
  { ID: 2, name: t('designShowcase.cities.isfahan') },
  { ID: 3, name: t('designShowcase.cities.shiraz') },
  { ID: 4, name: t('designShowcase.cities.mashhad') },
  { ID: 5, name: t('designShowcase.cities.tabriz') },
]

// Radio options
const genderOptions = [
  { label: t('designShowcase.gender.male'), value: 'male' },
  { label: t('designShowcase.gender.female'), value: 'female' },
]



</script>