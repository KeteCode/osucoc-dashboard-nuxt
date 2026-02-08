<template>
  <v-card>
    <v-toolbar color="warning" title="Delete Confirmation"></v-toolbar>
    <v-card-text>
      <div class="text-h4 pa-12">
        Are you sure you want to delete these {{ selectedCount }} item(s)?
      </div>
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-btn
        :disabled="isProcessing"
        color="warning"
        variant="tonal"
        @click="$emit('confirm-delete')"
        >Yes, Delete</v-btn
      >
      <v-btn
        :disabled="isProcessing"
        color="primary"
        variant="tonal"
        @click="$emit('close')"
        >No, Close</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script setup>
defineProps({
  selectedCount: {
    type: Number,
    required: true,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['confirm-delete', 'close']);
</script>