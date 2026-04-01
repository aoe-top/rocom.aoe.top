<template>
    <tbody
        data-slot="table-body"
        class="[&_tr:last-child]:border-0"
        v-bind="$attrs">
        <slot />
    </tbody>
</template>
