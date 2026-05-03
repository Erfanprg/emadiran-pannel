<script setup lang="ts">
/**
 * Panel layout for authenticated users
 */
</script>

<template>
  <div class="panel-layout">
    <!-- Panel Content -->
    <div class="panel-content">
      <!-- Header -->
      <header class="panel-header">
        <!-- Add panel header components here -->
      </header>
      
      <!-- Sidebar & Main Content -->
      <div class="panel-wrapper">
        <!-- Sidebar -->
        <aside class="panel-sidebar">
          <!-- Add sidebar navigation here -->
        </aside>
        
        <!-- Main Content -->
        <main class="panel-main">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-layout {
  position: relative;
  min-height: 100vh;
  background-color: #151515; /* gray-900 */
}

.panel-content {
  position: relative;
  z-index: 10;
}

.panel-header {
  /* Add header styles */
}

.panel-wrapper {
  display: flex;
  min-height: calc(100vh - 64px); /* Adjust based on header height */
}

.panel-sidebar {
  /* Add sidebar styles */
  width: 260px;
  flex-shrink: 0;
}

.panel-main {
  flex: 1;
  padding: 2rem;
}

@media (max-width: 1024px) {
  .panel-sidebar {
    display: none; /* Hide on mobile, add hamburger menu */
  }
}
</style>
