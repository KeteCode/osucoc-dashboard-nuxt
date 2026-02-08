<template>
  <v-card width="400">
    <v-toolbar color="primary" title="Edit Record"></v-toolbar>
    <v-card-text>
      <div v-for="key in Object.keys(editableRecord)" :key="key">
        <v-text-field
          v-model="editableRecord[key]"
          :label="key"
          :disabled="key === 'id' || key === 'created_at'"
        ></v-text-field>
      </div>
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-btn
        :disabled="isProcessing"
        color="primary"
        variant="tonal"
        @click="submit"
        >Save</v-btn
      >
      <v-btn :disabled="isProcessing" variant="text" @click="$emit('close')"
        >Close</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  record: {
    type: Object,
    required: true,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update-record', 'close']);

const editableRecord = ref({});

// Deep clone the record prop to make it locally editable
watch(() => props.record, (newRecord) => {
    editableRecord.value = JSON.parse(JSON.stringify(newRecord));
}, { immediate: true, deep: true });


const submit = () => {
  emit('update-record', editableRecord.value);
};
</script>