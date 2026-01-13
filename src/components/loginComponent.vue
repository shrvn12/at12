<template>
  <div class="cont">
    <div class="login_heading">
      <v-icon style="cursor: pointer;" color="#ffffff" @click="goBack()">mdi-arrow-left</v-icon>
    </div>

    <div class="login-container">
      <div class="login-box">
        <h1>Sign In</h1>

        <form @submit.prevent="handleLogin">
          <input type="email" placeholder="Email" v-model="email" required />
          <input type="password" placeholder="Password" v-model="password" required />
          <button type="submit">Sign In</button>

          <div class="options">
            <label style="display: flex; align-items: center; border: 0px solid white; height: 5vh;">
              <input type="checkbox" v-model="remember" style="margin-top: 2vh;"/>
              <p style="white-space: nowrap; margin-left: 10px;">Remember me</p>
            </label>
            <label style="display: flex; align-items: center; border: 0px solid white; height: 5vh;">
                <a href="#">Forgot Password?</a>
            </label>
          </div>
        </form>

        <div class="signup">
          <p>New to @12? <router-link to="/signup">Sign up now</router-link>.</p>
          <small>
            This page is protected by Google reCAPTCHA to ensure you're not a bot.
          </small>
        </div>
        <br>
        <br>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification';
import { useQueueStore } from '../stores/queue';

export default {
  name: 'loginComponent',
  setup() {
      const queueStore = useQueueStore();
      return {queueStore};
  },
  data() {
    return {
      email: '',
      password: '',
      remember: true,
      loading: false,
      toast: useToast(),
    };
  },
  methods: {
    goBack() {
      if (window.history.state && window.history.state.back) {
        this.$router.back();
      } else {
        this.$router.push({ name: 'home' });
      }
    },
    handleLogin() {
      // Placeholder logic
      console.log('Logging in with', this.email, this.password);
      this.loading = true;
      fetch('https://api-dqfspola6q-uc.a.run.app/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: this.email,
          password: this.password,
          remember: this.remember,
        }),
      }).then(async (res) => {
        this.loading = false;
        res = await res.json();
        console.log(res);
        if(res.success){
          this.queueStore.userData = res;
          this.$router.replace('/');
        } else {
          this.toast.error(res.message || res.msg || 'Login failed. Please try again.');
          this.$router.push('/login');
        }
      }).catch((err) => {
        this.loading = false;
        console.error('Error during signup:', err);
        this.toast.error('An error occurred. Please try again.');
      });
    },
  },
};
</script>

<style scoped>
.cont {
  width: 100%;
  height: 100%;
  background: url('https://assets.nflxext.com/ffe/siteui/vlv3/6c6a5e8e-b88f-40c7-9dc2-2a2c0f4db2dc/fc5ffefb-7e42-4629-a0b1-8ebedb2ce2e8/IN-en-20230828-popsignuptwoweeks-perspective_alpha_website_large.jpg')
    center/cover no-repeat;
  display: flex;
  flex-direction: column;
  color: white;
  overflow-y: auto;
  scrollbar-width: none;
}

.login_heading {
  width: 100%;
  height: 10%;
  display: flex;
  align-items: center;
  justify-content: left;
  margin-top: 1vh;
}

.login-container {
  display: flex;
  justify-content: center;
  /* align-items: center; */
  /* flex: 1; */
}

.login-box {
  padding: 0px 0vw;
  border-radius: 4px;
  width: 320px;
}

h1 {
  margin-bottom: 28px;
  font-weight: 600;
}

input {
  width: 100%;
  margin-bottom: 16px;
  padding: 14px;
  border: none;
  border-radius: 4px;
  background: #333;
  color: white;
  font-size: 14px;
}

input:focus {
  outline: 2px solid #e50914;
}

button {
  width: 100%;
  padding: 14px;
  background: #e50914;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #f6121d;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: small;
  margin-top: 10px;
}

.options a {
  color: #b3b3b3;
  text-decoration: none;
}

.options a:hover {
  text-decoration: underline;
}

.signup {
  margin-top: 40px;
  font-size: 14px;
  color: #b3b3b3;
}

.signup a {
  color: white;
  text-decoration: none;
}

.signup a:hover {
  text-decoration: underline;
}

small {
  display: block;
  color: #8c8c8c;
  margin-top: 15px;
  font-size: 12px;
  line-height: 1.4;
}
</style>
