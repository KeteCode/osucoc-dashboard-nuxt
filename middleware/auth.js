export default defineNuxtRouteMiddleware(async ()=>{
    const client = useSupabaseClient();
    const user =  await client.auth.getUser();
    const router = useRouter();
    if(!user.data.user){
        router.push('/login');
    }
})