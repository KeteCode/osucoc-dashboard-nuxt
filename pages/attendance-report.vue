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
        <v-alert
          v-if="responseMessage"
          :type="responseType"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="responseMessage = ''"
        >
          {{ responseMessage }}
        </v-alert>

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
                  show-delete
                  @delete-item="handleDelete"
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
const responseMessage = ref('');
const responseType = ref('success');

const fetchReportData = async (date) => {
  if (!date) return;
  
  loading.value = true;
  responseMessage.value = ''; // Clear previous messages
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

const handleDelete = async (item) => {
  if (!confirm('Are you sure you want to remove this attendance record?')) return;

  const memberId = item['Church Number'] || item.church_member_church_number || item.church_number;

  loading.value = true;
  responseMessage.value = '';

  try {
    let query = client.from('attendance').delete();

    if (memberId) {
      const targetDate = selectedDate.value;
      query = query
        .eq('church_member_church_number', memberId)
        .gte('created_at', `${targetDate}T00:00:00`)
        .lte('created_at', `${targetDate}T23:59:59`);
    } else if (item.id) {
      query = query.eq('id', item.id);
    } else {
      throw new Error('Could not identify member to delete.');
    }

    const { error } = await query;
    if (error) throw error;

    responseType.value = 'success';
    responseMessage.value = 'Attendance record removed successfully.';
    await fetchReportData(selectedDate.value);
  } catch (error) {
    console.error('Error removing attendance:', error);
    responseType.value = 'error';
    responseMessage.value = `Error removing attendance: ${error.message}`;
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

