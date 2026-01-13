<template>
    <div class="sky">
        <div class="gradient-layer gradient-layer-1" :style="{ background: gradientStyle1 }"></div>
        <div class="gradient-layer gradient-layer-2" :style="{ background: gradientStyle2, opacity: currentLayer === 2 ? 1 : 0 }"></div>
        <div v-if="imageUrl" class="image-overlay" :style="{ backgroundImage: `url(${imageUrl})` }"></div>
    </div>
</template>

<script>
import { EventBus } from '../eventBus.js';

export default {
    data() {
        return {
            imgUrl: null,
            gradientStyle1: 'linear-gradient(135deg, #051200 0%, #02010d 16.667%, #050a1a 33.333%, #0f1d16 50%, #1f1906 66.667%, #350400 83.333%, #500501 100%)',
            gradientStyle2: 'linear-gradient(135deg, #051200 0%, #02010d 16.667%, #050a1a 33.333%, #0f1d16 50%, #1f1906 66.667%, #350400 83.333%, #500501 100%)',
            defaultGradient: 'linear-gradient(135deg, #051200 0%, #02010d 16.667%, #050a1a 33.333%, #0f1d16 50%, #1f1906 66.667%, #350400 83.333%, #500501 100%)',
            currentLayer: 1
        }
    },
    watch: {
        imageUrl(newUrl) {
            if (newUrl) {
                this.extractColorsAndCreateGradient(newUrl);
            } else {
                this.updateGradient(this.defaultGradient);
            }
        }
    },
    mounted() {
        if (this.imageUrl) {
            this.extractColorsAndCreateGradient(this.imageUrl);
        }
        EventBus.on('update-background', (newImageUrl) => {
            console.log('Received update-background event with URL:', newImageUrl);
            if (newImageUrl && newImageUrl !== this.imageUrl) {
                this.extractColorsAndCreateGradient(newImageUrl);
                this.imageUrl = newImageUrl;
            } else {
                this.gradientStyle = this.defaultGradient;
            }
        });
    },
    methods: {
        updateGradient(newGradient) {
            // Alternate between layers for smooth crossfade
            if (this.currentLayer === 1) {
                this.gradientStyle2 = newGradient;
                this.currentLayer = 2;
            } else {
                this.gradientStyle1 = newGradient;
                this.currentLayer = 1;
            }
        },
        
        extractColorsAndCreateGradient(imageUrl) {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Resize to smaller dimension for faster processing
                    const size = 100;
                    canvas.width = size;
                    canvas.height = size;
                    
                    ctx.drawImage(img, 0, 0, size, size);
                    const imageData = ctx.getImageData(0, 0, size, size);
                    
                    // Extract dominant colors
                    const colors = this.extractDominantColors(imageData.data, 7);
                    
                    // Darken colors for background
                    const darkenedColors = colors.map(color => this.darkenColor(color, 0.7));
                    
                    // Create gradient
                    const gradient = this.createGradient(darkenedColors);
                    this.updateGradient(gradient);
                } catch (error) {
                    console.error('Error extracting colors:', error);
                    this.updateGradient(this.defaultGradient);
                }
            };
            
            img.onerror = () => {
                console.error('Failed to load image');
                this.updateGradient(this.defaultGradient);
            };
            
            img.src = imageUrl;
        },
        
        extractDominantColors(pixelData, numColors) {
            const colorMap = {};
            
            // Sample every 4th pixel for performance
            for (let i = 0; i < pixelData.length; i += 16) {
                const r = pixelData[i];
                const g = pixelData[i + 1];
                const b = pixelData[i + 2];
                const a = pixelData[i + 3];
                
                // Skip transparent pixels
                if (a < 128) continue;
                
                // Quantize colors to reduce variations
                const quantizedR = Math.round(r / 32) * 32;
                const quantizedG = Math.round(g / 32) * 32;
                const quantizedB = Math.round(b / 32) * 32;
                
                const key = `${quantizedR},${quantizedG},${quantizedB}`;
                colorMap[key] = (colorMap[key] || 0) + 1;
            }
            
            // Sort by frequency and get top colors
            const sortedColors = Object.entries(colorMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, numColors)
                .map(([rgb]) => {
                    const [r, g, b] = rgb.split(',').map(Number);
                    return { r, g, b };
                });
            
            // If we didn't get enough colors, fill with variations
            while (sortedColors.length < numColors && sortedColors.length > 0) {
                const baseColor = sortedColors[sortedColors.length % sortedColors.length];
                sortedColors.push(this.varyColor(baseColor));
            }
            
            return sortedColors;
        },
        
        darkenColor(color, amount) {
            return {
                r: Math.round(color.r * (1 - amount)),
                g: Math.round(color.g * (1 - amount)),
                b: Math.round(color.b * (1 - amount))
            };
        },
        
        varyColor(color) {
            return {
                r: Math.max(0, Math.min(255, color.r + (Math.random() - 0.5) * 40)),
                g: Math.max(0, Math.min(255, color.g + (Math.random() - 0.5) * 40)),
                b: Math.max(0, Math.min(255, color.b + (Math.random() - 0.5) * 40))
            };
        },
        
        rgbToHex(r, g, b) {
            return '#' + [r, g, b].map(x => {
                const hex = Math.round(x).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        },
        
        createGradient(colors) {
            const stops = colors.map((color, index) => {
                const position = (index / (colors.length - 1)) * 100;
                const hex = this.rgbToHex(color.r, color.g, color.b);
                return `${hex} ${position.toFixed(3)}%`;
            });
            
            return `linear-gradient(135deg, ${stops.join(', ')})`;
        }
    }
}
</script>

<style scoped>
.sky {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

.gradient-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: opacity 1s ease-in-out;
    will-change: opacity;
}

.sky.transitioning .gradient-layer {
    filter: blur(20px);
}

.gradient-layer-1 {
    z-index: 1;
}

.gradient-layer-2 {
    z-index: 2;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0;
    transition: opacity 1.5s ease-in-out;
    pointer-events: none;
    mask-image: linear-gradient(to right, black 0%, black 70%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, black 0%, black 70%, transparent 100%);
    z-index: 3;
    animation: fadeIn 1s ease-in-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 0.03;
    }
}
</style>