import { mount } from '@vue/test-utils'
import TranslatePanel from '../TranslatePanel.vue'

vi.mock('@/services/translate', () => ({
  detectLanguage: vi.fn(async () => 'en'),
  translateText: vi.fn(async (t: string) => t),
}))

describe('TranslatePanel', () => {
  it('renders translator UI', () => {
    const wrapper = mount(TranslatePanel)
    expect(wrapper.text()).toContain('Translator')
    expect(wrapper.text()).toContain('Preferred Language')
  })
})
