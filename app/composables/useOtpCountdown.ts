/**
 * Countdown before the OTP code can be requested again.
 */
export const useOtpCountdown = () => {
  const countdown = ref(0)

  let countdownInterval: NodeJS.Timeout | null = null

  const startCountdown = () => {
    countdown.value = 120 // 2 minutes

    if (countdownInterval) {
      clearInterval(countdownInterval)
    }

    countdownInterval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownInterval!)
        countdownInterval = null
      }
    }, 1000)
  }

  const stopCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
    countdown.value = 0
  }

  const formatCountdown = computed(() => {
    const minutes = Math.floor(countdown.value / 60)
    const seconds = countdown.value % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  onUnmounted(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval)
    }
  })

  return { countdown, formatCountdown, startCountdown, stopCountdown }
}
