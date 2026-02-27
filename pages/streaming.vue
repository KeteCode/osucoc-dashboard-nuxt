<template>
  <div>
    <h1 class="text-h4 mb-6">Stream Management</h1>
    
    <v-row>
      <v-col cols="12" md="6">
        <RestreamerControl />
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card variant="outlined">
          <v-card-title>Streaming Information</v-card-title>
          <v-card-text>
            <p class="mb-2">The Restreamer VM is configured to auto-shutdown after 6 hours of continuous operation to optimize costs.</p>
            <p class="mb-2"><strong>Status:</strong> Use the refresh button to get the latest status from GCP.</p>
            <p><strong>Note:</strong> Starting the VM can take up to 2 minutes before the stream link is active.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
