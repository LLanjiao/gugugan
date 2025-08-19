<template>
  <div class="project-showcase">
    <!-- 左侧菜单栏 -->
    <div class="sidebar">
      <nav class="menu">
        <div
          v-for="(project, index) in projects"
          :key="project.id"
          :class="[
            'menu-item',
            { active: currentIndex === index }
          ]"
          @click="scrollToProject(index)"
          :ref="el => menuItemRefs[index] = el as HTMLElement"
        >
          <span class="menu-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="menu-title">{{ project.title }}</span>
        </div>
      </nav>
    </div>

    <!-- 右侧展示栏 -->
    <div
      class="display-area"
      ref="displayAreaRef"
      @wheel="handleWheel"
    >
      <div class="cards-container" ref="cardsContainerRef">
        <div
          v-for="(project, index) in projects"
          :key="project.id"
          class="project-card"
          :ref="el => cardRefs[index] = el as HTMLElement"
        >
          <div class="card-content">
            <h2 class="project-title">{{ project.title }}</h2>
            <p class="project-description">{{ project.description }}</p>
            <div class="project-tags">
              <span
                v-for="tag in project.tags"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
            <div class="project-meta">
              <span class="project-date">{{ project.date }}</span>
              <span class="project-status">{{ project.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { gsap } from 'gsap'

interface Project {
  id: number
  title: string
  description: string
  tags: string[]
  date: string
  status: string
}

// 项目数据
const projects: Project[] = [
  {
    id: 1,
    title: "智能数据分析平台",
    description: "基于人工智能的大数据分析平台，提供实时数据处理、可视化分析和智能预测功能。支持多种数据源接入，具备强大的数据挖掘能力。",
    tags: ["Vue3", "Python", "AI", "大数据"],
    date: "2024.01",
    status: "已完成"
  },
  {
    id: 2,
    title: "移动端电商应用",
    description: "现代化的移动电商解决方案，具备完整的购物流程、支付系统和用户管理功能。采用响应式设计，支持多平台部署。",
    tags: ["React Native", "Node.js", "MongoDB"],
    date: "2024.03",
    status: "进行中"
  },
  {
    id: 3,
    title: "企业级CMS系统",
    description: "功能强大的内容管理系统，支持多站点管理、权限控制和内容工作流。提供丰富的API接口和插件扩展机制。",
    tags: ["Vue3", "TypeScript", "Express", "MySQL"],
    date: "2024.05",
    status: "规划中"
  },
  {
    id: 4,
    title: "实时协作编辑器",
    description: "支持多人实时协作的在线文档编辑器，具备版本控制、评论系统和富文本编辑功能。采用WebSocket实现实时同步。",
    tags: ["React", "WebSocket", "Redis", "Docker"],
    date: "2024.07",
    status: "已完成"
  }
]

// 响应式数据
const displayAreaRef = ref<HTMLElement>()
const cardsContainerRef = ref<HTMLElement>()
const cardRefs = ref<HTMLElement[]>([])
const menuItemRefs = ref<HTMLElement[]>([])

const scrollProgress = ref(0)
const currentIndex = computed(() => Math.floor(scrollProgress.value))

// GSAP时间轴
let tl: gsap.core.Timeline | null = null
let isAnimating = false

// 初始化GSAP动画
const initGSAPAnimations = () => {
  if (!cardRefs.value.length) return

  // 设置初始状态
  cardRefs.value.forEach((card, index) => {
    if (index === 0) {
      gsap.set(card, {
        y: 0,
        opacity: 1,
        zIndex: 10,
        scale: 1
      })
    } else {
      gsap.set(card, {
        y: 100,
        opacity: 0,
        zIndex: 1,
        scale: 0.95
      })
    }
  })

  // 设置菜单项初始状态
  menuItemRefs.value.forEach((item, index) => {
    if (index !== 0) {
      gsap.set(item, {
        opacity: 0.7,
        x: 0
      })
    }
  })
}

// 更新卡片位置和透明度
const updateCardsAnimation = (progress: number) => {
  const currentIdx = Math.floor(progress)
  const nextIdx = Math.min(currentIdx + 1, projects.length - 1)
  const interpolation = progress - currentIdx

  cardRefs.value.forEach((card, index) => {
    if (index < currentIdx) {
      // 已经过去的卡片
      gsap.to(card, {
        y: -100,
        opacity: 0,
        zIndex: 1,
        scale: 0.9,
        duration: 0.3,
        ease: "power2.out"
      })
    } else if (index === currentIdx) {
      // 当前卡片
      gsap.to(card, {
        y: -interpolation * 100,
        opacity: 1 - interpolation * 0.3,
        zIndex: 10,
        scale: 1 - interpolation * 0.05,
        duration: 0.1,
        ease: "none"
      })
    } else if (index === nextIdx && interpolation > 0) {
      // 下一张正在进入的卡片
      gsap.to(card, {
        y: 100 - interpolation * 100,
        opacity: interpolation,
        zIndex: 9,
        scale: 0.95 + interpolation * 0.05,
        duration: 0.1,
        ease: "none"
      })
    } else {
      // 还未到达的卡片
      gsap.to(card, {
        y: 100,
        opacity: 0,
        zIndex: 1,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.out"
      })
    }
  })

  // 更新菜单高亮
  updateMenuHighlight(progress)
}

// 更新菜单高亮
const updateMenuHighlight = (progress: number) => {
  const currentIdx = Math.floor(progress)
  
  menuItemRefs.value.forEach((item, index) => {
    if (index === currentIdx) {
      gsap.to(item, {
        x: 10,
        opacity: 1,
        scale: 1.02,
        duration: 0.4,
        ease: "back.out(1.7)"
      })
    } else {
      gsap.to(item, {
        x: 0,
        opacity: 0.7,
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      })
    }
  })
}

// 处理滚轮事件
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  
  if (isAnimating) return
  
  const delta = event.deltaY > 0 ? 0.15 : -0.15
  const newProgress = scrollProgress.value + delta
  
  // 限制滚动范围，添加弹性效果
  const clampedProgress = Math.max(0, Math.min(projects.length - 1, newProgress))
  
  // 如果超出边界，添加轻微的弹性动画
  if (newProgress < 0 || newProgress > projects.length - 1) {
    const currentCard = cardRefs.value[clampedProgress === 0 ? 0 : projects.length - 1]
    if (currentCard) {
      gsap.to(currentCard, {
        scale: 1.02,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      })
    }
  }
  
  scrollProgress.value = clampedProgress
  updateCardsAnimation(scrollProgress.value)
}

// 点击菜单项滚动到对应项目
const scrollToProject = (index: number) => {
  if (isAnimating) return
  
  isAnimating = true
  
  gsap.to({ progress: scrollProgress.value }, {
    progress: index,
    duration: 0.8,
    ease: "power2.inOut",
    onUpdate: function() {
      scrollProgress.value = this.targets()[0].progress
      updateCardsAnimation(scrollProgress.value)
    },
    onComplete: () => {
      isAnimating = false
    }
  })
}

// 添加入场动画
const playEntranceAnimation = () => {
  // 卡片入场动画
  gsap.fromTo(cardRefs.value[0], 
    { 
      scale: 0.8, 
      opacity: 0, 
      rotationY: -15 
    },
    {
      scale: 1,
      opacity: 1,
      rotationY: 0,
      duration: 1.2,
      ease: "back.out(1.7)"
    }
  )

  // 菜单项依次入场
  gsap.fromTo(menuItemRefs.value,
    {
      x: -50,
      opacity: 0
    },
    {
      x: 0,
      opacity: 0.7,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      delay: 0.3
    }
  )

  // 第一个菜单项高亮
  gsap.to(menuItemRefs.value[0], {
    x: 10,
    opacity: 1,
    scale: 1.02,
    duration: 0.4,
    ease: "back.out(1.7)",
    delay: 0.8
  })
}

onMounted(() => {
  nextTick(() => {
    initGSAPAnimations()
    // 添加入场动画延迟，让用户看到效果
    setTimeout(() => {
      playEntranceAnimation()
    }, 200)
  })
})
</script>

<style scoped>
.project-showcase {
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* 左侧菜单栏 */
.sidebar {
  width: 300px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 40px 20px;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  border-radius: 12px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: background-color 0.3s ease;
  will-change: transform, opacity;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.8);
}

.menu-item.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.menu-index {
  font-size: 18px;
  font-weight: bold;
  opacity: 0.7;
}

.menu-item.active .menu-index {
  opacity: 0.9;
}

.menu-title {
  font-size: 16px;
  font-weight: 500;
}

/* 右侧展示栏 */
.display-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  perspective: 1000px;
}

.cards-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-card {
  position: absolute;
  width: 50%;
  height: 50%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  will-change: transform, opacity;
}

.card-content {
  padding: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.project-title {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 20px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.project-description {
  font-size: 16px;
  line-height: 1.6;
  color: #555;
  margin: 0 0 25px 0;
  flex-grow: 1;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
}

.tag {
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.project-date {
  font-size: 14px;
  color: #666;
}

.project-status {
  padding: 4px 12px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-showcase {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .menu {
    flex-direction: row;
    overflow-x: auto;
    gap: 10px;
  }
  
  .menu-item {
    flex-shrink: 0;
    min-width: 200px;
  }
  
  .display-area {
    height: 70vh;
  }
  
  .project-card {
    width: 80%;
    height: 60%;
  }
  
  .card-content {
    padding: 20px;
  }
  
  .project-title {
    font-size: 24px;
  }
  
  .project-description {
    font-size: 14px;
  }
}
</style>