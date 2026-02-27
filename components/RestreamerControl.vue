<template>
  <v-card class="mb-4" :loading="loading" elevation="2">
    <v-card-title class="d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <v-icon start icon="mdi-video-input-component" class="mr-2" />
        Stream Control (VM)
      </div>
      <v-chip :color="statusColor" size="small" variant="flat">
        {{ status || 'UNKNOWN' }}
      </v-chip>
    </v-card-title>

    <v-card-text>
      <div v-if="status === 'RUNNING'" class="text-center mb-4">
        <v-progress-circular
          :model-value="uptimePercentage"
          :size="120"
          :width="10"
          color="primary"
          class="mx-auto"
        >
          <div class="d-flex flex-column align-center justify-center">
            <span class="text-h6 font-weight-bold">{{ formatUptime(uptimeRemaining) }}</span>
            <span class="text-caption">remaining</span>
          </div>
        </v-progress-circular>
        <div class="text-caption mt-2">Auto-shutdown window</div>
      </div>

      <div class="d-flex gap-2 flex-wrap mb-4">
        <v-btn
          v-if="status !== 'RUNNING' && status !== 'STARTING'"
          color="success"
          prepend-icon="mdi-play"
          :disabled="loading"
          @click="startVM"
        >
          Start Stream
        </v-btn>
        
        <v-btn
          v-if="status === 'RUNNING' || status === 'STARTING'"
          color="error"
          prepend-icon="mdi-stop"
          :disabled="loading"
          @click="stopVM"
        >
          Stop Stream
        </v-btn>

        <v-btn
          color="secondary"
          prepend-icon="mdi-open-in-new"
          href="https://stream.osucoc.org"
          target="_blank"
          variant="outlined"
        >
          Open Restreamer
        </v-btn>

        <v-btn
          icon="mdi-refresh"
          variant="text"
          size="small"
          :disabled="loading"
          @click="fetchStatus(true)"
        />
      </div>

      <!-- Log viewer is hidden for now -->
      <!--
      <v-expansion-panels variant="accordion">
        <v-expansion-panel
          title="Recent VM Logs"
          prepend-icon="mdi-console"
        >
          <v-expansion-panel-text>
            <div class="log-container bg-grey-darken-4 pa-3 rounded">
              <pre v-if="logs" class="log-content">{{ logs }}</pre>
              <div v-else class="text-grey text-caption italic">No logs available. Click refresh to pull data.</div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      -->
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'

const { status, uptimeRemaining, logs, loading, fetchStatus, startVM, stopVM } = useRestreamer()

const statusColor = computed(() => {
  switch (status.value) {
    case 'RUNNING': return 'success'
    case 'PROVISIONING':
    case 'STAGING':
    case 'STARTING': return 'warning'
    case 'STOPPING':
    case 'TERMINATED':
    case 'STOPPED': return 'error'
    default: return 'grey'
  }
})

const uptimePercentage = computed(() => {
  const sixHoursInMs = 6 * 60 * 60 * 1000
  return (uptimeRemaining.value / sixHoursInMs) * 100
})

const formatUptime = (ms) => {
  if (ms <= 0) return '0h 0m'
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

onMounted(() => {
  fetchStatus(true)
  // Refresh status every 30 seconds
  const interval = setInterval(() => {
    fetchStatus(false) // Just status for background poll
  }, 30000)

  onUnmounted(() => clearInterval(interval))
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.log-container {
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', Courier, monospace;
}
.log-content {
  font-size: 11px;
  color: #00ff00;
  white-space: pre-wrap;
  margin: 0;
}
</style>
