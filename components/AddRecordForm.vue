<template>
  <v-card width="400">
    <v-toolbar color="primary" title="Add New Record"></v-toolbar>
    <v-card-text>
      <div v-for="key in Object.keys(formTemplate)" :key="key">
        <v-text-field
          v-model="editableForm[key]"
          :label="key"
          :disabled="key === 'id' || key === 'created_at'"
        ></v-text-field>
      </div>
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-btn color="primary" variant="tonal" @click="submit">Create</v-btn>
      <v-btn variant="text" @click="$emit('close')">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  formTemplate: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['create-record', 'close']);

const editableForm = ref({});

// Use a watcher to deeply clone the prop to local state
// This allows the form to be editable without mutating the prop
watch(() => props.formTemplate, (newTemplate) => {
  editableForm.value = JSON.parse(JSON.stringify(newTemplate));
}, { immediate: true, deep: true });

const submit = () => {
  emit('create-record', editableForm.value);
};
</script>