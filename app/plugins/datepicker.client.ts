import Vue3PersianDatetimePicker from 'vue3-persian-datetime-picker'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3PersianDatetimePicker, {
    name: 'DatePicker',
    props: {
      inputClass: 'date-picker-input',
      color: '#3b82f6', // primary blue color
      autoSubmit: true,
      format: 'YYYY-MM-DD',
      displayFormat: 'jYYYY/jMM/jDD',
      locale: 'fa',
      type: 'date'
    }
  })
})
