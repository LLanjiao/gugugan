<template>
  <div class="resume-container" ref="resumeContainerRef">
    <!-- 左侧菜单 -->
    <nav class="sidebar">
      <ul>
        <li
          v-for="(item, index) in menu"
          :key="item.id"
          :class="{ active: activeSection === item.id }"
          @click="scrollToSection(item.id)"
        >
          {{ item.title }}
        </li>
      </ul>
    </nav>

    <!-- 右侧内容 -->
    <main class="content">
      <section
        v-for="(item, index) in menu"
        :key="item.id"
        :id="item.id"
        class="section"
      >
        <h2>{{ item.title }}</h2>
        <p v-for="i in 10" :key="i">
          {{ item.title }} 内容 {{ i }}
        </p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const menu = [
  { id: "section1", title: "第一部分" },
  { id: "section2", title: "第二部分" },
  { id: "section3", title: "第三部分" },
  { id: "section4", title: "第四部分" }
];

const activeSection = ref(menu[0].id);
let observer: IntersectionObserver | null = null;

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
};


// 主父容器对象
const resumeContainerRef = ref<HTMLDivElement | null>(null);

const handleMouseMove = (e: MouseEvent) => {
  if (resumeContainerRef.value) {
    resumeContainerRef.value.style.backgroundImage = `radial-gradient(
      circle 350px at ${e.clientX}px ${e.clientY}px,
      rgba(255, 255, 255, 0.05),
      rgba(15, 23, 42, 1) 100%
    )`;
  }
};


onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id;
        }
      });
    },
    { root: null, rootMargin: "0px", threshold: 0.6 }
  );

  menu.forEach((item) => {
    const el = document.getElementById(item.id);
    if (el) observer!.observe(el);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  if (observer) observer.disconnect();
});
</script>

<style scoped>
.resume-container {
  display: flex;
  background-color: rgb(15, 23, 42);
  background-repeat: no-repeat;
  transition: background-image 0.05s linear;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 180px;
  height: 100vh;
  padding: 20px;
  overflow-y: auto;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.sidebar li.active {
  background: #42b983;
  color: white;
  border-radius: 4px;
}

.content {
  color: white;
  margin-left: 200px; /* 给右侧留出左栏宽度 */
  padding: 20px;
  flex: 1;
  height: 100vh; /* 占满屏幕高度 */
  overflow-y: auto; /* 独立滚动 */
}

/* 隐藏滚动条 */
.content::-webkit-scrollbar {
  display: none;
}

.section {
  border-bottom: 1px solid #ddd;
}
</style>
