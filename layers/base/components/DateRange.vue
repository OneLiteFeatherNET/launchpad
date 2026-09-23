<script setup lang="ts">
import { computed } from 'vue'
import { formatDateRange } from '../utils/dateRange'

/**
 * A point in time or a span, machine-readable as `<time datetime>` and
 * written in one fixed time zone (the server's, `Europe/Berlin`, unless
 * told otherwise) so the server render and the hydrated page agree.
 * Renders nothing for an unparsable start.
 */
const props = withDefaults(defineProps<{
  start: string | Date
  end?: string | Date
  timeZone?: string
  withTime?: boolean
}>(), {
  end: undefined,
  timeZone: 'Europe/Berlin',
  withTime: true,
})

const { locale } = useI18n()

const range = computed(() => formatDateRange({
  start: props.start,
  end: props.end,
  locale: locale.value,
  timeZone: props.timeZone,
  withTime: props.withTime,
}))

const separator = computed(() => (range.value?.sameDay ? '–' : ' – '))
</script>

<template>
  <!-- Line breaks only inside tags: whitespace between the parts would put
       spaces around the dash of a same-day range. -->
  <span v-if="range"><time
    :datetime="range.startIso"
  >{{ range.startText }}</time><template v-if="range.endText && range.endIso">{{ separator }}<time
    :datetime="range.endIso"
  >{{ range.endText }}</time></template></span>
</template>
