<template>
    <Transition name="scale-y">
      
          <v-alert v-if="successMsg" type="success" >
                {{ successMsg }}
            </v-alert>
          
    </Transition>
  </template>
  
  <script setup >
    defineProps({ successMsg: String })
  </script>