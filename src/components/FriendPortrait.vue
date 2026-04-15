<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

interface Props {
    name?: string | null;
    alt: string;
    class?: HTMLAttributes["class"];
    imgClass?: HTMLAttributes["class"];
    eager?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    name: "",
    eager: false,
});

const failed = ref(false);

const imageSrc = computed(() => {
    if (!props.name) {
        return "";
    }

    return `/assets/webp/friends/JL_${props.name}.webp`;
});

const fallbackText = computed(() => props.alt.trim().slice(0, 2) || "? ");

watch(
    () => props.name,
    () => {
        failed.value = false;
    },
);
</script>

<template>
    <div
        :class="
            cn(
                'relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]',
                props.class,
            )
        "
    >
        <img
            v-if="imageSrc && !failed"
            :src="imageSrc"
            :alt="props.alt"
            :loading="props.eager ? 'eager' : 'lazy'"
            decoding="async"
            :class="cn('block h-full w-full object-cover', props.imgClass)"
            @error="failed = true"
        />

        <div
            v-else
            class="flex h-full w-full items-center justify-center text-lg font-semibold tracking-wide text-slate-100"
        >
            {{ fallbackText }}
        </div>

        <div
            class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.22),transparent_18%),linear-gradient(135deg,rgba(15,23,42,0.12),rgba(14,165,233,0.12))]"
        />
    </div>
</template>
