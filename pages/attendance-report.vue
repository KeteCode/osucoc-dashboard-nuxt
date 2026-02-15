<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h1 class="text-h4">Attendance Report</h1>
        <p class="text-subtitle-1">Select a date to view attendance and absentee records.</p>
      </v-col>
    </v-row>

    <!-- Date Picker Row -->
    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="selectedDate"
          label="Report Date"
          prepend-inner-icon="mdi-calendar"
          type="date"
          variant="outlined"
          density="compact"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Tabs and Data Tables Row -->
    <v-row>
      <v-col cols="12">
        <v-tabs v-model="tab" color="primary">
          <v-tab value="present">Present</v-tab>
          <v-tab value="absent">Absent</v-tab>
        </v-tabs>

        <v-window v-model="tab" class="mt-4">
          <v-window-item value="present">
            <v-card flat>
              <v-card-text>
                <ReportDataTable
                  v-if="presentData.length"
                  :items="presentData"
                  :loading="loading"
                  table-name="present_members"
                />
                <v-alert v-else-if="!loading" type="info">No attendance records found for this date.</v-alert>
                 <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>
              </v-card-text>
            </v-card>
          </v-window-item>

          <v-window-item value="absent">
            <v-card flat>
              <v-card-text>
                <ReportDataTable
                  v-if="absentData.length"
                  :items="absentData"
                  :loading="loading"
                  table-name="absent_members"
                />
                <v-alert v-else-if="!loading" type="info">No absentee records found for this date.</v-alert>
                <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import ReportDataTable from '~/components/ReportDataTable.vue';

const client = useSupabaseClient();

// Initialize with today's date in YYYY-MM-DD format
const selectedDate = ref(new Date().toISOString().substr(0, 10));
const tab = ref('present');
const loading = ref(false);
const presentData = ref([]);
const absentData = ref([]);

const fetchReportData = async (date) => {
  if (!date) return;
  
  loading.value = true;
  presentData.value = [];
  absentData.value = [];
  
  // Date is already in YYYY-MM-DD format from the input type="date"
  const formattedDate = date;

  try {
    const { data: present, error: presentError } = await client.rpc('get_attendance_by_date', { target_date: formattedDate });
    if (presentError) throw presentError;
    presentData.value = present;

    const { data: absent, error: absentError } = await client.rpc('get_absentees_by_date', { target_date: formattedDate });
    if (absentError) throw absentError;
    absentData.value = absent;
  } catch (error) {
    console.error('Error fetching report data:', error.message);
  } finally {
    loading.value = false;
  }
};

watch(selectedDate, (newDate) => {
  fetchReportData(newDate);
});

onMounted(() => {
  fetchReportData(selectedDate.value);
});
</script>

