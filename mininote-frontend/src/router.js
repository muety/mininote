import VueRouter from "vue-router";

import App from './pages/App/App'
import NotebookListPage from './pages/App/pages/NotebookListPage/NotebookListPage'
import NotebookPage from './pages/App/pages/NotebookPage/NotebookPage'
import NotesEditPage from './pages/App/pages/NotebookPage/pages/NotesEditPage'

const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: App,
      children: [
        {
          name: 'landingpage',
          path: '',
          component: NotebookListPage,
        },
        {
          name: 'notebookpage',
          path: ':notebookId',
          component: NotebookPage,
          props: true,
          children: [
            {
              name:'noteseditpage',
              path: ':noteId',
              component: NotesEditPage,
              props: true,
            }
          ],
        },
      ],
    },
  ]
})

export default router
