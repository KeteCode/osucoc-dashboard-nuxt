<template>
    <div id="supabaseTable">
        <div class="controlPanel">
            <v-row>
                <!-- Add Record Dialog -->
                <v-col cols="auto">
                    <v-dialog width="auto" v-model="showAddDialog">
                        <template v-slot:activator="{ props }">
                            <v-btn color="primary" v-bind="props">Add</v-btn>
                        </template>
                        <AddRecordForm
                            :form-template="tableObjectTemplate"
                            @create-record="createSupabaseRow"
                            @close="showAddDialog = false"
                        />
                    </v-dialog>
                </v-col>

                <!-- Edit Record Dialog -->
                <v-col cols="auto">
                    <v-dialog width="auto" v-model="showEditDialog">
                        <template v-slot:activator="{ props }">
                            <v-btn color="primary" v-bind="props" :disabled="selectedRows.length !== 1">Edit</v-btn>
                        </template>
                        <EditRecordForm
                            v-if="selectedRows.length === 1"
                            :record="selectedRows[0]"
                            :is-processing="isRowActionProcessing"
                            @update-record="editSupabaseRow"
                            @close="showEditDialog = false"
                        />
                    </v-dialog>
                </v-col>

                <!-- Delete Confirmation Dialog -->
                <v-col cols="auto">
                    <v-dialog transition="dialog-top-transition" width="auto" v-model="showDeleteDialog">
                        <template v-slot:activator="{ props }">
                            <v-btn color="warning" v-bind="props" :disabled="selectedRows.length === 0">Delete</v-btn>
                        </template>
                        <DeleteConfirmation
                            :selected-count="selectedRows.length"
                            :is-processing="isRowActionProcessing"
                            @confirm-delete="deleteSupabaseRows"
                            @close="showDeleteDialog = false"
                        />
                    </v-dialog>
                </v-col>
            </v-row>
        </div>
        
        <div v-if="pending">
            Loading table data...
        </div>
        <div v-else-if="localTableHeaders.length > 0">
            <DataTable
                :columns="localTableHeaders" 
                :data="data" 
                ref="table"
                @select="selectCallback"
                @deselect="selectCallback"
                class="display"
                :options="{
                    pageLength: 50,
                    lengthChange: false,
                    select: { style: 'multiple' },
                    scrollX: true,
                    scrollY: 'calc(100vh - 300px)',
                    dom: 'Bftip',
                }"
            >
            </DataTable>
        </div>
        <div v-else>
            No data found for this table.
        </div>
    </div>
</template>
<script setup>
    import { watch } from 'vue';
    import DataTablesCore from 'datatables.net';
    import DataTable from 'datatables.net-vue3';
    import Select from 'datatables.net-select';
    import Buttons from 'datatables.net-buttons';
    import 'datatables.net-buttons/js/buttons.html5';

    // Import the new child components
    import AddRecordForm from './AddRecordForm.vue';
    import EditRecordForm from './EditRecordForm.vue';
    import DeleteConfirmation from './DeleteConfirmation.vue';

    DataTable.use(DataTablesCore);
    DataTable.use(Select);
    DataTable.use(Buttons);

    const props = defineProps({
        supabaseTableName: {
            type: String,
            required: true,
        },
        supabaseTableId: {
            type: String,
            required: false,
            default: 'id'
        }
    })

    const client = useSupabaseClient();
    const table = ref(null); // Ref for the datatable component
    let dt; // Variable to hold the datatable instance

    const localTableHeaders = ref([]);
    const selectedRows = ref([]);
    const tableObjectTemplate = ref({});
    
    const showAddDialog = ref(false);
    const showEditDialog = ref(false);
    const showDeleteDialog = ref(false);
    const isRowActionProcessing = ref(false);

    // Fetch initial data
    const { data, pending, error } = useAsyncData(
      `table-${props.supabaseTableName}`,
      async () => {
        const { data } = await client.from(props.supabaseTableName).select('*').limit(1000);
        return data;
      }
    );

    if (error.value) console.error("Error fetching data:", error.value);

    // Watch for the data to become available, then generate headers
    watch(data, (newData) => {
        if (newData && newData.length > 0) {
            const firstRow = toRaw(newData[0]);
            localTableHeaders.value = Object.keys(firstRow).map(key => ({
                title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Prettify titles
                data: key
            }));
            tableObjectTemplate.value = Object.keys(firstRow).reduce((acc, key) => {
                acc[key] = '';
                return acc;
            }, {});
        }
    }, { immediate: true }); // Use immediate to run on initial load
    
    onMounted(() => {
        if (table.value) {
            dt = table.value.dt;
        }
    });

    function selectCallback() {
        if (dt) {
            selectedRows.value = toRaw(dt.rows({ selected: true }).data().toArray());
        }
    }

    async function createSupabaseRow(newRecord) {
        // Remove empty keys and the 'id' field before insert
        let payload = { ...newRecord };
        delete payload[props.supabaseTableId];
        Object.keys(payload).forEach(key => {
            if (payload[key] === '' || payload[key] === null) {
                delete payload[key];
            }
        });

        const { data: insertedData, error } = await client
            .from(props.supabaseTableName)
            .insert(payload)
            .select()
            .single(); // Assuming you want to add one row and get it back

        if (error) {
            console.error("Error creating row:", error);
        } else {
            dt.row.add(insertedData).draw();
            showAddDialog.value = false;
        }
    }

    async function editSupabaseRow(updatedRecord) {
        isRowActionProcessing.value = true;
        const { data: updatedData, error } = await client
            .from(props.supabaseTableName)
            .upsert(updatedRecord)
            .select()
            .single();

        if (error) {
            console.error("Error updating row:", error);
            isRowActionProcessing.value = false;
        } else {
            dt.row({ selected: true }).data(updatedData).draw();
            showEditDialog.value = false;
            isRowActionProcessing.value = false;
        }
    }
    
    async function deleteSupabaseRows() {
        isRowActionProcessing.value = true;
        const idsToDelete = selectedRows.value.map(row => row[props.supabaseTableId]);
        
        const { error } = await client
            .from(props.supabaseTableName)
            .delete()
            .in(props.supabaseTableId, idsToDelete);

        if (error) {
            console.error("Error deleting rows:", error);
            isRowActionProcessing.value = false;
        } else {
            dt.rows({ selected: true }).remove().draw();
            showDeleteDialog.value = false;
            isRowActionProcessing.value = false;
        }
    }
</script>

<style>
@import 'datatables.net-dt';
@import 'datatables.net-buttons-dt';
@import 'datatables.net-select-dt';
</style>