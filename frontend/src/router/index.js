

import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../view/LandingPage.vue'
import LoginView from '../view/LoginView.vue';
import RegisterView from '../view/RegisterView.vue';
import DashboardOperator from '../view/DashboardOperator.vue';
import DashboardVerifikator from '../view/DashboardVerifikator.vue';

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingPage,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
  },
  {
    path: '/dashboard/operator',
    name: 'dashboard-operator',
    component: DashboardOperator,
    meta: { requiresAuth: true, role: 'operator' },
  },
  {
    path: '/dashboard/verifikator',
    name: 'dashboard-verifikator',
    component: DashboardVerifikator,
    meta: { requiresAuth: true, role: 'verifikator' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
    next('/login');
  } else if (to.matched.some(record => record.meta.role) && to.meta.role !== role) {
    next('/login');
  } else {
    next();
  }
});

export default router;

