/**
 * 生成随机数
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @param isInt 是否取整（默认 true）
 * @returns 随机数
 */
export function randomNumber(min: number, max: number, isInt = true): number {
  const val = Math.random() * (max - min) + min
  return isInt ? Math.floor(val) : val
}