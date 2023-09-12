<template>
    <div id="app">
        
        <auto-scroll :loop="true" :loop-up="true" :slow="false">
            <div class="text-h1 font-weight-bold" v-for="member in data" >
                <section id="names">
                    {{ useChangeCase(member.name, 'capitalCase').value }}
                </section>
                
            </div>
        </auto-scroll>
    </div>
</template>

<script setup>
    import { useChangeCase } from '@vueuse/integrations/useChangeCase';

    definePageMeta({
        middleware: 'auth',
    });
    let date_param = new Date().toISOString().slice(0, 10)
    const table = 'church_members'
    console.log("Date param ",date_param)
    const client = useSupabaseClient()
    
    //get all data using useAsyncData
    let {data,error} =  await useAsyncData('weeklyOutreach', async () => {
        const { data } = await client.rpc('get_members_without_attendance', {
                                            date_param
                                        })
        //tableObjectTemplate =  clearObject(data[0])
        
        return data;
    })
    console.log("Data total ",data.value.length)
    if (error) console.error(error)
    else console.log(data)
</script>

<style>
::-webkit-scrollbar { 
  display: none; 
}
#names{
    margin-bottom: 60px;
}
</style>