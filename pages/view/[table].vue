<template>
    <div>
        <h1>{{ pageTitle }}</h1>

        <!-- Conditional Year Picker -->
        <v-row v-if="tableName === 'member_attendance_count'">
            <v-col cols="12" sm="4" md="3">
                <v-select
                    v-model="selectedYear"
                    :items="yearOptions"
                    label="Select Year"
                    variant="outlined"
                    dense
                ></v-select>
            </v-col>
        </v-row>

        <DataTableJs
            :supabase-table-name="tableName"
            :filter-year="selectedYear"
            :disable-crud="tableName === 'member_attendance_count'"
        >
        </DataTableJs>
    </div>
</template>

<script setup>
    import { ref, computed } from 'vue';
    import { capitalCase } from 'change-case';

    definePageMeta({
        middleware: 'auth',
    });

    const route = useRoute();
    const tableName = route.params.table;
    
    const pageTitle = computed(() => {
        const spacedName = tableName.replace(/_/g, ' ');
        return capitalCase(spacedName);
    });

    // Year Picker Logic
    const currentYear = new Date().getFullYear();
    const selectedYear = ref(currentYear);
    const yearOptions = computed(() => {
        const years = [];
        for (let i = 0; i < 10; i++) {
            years.push(currentYear - i);
        }
        return years;
    });
</script>