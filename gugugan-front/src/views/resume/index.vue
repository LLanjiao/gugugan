<template>
  <div
    class="resume-container"
    :class="settingsStore.sceneMode === 'night' ? 'night-mode' : 'day-mode'"
    ref="resumeContainerRef">
    <RotateMenu ref="rotateMenuRef" :menu="menu" />

    <!-- 项目信息栏 -->
    <main class="w-full px-[10%]">
      <!-- 各个项目 -->
      <section
        :key="0"
        :id="menu[0].id"
        class="project-section">
        <div class="project-left">
          <div class="intro">{{ menu[0].title }}</div>
        </div>

        <div class="project-right">
          <div class="w-[100%] h-[100%] flex flex-col justify-center items-center">
            <h1>王永钦</h1>
            <h2>2002.05</h2>
          </div>
        </div>
      </section>
      <section
        :key="1"
        :id="menu[1].id"
        class="project-section">
        <AiGateway />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import RotateMenu from "./RotateMenu.vue";
import AiGateway from "./AiGateway.vue";
import { useSettingsStore } from "@/store/settings";

export interface MenuItem {
  id: string;
  title: string;
}
const menu = [
  { id: "info", title: "个人简介" },
  { id: "project", title: "AI大模型门户系统" }
] as MenuItem[];

const settingsStore = useSettingsStore();
// 主父容器对象
const resumeContainerRef = ref<HTMLDivElement | null>(null);
// 菜单对象
const rotateMenuRef = ref<InstanceType<typeof RotateMenu>>();

// 鼠标位置全局保存
let mouseX = 0;
let mouseY = 0;

// 监听鼠标位置，在鼠标位置上显示透明背景
const updateLight = () => {
  if (resumeContainerRef.value) {
    resumeContainerRef.value.style.backgroundImage = `radial-gradient(
      circle 350px at ${mouseX}px ${mouseY + window.scrollY}px,
      rgba(255, 255, 255, 0.05),
      rgba(15, 23, 42, 1) 100%
    )`;
  };
}

// 鼠标移动时更新位置
const handleMouseMove = (e: MouseEvent) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  updateLight();
}

// 滚动时更新背景光位置
const handleScroll = () => {
  updateLight();
}

// 监听 mode 变化
watch(
  () => settingsStore.sceneMode,
  (mode) => {
    if (mode === 'night') {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener("scroll", handleScroll, { passive: true });
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      // 切换到白天时，顺便清除背景光效
      if (resumeContainerRef.value) {
        resumeContainerRef.value.style.backgroundImage = '';
      }
    }
  },
  { immediate: true }
);

// 监听项目占比，切换时切换菜单
let menuObserver: IntersectionObserver | null = null;
const addMenuObserver = () => {
  menuObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 切换菜单
        if (rotateMenuRef.value) {
          rotateMenuRef.value.changeMenu(entry.target.id);
        }
      }
    });
  },
  {
    root: null,
    rootMargin: "0px",
    threshold: 0.6
  });

  menu.forEach((item) => {
    const el = document.getElementById(item.id);
    if (el) menuObserver!.observe(el);
  });
};

// 观察所有 "fade-in-up" 类,第一次进入视口时将其添加 "visible" 类
let fadeInObserver: IntersectionObserver | null = null;
const addFadeInObserver = () => {
  fadeInObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeInObserver!.unobserve(entry.target); // 只触发一次
        }
      })
    },
    {
      threshold: 0.6 // 元素有 40% 进入视口就触发
    }
  );

  document.querySelectorAll('.fade-in-up').forEach(el => {
    fadeInObserver!.observe(el);
  });
  document.querySelectorAll('.fade-in-left-right').forEach(el => {
    fadeInObserver!.observe(el);
  });
}

onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("scroll", handleScroll, { passive: true });
  addMenuObserver();

  addFadeInObserver();
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("scroll", handleScroll);
  if (menuObserver) {
    menuObserver.disconnect();
  };
  if (fadeInObserver) {
    fadeInObserver.disconnect();
  };
});
</script>

<style lang="css">
/* 根容器通用样式 */
.resume-container {
  background-repeat: no-repeat;
  transition:
    background-image 0.05s linear,
    background-color 1s ease,
    color 0.5s ease;

  background-color: var(--bg-color);
  color: var(--text-color);
}

/* 所有子元素的边框颜色使用变量 */
.resume-container * {
  border-color: var(--border-color);
}

/* 暗黑模式变量覆盖 */
.night-mode {
  --bg-color: rgb(15, 23, 42);
  --text-color: white;
  --border-color: white;
}

/* 日间模式变量覆盖 */
.day-mode {
  --bg-color: white;
  --text-color: black;
  --border-color: black;
}

.project-section {
  display: flex;
  box-sizing: border-box;
  align-items: stretch;
}

.project-section .project-left {
  width: 50%;
}

.project-left .intro {
  position: sticky;
  top: 0;
  height: 100vh;
  padding-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-section .project-right {
  flex: 1 1 0%;
}

.project-right::-webkit-scrollbar {
  display: none; /* 隐藏滚动条 */
}

/* 后进入类 */
/* 自下到上进入 */
.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1.5s ease, transform 1.5s ease;
}

.fade-in-up.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 自左到右进入 */
.fade-in-left-right {
  opacity: 0;
  transform: translateX(-30px);
  transition: opacity 1.5s ease, transform 1.5s ease;
}

.fade-in-left-right.visible {
  opacity: 1;
  transform: translateX(0);
}
</style>
