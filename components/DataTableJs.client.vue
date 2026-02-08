<template>
  <div id="vue3-easy-data-table">
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
              @create-record="createItem"
              @close="showAddDialog = false"
            />
          </v-dialog>
        </v-col>

        <!-- Edit Record Dialog -->
        <v-col cols="auto">
          <v-dialog width="auto" v-model="showEditDialog">
            <template v-slot:activator="{ props }">
              <v-btn color="primary" v-bind="props" :disabled="selectedItems.length !== 1">Edit</v-btn>
            </template>
            <EditRecordForm
              v-if="selectedItems.length === 1"
              :record="selectedItems[0]"
              :is-processing="isProcessing"
              @update-record="editItem"
              @close="showEditDialog = false"
            />
          </v-dialog>
        </v-col>

        <!-- Delete Confirmation Dialog -->
        <v-col cols="auto">
          <v-dialog transition="dialog-top-transition" width="auto" v-model="showDeleteDialog">
            <template v-slot:activator="{ props }">
              <v-btn color="warning" v-bind="props" :disabled="selectedItems.length === 0">Delete</v-btn>
            </template>
            <DeleteConfirmation
              :selected-count="selectedItems.length"
              :is-processing="isProcessing"
              @confirm-delete="deleteItems"
              @close="showDeleteDialog = false"
            />
          </v-dialog>
        </v-col>

        <!-- Download Buttons -->
        <v-col cols="auto">
            <v-btn @click="downloadCSV" :disabled="selectedItems.length === 0">Download CSV</v-btn>
        </v-col>
        <v-col cols="auto">
            <v-btn @click="downloadPDF" :disabled="selectedItems.length === 0">Download PDF</v-btn>
        </v-col>

        <!-- Select All Button -->
        <v-col cols="auto">
            <v-btn 
                @click="toggleSelectAll"
                :disabled="items.length === 0"
            >
                {{ allItemsSelected ? 'Deselect All' : 'Select All' }}
            </v-btn>
        </v-col>
        
        <!-- Search Field -->
        <v-col>
          <v-text-field
            v-model="searchValue"
            label="Search..."
            dense
            clearable
          ></v-text-field>
        </v-col>
      </v-row>
    </div>

    <EasyDataTable
      v-if="!pending"
      :headers="headers"
      :items="items"
      v-model:items-selected="selectedItems"
      @click-row="onRowClick"
      :loading="pending"
      :search-value="searchValue"
      rows-per-page="50"
      show-index
      buttons-pagination
      alternating
      table-class-name="customize-table"
    />
    <div v-else>Loading data...</div>
  </div>
</template>

<script setup>
  import { ref, watch, toRaw, computed } from 'vue';
  import EasyDataTable from 'vue3-easy-data-table';
  import 'vue3-easy-data-table/dist/style.css';
  import jsPDF from 'jspdf';
  import autoTable from 'jspdf-autotable';
  
  import AddRecordForm from './AddRecordForm.vue';
  import EditRecordForm from './EditRecordForm.vue';
  import DeleteConfirmation from './DeleteConfirmation.vue';

  const props = defineProps({
      supabaseTableName: { type: String, required: true },
      supabaseTableId: { type: String, default: 'id' }
  });

  const client = useSupabaseClient();
  
  const headers = ref([]);
  const items = ref([]);
  const selectedItems = ref([]);
  const tableObjectTemplate = ref({});
  const searchValue = ref('');

  const showAddDialog = ref(false);
  const showEditDialog = ref(false);
  const showDeleteDialog = ref(false);
  const isProcessing = ref(false);
  
  const { data, pending, error, refresh } = useAsyncData(
    `table-${props.supabaseTableName}`,
    async () => client.from(props.supabaseTableName).select('*').limit(1000).then(res => res.data),
    { server: false } 
  );

  watch(data, (newData) => {
      if (newData && newData.length > 0) {
          const firstRow = toRaw(newData[0]);
          headers.value = Object.keys(firstRow).map(key => ({
              text: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              value: key,
              sortable: true
          }));
          tableObjectTemplate.value = Object.keys(firstRow).reduce((acc, key) => ({ ...acc, [key]: '' }), {});
          items.value = newData;
      }
  }, { deep: true, immediate: true });

  if (error.value) console.error("Error fetching data:", error.value);

  const onRowClick = (item) => {
    const itemId = item[props.supabaseTableId];
    const index = selectedItems.value.findIndex(selectedItem => selectedItem[props.supabaseTableId] === itemId);
    if (index === -1) {
      selectedItems.value.push(item);
    } else {
      selectedItems.value.splice(index, 1);
    }
  };

  const allItemsSelected = computed(() => {
    return selectedItems.value.length === items.value.length && items.value.length > 0;
  });

  const toggleSelectAll = () => {
    if (allItemsSelected.value) {
      selectedItems.value = [];
    } else {
      selectedItems.value = [...items.value];
    }
  };

  const downloadCSV = () => {
    const headerKeys = headers.value.map(h => h.value);
    const headerTitles = headers.value.map(h => h.text);
    const csvContent = [
      headerTitles.join(','),
      ...selectedItems.value.map(item => 
        headerKeys.map(key => {
          let val = item[key];
          if (typeof val === 'string' && val.includes(',')) {
            return `"${val}"`;
          }
          return val;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${props.supabaseTableName}_selection.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const head = [headers.value.map(h => h.text)];
    const body = selectedItems.value.map(item => headers.value.map(h => item[h.value]));

    autoTable(doc, {
      head: head,
      body: body,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [38, 38, 38] },
    });

    doc.save(`${props.supabaseTableName}_selection.pdf`);
  };

  async function createItem(newItem) {
      isProcessing.value = true;
      let payload = { ...newItem };
      delete payload[props.supabaseTableId];
      Object.keys(payload).forEach(key => {
          if (payload[key] === '' || payload[key] === null) delete payload[key];
      });

      const { error } = await client.from(props.supabaseTableName).insert(payload);
      if (error) console.error("Error creating item:", error);
      else {
          showAddDialog.value = false;
          refresh();
      }
      isProcessing.value = false;
  }

  async function editItem(editedItem) {
      isProcessing.value = true;
      const { error } = await client.from(props.supabaseTableName).upsert(editedItem);
      if (error) console.error("Error updating item:", error);
      else {
          showEditDialog.value = false;
          refresh();
      }
      isProcessing.value = false;
  }
  
  async function deleteItems() {
      isProcessing.value = true;
      const idsToDelete = selectedItems.value.map(item => item[props.supabaseTableId]);
      const { error } = await client.from(props.supabaseTableName).delete().in(props.supabaseTableId, idsToDelete);

      if (error) console.error("Error deleting items:", error);
      else {
          showDeleteDialog.value = false;
          selectedItems.value = [];
          refresh();
      }
      isProcessing.value = false;
  }
</script>

<style>
.customize-table {
  --easy-table-border: 1px solid #e0e0e0;
  --easy-table-row-border: 1px solid #e0e0e0;

  --easy-table-header-font-size: 14px;
  --easy-table-header-height: 50px;
  --easy-table-header-background-color: #f9fafb;
  --easy-table-header-font-color: #373737;

  --easy-table-body-row-font-size: 14px;
  --easy-table-body-row-height: 50px;
  --easy-table-body-row-font-color: #373737;
  --easy-table-body-row-background-color: #ffffff;
  
  --easy-table-body-row-hover-font-color: #2d3a4f;
  --easy-table-body-row-hover-background-color: #e8f0ff;
  
  --easy-table-body-even-row-font-color: #373737;
  --easy-table-body-even-row-background-color: #f8f8f8;
  
  --easy-table-body-item-padding: 10px 15px;
  
  --easy-table-footer-background-color: #f9fafb;
  --easy-table-footer-font-color: #373737;
  --easy-table-footer-font-size: 14px;
  --easy-table-footer-padding: 0px 10px;
  --easy-table-footer-height: 50px;

  --easy-table-scrollbar-track-color: #f0f0f0;
  --easy-table-scrollbar-color: #f0f0f0;
  --easy-table-scrollbar-thumb-color: #cccccc;
  --easy-table-scrollbar-corner-color: #f0f0f0;
  
  --easy-table-loading-mask-background-color: #ffffff;
}
</style>