<template>
    <div>
        <h1>{{ pageTitle }}</h1>
        <DataTableJs
        :supabase-table-name="tableName"
        >
        </DataTableJs>
    </div>
</template>

<script setup>
    import { useChangeCase } from '@vueuse/integrations/useChangeCase';

    definePageMeta({
        middleware: 'auth',
    });

    const route = useRoute();
    const tableName = route.params.table;
    const pageTitle = computed(() => {
        const spacedName = tableName.replace(/_/g, ' ');
        return useChangeCase(spacedName, 'capitalCase').value;
    })
</script>