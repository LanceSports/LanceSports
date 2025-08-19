import { createApp } from 'vue'
//import '../'
import App from '../App.vue'
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import Landing from '../components/Landing.vue'
import Navbar from '../components/Navbar.vue'
import soccerPitch from '../components/soccerPitch.vue'
import Login from '../components/Login.vue'
import GoogleLogin from '../components/GoogleLogin.vue'

//Hi jordan i added this but it does mothing to your code
const history = import.meta.env.MODE === 'test' ? createMemoryHistory() : createWebHistory()



const routes = [
    {
        path: '/',
        name: 'Landing',
        component: Landing,
    },

    {
        path: '/soccerPitch',
        name: 'soccerPitch',
        component: soccerPitch,
    },

    {
        path: '/Login',
        name: 'Login',
        component: Login
    },

    {
        path: '/GoogleLogin',
        name: 'GoogleLogin',
        component: GoogleLogin
    },

];
// added this @benny
 const router = createRouter({ history, routes })
//I commented this out as it was messing with testing, feel free to comment it in for your code 
// const router = createRouter({
//     history: createWebHistory(),
//     routes,
// });
export default router;
