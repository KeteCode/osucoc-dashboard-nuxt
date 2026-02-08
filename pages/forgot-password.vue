<template>
    <div >
      <v-container>
        <v-row>
            <v-col></v-col>
            <v-col>
                <h1>Osu COC Admin Portal</h1>
                <h3 >Forgot password</h3>
                <form @submit.prevent="resetPassword">
                    <ErrorAlert :error-msg="authError" @clearError="clearError" />
                    <SuccessAlert :success-msg="authSuccess" @clearSuccess="clearSuccess" />
                    <div >
                    <label >
                        <div >
                        <v-text-field type="text" placeholder="Email address" v-model="email"></v-text-field>
                        </div>
                    </label>
                    </div>
                    <v-btn type="submit" :disabled="loading">
                     <div :class="{loading: loading}">Request password reset</div>
                    </v-btn>
                </form>
            </v-col>
            <v-col></v-col>
        </v-row>
      </v-container>
    </div>
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