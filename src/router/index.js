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

const routes = [
  {
    path: '/',
    name: 'CreateGame',
    component: CreateGameButton,
  },
  {
    path: '/game/:gameCode',
    name: 'GamePage',
    component: GamePage,
  },
  {
    path: '/admin/:gameCode',
    name: 'Adminpage',
    component: Adminpage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

