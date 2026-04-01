<template>
    <tfoot
        data-slot="table-footer"
        class="border-t border-white/10 bg-white/5 font-medium [&>tr]:last:border-b-0"
        v-bind="$attrs">
        <slot />
    </tfoot>
</template>
