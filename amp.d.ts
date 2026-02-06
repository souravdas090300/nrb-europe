declare global {
  namespace JSX {
    interface IntrinsicElements {
      'amp-img': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string
        width?: string | number
        height?: string | number
        layout?: string
        alt?: string
      }
      'amp-analytics': any
    }
  }
}

export {}
