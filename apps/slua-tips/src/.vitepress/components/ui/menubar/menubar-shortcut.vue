<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/utilities/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <span
    data-slot="menubar-shortcut"
    :class="cn('text-muted-foreground ml-auto text-xs tracking-widest', props.class)"
  >
    <slot />
  </span>
</template>
