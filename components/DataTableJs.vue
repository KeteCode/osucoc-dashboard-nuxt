<template>
    <div id="supabaseTable">
        <div class="controlPanel">
            <v-row>
                <v-col cols="auto">
                    <v-dialog width="auto" v-model=showAddDialog>
                        <template v-slot:activator="{ props }">
                        <v-btn color="primary" v-bind="props">Add {{ props.tableName }}</v-btn>
                        </template>
                        <template v-slot:default="{ isActive }">
                        <v-card width="400">
                            <v-toolbar color="primary" title="Add"></v-toolbar>
                            <v-card-text>
                                <div v-for="jsonKey in Object.keys(tableObjectTemplate)" :key="jsonKey">
                                    <v-text-field v-if="jsonKey==props.supabaseTableId"
                                    v-model="tableObjectTemplate[jsonKey]"
                                    disabled
                                    :label="jsonKey"
                                    ></v-text-field>
                                    <v-text-field v-else
                                    v-model="tableObjectTemplate[jsonKey]"
                                    :label="jsonKey"
                                    ></v-text-field>
                                </div> 
                            </v-card-text>
                                <v-card-actions class="justify-end">
                                    <v-btn color="primary" variant="tonal" @click="createSupabaseRow"
                                        >Create</v-btn
                                    >
                                    <v-btn variant="text" @click="isActive.value = false"
                                        >Close</v-btn
                                    >
                                </v-card-actions>
                        </v-card>
                        </template>
                    </v-dialog>
                </v-col>

                <v-col cols="auto">
                    <v-dialog width="auto" v-model=showEditDialog>
                        <template v-slot:activator="{ props }">
                        <v-btn color="primary" v-bind="props" :disabled="selectedRows.length!=1 ">Edit</v-btn>
                        </template>
                        <template v-slot:default="{ isActive }">
                        <v-card width="400">
                            <v-toolbar color="primary" title="Editing"></v-toolbar>
                            <v-card-text>
                                <template v-for="jsonKey in Object.keys(tableObject)" :key="jsonKey">
                                    <v-text-field v-if="jsonKey==props.supabaseTableId"
                                    v-model="tableObject[jsonKey]"
                                    disabled
                                    :label="jsonKey"
                                    ></v-text-field>
                                    <v-text-field v-else
                                    v-model="tableObject[jsonKey]"
                                    :label="jsonKey"
                                    ></v-text-field>
                                </template> 
                            </v-card-text>
                                <v-card-actions class="justify-end">
                                    
                                    <v-btn :disabled="isRowActionProcessing" color="primary" variant="tonal" @click="editSupabaseRow"
                                        >Save</v-btn
                                    >
                                    <v-btn :disabled="isRowActionProcessing" variant="text" @click="isActive.value = false"
                                        >Close</v-btn
                                    >
                            </v-card-actions>
                            
                        </v-card>
                        </template>
                    </v-dialog>
                </v-col>

                <v-col cols="auto">
                    <v-dialog transition="dialog-top-transition" width="auto" v-model="showDeleteDialog">
                        <template v-slot:activator="{ props }">
                        <v-btn color="warning" v-bind="props" :disabled="!selectedRows.length>0">Delete</v-btn>
                        </template>
                        <template v-slot:default="{ isActive }">
                        <v-card>
                            <v-toolbar color="warning" title="Delete"></v-toolbar>
                            <v-card-text>
                            <div class="text-h4 pa-12">Are you sure you want to delete these {{ selectedRows.length }} items?</div>
                                <DataTable :columns="localTableHeaders"
                                    :data="selectedRows" >
                                    <thead>
                                        <tr>
                                            <th v-for="column in localTableHeaders" :key="column.data">
                                                {{ column.data }}
                                            </th>
                                        </tr>
                                    </thead>
                                </DataTable>
                            </v-card-text>
                            <v-card-actions class="justify-end">
                            <v-btn :disabled="isRowActionProcessing" color="danger" variant="tonal" @click="deleteSupabaseRows"
                                >Yes Delete</v-btn
                            >
                            <v-btn :disabled="isRowActionProcessing" color="primary" variant="tonal" @click="isActive.value = false"
                                >No Close</v-btn
                            >
                            </v-card-actions>
                        </v-card>
                        </template>
                    </v-dialog>
                </v-col>
            </v-row>
        </div>
        <DataTable :columns="localTableHeaders" 
        :data="data" 
        ref="table"
        @select="selectCallback"
        @deselect="selectCallback"
        :options="{
            pageLength: 50,
            lengthChange: false,
            lengthMenu: [ 50, 75, 100,300,500 ],
            select:{ items: 'row', style:'multiple' },
            nowrap: true,
            scrollX: true,
            scrollCollapse: true,
            scrollY: 'calc(100vh - 300px)',
            dom: 'Bftip',
            }"
        >  
            <thead>
                <tr>
                    <th v-for="column in localTableHeaders" :key="column.data">
                        {{ column.data }}
                    </th>
                </tr>
            </thead>
        </DataTable>
    </div>
</template>
<script setup>
    import DataTablesCore from 'datatables.net';
    import DataTable from 'datatables.net-vue3';
    import Select from 'datatables.net-select';
    import Editor from 'datatables.net-editor';
    import Buttons from 'datatables.net-buttons';   
    import 'datatables.net-buttons/js/buttons.html5'; 

    DataTable.use(DataTablesCore);
    // DataTable.use(Select);
    DataTable.use(Editor);
    DataTable.use(Buttons);

    import { useDate } from 'vuetify/labs/date'


    const props = defineProps({
        data: {
            type: Array,
            required: false
        },
        tableHeaders: {
            type: Array,
            required: false
        },
        excludedColumns: {
            type: Array,
            required: false,
            default: []
        },
        supabaseColumns: {
            type: String,
            required: false,
            default: '*'
        },
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
    
    const date = useDate()
    const localTableHeaders = ref()
    const client = useSupabaseClient()
    const user = useSupabaseUser()
    //const itemsPerPage = ref(5)
    const currentPage = ref(1)
    //const totalItems = ref(0)
   //const drivers = ref([])
    const loading = ref(false)
    const queryColumns = props.supabaseColumns
    let selectedRows = ref([])
    let tableObject = toRaw({});
    let tableObjectTemplate=reactive({});
    let showEditDialog = ref(false);
    let showDeleteDialog = ref(false);
    let showAddDialog = ref(false);
    let isRowActionProcessing = ref(false);

    let dt;
    let editor;
    const table = ref()
    let buttons = ref()
    //const dataTable = this.$refs.table.dt; // This variable is used in the `ref` attribute for the component
    
    onMounted(function () {
        dt = table.value.dt;
        buttons = dt.buttons( ['.edit', '.delete'] );
        //dt.buttons().disable();
        selectCallback()
        /* this.$refs.table.dt()
        .on( 'select', function ( e, dt, type, indexes ) {
            var rowData = dt.rows( indexes ).data().toArray();
            
        } ) */
        
    }); 
    // const { data:drivers, error } = await useAsyncData('drivers', async () => {
    //     return await client.from('awayBusDrivers').select().order('created_at')
    // })
    
    // get all data using useAsyncData
    let {data} =  await useAsyncData('awayBusDrivers', async () => {
        const { data } = await client.from(props.supabaseTableName).select(queryColumns).limit(1000)
        //tableObjectTemplate =  clearObject(data[0])
        
        return data;
    })
    tableObjectTemplate = clearObject(markRaw(data.value[0]))
    // delete id key from tableObjectTemplate
    //delete tableObjectTemplate[props.supabaseTableId]
    //delete tableObjectTemplate["created_at"]
    
    // checking for excluded columns and removing them from tableObjectTemplate
    props.excludedColumns.forEach(column => {
        
        delete tableObjectTemplate[column]
    });

    // generate modal form if data has content
    const generateModalForm = (action) => {
        if(data.value.length > 0){
            return getForm(toRaw(data.value[0]),action)
        }
        else{
            return '<h1>no data</h1>'
        }
    }
    
    //let drivers = await client.from('awayBusDrivers').select().order('created_at').data;

    //drivers.value = getNextBatchOfDrivers({ page: currentPage.value, itemsPerPage: 5, sortBy: 'id' })
    //Get Table Headers from first row of data
    if(props.tableHeaders != undefined){
        localTableHeaders.value = props.tableHeaders
    }
    else{
        localTableHeaders.value = getTableHeaders(toRaw(data.value[0]));
    }
    //tableHeaders.value = getTableHeaders(toRaw(data.value[0]));

    // get count of all drivers using useAsyncData
    /* const {data:totalItems, pending, error} =  await useAsyncData('awayBusDriversCount', async () => {
        const { data, count,error } = await client.from('awayBusDrivers').select('*',{count:'exact'})
        
        return count;
    }) */
    

    async function getNextBatchOfDrivers({ page, itemsPerPage, sortBy }) {
        
        const { data } = await client.from('awayBusDrivers').select().range((page-1)*itemsPerPage,itemsPerPage.value).limit(itemsPerPage).order('id', { ascending: true })
        drivers.value = data;
        //return data;
    }

    async function getAllDrivers() {
        loading.value = true;
        let result =  await useAsyncData('awayBusDrivers', async () => {
            const { data } = await client.from('awayBusDrivers').select().range(currentPage.value,(currentPage.value ) * itemsPerPage.value)//.range(currentPage.value, currentPage.value+itemsPerPage.value)//.limit(itemsPerPage.value).range((currentPage.value - 1) * itemsPerPage.value).order('created_at', { ascending: false })
            
            drivers.value = data;
            return data;
        })
        loading.value = false;
        return result;
    }

    const driverLength = () => {
        // if drivers is an array and it is empty return an empty array
        if (Array.isArray(drivers.value) && drivers.value.length === 0) {
            return 0;
        }
        return drivers.value.length;
    }

    // add a new driver using a function
    async function addDriver(name,phoneNumber,carNumber,station, carColour, carModel, isVerified){
        const { data, error } = await client.from('awayBusDrivers').insert([
            { name, phoneNumber, carNumber, station, carColour, carModel, isVerified }
        ])
        if (error) {
            
        }
        else {
            return data;
        }
    }

    // remove all values from json object
    function clearObject(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                //delete obj[key];
                obj[key] = '';
            }
        }
        return obj;
    }

    function getTableHeadersArray(jsonArray) {
        
        // if json is empty return empty array
        if (jsonArray.length === 0) {
            return [];
        }
        return Object.keys(jsonArray);
    }

    //  map json keys to the format {
    //       title: 'Dessert (100g serving)',
    //       align: 'start',
    //       sortable: false,
    //       key: 'name',
    //     }
    function getTableHeaders(json) {
        
        let result =  getTableHeadersArray(json).map((key) => {
            return {
                data:key,
                defaultContent: "Not set"
            }
        })
        return result;
    }


    //const { data, error } = await client.from('awayBusDrivers').select().order('created_at')

    function action() {
      dt.rows({ selected: true }).every(function () {
            let idx = data.value.indexOf(this.data());
            data.value.splice(idx, 1);
        });
      /* this.editor
        .title('Add new record')
        .buttons('Save')
        .create(); */
    }
    function selectCallback(data, type, selected) {
        selectedRows.value = toRaw(dt.rows({ selected: true }).data().toArray());
        tableObject = toRaw(dt.rows({ selected: true }).data().toArray()[0]);
        
        //dt.buttons().disable();
 
        if ( selectedRows.length > 0 ) {
            dt.buttons().enable();
        }
        else {
            dt.buttons().disable();
        }

    }
    async function createSupabaseRow(){
        let payload = toRaw(tableObjectTemplate);
        // remove any payload keys that are empty
        for (var key in payload) {
            if (payload.hasOwnProperty(key)) {
                if(payload[key] == ''){
                    delete payload[key];
                }
            }
        }

        const { data, error } = await client
        .from(props.supabaseTableName)
        .insert(
            payload
        )
        .select()
        if (error) {
        }
        else {
            //selectedRows.value[0] = data;
            // update dt row
            dt.row.add(data[0]).draw();
            clearObject(tableObjectTemplate.value)
            showAddDialog.value = false;
            return data;
        }
        
    }

    async function editSupabaseRow(){
        isRowActionProcessing.value = true;
        //let selectedRows = dt.rows({ selected: true }).data().toArray();
        const { data, error } = await client
        .from(props.supabaseTableName)
        .upsert(tableObject)
        .select()
        //selectedRows.value[0] = data;
        if (error) {
            // show error dialog
            isRowActionProcessing.value = false;
        }
        else {
            selectedRows = data;
            showEditDialog.value = false;
            // update dt row
            dt.row({ selected: true }).data(data[0]);
            isRowActionProcessing.value = false;
            return data;
        }
        
    }
    async function deleteSupabaseRows(){
            isRowActionProcessing.value = true;
            const { error } = await client
            .from(props.supabaseTableName)
            .delete()
            .eq(props.supabaseTableId, selectedRows.value[0][props.supabaseTableId])
            if (error) {
                // show error dialog
                isRowActionProcessing.value = false;
            }
            else {
                // update dt
                dt.rows({ selected: true }).remove().draw();
                // dismiss dialog
                showDeleteDialog.value = false;
                isRowActionProcessing.value = false;
            }     
    }

    // return true if json keys contain 'id'
    function hasId(json) {
        return Object.keys(json).includes('id');
    }

   
</script>

<style>
@import 'datatables.net-dt';
@import 'datatables.net-buttons-dt';
@import 'datatables.net-select-dt';
</style>