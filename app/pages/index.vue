<script lang="ts" setup>

const { t } = useI18n()

// Landing page
const siteUrl = 'https://emadiran.ir'
const title = t('seo.home.title')
const description =
  t('seo.home.description')

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
        name: t('seo.siteName'),
        alternateName: 'Emad Iran',
        url: `${siteUrl}/`,
        logo: `${siteUrl}/emad-logo-p.png`,
        slogan: t('app.title'),
      }),
    },
  ],
})

useSeoMeta({
  description,
  robots: 'index, follow',
  ogType: 'website',
  ogLocale: 'fa_IR',
  ogSiteName: t('seo.siteName'),
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