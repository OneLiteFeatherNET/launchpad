<script setup lang="ts">
import logoSvg from '../../public/images/logo.svg?raw'

// Receives only what the calling composable resolved. Satori cannot read CSS
// variables, so the colours are the dark-scheme MD3 roles from
// assets/css/tailwind.css, copied as literals.
defineProps<{ title: string; description?: string }>()

const logoSrc = `data:image/svg+xml;base64,${btoa(logoSvg)}`
const colors = {
  surface: '#121319',
  onSurface: '#e4e1e9',
  onSurfaceVariant: '#c6c5d3',
  primary: '#bbc3ff',
  secondary: '#7dd0ff',
  tertiary: '#ffb0cc'
}
</script>

<template>
  <div
    :style="{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: '100%',
      height: '100%',
      padding: '64px 72px',
      background: colors.surface,
      color: colors.onSurface,
      fontFamily: 'Inter'
    }"
  >
    <div :style="{ display: 'flex', flexDirection: 'column', gap: '40px' }">
      <div :style="{ display: 'flex', alignItems: 'center', gap: '48px' }">
        <img :src="logoSrc" width="240" height="240" :style="{ width: '240px', height: '240px' }" />
        <div :style="{ display: 'flex', flexDirection: 'column', width: '768px', overflow: 'hidden' }">
          <div :style="{ display: 'flex', fontSize: '40px', fontWeight: 700, color: colors.primary }">
            OneLiteFeather.net
          </div>
          <div :style="{ display: 'flex', width: '768px', marginTop: '20px', fontSize: '68px', fontWeight: 700, lineHeight: 1.1 }">
            {{ title }}
          </div>
        </div>
      </div>

      <div
        v-if="description"
        :style="{ display: 'flex', fontSize: '30px', lineHeight: 1.4, color: colors.onSurfaceVariant, maxHeight: '176px', overflow: 'hidden' }"
      >
        {{ description }}
      </div>
    </div>

    <div
      :style="{
        display: 'flex',
        height: '10px',
        borderRadius: '5px',
        backgroundImage: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.tertiary})`
      }"
    />
  </div>
</template>
