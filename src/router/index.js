import { createApp } from 'vue'
//import '../'
import App from '../App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../components/Landing.vue'
import Navbar from '../components/Navbar.vue'
import soccerPitch from '../components/soccerPitch.vue'
import Login from '../components/Login.vue'
import GoogleLogin from '../components/GoogleLogin.vue'



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

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
