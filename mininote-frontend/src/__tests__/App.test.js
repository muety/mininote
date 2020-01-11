import { createLocalVue, shallowMount } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue'
import App from '@/App'
import store from '../store'

const localVue = createLocalVue()

localVue.use(BootstrapVue)

describe('App.vue', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(App, {
      localVue,
      propsData: {},
      store
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
