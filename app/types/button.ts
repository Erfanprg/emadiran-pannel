export interface BaseButton {
  type: 'button' | 'submit' | 'reset' | undefined
  typeDesign: 'primary' | 'outline' | 'full'
  loading?: boolean
  text?: string
  icon?: string
  alt?: string
  disabled?: boolean
  customDesign?: string
}
