<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
    <div class="container">
      <div class="icon">🖥️</div>
      <h1>Desktop Experience Required</h1>
      <p>This website is optimized for desktop and laptop browsers. For the best experience, please visit us from a PC.</p>
      <button @click="refreshPage" class="button">Try Again</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeviceNotice',
  methods: {
    refreshPage() {
      window.location.reload();
    }
  }
}
</script>

<style scoped>
.container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 1rem;
}
h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
  line-height: 1.2;
}
p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  opacity: 0.9;
}
.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ffd700;
}
.button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #ffd700;
  color: #1a1a1a;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s, background 0.2s;
  border: none;
  cursor: pointer;
}
.button:hover {
  transform: translateY(-2px);
  background: #ffca28;
}
@media (max-width: 600px) {
  h1 {
    font-size: 1.5rem;
  }
  p {
    font-size: 1rem;
  }
  .container {
    padding: 1.5rem;
  }
}
</style>