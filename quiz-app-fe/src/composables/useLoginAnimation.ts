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

export function useLoginAnimation(animationRef: Ref<RiveAnimationRef | null>) {
  const isPasswordFocused = ref(false)
  const emailLength = ref(0)

  // Calculate look position based on email input length
  // The numLook input ranges from 0 to 100
  const calculateLookPosition = (length: number): number => {
    const maxLength = 30
    const normalizedLength = Math.min(length, maxLength)
    return (normalizedLength / maxLength) * 100
  }

  // Helper to safely call animation methods with error handling
  const safeAnimationCall = (callback: () => void) => {
    if (!animationRef.value) return
    try {
      callback()
    } catch (error) {
      console.warn('Animation error:', error)
    }
  }

  // Called when user focuses on email field
  const onEmailFocus = () => {
    safeAnimationCall(() => {
      animationRef.value!.setBooleanInput(INPUTS.IS_CHECKING, true)
      animationRef.value!.setBooleanInput(INPUTS.IS_HANDS_UP, false)
    })
    isPasswordFocused.value = false
  }

  // Called when user types in email field
  const onEmailChange = (email: string) => {
    emailLength.value = email.length
    const lookPosition = calculateLookPosition(email.length)
    safeAnimationCall(() => {
      animationRef.value!.setNumberInput(INPUTS.LOOK, lookPosition)
    })
  }

  // Called when user blurs from email field
  const onEmailBlur = () => {
    if (!isPasswordFocused.value) {
      safeAnimationCall(() => {
        animationRef.value!.setBooleanInput(INPUTS.IS_CHECKING, false)
      })
    }
  }

  // Called when user focuses on password field - bear covers eyes
  const onPasswordFocus = () => {
    isPasswordFocused.value = true
    safeAnimationCall(() => {
      animationRef.value!.setBooleanInput(INPUTS.IS_CHECKING, false)
      animationRef.value!.setBooleanInput(INPUTS.IS_HANDS_UP, true)
    })
  }

  // Called when user blurs from password field
  const onPasswordBlur = () => {
    isPasswordFocused.value = false
    safeAnimationCall(() => {
      animationRef.value!.setBooleanInput(INPUTS.IS_HANDS_UP, false)
    })
  }

  // Called on successful login - bear celebrates
  const onLoginSuccess = () => {
    safeAnimationCall(() => {
      animationRef.value!.setBooleanInput(INPUTS.IS_HANDS_UP, false)
      animationRef.value!.setBooleanInput(INPUTS.IS_CHECKING, false)
      animationRef.value!.fireTrigger(INPUTS.TRIGGER_SUCCESS)
    })
  }

  // Called on failed login - bear looks sad
  const onLoginFail = () => {
    safeAnimationCall(() => {
      animationRef.value!.setBooleanInput(INPUTS.IS_HANDS_UP, false)
      animationRef.value!.setBooleanInput(INPUTS.IS_CHECKING, false)
      animationRef.value!.fireTrigger(INPUTS.TRIGGER_FAIL)
    })
  }

  // Reset to idle state
  const resetAnimation = () => {
    safeAnimationCall(() => {
      animationRef.value!.setBooleanInput(INPUTS.IS_CHECKING, false)
      animationRef.value!.setBooleanInput(INPUTS.IS_HANDS_UP, false)
      animationRef.value!.setNumberInput(INPUTS.LOOK, 0)
    })
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