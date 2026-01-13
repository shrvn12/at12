// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import homeComponent from '../components/homeComponent.vue';
import searchResults from '../components/searchResults.vue';
import NowPlaying from '../components/nowPlaying.vue';
import artistComponent from '../components/artistComponent.vue';
import playlistComponent from '../components/playlistComponent.vue';
import loginComponent from '../components/loginComponent.vue';
import signupComponent from '../components/signupComponent.vue';
import accountComponent from '../components/accountComponent.vue';
import verifyEmailComponent from '../components/verifyEmail.vue';
import { useUserStore } from '../stores/user';

const routes = [
  { path: '/', name: 'home', component: homeComponent },
  { path: '/search', name: 'search', component: searchResults },
  { path: '/playing/:videoId', name: 'nowPlaying', component: NowPlaying },
  { path: '/artist/:artistId', name: 'artist', component: artistComponent },
  { path: '/playlist/:playlistId', name: 'playlist', component: playlistComponent },
  { path: '/:catchAll(.*)', redirect: '/' }, // Redirect unknown routes to home
  { path: '/login', name: 'login', component: loginComponent },
  { path: '/signup', name: 'signup', component: signupComponent },
  { path: '/account', name: 'account', component: accountComponent },
  { path: '/verify/:email', name: 'verifyEmail', component: verifyEmailComponent}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

let skipNextPush = false;

router.beforeEach(async (to, from) => {
  const userStore = useUserStore();
  console.log('Navigating from', from.name, 'to', to.name);

  // 1️⃣ Fetch user info only once
  if (!userStore.user.id) {
    try {
      const res = await fetch('https://api-dqfspola6q-uc.a.run.app/auth/userInfo', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }).then(r => r.json());

      if (res.success) {
        userStore.user = res;
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  }

  const user = userStore.user;

  // 2️⃣ Force email verification
  if (
    user?.email &&
    !user.emailVerified &&
    !['verifyEmail', 'login'].includes(to.name)
  ) {
    console.log('Redirecting to verify email:', user.email);
    return {
      name: 'verifyEmail',
      params: { email: user.email },
      replace: true
    };
  }

  // 3️⃣ Redirect logged-in users away from auth pages
  if (
    user?.emailVerified &&
    ['login', 'signup'].includes(to.name)
  ) {
    return { name: 'home', replace: true };
  }

  // 4️⃣ Handle skipNextPush logic (SAFE)
  const isSameRoute =
    to.name === from.name &&
    JSON.stringify(to.params) === JSON.stringify(from.params);

  if (skipNextPush && isSameRoute) {
    skipNextPush = false;
    return false; // cancel duplicate navigation
  }

  // 5️⃣ Detect routes that should prevent immediate re-push
  if (
    from.name === 'nowPlaying' ||
    (from.name === 'search' && to.name === 'search')
  ) {
    skipNextPush = true;
  } else {
    skipNextPush = false;
  }
  // 6️⃣ Allow navigation
  return true;
});
export default router;