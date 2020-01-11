import { createLocalVue, shallowMount } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue'
import ControlBar from '@/components/ControlBar'
import store from '../../store'

const localVue = createLocalVue()

localVue.use(BootstrapVue)

describe('ControlBar.vue', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(ControlBar, {
      localVue,
      propsData: {
        hasChanges: false,
        notes: ['note one', 'note two'],
      },
      store
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
