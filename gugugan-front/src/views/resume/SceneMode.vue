<template>
  <div class="rotate-center">
    <div class="day-scene"
      :style="{ transform: `translate(calc(${rotateRadius}px - 50%), -50%) ${sceneMode === 'day' ? 'rotate(45deg)' : 'rotate(225deg)'}` }">
      <div class="sun"></div>
    </div>
    <div class="night-scene"
      :style="{ transform: `translate(calc(${rotateRadius}px - 50%), -50%) ${sceneMode === 'night' ? 'rotate(45deg)' : 'rotate(225deg)'}` }">
      <div class="moon"></div>
    </div>
    <!-- 白云星星组件 -->
    <transition name="slide" mode="out-in">
      <div v-if="sceneMode === 'night'" key="stars" class="stars-scene">
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
      </div>
      <div v-else key="clouds" class="clouds-scene">
        <div class="cloud cloud1"></div>
        <div class="cloud cloud2"></div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
const rotateRadius = 100;

const props = defineProps<{
  sceneMode: SceneModeType;
}>();

export type SceneModeType = "day" | "night";
</script>

<style scoped>
.rotate-center {
  position: fixed;
  top: -60px;
  left: -60px;
}

.day-scene {
  position: absolute;
  transform-origin: calc(-100px + 50%) 50%;
  transition: transform 1s ease;
  cursor: pointer;
}

.sun {
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, #FFD700 0%, #FFA500 70%, #FF8C00 100%);
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  animation: sunGlow 2s ease-in-out infinite alternate;
}

.sun::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: sunRotate 10s linear infinite;
}

/* 太阳呼吸动画 */
@keyframes sunGlow {
  0% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.6); }
  100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 165, 0, 0.4); }
}

@keyframes sunRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.night-scene {
  position: absolute;
  transform-origin: calc(-100px + 50%) 50%;
  transition: transform 1s ease;
  cursor: pointer;
}

.moon {
  width: 60px;
  height: 60px;
  background: #F5F5DC;
  border-radius: 50%;
  position: relative;
  margin: 0 auto;
  box-shadow: 0 0 15px rgba(245, 245, 220, 0.5);
}

.moon::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  width: 8px;
  height: 8px;
  background: #D3D3D3;
  border-radius: 50%;
  box-shadow: 
    15px 8px 0 -2px #D3D3D3,
    25px 5px 0 -3px #BEBEBE,
    8px 20px 0 -3px #BEBEBE,
    20px 22px 0 -1px #D3D3D3,
    30px 18px 0 -4px #C0C0C0;
}

.stars-scene {
  position: absolute;
  width: 80px;
  height: 80px;
  transform: translate(calc(70px - 50%), calc(70px + -50%));
}

.clouds-scene {
  position: absolute;
  width: 80px;
  height: 80px;
  transform: translate(calc(70px - 50%), calc(70px + -50%));
}

/* 白云星星组件进入/离开动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

/* 进入：从左进 */
.slide-enter-from {
  transform: translate(calc(70px - 150%), calc(70px + -50%));
  opacity: 0;
}
.slide-enter-to {
  transform: translate(calc(70px - 50%), calc(70px + -50%));
  opacity: 1;
}

/* 离开：向右退 */
.slide-leave-from {
  transform: translate(calc(70px - 50%), calc(70px + -50%));
  opacity: 1;
}
.slide-leave-to {
  transform: translate(calc(70px - 150%), calc(70px + -50%));
  opacity: 0;
}

.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50px;
  opacity: 0.6;
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50px;
}

.cloud1 {
  width: 40px;
  height: 15px;
  bottom: 25%;
  left: 10%;
  animation: float 4s ease-in-out infinite;
}

.cloud1::before {
  width: 25px;
  height: 25px;
  top: -10px;
  left: 5px;
}

.cloud1::after {
  width: 30px;
  height: 20px;
  top: -8px;
  right: 5px;
}

.cloud2 {
  width: 30px;
  height: 12px;
  bottom: 15%;
  right: 15%;
  animation: float 5s ease-in-out infinite reverse;
}

.cloud2::before {
  width: 20px;
  height: 20px;
  top: -8px;
  left: 3px;
}

.cloud2::after {
  width: 25px;
  height: 16px;
  top: -6px;
  right: 3px;
}

/* 白云浮动动画 */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

/* 星星 */
.star {
  position: absolute;
  background: #FFF;
  /* 剪裁 */
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: twinkle 2s ease-in-out infinite alternate;
}

.star:nth-child(1) {
  width: 8px;
  height: 8px;
  top: 90%;
  left: 70%;
  animation-delay: 1s;
}

.star:nth-child(2) {
  width: 6px;
  height: 6px;
  top: 110%;
  left: 50%;
  animation-delay: 0.5s;
}

.star:nth-child(3) {
  width: 7px;
  height: 7px;
  top: 55%;
  left: 95%;
  animation-delay: 1s;
}

.star:nth-child(4) {
  width: 5px;
  height: 5px;
  top: 45%;
  left: 115%;
  animation-delay: 1.5s;
}

.star:nth-child(5) {
  width: 5px;
  height: 5px;
  top: 95%;
  left: 40%;
  animation-delay: 2s;
}

/* 闪烁动画 */
@keyframes twinkle {
  0% { opacity: 0.3; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.2); }
}
</style>