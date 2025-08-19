<template>
  <SceneMode :scene-mode="sceneMode" />
  <div class="menu-circle" @click.self="changeSceneMode">
    <ul :style="{ transform: `rotate(calc(${rotationOffset}deg + ${rotation}deg))`, transition: `transform ${rotationSpeed}s ease` }">
      <li
        v-for="(item, index) in menuList"
        :key="item.id"
        :style="getItemStyle(index)"
        :class="{ 'active-label': index === activeSectionIndex }"
      >
        <div class="menu-label" :style="getItemInnerStyle(index)">
          {{ item.title }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import SceneMode from './SceneMode.vue';
import type { SceneModeType } from './SceneMode.vue';
import { useSettingsStore } from '@/store/settings';

export interface MenuItem {
  id: string;
  title: string;
}

const props = defineProps<{
  menu: MenuItem[];
}>();

const settingsStore = useSettingsStore();
// 菜单列表
const menuList = props.menu;

const rotationSpeed = 0.6 // 旋转速度（秒）
const rotationOffset = 10 // 旋转偏移量（deg）
const radius = 25; // 旋转圆心距离
const angleStep = 360 / menuList.length; // 每一个菜单项的相距角度


const activeSectionIndex = ref(0);
const rotation = ref(0);

// 外层样式：使每个标签基于ul为圆心放射状排列
const getItemStyle = (index: number) => {
  const angle = index * angleStep;
  return {
    // li的旋转中心：指向圆心ul
    transformOrigin: `-${radius}px 50%`,
    // 旋转，让每个菜单项中心线交于圆心，形成放射装
    transform: `translate(${radius}px, -50%) rotate(${angle}deg)`,
  };
};

// 内层样式：控制二次旋转，让原本放射状的标签文字始终保持横向排列
const getItemInnerStyle = (index: number) => {
  // 二次旋转角度
  const extraAngle = (activeSectionIndex.value - index) * angleStep;
  return {
    transition: `transform ${rotationSpeed}s ease`,
    // 二次旋转的原点，自身中心
    transformOrigin: '50% 50%',
    // 二次旋转：绕新原点旋转，由于第0项相对x轴做偏转，这边要计算反向偏转
    transform: `rotate(calc(${extraAngle}deg - ${rotationOffset}deg))`,
    display: 'inline-block', // 确保transform生效
  };
};

// 切换菜单
const changeMenu = (menuId: string) => {
  const itemIndex = menuList.findIndex((menuItem) => menuItem.id === menuId);
  rotation.value = -itemIndex * angleStep;
  activeSectionIndex.value = itemIndex;
}

// 黑暗模式
const sceneMode = ref<SceneModeType>(settingsStore.sceneMode)
const changeSceneMode = () => {
  sceneMode.value = sceneMode.value === 'night' ? 'day' : 'night';
  settingsStore.sceneMode = sceneMode.value;
}

defineExpose({
  changeMenu
})
</script>

<style scoped>
/* 旋转菜单根容器 */
.menu-circle {
  position: fixed;
  top: -2px;
  left: -2px;
  width: 50px;
  height: 50px;
  border-bottom-right-radius: 100%;
  cursor: pointer;
}

/* 旋转圆心，位于容器中心 */
.menu-circle ul {
  position: absolute;
  left: 50%;
  top: 50%;
  list-style: none;
  padding: 0;
  margin: 0;
  /* 让ul的中心与.menu-circle的中心重合 */
  transform: translate(-50%, -50%);
  cursor: default;
}

/* 菜单项的外层容器，控制每一项旋转与消失 */
.menu-circle li {
  opacity: 0;
  position: absolute;
  transition: opacity 0.5s ease;
}

.menu-circle .active-label {
  opacity: 1;
  transition: opacity 0.5s ease;
}

/* 菜单项的内层容器，菜单项样式 */
.menu-circle .menu-label {
  font-size: 26px;
  padding: 5px 10px;
  border-radius: 4px;
  white-space: nowrap;
}
</style>