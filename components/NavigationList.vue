<template>
  <v-list nav dense>
    <!-- Management Section -->
    <v-list-subheader>Management</v-list-subheader>
    <NuxtLink v-for="item in managementItems" :key="item.title" :to="item.value" class="nav-link">
      <v-list-item :prepend-icon="item.icon" :title="item.title" :value="item.value"></v-list-item>
    </NuxtLink>

    <!-- Attendance Section -->
    <v-list-subheader>Attendance</v-list-subheader>
    <NuxtLink v-for="item in attendanceItems" :key="item.title" :to="item.value" class="nav-link">
      <v-list-item :prepend-icon="item.icon" :title="item.title" :value="item.value"></v-list-item>
    </NuxtLink>

    <!-- User Section -->
    <v-list-subheader>User Administration</v-list-subheader>
    <NuxtLink v-for="item in userItems" :key="item.title" :to="item.value" class="nav-link">
      <v-list-item :prepend-icon="item.icon" :title="item.title" :value="item.value"></v-list-item>
    </NuxtLink>

    <!-- Streaming Section -->
    <v-list-subheader>Streaming</v-list-subheader>
    <NuxtLink v-for="item in streamingItems" :key="item.title" :to="item.value" class="nav-link">
      <v-list-item :prepend-icon="item.icon" :title="item.title" :value="item.value"></v-list-item>
    </NuxtLink>

    <!-- Logout -->
    <v-divider class="my-2"></v-divider>
    <NuxtLink to="/logout" class="nav-link">
      <v-list-item prepend-icon="mdi-logout" title="Logout" value="/logout"></v-list-item>
    </NuxtLink>
  </v-list>
</template>

<script setup>
import { ref } from 'vue';

const managementItems = ref([
  {
    title: 'Church Members',
    value: '/view/church_members',
    icon: 'mdi-account-group-outline',
  },
  {
    title: 'Announcements',
    value: '/view/announcements',
    icon: 'mdi-bullhorn-outline',
  },
  {
    title: 'Visitors',
    value: '/view/church_visitors',
    icon: 'mdi-account-star-outline',
  },
  {
    title: 'Order of Worship',
    value: '/view/order_of_worship',
    icon: 'mdi-format-list-bulleted-square',
  },
  {
    title: 'Weekly Outreach',
    value: '/weeklyOutreach',
    icon: 'mdi-calendar-week',
  },
]);

const attendanceItems = ref([
  {
    title: 'Mark Attendance',
    value: '/mark-attendance',
    icon: 'mdi-check-circle-outline',
  },
  {
    title: 'Attendance Report',
    value: '/attendance-report',
    icon: 'mdi-file-chart-outline',
  },
  {
    title: 'Attendance Dashboard',
    value: '/view/member_attendance_count',
    icon: 'mdi-view-dashboard-outline',
  },
]);

const userItems = ref([
  {
    title: 'Invite User',
    value: '/invite-user',
    icon: 'mdi-account-plus-outline',
  },
  {
    title: 'Users',
    value: '/view/users',
    icon: 'mdi-account-cog-outline',
  },
]);

const streamingItems = ref([
  {
    title: 'Stream Control',
    value: '/streaming',
    icon: 'mdi-video-input-component',
  },
]);
</script>

<style scoped>
.nav-link {
  text-decoration: none;
  color: inherit;
}
.router-link-exact-active .v-list-item {
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}
.v-list-item:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.05);
}
</style>