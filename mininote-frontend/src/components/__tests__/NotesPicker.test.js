import { createLocalVue, shallowMount } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue'
import NotesPicker from '@/components/NotesPicker'
import store from '../../store'

const localVue = createLocalVue()

localVue.use(BootstrapVue)

describe('NotesPicker.vue', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(NotesPicker, {
      localVue,
      propsData: {
        notes: ['note one', 'note two']
      },
      store
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
