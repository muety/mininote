import { shallowMount } from '@vue/test-utils'
import NotesPicker from '@/components/NotesPicker'

describe('NotesPicker.vue', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(NotesPicker, {
      propsData: {
        notes: ['note one', 'note two']
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
