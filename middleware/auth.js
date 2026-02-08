export default defineNuxtRouteMiddleware(async ()=>{
    const client = useSupabaseClient();
    const user =  await client.auth.getUser();
    
    if(!user.data.user){
        return navigateTo('/login');
    }
})