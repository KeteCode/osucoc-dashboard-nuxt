<template>
    <div>
        <h1>All Church Members On Record</h1>
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
    const table = 'church_members'
</script>