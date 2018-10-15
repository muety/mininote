import { shallowMount } from '@vue/test-utils'
import ControlBar from '@/components/ControlBar'

describe('ControlBar.vue', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(ControlBar, {
      propsData: {
        hasChanges: false,
        notes: ['note one', 'note two'],
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
