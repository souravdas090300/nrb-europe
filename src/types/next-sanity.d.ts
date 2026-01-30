declare module 'next-sanity/studio' {
  import { ComponentType } from 'react'
  
  export interface NextStudioProps {
    config: any
  }
  
  export const NextStudio: ComponentType<NextStudioProps>
  export const metadata: any
  export const viewport: any
}
