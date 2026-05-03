<script lang="ts" setup>
// Landing page
useHead({
  title: 'عماد ایران'
})
</script>

<template>
  <div class="landing-page">
    <LandingNavbar />
    <LandingHeroSection />
    <LandingFeaturesSection />
    <LandingServicesSection />
    <LandingAboutSection />
    <LandingFAQSection />
    <LandingFooter />
  </div>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  width: 100%;
}
</style>