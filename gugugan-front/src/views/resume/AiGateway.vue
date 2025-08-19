<template>
  <div class="ai-gateway-container" ref="containerRef">
    <div class="project-left">
      <div class="intro">
        <nav class="menu fade-in-left-right">
          <div
            v-for="(project, index) in projects"
            :key="project.id"
            :class="[
              'menu-item',
              { active: currentIndex === index }
            ]"
            @click="scrollToProject(index)"
          >
            <div class="menu-item-title">
              <span class="nav-indicator"></span>
              <span class="menu-title">{{ project.title }}</span>
            </div>
            <div class="menu-item-content">
              {{ project.introduce }}
            </div>
          </div>
        </nav>
      </div>
    </div>

    <div class="project-right">
      <div
        class="display-area"
        ref="displayAreaRef"
      >
        <div class="cards-container fade-in-up" ref="cardsContainerRef">
          <div
            v-for="(project, index) in projects"
            :key="project.id"
            class="project-card"
            :ref="el => cardRefs[index] = el as HTMLElement"
          >
            <div class="card-content">
              <video
                class="custom-video"
                :src="project.video"
                autoplay
                loop
                muted
                playsinline
              >
                您的浏览器不支持HTML5视频播放
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref } from 'vue'

// 如果项目中已安装 gsap，请取消注释下面这行
import { gsap } from 'gsap'

/** AI门户项目展示逻辑 */
interface Project {
  id: number
  title: string
  introduce: string
  video: string
}

// 项目数据列表
const projects: Project[] = [
  {
    id: 1,
    title: "通用渲染",
    introduce: "大模型回复的通用渲染，支持各种markdown语法渲染，包括表格、标题、代码块等",
    video: "/通用渲染.mp4",
  },
  {
    id: 2,
    title: "题目组渲染",
    introduce: "根据大模型回复的题目组，渲染为题目组，支持选择题与判断题，允许进行在线考试与判题",
    video: "/题目组渲染.mp4",
  },
  {
    id: 3,
    title: "Echart渲染",
    introduce: "将大模型回复的数据渲染为Echart，为智能问数功能提供更好的可视化效果",
    video: "/Echart.mp4",
  },
  {
    id: 4,
    title: "生成文档",
    introduce: "智能体使用约定的格式输出内容，将指定内容生成为docx文件",
    video: "/生成文档.mp4",
  },
  {
    id: 5,
    title: "双端操作支持",
    introduce: "为智能体聊天提供双端操作支持，支持在桌面端与移动端进行交互",
    video: "/双端操作支持.mp4",
  }
]

// 响应式数据
const containerRef = ref<HTMLElement>()
const displayAreaRef = ref<HTMLElement>()
const cardsContainerRef = ref<HTMLElement>()
const cardRefs = ref<HTMLElement[]>([])

const scrollProgress = ref(0)
const currentIndex = computed(() => Math.floor(scrollProgress.value))

// 滚动控制状态
const isScrollLocked = ref(false)
const isInViewport = ref(false)
let isAnimating = false

// 全局滚动监听
const handleGlobalWheel = (event: WheelEvent) => {
  if (!containerRef.value) return
  
  // 获取容器的视口位置和尺寸信息
  const rect = containerRef.value.getBoundingClientRect()
  const windowHeight = window.innerHeight
  
  // 检查组件高度是否大于视口
  const componentHeight = rect.bottom - rect.top
  const isComponentTallerThanViewport = componentHeight > windowHeight

  // 检查组件是否完全在视口范围内
  const isInViewportRange = isComponentTallerThanViewport 
    ? (rect.top <= 0 && rect.bottom >= windowHeight) // 如果大于视口，组件顶部高于视口顶部 && 底部要低于视口底部
    : (rect.top >= 0 && rect.bottom <= windowHeight)  // 如果小于视口，则组件顶部低于视口顶部 && 底部要高于视口底部
  // 检查鼠标是否在视口范围内
  const isMouseInContainer = event.clientY >= rect.top && event.clientY <= rect.bottom
  
  // 只有当鼠标在组件内且组件在视口范围内时才处理，如果不在，则解锁全局滚动并返回
  if (!isMouseInContainer || !isInViewportRange) {
    // 确保解锁全局滚动
    unlockScroll()
    return
  }
  
  // 检查滚动方向和边界
  const scrollingDown = event.deltaY > 0
  const scrollingUp = event.deltaY < 0
  
  // 边界检测
  const isAtTop = scrollProgress.value <= 0
  const isAtBottom = scrollProgress.value >= projects.length - 1
  
  // 检查是否滚动到边界，是则解锁全局滚动
  if (scrollingUp && isAtTop) {
    // 向上滚动且已到顶部，允许离开组件
    unlockScroll()
    return
  }
  
  if (scrollingDown && isAtBottom) {
    // 向下滚动且已到底部，允许继续向下
    unlockScroll()
    return
  }
  
  // 在组件内部且未到边界时，阻止默认滚动并处理组件滚动
  event.preventDefault()
  handleComponentScroll(event)
}

// 组件内部滚动处理
const handleComponentScroll = (event: WheelEvent) => {
  if (isAnimating) return
  
  // 手动控制滚动速度
  const delta = event.deltaY > 0 ? 0.15 : -0.15
  const newProgress = scrollProgress.value + delta
  
  // 锁定全局滚动（只在组件内部滚动时）
  lockScroll()
  
  // 限制滚动范围
  const clampedProgress = Math.max(0, Math.min(projects.length - 1, newProgress))
  
  // 到达边界时，延迟解锁以允许滚出
  if (newProgress < 0 || newProgress > projects.length - 1) {
    setTimeout(() => {
      if ((newProgress < 0 && event.deltaY < 0) || 
          (newProgress > projects.length - 1 && event.deltaY > 0)) {
        unlockScroll()
      }
    }, 150)
  }
  
  scrollProgress.value = clampedProgress
  updateCardsAnimation(scrollProgress.value)
}

// 改进的锁定/解锁机制
let scrollLockTimeout: number | null = null

// 锁定滚动事件
const lockScroll = () => {
  if (!isScrollLocked.value) {
    isScrollLocked.value = true
    document.body.style.overflow = 'hidden'
  }
  
  // 清除之前的解锁定时器
  if (scrollLockTimeout) {
    clearTimeout(scrollLockTimeout)
  }
}

// 解锁滚动
const unlockScroll = () => {
  // 添加防抖，避免频繁切换
  if (scrollLockTimeout) {
    clearTimeout(scrollLockTimeout)
  }
  
  scrollLockTimeout = setTimeout(() => {
    if (isScrollLocked.value) {
      isScrollLocked.value = false
      document.body.style.overflow = ''
    }
  }, 50)
}


// 优化的视口检测
const checkViewportStatus = () => {
  if (!containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  const windowHeight = window.innerHeight
  
  // 检测组件是否完全在视口内
  const threshold = 0 
  const isInViewportRange = rect.top >= 0 && rect.bottom <= windowHeight
  
  isInViewport.value = isInViewportRange
  
  // 组件完全离开视口时的处理
  if (!isInViewportRange) {
    unlockScroll()
    
    // 重置滚动进度的逻辑更加精确
    if (rect.top > windowHeight) {
      // 组件在下方，重置到开始
      scrollProgress.value = 0
      updateCardsAnimation(0)
    } else if (rect.bottom < 0) {
      // 组件在上方，设置到结束
      scrollProgress.value = projects.length - 1
      updateCardsAnimation(projects.length - 1)
    }
  }
}

// 监听全局滚动位置变化
const handleGlobalScroll = () => {
  checkViewportStatus()
}

// 更新卡片位置和透明度
const updateCardsAnimation = (progress: number) => {
  // 当前卡片的索引
  const currentIdx = Math.floor(progress)
  // 即将进入的卡片的索引
  const nextIdx = Math.min(currentIdx + 1, projects.length - 1)
  // 下一个卡片的移动量
  let interpolation = progress - currentIdx
  // 增加一个活跃区间检测，只有在0.25到0.75之间才进行动画
  if (interpolation < 0.25) {
    interpolation = 0
  } else if (interpolation > 0.75) {
    interpolation = 1
  }

  cardRefs.value.forEach((card, index) => {
    if (index < currentIdx) {
      // 已经过去的卡片
      gsap.to(card, {
        y: -30,
        opacity: 0,
        zIndex: 1,
        scale: 0.8,
        duration: 0.1
      })
    } else if (index === currentIdx) {
      // 当前卡片
      gsap.to(card, {
        y: -interpolation * 30,
        opacity: 1 - interpolation,
        zIndex: 9,
        scale: 1 - interpolation * 0.05,
        duration: 0.3
      })
    } else if (index === nextIdx && interpolation > 0) {
      // 下一张正在进入的卡片
      gsap.to(card, {
        y: 200 - interpolation * 200,
        opacity: Math.min(1, 0.5 + interpolation),
        zIndex: 10,
        scale: 0.8 + interpolation * 0.1,
        duration: 0.3
      })
    } else {
      // 还未到达的卡片
      gsap.to(card, {
        y: 200,
        opacity: 0,
        zIndex: 1,
        scale: 0.8,
        duration: 0.3
      })
    }
  })
}

// 点击菜单项滚动到对应项目
const scrollToProject = (index: number) => {
  if (isAnimating) return
  
  isAnimating = true
  lockScroll()
  
  // 简化的滚动动画
  const startProgress = scrollProgress.value
  const targetProgress = index
  const duration = 800
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 缓动函数
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    
    scrollProgress.value = startProgress + (targetProgress - startProgress) * easeProgress
    updateCardsAnimation(scrollProgress.value)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isAnimating = false
    }
  }
  
  requestAnimationFrame(animate)
}


onMounted(() => {
  nextTick(() => {
    // 添加全局事件监听
    window.addEventListener('wheel', handleGlobalWheel, { passive: false })
    window.addEventListener('scroll', handleGlobalScroll, { passive: true })
    
    // 初始检查视口状态
    checkViewportStatus()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', handleGlobalWheel)
  window.removeEventListener('scroll', handleGlobalScroll)
  
  if (scrollLockTimeout) {
    clearTimeout(scrollLockTimeout)
  }
  
  // 确保解锁滚动
  if (isScrollLocked.value) {
    isScrollLocked.value = false
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* 容器样式 */
.ai-gateway-container {
  display: flex;
  width: 100%;
  height: 100vh; /* 确保有明确的高度 */
  min-height: 600px; /* 最小高度 */
}

/* 重写布局样式以避免冲突，由于有视频，这里采用4：6布局 */
.ai-gateway-container .project-left {
  width: 40%;
  padding-right: 20px;
}

.ai-gateway-container .project-right {
  flex: 1;
  height: 100%; /* 确保高度继承 */
}

/* 重写菜单容器 */
.ai-gateway-container .intro {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: start;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 菜单项目样式 */
.menu-item {
  display: flex;
  flex-direction: column;
  gap: 15px;
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.menu-item:hover {
  opacity: 1;
  color: var(--text-color);
}

.menu-item.active {
  opacity: 1;
  color: var(--text-color);
}

.menu-item-title {
  display: flex;
  align-items: center;
}

/* 突出高亮线 */
.nav-indicator {
  display: inline-block;
  margin-right: 1rem;
  height: 1px;
  width: 2rem;
  background-color: var(--text-color);
  transition: all 0.2s;
}

.menu-item:hover .nav-indicator {
  width: 4rem;
  background-color: var(--text-color);
}

.menu-item.active .nav-indicator {
  width: 4rem;
  background-color: var(--text-color);
}

/* 菜单标题 */
.menu-title {
  font-size: 16px;
  font-weight: 500;
}

/* 菜单内容 */
.menu-item-content {
  display: none;
}

.menu-item.active .menu-item-content {
  display: block;
}

/* 右侧展示栏 - 关键修复 */
.display-area {
  position: relative;
  width: 100%;
  height: 100vh; /* 明确设置高度 */
}

/* 卡片容器 */
.cards-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.project-card {
  /* 毛玻璃效果 */
  backdrop-filter: blur(20px);
  background-color: rgba(255, 255, 255, 0.2);
  /* 边框增强 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  border-radius: 20px;
  position: absolute;
  margin-left: 5px;
  margin-right: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.card-content {
  padding: 5px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 视频播放器样式 */
.custom-video {
  width: 100%;
  height: auto;
  border-radius: 12px;
}
</style>