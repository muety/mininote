import { shallowMount } from '@vue/test-utils'
import NotesEditor from '@/components/NotesEditor'

jest.mock('../../services/marked')

describe('NotesEditor.vue', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(NotesEditor, {
      propsData: {
        note: 'this is a note',
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
