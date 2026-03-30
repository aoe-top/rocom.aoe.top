<script setup lang="ts"></script>
<template>
    <div
        class="flex h-screen w-screen overflow-hidden bg-background text-foreground selection:bg-primary/30 font-sans antialiased">
        <Sidebar />
        <main class="flex-1 flex flex-col min-w-0 bg-background">
            <div
                class="flex-1 h-screen overflow-y-auto overflow-x-hidden p-6 md:p-10 scroll-smooth">
                <slot />
            </div>
        </main>
    </div>
</template>
<style scoped></style>
