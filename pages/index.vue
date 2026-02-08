<template>
  <div>
    <!-- Page content is empty because we are redirecting -->
  </div>
</template>

<script setup>
  definePageMeta({
      middleware: 'auth',
  });
  
  navigateTo('/view/member_attendance_count', { replace: true });
</script>