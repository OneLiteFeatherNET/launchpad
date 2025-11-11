<script setup lang="ts">

</script>

<template>
  <footer class="mt-auto bg-surface-container dark:bg-surface-container-dark">
    <!-- Hauptbereich -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Logo/Brand Section -->
        <div class="col-span-1 md:col-span-1">
          <h3 class="text-lg font-semibold text-on-surface dark:text-white mb-4">
            OneLiteFeather
          </h3>
          <p class="text-sm text-on-surface-variant dark:text-white">
            Ein Minecraft‑Netzwerk mit Fokus auf Community und Entwicklung
          </p>
        </div>

        <!-- Links Spalte 1 -->
        <div>
          <h4 class="text-sm font-semibold text-on-surface dark:text-white mb-4">
            Produkt
          </h4>
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/features" class="text-sm text-on-surface-variant dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
                Features
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/pricing" class="text-sm text-on-surface-variant dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
                Preise
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Links Spalte 2 -->
        <div>
          <h4 class="text-sm font-semibold text-on-surface dark:text-white mb-4">
            Unternehmen
          </h4>
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/about" class="text-sm text-on-surface-variant dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
                Über uns
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="text-sm text-on-surface-variant dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
                Kontakt
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Social Media -->
        <div>
          <h4 class="text-sm font-semibold text-on-surface dark:text-white mb-4">
            Folge uns
          </h4>
          <div class="flex gap-3">
            <a href="#" class="p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-surface-container-high-dark transition-colors">
              <Icon name="mdi:github" class="w-5 h-5 text-on-surface-variant dark:text-white" />
            </a>
            <a href="#" class="p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-surface-container-high-dark transition-colors">
              <Icon name="mdi:twitter" class="w-5 h-5 text-on-surface-variant dark:text-white" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-outline-variant dark:border-outline-variant-dark"></div>

    <!-- Copyright Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-sm text-on-surface-variant dark:text-white">
          © {{ new Date().getFullYear() }} OneLiteFeather. Alle Rechte vorbehalten.
        </p>
        <div class="flex gap-6">
          <NuxtLink to="/privacy" class="text-sm text-on-surface-variant dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
            Datenschutz
          </NuxtLink>
          <NuxtLink to="/terms" class="text-sm text-on-surface-variant dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
            AGB
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>


<style scoped>

</style>