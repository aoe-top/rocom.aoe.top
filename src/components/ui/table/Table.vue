<template>
    <div data-slot="table-container" class="relative w-full overflow-x-auto">
        <table
            data-slot="table"
            class="w-full caption-bottom text-sm"
            v-bind="$attrs">
            <slot />
        </table>
    </div>
</template>
