<template>
    <div class="account-page">
        <div class="heading">
            <v-icon color="#ffffff" style="cursor: pointer;" @click="goBack()">mdi-arrow-left</v-icon>
        </div>

        <div class="profile">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" alt="User Avatar"
                class="avatar" />
            <h2>{{ userStore.user.name }}</h2>
            <p>{{ userStore.user.email }}</p>
        </div>

        <div class="settings">
            <h3>Settings</h3>
            <hr />
            <div class="setting-item" @click="changePassword">Change Password</div>
            <div class="setting-item" @click="dialog = true">Sign Out</div>
        </div>
    </div>

    <!-- Logout Confirmation Dialog -->
    <v-dialog v-model="dialog" max-width="400">
        <v-card style="padding: 4% 2%;" dark color="#121212">
            <v-card-title class="text-h6">Leaving so soon..</v-card-title>
            <v-card-text>Are you sure you want to log out?</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="grey" @click="dialog = false">Cancel</v-btn>
                <v-btn color="red darken-2" dark @click="confirmLogout">Sign Out</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { useToast } from 'vue-toastification';
import { useUserStore } from '../stores/user';

export default {
    name: 'accountComponent',
    setup() {
        const userStore = useUserStore();
        return { userStore };
    },
    data() {
        return {
            toast: useToast(),
            dialog: false,
        };
    },
    beforeMount() {
        if (!this.userStore.user.name) {
            fetch('https://api-dqfspola6q-uc.a.run.app/auth/userInfo', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            }).then(async (res) => {
                res = await res.json();
                if (res.success) {
                    console.log(res);
                    this.userStore.user = res;
                } else {
                    this.$router.replace({ name: 'login' });
                }
            }).catch((err) => {
                console.error('Error fetching user info:', err);
            });
        }
    },
    methods: {
        goBack() {
            if (window.history.state && window.history.state.back) {
                this.$router.back();
            } else {
                this.$router.push({ name: 'home' });
            }
        },
        changePassword() {
            alert('Redirect to Change Password page');
        },
        confirmLogout() {
            this.dialog = false;
            fetch('https://api-dqfspola6q-uc.a.run.app/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(async (res) => {
                    res = await res.json();
                    if (res.success) {
                        this.userStore.user = {};
                        this.$router.replace({ name: 'login' });
                    } else {
                        this.$toast.error('Logout failed. Please try again.');
                        // alert('Logout failed. Please try again.');
                    }
                })
                .catch((err) => {
                    console.error('Error during logout:', err);
                    this.$toast.error('Error during logout. Please try again.');
                    // alert('An error occurred. Please try again.');
                });
            console.log("User logged out");
        }
    },
};
</script>

<style scoped>
.account-page {
    width: 100%;
    height: 100%;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.heading {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
}

.profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* margin-top: 60px; */
    text-align: center;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 10px;
    margin-bottom: 15px;
}

h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
}

p {
    margin-top: 6px;
    font-size: 14px;
    color: #b3b3b3;
}

.settings {
    width: 80%;
    margin-top: 7vh;
    text-align: center;
}

.settings h3 {
    font-size: 16px;
    margin-bottom: 2vh;
    font-weight: 600;
}

hr {
    border: 0;
    border-top: 1px solid #333;
    margin: 2vh 0 3vh;
}

.setting-item {
    font-size: 15px;
    color: #b3b3b3;
    margin: 2vh 0;
    cursor: pointer;
    transition: color 0.2s;
}

.setting-item:hover {
    color: #fff;
}
</style>
