<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12 pa-4">
          <v-card-title class="text-center text-h5">
            Invite New User
          </v-card-title>
          <v-card-subtitle class="text-center mb-4">
            Enter the email address to send an invitation link.
          </v-card-subtitle>

          <v-card-text>
            <form @submit.prevent="sendInvitation">
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
                v-model="email"
                label="Email Address"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                type="email"
                required
                :disabled="loading"
                class="mb-2"
              ></v-text-field>

              <v-select
                v-model="selectedRole"
                :items="roles"
                label="Role"
                prepend-inner-icon="mdi-account-lock-outline"
                variant="outlined"
                required
                :disabled="loading"
              ></v-select>

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="loading"
                :disabled="!email || !selectedRole || loading"
                class="mt-4"
              >
                Send Invitation
              </v-btn>
            </form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

definePageMeta({
    middleware: 'auth',
});

const email = ref('');
const selectedRole = ref('Member'); // Default role
const roles = ['Admin', 'Member'];
const loading = ref(false);
const responseMessage = ref('');
const responseType = ref('success');

const sendInvitation = async () => {
  if (!email.value || !selectedRole.value) return;

  loading.value = true;
  responseMessage.value = '';

  try {
    const { data, error } = await useFetch('/api/invite', {
      method: 'POST',
      body: {
        email: email.value,
        role: selectedRole.value,
      },
    });

    if (error.value) {
        throw new Error(error.value.data?.message || 'An unknown error occurred.');
    }

    responseType.value = 'success';
    responseMessage.value = data.value.message;
    email.value = ''; // Clear input on success

  } catch (error) {
    responseType.value = 'error';
    responseMessage.value = `Error: ${error.message}`;
    console.error("Error sending invitation:", error);
  } finally {
    loading.value = false;
  }
};
</script>
