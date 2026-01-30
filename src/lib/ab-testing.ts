interface TestVariant {
  id: string
  weight: number
  component: React.ComponentType<any>
  props?: any
}

export class ABTest {
  private tests: Map<string, TestVariant[]> = new Map()
  
  registerTest(testId: string, variants: TestVariant[]) {
    this.tests.set(testId, variants)
  }
  
  getVariant(testId: string, userId: string): TestVariant {
    const variants = this.tests.get(testId)
    if (!variants) throw new Error(`Test ${testId} not found`)
    
    const hash = this.hashString(userId + testId)
    const random = hash % 100
    
    let cumulativeWeight = 0
    for (const variant of variants) {
      cumulativeWeight += variant.weight
      if (random < cumulativeWeight) {
        return variant
      }
    }
    
    return variants[0]
  }
  
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }
  
  trackConversion(testId: string, variantId: string, userId: string) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ab_test_conversion', {
        test_id: testId,
        variant_id: variantId,
        user_id: userId,
      })
    }
  }
}

export const abTest = new ABTest()
