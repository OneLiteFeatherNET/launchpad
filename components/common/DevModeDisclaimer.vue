<script setup lang="ts">
import { ref, onMounted } from 'vue';

// State to control visibility of the popup
const isVisible = ref(true);

// Function to close the popup
const closePopup = () => {
  isVisible.value = false;
};

// Check if we're in development mode
// In Nuxt 3, we can use process.dev which is true in development and false in production
const isDevelopment = process.dev;

// Auto-hide the popup after 10 seconds
onMounted(() => {
  if (isDevelopment) {
    setTimeout(() => {
      isVisible.value = false;
    }, 10000); // 10 seconds
  }
});
</script>

<template>
  <!-- Only show in development mode and when isVisible is true -->
  <Teleport to="body">
    <div v-if="isDevelopment && isVisible" 
         class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full mx-2 sm:mx-4 my-2 sm:my-0">
        <div class="flex justify-between items-start">
          <h2 class="text-lg sm:text-xl font-bold text-secondary dark:text-secondary">Entwicklungshinweis</h2>
          <button @click="closePopup" class="text-on-surface-variant hover:text-secondary dark:text-on-surface-variant dark:hover:text-secondary p-1" aria-label="Schließen">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="mt-3 sm:mt-4 text-sm sm:text-base text-on-surface-variant dark:text-gray-300">
          <p class="mb-2 sm:mb-4">Diese Seite befindet sich aktuell in der Entwicklung (Work in Progress).</p>
          <p>Einige Funktionen könnten noch nicht vollständig implementiert sein oder nicht wie erwartet funktionieren.</p>
        </div>
        <div class="mt-4 sm:mt-6 flex justify-end">
          <button @click="closePopup" 
                  class="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-secondary text-white rounded hover:bg-secondary-container focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50">
            Verstanden
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
