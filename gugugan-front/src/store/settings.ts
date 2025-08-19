import { defineStore } from 'pinia'

export type SceneModeType = "day" | "night";

export const useSettingsStore = defineStore('settings', {
  state: () => {
    return {
      // 侧边栏宽度
      sidebarWidth: '200px',
      // 黑暗模式
      sceneMode: 'night' as SceneModeType
    }
  }
})