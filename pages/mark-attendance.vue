<template>
  <v-container fluid>
    <!-- Attendance Marking Section -->
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12 pa-4">
          <v-card-title class="text-center text-h5">
            Mark Attendance
          </v-card-title>
          <v-card-subtitle class="text-center mb-4">
            <!-- Date Picker -->
            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="formattedMarkDate"
                  label="Attendance Date"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="markDate"
                @update:model-value="dateMenu = false"
                color="primary"
              ></v-date-picker>
            </v-menu>
          </v-card-subtitle>

          <v-card-text>
            <form @submit.prevent="submitAttendance">
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
              
              <v-text-field
                v-model="churchNumber"
                label="Church Member Number"
                prepend-inner-icon="mdi-card-account-details-outline"
                variant="outlined"
                required
                autofocus
                :disabled="loading"
                class="mb-4"
              ></v-text-field>

              <v-row>
                <v-col>
                  <v-btn
                    type="submit"
                    color="primary"
                    block
                    size="large"
                    :loading="loading"
                    :disabled="!churchNumber || loading"
                  >
                    Mark Present
                  </v-btn>
                </v-col>
                <v-col cols="auto">
                  <v-btn
                    @click="fetchReportData(markDate)"
                    size="large"
                    icon="mdi-refresh"
                    :loading="reportLoading"
                  ></v-btn>
                </v-col>
              </v-row>
            </form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Divider -->
    <v-row>
      <v-col>
        <v-divider class="my-6"></v-divider>
      </v-col>
    </v-row>

    <!-- Attendance Reports Section -->
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
                  :loading="reportLoading"
                  table-name="present_members"
                />
                <v-alert v-else-if="!reportLoading" type="info">No attendance records found for this date.</v-alert>
                <v-progress-circular v-if="reportLoading" indeterminate color="primary"></v-progress-circular>
              </v-card-text>
            </v-card>
          </v-window-item>

          <v-window-item value="absent">
            <v-card flat>
              <v-card-text>
                <ReportDataTable
                  v-if="absentData.length"
                  :items="absentData"
                  :loading="reportLoading"
                  table-name="absent_members"
                />
                <v-alert v-else-if="!reportLoading" type="info">No absentee records found for this date.</v-alert>
                <v-progress-circular v-if="reportLoading" indeterminate color="primary"></v-progress-circular>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import ReportDataTable from '~/components/ReportDataTable.vue';

definePageMeta({
    middleware: 'auth',
});

const client = useSupabaseClient();

// State for attendance marking
const churchNumber = ref('');
const loading = ref(false);
const responseMessage = ref('');
const responseType = ref('success');

// State for date picker and reports
const markDate = ref(new Date());
const dateMenu = ref(false);
const reportLoading = ref(false);
const tab = ref('present');
const presentData = ref([]);
const absentData = ref([]);

const formattedMarkDate = computed(() => {
  return markDate.value.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

const formatDateForSupabase = (date) => {
  return date.toISOString().split('T')[0];
};

const submitAttendance = async () => {
  if (!churchNumber.value) return;

  loading.value = true;
  responseMessage.value = '';

  try {
    const { data, error } = await client.rpc('mark_attendance', {
      member_church_number: churchNumber.value,
      target_date: formatDateForSupabase(markDate.value), // Pass selected date
    });

    if (error) throw error;

    if (data.startsWith('Success')) {
      responseType.value = 'success';
      churchNumber.value = ''; // Clear input for next entry
      fetchReportData(markDate.value); // Auto-refresh reports for selected date
    } else {
      responseType.value = 'warning';
    }
    responseMessage.value = data;

  } catch (error) {
    responseType.value = 'error';
    responseMessage.value = `Error: ${error.message}. Please check the Church Number.`;
    console.error("Error marking attendance:", error);
  } finally {
    loading.value = false;
  }
};

const fetchReportData = async (date) => {
  if (!date) return;

  reportLoading.value = true;
  
  const formattedDate = formatDateForSupabase(date);

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
    reportLoading.value = false;
  }
};

watch(markDate, (newDate) => {
  fetchReportData(newDate);
});

onMounted(() => {
  fetchReportData(markDate.value);
});
</script>

