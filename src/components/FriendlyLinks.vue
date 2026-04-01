<script setup lang="ts">
const links = ref<any[]>([]);

async function getLinks() {
    const res = await fetch("https://api.aoe.top/api/friendly/links");
    links.value = await res.json();
}
getLinks();
</script>
<template>
    <Card>
        <CardHeader>
            <CardTitle>友情链接</CardTitle>
        </CardHeader>
        <CardContent>
            <div class="flex flex-wrap items-center gap-2 text-[12px]">
                <div v-for="link in links" :key="link.name">
                    <a
                        :href="link.url"
                        target="_blank"
                        class="flex items-center gap-1 p-[0.2rem,0.4rem] opacity-[0.72] transition-opacity hover:opacity-100"
                        >{{ link.name }}
                        <IconExternalLink class="h-3 w-3 shrink-0" />
                    </a>
                </div>
            </div>
        </CardContent>
    </Card>
</template>
<style scoped></style>
