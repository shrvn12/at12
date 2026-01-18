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
                const res = await fetch('https://api-dqfspola6q-uc.a.run.app/auth/send-verification-email', {
                    method: 'POST',
                    credentials: 'include',
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
    min-height: 100vh;
    padding: 20px;
    color: white;
}

.verify-card {
    text-align: center;
    background: rgba(20, 20, 20, 0.9);
    padding: 40px 30px;
    border-radius: 12px;
    max-width: 30vw;
    width: 100%;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}

h2 {
    margin-top: 15px;
    font-weight: 600;
    font-size: 1.75rem;
}

p {
    margin: 10px 0 20px;
    line-height: 1.5;
    color: #ccc;
    font-size: 1rem;
}

/* Tablet devices (768px and below) */
@media only screen and (max-width: 768px) {
    .verify-card {
        max-width: 50vw;
        padding: 35px 25px;
    }

    h2 {
        font-size: 1.5rem;
    }

    p {
        font-size: 0.95rem;
    }
}

/* Mobile devices (480px and below) */
@media only screen and (max-width: 480px) {
    .verify-container {
        padding: 15px;
        min-height: 100dvh; /* Use dvh for better mobile support */
    }

    .verify-card {
        max-width: 100%;
        padding: 30px 20px;
        border-radius: 10px;
    }

    .verify-card .v-icon {
        font-size: 40px !important;
    }

    h2 {
        margin-top: 12px;
        font-size: 1.35rem;
    }

    p {
        font-size: 0.9rem;
        margin: 12px 0 20px;
        line-height: 1.6;
    }

    p br {
        display: none;
    }

    .verify-card .v-btn {
        width: 100%;
        font-size: 0.9rem;
    }
}

/* Small mobile devices (360px and below) */
@media only screen and (max-width: 360px) {
    .verify-card {
        padding: 25px 15px;
    }

    .verify-card .v-icon {
        font-size: 36px !important;
    }

    h2 {
        font-size: 1.25rem;
    }

    p {
        font-size: 0.85rem;
    }
}

/* Landscape mobile orientation */
@media only screen and (max-height: 500px) and (orientation: landscape) {
    .verify-container {
        min-height: 100vh;
        align-items: flex-start;
        padding-top: 20px;
    }

    .verify-card {
        padding: 25px 30px;
        margin: 20px auto;
    }

    h2 {
        margin-top: 10px;
    }

    p {
        margin: 8px 0 15px;
    }
}
</style>