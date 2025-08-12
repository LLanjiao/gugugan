import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

export const DirectionKey = {
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  None: ''
} as const

export type DirectionKeyType = typeof DirectionKey[keyof typeof DirectionKey]

/**
 * 监听键盘方向键
 * @param onChange 回调函数（每次按键都会触发）
 * @returns direction 方向
 */
export function useKeyDirection(onChange?: (newDir: DirectionKeyType) => void) {
  const direction = ref<DirectionKeyType>(DirectionKey.None)

  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      e.key === DirectionKey.ArrowUp ||
      e.key === DirectionKey.ArrowDown ||
      e.key === DirectionKey.ArrowLeft ||
      e.key === DirectionKey.ArrowRight
    ) {
      direction.value = e.key as DirectionKeyType
      // 每次按键都会触发回调
      onChange?.(direction.value)
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    direction
  }
}