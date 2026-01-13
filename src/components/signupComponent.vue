<template>
  <div class="cont">
    <div class="signup_heading">
      <v-icon style="cursor: pointer;" color="#ffffff" @click="goBack()">mdi-arrow-left</v-icon>
    </div>

    <div class="signup-container">
      <div class="signup-box">
        <h1>Create Account</h1>

        <form @submit.prevent="handleSignup">
          <input type="text" placeholder="Full Name" v-model="name" required />
          <input type="email" placeholder="Email address" v-model="email" required />
          <input type="password" placeholder="Password" v-model="password" required />
          <!-- <button type="submit">{{ loading ? "Working..." : "Sign Up"}}</button> -->
          <v-btn type="submit" color="#e50914" dark class="mt-4" :loading="loading">
                Sign Up
            </v-btn>
          <!-- <div class="options">
            <label>
              <input type="checkbox" v-model="terms" required />
              I agree to the Terms of Use & Privacy Policy
            </label>
          </div> -->
        </form>

        <div class="login-redirect">
          <p>Already have an account? <router-link to="/login">Sign in now</router-link>.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification';

export default {
  name: 'signupComponent',
  data() {
    return {
      toast: useToast(),
      name: '',
      email: '',
      password: '',
      loading: false,
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
    handleSignup() {
      // if (!this.terms) {
      //   alert('Please agree to the terms before signing up.');
      //   return;
      // }
      // Placeholder logic
      console.log('Signing up with', this.name, this.email, this.password);
      this.loading = true;
      fetch('https://api-dqfspola6q-uc.a.run.app/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.name,
          email: this.email,
          password: this.password,
        }),
      }).then(async (res) => {
        this.loading = false;
        res = await res.json();
        console.log(res);
        if(res.success){
          console.log('Signup successful');
          // this.toast.success('Signup successful! Please verify your email.');
          // this.sendVerificationEmail();
          this.$router.push({ name: 'verifyEmail', params: { email: this.email } });
        } else {
          this.toast.error(res.message || res.msg || 'Signup failed. Please try again.');
        }
      }).catch((err) => {
        this.loading = false;
        console.error('Error during signup:', err);
        this.toast.error('An error occurred. Please try again.');
      });
    },
    sendVerificationEmail() {
      // Placeholder logic for sending verification email
      console.log('Sending verification email to', this.email);
      this.loading = true;
      fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, name: this.name }),
      }).then(async (res) => {
        this.loading = false;
        res = await res.json();
        if(res.success){
          this.$router.push({ name: 'verifyEmail', params: { email: this.email } });
          // this.toast.success('Verification email sent! Please check your inbox.');
        } else {
          this.toast.error(res.message || res.msg || 'Failed to send verification email.');
        }
      }).catch((err) => {
        this.loading = false;
        console.error('Error sending verification email:', err);
        this.toast.error('An error occurred. Please try again.');
      });
      
      // this.toast.success('Verification email sent! Please check your inbox.');
    }
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

.signup_heading {
  width: 100%;
  height: 10%;
  display: flex;
  align-items: center;
  justify-content: left;
  margin-top: 1vh;
}
.logo {
  font-size: 28px;
  font-weight: 700;
  color: #e50914;
  margin-left: 15px;
  letter-spacing: 1px;
}

.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.signup-box {
  padding: 0px;
  border-radius: 4px;
  width: 320px;
}

h1 {
  margin-bottom: 25px;
  font-weight: 600;
  margin-top: 0px;
}

input {
  width: 100%;
  margin-bottom: 12px;
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
  /* padding: 14px; */
  /* background: #e50914;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer; */
  /* transition: background 0.3s; */
}

button:hover {
  background: #f6121d;
}

.options {
  display: flex;
  align-items: flex-start;
  font-size: 13px;
  margin-top: 12px;
  color: #b3b3b3;
}

.options input[type="checkbox"] {
  margin-right: 8px;
  margin-top: 2px;
}

.login-redirect {
  margin-top: 3vh;
  margin-bottom: 2vh;
  font-size: 14px;
  color: #b3b3b3;
}

.login-redirect a {
  color: white;
  text-decoration: none;
}

.login-redirect a:hover {
  text-decoration: underline;
}
</style>
