<template>
  <div class="container">
    <div class="game-map">
      <div
        v-for="item in mapItems"
        :key="item.id"
        class="item game-data"
        :style="{
          transform: `translate(${item.x * 60}px, ${item.y * 60}px)`,
        }"
      >
        {{ item.value }}
      </div>
      <!-- 背景 -->
      <div
        v-for="item in mapBgItems"
        :key="item.id"
        class="item background"
        :style="{
          transform: `translate(${item.x * 60}px, ${item.y * 60}px)`,
        }"
      >
        {{ item.value }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { DirectionKey, useKeyDirection, type DirectionKeyType } from '@/composables/useKeyDirection'
import { randomNumber } from '@/utils/random';
import { onMounted, ref } from 'vue';

const mapHeight = 4
const mapWidth = 4

// 数据实体
interface NumItem {
  id: number        // 唯一 ID（避免合并过程中丢失动画）
  value: number     // 数值
  x: number         // 当前列索引
  y: number         // 当前行索引
  targetX: number   // 目标列索引（动画结束时）
  targetY: number   // 目标行索引（动画结束时）
  isMerged?: boolean // 是否合并过（防止多次合并）
}

// 数据实体列表
const mapItems = ref<NumItem[]>([])
// 背景数据实体列表
const mapBgItems = ref<NumItem[]>([])
let idCounter = 1

// 生成数据实体对象
const createItem = (x: number, y: number, value: number): NumItem => {
  return {
    id: idCounter++,
    value,
    x,
    y,
    targetX: x,
    targetY: y,
    isMerged: false
  }
}

// 构建游戏地图
const createMapItems = () => {
  mapBgItems.value = []
  for (let y = 0; y < mapHeight; y ++) {
    for (let x = 0; x < mapWidth; x ++) {
      mapBgItems.value.push(createItem(x, y, 0))
    }
  }
}

// 随机添加一个数
const addRandomItem = () => {
  // 首先找到所有值为 0 的对象
  const emptyCells: { x: number; y: number }[] = []
  for (let y = 0; y < mapHeight; y ++) {
    for (let x = 0; x < mapWidth; x ++) {
      if (!mapItems.value.some(t => t.x === x && t.y === y)) {
        emptyCells.push({ x, y })
      }
    }
  }

  // 如果有空位置，随机选择一个位置并添加一个数字
  if (emptyCells.length) {
    const pos = emptyCells[randomNumber(0, emptyCells.length - 1)]
    mapItems.value.push(createItem(pos.x, pos.y, Math.random() < 0.9 ? 2 : 4))
  }
}

// 监听键盘方向键
const { direction } = useKeyDirection((dir) => {
  switch (dir) {
    case DirectionKey.ArrowUp:
      moveUp()
      break
    case DirectionKey.ArrowDown:
      moveDown()
      break
    case DirectionKey.ArrowLeft:
      moveLeft()
      break
    case DirectionKey.ArrowRight:
      moveRight()
      break
  }
})

const moveUp = () => {
  // 先重置合并标记
  mapItems.value.forEach(item => item.isMerged = false)

  // 计算目标位置，按列循环
  for (let col = 0; col < mapWidth; col ++) {
    let targetRow = 0
    let lastMergeValue = 0

    for (let row = 0; row < mapHeight; row ++) {
      const item = mapItems.value.find(t => t.x === col && t.y === row)
      if (!item) continue

      if (lastMergeValue === item.value) {
        // 与上一个合并
        item.targetY = targetRow - 1
        item.isMerged = true
        lastMergeValue = 0 // 本列不能连续二合并
      } else {
        // 移动到目标行
        item.targetY = targetRow
        lastMergeValue = item.value
        targetRow ++
      }
      item.targetX = col
    }
  }

  // 播放动画
  setTimeout(() => {
    // 同步位置
    mapItems.value.forEach(item => {
      item.y = item.targetY
      item.x = item.targetX
    })

    // 合并
    for (let col = 0; col < mapWidth; col++) {
      for (let row = 0; row + 1 < mapHeight; row++) {
        const itemList = mapItems.value.filter(t => t.x === col && t.y === row)
        // 找到重复的数据
        if (itemList.length === 2) {
          itemList[0].value += itemList[1].value

          // 删除重复的数据
          const targetIndex = mapItems.value.findIndex(item => item === itemList[1])
          if (targetIndex !== -1) {
            mapItems.value.splice(targetIndex, 1)
          }
        }
      }
    }

    addRandomItem()
  }, 150) // 动画时长
}

const moveDown = () => {
  // 先重置合并标记
  mapItems.value.forEach(item => item.isMerged = false)

  // 计算目标位置，按列循环
  for (let col = 0; col < mapWidth; col ++) {
    let targetRow = mapHeight - 1
    let lastMergeValue = 0

    for (let row = mapHeight - 1; row >= 0; row --) {
      const item = mapItems.value.find(t => t.x === col && t.y === row)
      if (!item) continue

      if (lastMergeValue === item.value) {
        // 与上一个合并
        item.targetY = targetRow + 1
        item.isMerged = true
        lastMergeValue = 0
      } else {
        // 移动到目标行
        item.targetY = targetRow
        lastMergeValue = item.value
        targetRow --
      }
      item.targetX = col
    }
  }

  // 播放动画
  setTimeout(() => {
    // 同步位置
    mapItems.value.forEach(item => {
      item.y = item.targetY
      item.x = item.targetX
    })

    // 合并
    for (let col = 0; col < mapWidth; col ++) {
      for (let row = mapHeight - 1; row >= 0; row --) {
        const itemList = mapItems.value.filter(t => t.x === col && t.y === row)
        // 找到重复的数据
        if (itemList.length === 2) {
          itemList[0].value += itemList[1].value

          // 删除重复的数据
          const targetIndex = mapItems.value.findIndex(item => item === itemList[1])
          if (targetIndex !== -1) {
            mapItems.value.splice(targetIndex, 1)
          }
        }
      }
    }

    addRandomItem()
  }, 150) // 动画时长
}

const moveLeft = () => {
  // 先重置合并标记
  mapItems.value.forEach(item => item.isMerged = false)

  // 计算目标位置，按行循环
  for (let row = 0; row < mapHeight; row ++) {
    let targetCol = 0
    let lastMergeValue = 0

    for (let col = 0; col < mapWidth; col ++) {
      const item = mapItems.value.find(t => t.x === col && t.y === row)
      if (!item) continue

      if (lastMergeValue === item.value) {
        // 与上一个合并
        item.targetX = targetCol - 1
        item.isMerged = true
        lastMergeValue = 0
      } else {
        // 移动到目标行
        item.targetX = targetCol
        lastMergeValue = item.value
        targetCol ++
      }
      item.targetY = row
    }
  }

  // 播放动画
  setTimeout(() => {
    // 同步位置
    mapItems.value.forEach(item => {
      item.y = item.targetY
      item.x = item.targetX
    })

    // 合并
    for (let row = 0; row < mapHeight; row ++) {
      for (let col = 0; col < mapWidth; col ++) {
        const itemList = mapItems.value.filter(t => t.x === col && t.y === row)
        // 找到重复的数据
        if (itemList.length === 2) {
          itemList[0].value += itemList[1].value

          // 删除重复的数据
          const targetIndex = mapItems.value.findIndex(item => item === itemList[1])
          if (targetIndex !== -1) {
            mapItems.value.splice(targetIndex, 1)
          }
        }
      }
    }

    addRandomItem()
  }, 150) // 动画时长
}

const moveRight = () => {
  // 先重置合并标记
  mapItems.value.forEach(item => item.isMerged = false)

  // 计算目标位置，按行循环
  for (let row = 0; row < mapHeight; row ++) {
    let targetCol = mapWidth - 1
    let lastMergeValue = 0

    for (let col = mapWidth - 1; col >= 0; col --) {
      const item = mapItems.value.find(t => t.x === col && t.y === row)
      if (!item) continue

      if (lastMergeValue === item.value) {
        // 与上一个合并
        item.targetX = targetCol + 1
        item.isMerged = true
        lastMergeValue = 0
      } else {
        // 移动到目标行
        item.targetX = targetCol
        lastMergeValue = item.value
        targetCol --
      }
      item.targetY = row
    }
  }

  // 播放动画
  setTimeout(() => {
    // 同步位置
    mapItems.value.forEach(item => {
      item.y = item.targetY
      item.x = item.targetX
    })

    // 合并
    for (let row = 0; row < mapHeight; row ++) {
      for (let col = mapWidth - 1; col >= 0; col --) {
        const itemList = mapItems.value.filter(t => t.x === col && t.y === row)
        // 找到重复的数据
        if (itemList.length === 2) {
          itemList[0].value += itemList[1].value

          // 删除重复的数据
          const targetIndex = mapItems.value.findIndex(item => item === itemList[1])
          if (targetIndex !== -1) {
            mapItems.value.splice(targetIndex, 1)
          }
        }
      }
    }

    addRandomItem()
  }, 150) // 动画时长
}

onMounted(() => {
  createMapItems()
  addRandomItem()
})
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-map {
  position: relative;
  width: 260px;
  height: 260px;
}

.item {
  position: absolute;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.15s ease;
  border-radius: 4px;
  font-weight: bold;
  font-size: 20px;
}

.item.background {
  z-index: 1;
  background: #ccc;
}

.item.game-data {
  z-index: 10;
  background-color: pink;
}
</style>