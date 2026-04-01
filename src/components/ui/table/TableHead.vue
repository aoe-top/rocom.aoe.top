<template>
    <th
        data-slot="table-head"
        class="h-9 px-3 text-left align-middle text-xs font-medium tracking-[0.14em] text-slate-500 uppercase"
        v-bind="$attrs">
        <slot />
    </th>
</template>
