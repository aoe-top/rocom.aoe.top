<template>
    <caption
        data-slot="table-caption"
        class="mt-4 text-sm text-slate-400"
        v-bind="$attrs">
        <slot />
    </caption>
</template>
