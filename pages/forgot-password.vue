<template>
    <v-container class="fill-height">
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="4">
                <v-card class="elevation-12 pa-4">
                    <v-card-title class="text-center text-h5">
                        Osu COC Admin Portal
                    </v-card-title>
                    <v-card-subtitle class="text-center mb-4">
                        Forgot Password
                    </v-card-subtitle>

                    <v-card-text>
                        <form @submit.prevent="resetPassword">
                            <ErrorAlert :error-msg="authError" />
                            <SuccessAlert :success-msg="authSuccess" />

                            <v-text-field
                                v-model="email"
                                label="Email address"
                                prepend-inner-icon="mdi-email-outline"
                                variant="outlined"
                                required
                                class="mb-2"
                            ></v-text-field>

                            <v-btn
                                type="submit"
                                color="primary"
                                block
                                size="large"
                                :loading="loading"
                                :disabled="loading"
                                class="mt-4"
                            >
                                Request Password Reset
                            </v-btn>
                        </form>
                    </v-card-text>

                    <v-card-actions class="justify-center">
                        <NuxtLink to="/login">
                            <v-btn text small>Back to Login</v-btn>
                        </NuxtLink>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
  
  <script setup >
  definePageMeta({
    layout: 'auth'
  })
  useHead({
    title: 'Forgot Password | supaAuth'
  })
  const email = ref('')
  const client = useSupabaseAuthClient()
  const loading = ref(false)
  const authSuccess = ref('')
  const authError = ref('')

  watch(email, () => {
    authError.value = '';
    authSuccess.value = '';
  });
  
  const resetPassword = async () => {
    loading.value = true
    const { error }  = await client.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/new-password`
    })
    if (error) {
      loading.value = false
      authError.value = 'Invalid email credential'
    }
    else {
      loading.value = false
      authSuccess.value = `We've sent you an email.`
    }
  }
  </script>