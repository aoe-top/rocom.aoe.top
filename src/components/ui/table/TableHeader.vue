<template>
    <thead
        data-slot="table-header"
        class="[&_tr]:border-b [&_tr]:border-white/10"
        v-bind="$attrs">
        <slot />
    </thead>
</template>
