<template>
  <div>
    <div class="controlPanel mb-4">
      <v-row align="center">
        <!-- Download Buttons -->
        <v-col cols="auto">
            <v-btn @click="downloadCSV" :disabled="selectedItems.length === 0" size="small">Download CSV</v-btn>
        </v-col>
        <v-col cols="auto">
            <v-btn @click="downloadPDF" :disabled="selectedItems.length === 0" size="small">Download PDF</v-btn>
        </v-col>

        <!-- Select All Button -->
        <v-col cols="auto">
            <v-btn 
                @click="toggleSelectAll"
                :disabled="items.length === 0"
                size="small"
            >
                {{ allItemsSelected ? 'Deselect All' : 'Select All' }}
            </v-btn>
        </v-col>

        <!-- Selection Count -->
        <v-col cols="auto" v-if="selectedItems.length > 0">
          <v-chip color="primary" label size="small">
            {{ selectedItems.length }} item(s) selected
          </v-chip>
        </v-col>
        
        <!-- Search Field -->
        <v-col>
          <v-text-field
            v-model="searchValue"
            label="Search..."
            dense
            clearable
            hide-details
          ></v-text-field>
        </v-col>
      </v-row>
    </div>

    <EasyDataTable
      :headers="headers"
      :items="items"
      v-model:items-selected="selectedItems"
      :loading="loading"
      :search-value="searchValue"
      :rows-per-page="100"
      buttons-pagination
      alternating
      table-class-name="customize-table"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const props = defineProps({
    items: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    tableName: { type: String, default: 'report' }
});

const headers = ref([]);
const selectedItems = ref([]);
const searchValue = ref('');

watch(() => props.items, (newItems) => {
    if (newItems && newItems.length > 0) {
        headers.value = Object.keys(newItems[0]).map(key => ({
            text: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: key,
            sortable: true
        }));
    } else {
        headers.value = [];
    }
    selectedItems.value = []; // Clear selection when items change
}, { deep: true, immediate: true });

const allItemsSelected = computed(() => {
  return selectedItems.value.length === props.items.length && props.items.length > 0;
});

const toggleSelectAll = () => {
  if (allItemsSelected.value) {
    selectedItems.value = [];
  } else {
    selectedItems.value = [...props.items];
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
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${props.tableName}_selection.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

    doc.save(`${props.tableName}_selection.pdf`);
};
</script>

<style>
/* Using the same styles as the main data table */
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
  --easy-table-body-row-selected-background-color: #dbe9ff;
  --easy-table-body-row-selected-font-color: #2d3a4f;
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
