<script setup lang="ts">
const params = new URLSearchParams(window.location.hash.slice(1));
const token = params.get("token");
const error = params.get("error");
const callback = encodeURIComponent("https://app.example.com/callback");
const base = "https://auth.example.com/authorize";
</script>

<template>
  <main>
    <a :href="`${base}?provider=google&redirect_uri=${callback}`">Login with Google</a>
    <a :href="`${base}?provider=github&redirect_uri=${callback}`">Login with GitHub</a>
    <pre v-if="token">{{ token }}</pre>
    <pre v-if="error">{{ error }}</pre>
  </main>
</template>
