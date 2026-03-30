<script setup lang="ts">
import type { IFriend } from "@/lib/interface";

const friends = ref<IFriend[]>([]);

async function getFriends() {
    const res = await fetch("/data/friend.json");
    friends.value = await res.json();
}

getFriends();
</script>
<template>
    <Card>
        <CardHeader>
            <CardTitle>图鉴</CardTitle>
            <CardDescription
                >洛克王国宠物、装备、技能等信息一览</CardDescription
            >
        </CardHeader>
        <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                    v-for="friend in friends"
                    :key="friend.id"
                    class="border rounded-lg p-4 flex flex-col items-center gap-2">
                    <img
                        :src="`/public/assets/webp/JL_${friend.name}.webp`"
                        :alt="friend.localized.zh.name"
                        class="w-24 h-24 object-cover rounded-full" />
                    <h3 class="text-lg font-semibold">
                        {{ friend.localized.zh.name }}
                    </h3>
                </div>
            </div>
        </CardContent>
    </Card>
</template>
<style scoped></style>
