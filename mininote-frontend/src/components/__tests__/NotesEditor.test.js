import { createLocalVue, shallowMount } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue'
import NotesEditor from '@/components/NotesEditor'
import store from '../../store'

jest.mock('../../lib/marked')

const localVue = createLocalVue()

localVue.use(BootstrapVue)

describe('NotesEditor.vue', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(NotesEditor, {
      localVue,
      propsData: {
        note: 'this is a note',
      },
      store
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
