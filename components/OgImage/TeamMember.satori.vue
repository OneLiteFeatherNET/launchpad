<script setup lang="ts">
defineProps<{
  name?: string
  description?: string
  roleText?: string
  rankLabel?: string
  avatarUrl?: string
}>()
</script>

<template>
  <div
    class="relative h-full w-full flex items-center text-white overflow-hidden"
    style="background: linear-gradient(135deg, #11162a 0%, #2A388F 55%, #91268F 100%);"
  >
    <!-- Top-right brand wordmark -->
    <div class="absolute top-12 right-16 flex items-center gap-3 text-[26px] font-semibold tracking-tight opacity-90">
      <div
        class="flex items-center justify-center rounded-full"
        style="width: 44px; height: 44px; background: rgba(255,255,255,0.12);"
      >
        <span class="text-[22px]">OL</span>
      </div>
      <span>OneLiteFeather</span>
    </div>

    <!-- Avatar block (left) -->
    <div class="flex items-center justify-center" style="margin-left: 80px;">
      <div
        class="flex items-center justify-center"
        style="width: 320px; height: 320px; background: rgba(255,255,255,0.06); border: 2px solid rgba(255,255,255,0.18); border-radius: 32px; box-shadow: 0 24px 60px -16px rgba(0,0,0,0.45);"
      >
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          width="256"
          height="256"
          style="image-rendering: pixelated; border-radius: 24px;"
        />
      </div>
    </div>

    <!-- Text block (right) -->
    <div class="flex flex-col" style="margin-left: 60px; max-width: 660px;">
      <div
        v-if="rankLabel"
        class="text-[22px] font-semibold uppercase tracking-[0.18em]"
        style="color: #27A9E1;"
      >
        {{ rankLabel }}
      </div>

      <h1
        class="text-[88px] font-bold leading-[1.02] tracking-tight mt-3"
        style="display: block; line-clamp: 2; text-overflow: ellipsis; text-wrap: balance;"
      >
        {{ name }}
      </h1>

      <p
        v-if="description"
        class="text-[28px] leading-snug mt-6"
        style="color: rgba(255,255,255,0.85); display: block; line-clamp: 3; text-overflow: ellipsis;"
      >
        {{ description }}
      </p>

      <p
        v-if="roleText"
        class="text-[22px] mt-5"
        style="color: rgba(255,255,255,0.65); display: block; line-clamp: 1; text-overflow: ellipsis;"
      >
        {{ roleText }}
      </p>
    </div>

    <!-- Accent bar bottom -->
    <div
      class="absolute bottom-0 left-0 right-0"
      style="height: 8px; background: linear-gradient(90deg, #EC008B 0%, #F7931D 50%, #27A9E1 100%);"
    />
  </div>
</template>
