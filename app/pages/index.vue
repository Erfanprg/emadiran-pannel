<script lang="ts" setup>
// Landing page
const siteUrl = 'https://emadiran.ir'
const title = 'عمادایران | ضمانت هوشمند اقساط و خدمات حقوقی لندتک‌ها'
const description =
  'عمادایران ارائه‌دهنده ضمانت هوشمند اقساط، خدمات حقوقی و وصول مطالبات برای کاربران، بانک‌ها و لندتک‌هاست؛ با هدف حفظ سلامت اعتباری و مدیریت ریسک مالی.'

useHead({
  title,
  htmlAttrs: { lang: 'fa', dir: 'rtl' },
  link: [{ rel: 'canonical', href: `${siteUrl}/` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'عماد ایران',
        alternateName: 'Emad Iran',
        url: `${siteUrl}/`,
        logo: `${siteUrl}/emad-logo-p.png`,
        slogan: 'عماد، نماد اعتماد',
      }),
    },
  ],
})

useSeoMeta({
  description,
  robots: 'index, follow',
  ogType: 'website',
  ogLocale: 'fa_IR',
  ogSiteName: 'عماد ایران',
  ogTitle: title,
  ogDescription: description,
  ogUrl: `${siteUrl}/`,
  ogImage: `${siteUrl}/emad-logo-p.png`,
  twitterCard: 'summary',
  twitterTitle: title,
  twitterDescription: description,
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