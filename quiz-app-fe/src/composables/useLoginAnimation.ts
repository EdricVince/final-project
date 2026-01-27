import { ref, type Ref } from 'vue'

// Teddy animation state machine input names
const INPUTS = {
  IS_CHECKING: 'isChecking',
  IS_HANDS_UP: 'isHandsUp',
  LOOK: 'numLook',
  TRIGGER_SUCCESS: 'trigSuccess',
  TRIGGER_FAIL: 'trigFail',
} as const

export interface RiveAnimationRef {
  setBooleanInput: (name: string, value: boolean) => void
  setNumberInput: (name: string, value: number) => void
  fireTrigger: (name: string) => void
  getInputs: () => unknown[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useLoginAnimation(animationRef: Ref<any>) {
  const isPasswordFocused = ref(false)
  const emailLength = ref(0)

  // Calculate look position based on email input length
  // The numLook input ranges from 0 to 100
  const calculateLookPosition = (length: number): number => {
    const maxLength = 30
    const normalizedLength = Math.min(length, maxLength)
    return (normalizedLength / maxLength) * 100
  }

  // Called when user focuses on email field
  const onEmailFocus = () => {
    if (!animationRef.value) return
    animationRef.value.setBooleanInput(INPUTS.IS_CHECKING, true)
    animationRef.value.setBooleanInput(INPUTS.IS_HANDS_UP, false)
    isPasswordFocused.value = false
  }

  // Called when user types in email field
  const onEmailChange = (email: string) => {
    if (!animationRef.value) return
    emailLength.value = email.length
    const lookPosition = calculateLookPosition(email.length)
    animationRef.value.setNumberInput(INPUTS.LOOK, lookPosition)
  }

  // Called when user blurs from email field
  const onEmailBlur = () => {
    if (!animationRef.value) return
    if (!isPasswordFocused.value) {
      animationRef.value.setBooleanInput(INPUTS.IS_CHECKING, false)
    }
  }

  // Called when user focuses on password field - bear covers eyes
  const onPasswordFocus = () => {
    if (!animationRef.value) return
    isPasswordFocused.value = true
    animationRef.value.setBooleanInput(INPUTS.IS_CHECKING, false)
    animationRef.value.setBooleanInput(INPUTS.IS_HANDS_UP, true)
  }

  // Called when user blurs from password field
  const onPasswordBlur = () => {
    if (!animationRef.value) return
    isPasswordFocused.value = false
    animationRef.value.setBooleanInput(INPUTS.IS_HANDS_UP, false)
  }

  // Called on successful login - bear celebrates
  const onLoginSuccess = () => {
    if (!animationRef.value) return
    animationRef.value.setBooleanInput(INPUTS.IS_HANDS_UP, false)
    animationRef.value.setBooleanInput(INPUTS.IS_CHECKING, false)
    animationRef.value.fireTrigger(INPUTS.TRIGGER_SUCCESS)
  }

  // Called on failed login - bear looks sad
  const onLoginFail = () => {
    if (!animationRef.value) return
    animationRef.value.setBooleanInput(INPUTS.IS_HANDS_UP, false)
    animationRef.value.setBooleanInput(INPUTS.IS_CHECKING, false)
    animationRef.value.fireTrigger(INPUTS.TRIGGER_FAIL)
  }

  // Reset to idle state
  const resetAnimation = () => {
    if (!animationRef.value) return
    animationRef.value.setBooleanInput(INPUTS.IS_CHECKING, false)
    animationRef.value.setBooleanInput(INPUTS.IS_HANDS_UP, false)
    animationRef.value.setNumberInput(INPUTS.LOOK, 0)
  }

  return {
    onEmailFocus,
    onEmailChange,
    onEmailBlur,
    onPasswordFocus,
    onPasswordBlur,
    onLoginSuccess,
    onLoginFail,
    resetAnimation,
  }
}