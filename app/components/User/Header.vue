<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { formatCurrency } from "~/utils/formatters";

const props = defineProps<{
  title: string;
}>();

const authStore = useAuthStore();
const route = useRoute();

// Navigation items
const navItems = [
  { title: "داشبورد", path: "/dashboard", icon: "mdi:view-dashboard" },
  // {
  //   title: "اقساط من",
  //   path: "/dashboard/installments",
  //   icon: "mdi:calendar-clock",
  // },
  {
    title: "تاریخچه بدهی‌ها",
    path: "/dashboard/transactions",
    icon: "mdi:receipt-text",
  },
  {
    title: "پرداخت بدهی",
    path: "/dashboard/payment/new",
    icon: "mdi:credit-card-plus",
  },
];

// Check if nav item is active
const isActive = (path: string) => {
  if (path === "/dashboard") {
    return route.path === "/dashboard";
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
  <header
    class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm pb-3"
  >
    <div class="max-w-[1400px] mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo & Title -->
        <div class="flex items-center">
          <div class="flex items-center gap-3">
            <img src="/emad-logo-p.png" alt="عماد" class="h-10" />
          
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

        <!-- User Info & Actions -->
        <div class="flex items-center gap-2  lg:gap-4">
          <!-- Debt Display -->
          <div v-if="authStore.user" class="hidden md:block">
            <div class="text-left bg-red-50 px-4 py-2 rounded-lg">
              <p class="text-xs text-red-600 font-medium">بدهی شما</p>
              <p class="text-lg font-bold text-red-700">
                {{ formatCurrency(authStore.user.totalDebt || "0") }}
                <span class="text-xs">ریال</span>
              </p>
            </div>
          </div>

          <!-- User Info -->
          <NuxtLink
            to="/dashboard/profile"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
            title="پروفایل کاربری"
          >
        
            <div class="text-right sm:block">
              <p
                class="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors"
              >
                {{ authStore.userFullName }}
              </p>
              <p class="text-xs text-gray-500">مشاهده پروفایل</p>
            </div>
          </NuxtLink>

          <!-- Logout Button -->
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="خروج"
          >
            <Icon name="mdi:logout" size="20" />
            <span class=" sm:inline">خروج</span>
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

      <!-- Mobile Debt Display -->
      <div v-if="authStore.user" class="md:hidden pb-3">
        <div
          class="bg-red-50 px-4 py-2 rounded-lg flex items-center justify-between"
        >
          <span class="text-xs text-red-600 font-medium">بدهی شما:</span>
          <span class="text-sm font-bold text-red-700" dir="ltr">
            ریال {{ formatCurrency(authStore.user.totalDebt || "0") }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>
