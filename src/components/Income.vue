<script lang="ts" setup>
onMounted(() => {
    (window as any).adsbygoogle = (window as any).adsbygoogle || [];
    (window as any).adsbygoogle.push({});
});
</script>
<template>
    <div class="google-ad">
        <ins
            class="adsbygoogle"
            style="display: block"
            data-ad-client="ca-pub-5978423097771370"
            data-ad-slot="7388473921"
            data-ad-format="auto"
            data-full-width-responsive="true"
        ></ins>
    </div>
</template>
<script lang="ts">
export default {
    name: "income",
};
</script>
<style scoped>
.google-ad {
    padding: 1rem 0;
    text-align: center;
}
</style>
