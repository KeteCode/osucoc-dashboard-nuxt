<template>
    <v-list>
      <v-list-item v-for="item in items" :key="item.title">
          <NuxtLink :to="item.value">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </NuxtLink>
      </v-list-item>
    </v-list>
</template>

<script setup>
import { ref } from 'vue';

const items = ref([
  {
    title: 'Mark Attendance',
    value: '/mark-attendance',
  },
  {
    title: 'Church Members',
    value: '/view/church_members',
  },
  {
    title: 'Announcements',
    value: '/view/announcements', // Corrected from 'stops'
  },
  {
    title: 'Visitors',
    value: '/view/church_visitors',
  },
  {
    title: 'Order of Worship',
    value: '/view/order_of_worship', // Corrected from 'routes'
  },
  {
    title: 'Attendance Dashboard',
    value: '/view/member_attendance_count',
  },
  {
    title: 'Attendance Report',
    value: '/attendance-report',
  },
  {
    title: 'Weekly Outreach',
    value: '/weeklyOutreach', // This is a custom page, not a table view
  },
  {
    title: 'Invite User',
    value: '/invite-user',
  },
  {
    title: 'Users',
    value: '/view/users', // Corrected from 'users' page to /view/users table
  },
  {
    title: 'Logout',
    value: '/logout',
  }
]);
</script>