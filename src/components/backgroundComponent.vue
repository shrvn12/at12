<template>
    <div class="sky">
        <div id="stars-container">
            <div class="stars-layer slow" id="stars-slow"></div>
            <div class="stars-layer fast" id="stars-fast"></div>
        </div>

        <!-- New layer for shooting stars -->
        <div id="shooting-stars-layer"></div>
    </div>
</template>
<style>

.sky {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: black;
    overflow: hidden;
}

/* Common for both layers */
.stars-layer {
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: center;
}

.star {
    position: absolute;
    background: white;
    border-radius: 50%;
    opacity: 0;
    animation: twinkle ease-in-out forwards;
}

/* Different rotation speeds */
.stars-layer.fast {
    animation: rotateSkyFast 180s linear infinite;
    z-index: 2;
    background-color: transparent;
}

.stars-layer.slow {
    animation: rotateSkySlow 300s linear infinite;
    z-index: 1;
}

@keyframes rotateSkyFast {
    from {
        transform: translate(-50%, -50%) rotate(0deg);
    }

    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

@keyframes rotateSkySlow {
    from {
        transform: translate(-50%, -50%) rotate(0deg);
    }

    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

@keyframes twinkle {
    0% {
        opacity: 0;
    }

    10% {
        opacity: var(--opacity);
    }

    90% {
        opacity: var(--opacity);
    }

    100% {
        opacity: 0;
    }
}

#shooting-stars-layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 1000;
}


.shooting-star {
    position: absolute;
    width: 0.5px;
    height: 50px;
    background: white;
    opacity: 1;
    transform: rotate(45deg);
    animation: shoot 0.5s linear forwards;
}

@keyframes shoot {
    0% {
        opacity: 0;
        transform: translate(0, 0) rotate(45deg);
    }

    10% {
        opacity: 1;
    }

    90% {
        opacity: 0;
        transform: translate(-400px, 400px) rotate(45deg);
    }

    100% {
        opacity: 0;
        transform: translate(-450px, 450px) rotate(45deg);
    }
}
</style>

<script>
export default {
    name: 'backgroundComponent',
    mounted() {
        const fastLayer = document.getElementById("stars-fast");
        const slowLayer = document.getElementById("stars-slow");
        const shootingStarsLayer = document.getElementById("shooting-stars-layer");

        const fastMin = 750;
        const fastMax = 800;
        const slowMin = 500;
        const slowMax = 550;

        let fastCount = 0;
        let slowCount = 0;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const diagonal = Math.sqrt(width ** 2 + height ** 2);

        // Apply diagonal size to both layers
        [fastLayer, slowLayer].forEach(layer => {
            layer.style.width = `${diagonal}px`;
            layer.style.height = `${diagonal}px`;
        });

        function getBiasedSize(isSlow = false) {
            const rand = Math.random();
            if (isSlow) return Math.random() * 0.5 + 0.3; // Smaller for background
            if (rand < 0.7) return Math.random() * 0.5 + 0.5;
            else if (rand < 0.95) return Math.random() * 1 + 1;
            else return Math.random() * 1 + 2.5;
        }

        function createStar(layer, isSlow = false) {
            const count = isSlow ? slowCount : fastCount;
            const max = isSlow ? slowMax : fastMax;
            if (count >= max) return;

            const star = document.createElement("div");
            star.className = "star";

            const x = Math.random() * diagonal;
            const y = Math.random() * diagonal;

            const size = getBiasedSize(isSlow);
            // const opacity = isSlow 
            //   ? (Math.random() * 0.2 + 0.2).toFixed(2) 
            //   : (Math.random() * 0.4 + 0.6).toFixed(2);
            const opacity = (Math.random() * 0.4 + 0.6).toFixed(2);

            const duration = 15 + Math.random() * 15;

            star.style.left = `${x}px`;
            star.style.top = `${y}px`;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.setProperty('--opacity', opacity);
            star.style.animationDuration = `${duration}s`;
            star.style.animationDelay = isSlow ? '1s' : '0s';

            layer.appendChild(star);
            if (isSlow) slowCount++;
            else fastCount++;

            // Cleanup
            setTimeout(() => {
                layer.removeChild(star);
                if (isSlow) slowCount--; else fastCount--;
                createStar(layer, isSlow);
            }, (duration + 1) * 1000);
        }

        // Fill both layers
        for (let i = 0; i < fastMin; i++) createStar(fastLayer, false);
        for (let i = 0; i < slowMin; i++) createStar(slowLayer, true);



        function createShootingStar() {
            const star = document.createElement("div");
            star.className = "shooting-star";

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Wider random spawn box
            const offsetX = 1000;
            const offsetY = 600;

            const startX = centerX + (Math.random() - 0.5) * offsetX;
            const startY = centerY - Math.random() * offsetY; // Always above center

            // const startY = centerY + (Math.random() - 0.5) * offsetY;

            star.style.left = `${startX}px`;
            star.style.top = `${startY}px`;

            shootingStarsLayer.appendChild(star);

            setTimeout(() => {
                shootingStarsLayer.removeChild(star);
            }, 1000);
        }


        // Occasionally add a shooting star every 3–8 seconds
        setInterval(() => {
            if (Math.random() > 0.5) { // 70% chance to show
                createShootingStar();
            }
        }, 5000);
    }
}

</script>