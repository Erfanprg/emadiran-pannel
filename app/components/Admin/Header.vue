<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

const props = defineProps<{
  title: string;
}>();

const authStore = useAuthStore();
const route = useRoute();

// Navigation items
const navItems = [
  { title: "داشبورد", path: "/admin", icon: "mdi:view-dashboard" },
  { title: "کاربران", path: "/admin/users", icon: "mdi:account-group" },
  { title: "تاریخچه پرداخت", path: "/admin/transactions", icon: "mdi:receipt-text" },
  // { title: "اقساط", path: "/admin/installments", icon: "mdi:calendar-clock" },
  {
    title: "درگاه‌های پرداخت",
    path: "/admin/gateways",
    icon: "mdi:credit-card-multiple",
  },
];

// Check if nav item is active
const isActive = (path: string) => {
  if (path === "/admin") {
    return route.path === "/admin";
  }
  return route.path.startsWith(path);
};

// Logout
const handleLogout = async () => {
  await authStore.logout();
  navigateTo("/auth");
};
</script>

<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-[1400px] mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo & Title -->
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-3">
            <img src="/emad-logo-p.png" alt="عماد" class="h-10" />
            <div>
              <h1 class="text-xl font-bold text-gray-900 min-w-[150px]">{{ title }}</h1>
              <p class="text-xs text-gray-500">پنل مدیریت</p>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="hidden lg:flex items-center gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="
              isActive(item.path)
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            "
          >
            <Icon :name="item.icon" size="18" />
            {{ item.title }}
          </NuxtLink>
        </nav>

        <!-- User Menu -->
        <div class="flex items-center gap-4">
          <div class="text-left hidden sm:block">
            <p class="text-sm font-medium text-gray-900">
              {{ authStore.userFullName }}
            </p>
            <p class="text-xs text-gray-500">
              {{ authStore.user?.phoneNumber }}
            </p>
          </div>
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="خروج"
          >
            <Icon name="mdi:logout" size="20" />
            <span class="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <nav class="lg:hidden flex items-center gap-1 pb-3 overflow-x-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap"
          :class="
            isActive(item.path)
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          "
        >
          <Icon :name="item.icon" size="16" />
          {{ item.title }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
