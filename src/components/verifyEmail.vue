<template>
    <div class="verify-container">
        <div class="verify-card">
            <v-icon color="#e50914" size="48">mdi-email-check-outline</v-icon>
            <h2>Verify your email</h2>
            <p>
                We've sent a verification link to your email address.<br />
                Please check your inbox and click the link to activate your account.
            </p>

            <v-btn color="#e50914" dark class="mt-4" :loading="isResending" :disabled="countdown > 0"
                @click="resendVerification">
                {{ countdown > 0 ? `Resend email in ${countdown}s` : 'Resend Verification Email' }}
            </v-btn>

            <v-btn text color="#999" class="mt-2" @click="goToLogin">
                Back to Login
            </v-btn>
        </div>
    </div>
</template>

<script>
import { useToast } from 'vue-toastification';

export default {
    name: 'verifyEmail',
    data() {
        return {
            toast: useToast(),
            isResending: false,
            email: this.$route.params.email || '',
            countdown: 0,
            timer: null,
        };
    },
    methods: {
        startCountdown() {
            this.countdown = 20;

            if (this.timer) {
                clearInterval(this.timer);
            }

            this.timer = setInterval(() => {
                this.countdown--;

                if (this.countdown <= 0) {
                    clearInterval(this.timer);
                    this.timer = null;
                }
            }, 1000);
        },

        async resendVerification() {
            if (this.countdown > 0) return;

            this.isResending = true;

            try {
                const res = await fetch('/api/auth/send-verification-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.email}),
                });

                const data = await res.json();

                if (data.success) {
                    this.toast.success('Verification email sent!');
                    this.startCountdown();
                } else {
                    this.toast.error(data.message || data.msg || 'Failed to send verification email.');
                }
            } catch (err) {
                console.error('Error sending verification email:', err);
                this.toast.error('An error occurred. Please try again.');
            } finally {
                this.isResending = false;
            }
        },

        goToLogin() {
            this.$router.push({ name: 'login' });
        },
    },

    mounted() {
        this.resendVerification();
    },

    beforeUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    },
};
</script>

<style scoped>
.verify-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: white;
}

.verify-card {
    text-align: center;
    background: rgba(20, 20, 20, 0.9);
    padding: 40px 30px;
    border-radius: 12px;
    max-width: 30vw;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}

h2 {
    margin-top: 15px;
    font-weight: 600;
}

p {
    margin: 10px 0 20px;
    line-height: 1.5;
    color: #ccc;
}
</style>