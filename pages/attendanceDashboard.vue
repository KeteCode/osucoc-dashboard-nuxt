<template>
    <div>
        <h1>Monthly Attendance Record</h1>
        <DataTableJs
        :supabase-table-name=table
        >

        </DataTableJs>
    </div>
</template>

<script setup>
    definePageMeta({
        middleware: 'auth',
    });
    const table = 'member_attendance_count'
</script>