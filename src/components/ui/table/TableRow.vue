<template>
    <tr
        data-slot="table-row"
        class="border-b border-white/10 transition-colors hover:bg-white/5 data-[state=selected]:bg-white/6"
        v-bind="$attrs">
        <slot />
    </tr>
</template>
