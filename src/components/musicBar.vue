<template>
    <div class='icon'>
        <span></span>
        <span></span>
        <span></span>
    </div>
</template>

<script>
export default {
    name: 'musicBar',
}
</script>

<style scoped>
.icon {
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 13px;
  height: 13px;
}

@keyframes bounce {
  10% {
    transform: scaleY(0.3); /* start by scaling to 30% */
  }

  30% {
    transform: scaleY(1); /* scale up to 100% */
  }

  60% {
    transform: scaleY(0.5); /* scale down to 50% */
  }

  80% {
    transform: scaleY(0.75); /* scale up to 75% */
  }

  100% {
    transform: scaleY(0.6); /* scale down to 60% */
  }
}

span {
  width: 3px;
  height: 100%;
  background-color: orange;
  border-radius: 3px;
  transform-origin: bottom;
  animation: bounce 2.2s ease infinite alternate;
  content: '';
}

span {
  &:nth-of-type(2) {
    animation-delay: -2.2s; /* Start at the end of animation */
  }

  &:nth-of-type(3) {
    animation-delay: -3.7s; /* Start mid-way of return of animation */
  }
}
</style>