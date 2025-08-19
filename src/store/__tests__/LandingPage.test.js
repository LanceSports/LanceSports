// top of test file, BEFORE importing the component
import { vi, describe, it, expect } from 'vitest'

// Mock the Pinia store entirely
vi.mock('../src/store/useUserStore', () => ({
  useUserStore: () => ({
    userData: { name: 'John Doe' }
  })
}))

import { mount, RouterLinkStub } from '@vue/test-utils'
import LandingPage from '../../components/Landing.vue'

describe('LandingPage.vue', () => {
  it('renders welcome message', () => {
    const wrapper = mount(LandingPage, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text()).toContain('Welcome, John Doe')
  })
})
