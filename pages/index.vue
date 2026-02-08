<template>
  <div>
    <!-- Page content is empty because we are redirecting -->
  </div>
</template>

<script setup>
  definePageMeta({
      middleware: 'auth',
  });
  
  navigateTo('/mark-attendance', { replace: true });
</script>