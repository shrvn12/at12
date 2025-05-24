// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import homeComponent from '../components/homeComponent.vue';
import searchResults from '../components/searchResults.vue';
import NowPlaying from '../components/nowPlaying.vue';

const routes = [
  { path: '/', name: 'home', component: homeComponent },
  { path: '/search', name: 'search', component: searchResults },
  { path: '/playing/:videoId', name: 'nowPlaying', component: NowPlaying },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

let skipNextPush = false;

router.beforeEach((to, from, next) => {
  const isLeavingNowPlaying = from.name === 'nowPlaying';

  if (isLeavingNowPlaying && !skipNextPush) {
    skipNextPush = true;
    router.replace(to.fullPath);
  } else {
    skipNextPush = false;
    next();
  }
});
export default router;