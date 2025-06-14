// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import homeComponent from '../components/homeComponent.vue';
import searchResults from '../components/searchResults.vue';
import NowPlaying from '../components/nowPlaying.vue';
import artistComponent from '../components/artistComponent.vue';
import playlistComponent from '../components/playlistComponent.vue';

const routes = [
  { path: '/', name: 'home', component: homeComponent },
  { path: '/search', name: 'search', component: searchResults },
  { path: '/playing/:videoId', name: 'nowPlaying', component: NowPlaying },
  { path: '/artist/:artistId', name: 'artist', component: artistComponent },
  { path: '/playlist/:playlistId', name: 'playlist', component: playlistComponent },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

let skipNextPush = false;

router.beforeEach((to, from, next) => {
  const isLeavingNowPlaying = from.name === 'nowPlaying';
  const isLeavingSearch = from.name === 'search';

  if (to.name == 'search' && isLeavingSearch && !skipNextPush) {
    skipNextPush = true;
    router.replace(to.fullPath);
  } else if (isLeavingNowPlaying && !skipNextPush) {
    skipNextPush = true;
    router.replace(to.fullPath);
  } else {
    skipNextPush = false;
    next();
  }
});
export default router;