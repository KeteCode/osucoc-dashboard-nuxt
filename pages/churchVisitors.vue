<template>
    <div>
        <h1>Visitors On Record</h1>
        <DataTableJs
        :supabase-table-name=table
        :excluded-columns="[]"
        >

        </DataTableJs>
    </div>
</template>

<script setup>
    definePageMeta({
        middleware: 'auth',
    });
    const table = 'church_visitors'
</script>