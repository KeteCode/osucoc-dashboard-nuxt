<template>
    <v-container class="fill-height">
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="4">
                <v-card class="elevation-12 pa-4">
                    <v-card-title class="text-center text-h5">
                        Osu COC Admin Portal
                    </v-card-title>
                    <v-card-subtitle class="text-center mb-4">
                        Sign in to continue
                    </v-card-subtitle>

                    <v-card-text>
                        <form @submit.prevent="login">
                            <ErrorAlert :error-msg="authError" />

                            <v-text-field
                                v-model="email"
                                label="Email address"
                                prepend-inner-icon="mdi-email-outline"
                                variant="outlined"
                                required
                                class="mb-2"
                            ></v-text-field>

                            <v-text-field
                                v-model="password"
                                label="Password"
                                prepend-inner-icon="mdi-lock-outline"
                                variant="outlined"
                                type="password"
                                required
                            ></v-text-field>
                            
                            <v-checkbox
                                v-model="rememberMe"
                                label="Remember me"
                                density="compact"
                                class="mt-2"
                            ></v-checkbox>
                            
                            <v-btn
                                type="submit"
                                color="primary"
                                block
                                size="large"
                                :loading="loading"
                                :disabled="loading"
                                class="mt-4"
                            >
                                Sign In
                            </v-btn>
                        </form>

                        <v-row align="center" class="my-4">
                            <v-divider></v-divider>
                            <span class="px-3 text-overline">OR</span>
                            <v-divider></v-divider>
                        </v-row>
                        
                        <v-btn
                            @click="signInWithGoogle"
                            variant="outlined"
                            block
                            size="large"
                        >
                            <v-icon start icon="mdi-google"></v-icon>
                            Sign in with Google
                        </v-btn>

                    </v-card-text>

                    <v-card-actions class="justify-center">
                        <NuxtLink to="/forgot-password">
                            <v-btn text small>Forgot your password?</v-btn>
                        </NuxtLink>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
definePageMeta({
    layout: "auth",
});
useHead({
    title: "Login | supaAuth",
});
const user = useSupabaseUser();
const loading = ref(false);
const authError = ref("");
const email = ref("");
const password = ref("");
const rememberMe = ref(true); // Default to true for convenience
const client = useSupabaseAuthClient();
const router = useRouter();

watchEffect(async () => {
    if (user.value) {
        router.push("/");
    }
});

watch([email, password], () => {
    authError.value = "";
});

const login = async () => {
    loading.value = true;
    const { error } = await client.auth.signInWithPassword({
        email: email.value,
        password: password.value,
    }, {
        shouldCreateUser: false, // Ensure users are not created via login
        persistSession: rememberMe.value, // Control session persistence
    });
    if (error) {
        loading.value = false;
        authError.value = "Invalid login credentials";
    }
};

const signInWithGoogle = async () => {
  loading.value = true;
  authError.value = '';
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) {
    loading.value = false;
    authError.value = 'Failed to sign in with Google.';
    console.error("Google sign in error:", error);
  }
};
</script>