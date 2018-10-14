import { shallowMount } from '@vue/test-utils'
import App from '@/App'

describe('App.vue', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(App, {
      propsData: {}
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
