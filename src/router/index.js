// import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: [
//     {
//       path: '/',
//       name: 'home',
//       component: HomeView,
//     },
//     {
//       path: '/about',
//       name: 'about',
//       component: () => import('../views/AboutView.vue'),
//     },
//   ],
// })

// export default router

import { createRouter, createWebHistory } from 'vue-router';
import CreateGameButton from '../components/CreateGameButton.vue';
import GamePage from '../views/GamePage.vue';
import Adminpage from '../components/AdminControlPage.vue'
import JoinGame from '../components/JoinGame.vue';
import First from '../components/FirstPage.vue';
import CreateTeam from '../components/CreateTeam.vue';
import PlayerPage from '@/components/PlayerPage.vue';
import PlayerWait from '@/views/PlayerWait.vue';
import Strategic from '../components/StrategicPage.vue';
import Marketing from '../components/MarketingPage.vue';
import Result from '../components/EndResult.vue';

const routes = [
  {
    path: '/',
    name: 'First',
    component: First,
  },
  {
    path: '/Join',
    name: 'JoinGame',
    component: JoinGame,
  },
  {
    path: '/admin',
    name: 'CreateGame',
    component: CreateGameButton,
  },
  {
    path: '/admin/start/:gameCode',
    name: 'GamePage',
    component: GamePage,
  },
  {
    path: '/admin/:gameCode',
    name: 'Adminpage',
    component: Adminpage,
  },
  {
    path: '/player',
    name: 'CreateTeam',
    component: CreateTeam,
  },
  {
    path: '/player/input',
    name: 'PlayerPage',
    component: PlayerPage,
  },
  {
    path: '/player/wait',
    name: 'PlayerWait',
    component: PlayerWait,
  },
  {
    path: '/strategic',
    name: 'Strategic',
    component: Strategic,
  },
  {
    path: '/marketing',
    name: 'Marketing',
    component: Marketing,
  },
  {
    path: '/endResult',
    name: 'Result',
    component: Result,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

