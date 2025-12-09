<script setup lang="ts">
import SimpleNavButton from '~/components/base/buttons/SimpleNavButton.vue';

const props = defineProps<{
  textKey: string;
  path: string;
  mobile?: boolean;
}>();

const emit = defineEmits(['click-mobile']);
</script>

<template>
  <SimpleNavButton :text-key="props.textKey" :path="props.path" :mobile="props.mobile" @click-mobile="() => emit('click-mobile')" />
</template>
