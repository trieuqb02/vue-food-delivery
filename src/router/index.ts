import { createRouter, createWebHistory } from 'vue-router'

const NotFoundView = () => import('../views/common/NotFoundView.vue')
const AdminView = () => import('../views/admin/AdminView.vue')
const LoginView = () => import('../views/auth/LoginView.vue')
const HomeView = () => import('../views/admin/HomeView.vue')
const ProductView = () => import('../views/admin/ProductView.vue')
const OrdertView = () => import('../views/admin/OrderView.vue')
const AccountView = () => import('../views/admin/AccountView.vue')
const CategoryView = () => import('../views/admin/CateroryView.vue')
const CategoryFormView = () => import('../views/admin/CategoryFormView.vue')
const EmployeeAddtionFormView = () => import('../views/admin/EmployeeAddtionFormView.vue')
const AccountListView = () => import('../views/admin/AccountListView.vue')
const ProductAddtionFormView = () => import('../views/admin/ProductAddtionFormView.vue')
const ProductEditingFormView = () => import('../views/admin/ProductEditingFormView.vue')
const CategoryListView = () => import('../views/admin/CategoryListView.vue')
const ProductListView = () => import('../views/admin/ProductListView.vue')
const PriceListView = () => import('../views/admin/PriceListView.vue')
const OrderListView = () => import('../views/admin/OrderListView.vue')
const StatisticsView = () => import('../views/admin/StatisticsView.vue')
const OrderStatisticsView = () => import('../views/admin/OrderStatistics.vue')

const routes = [
  { path: '/', component: LoginView },
  { path: '/login', component: LoginView },
  {
    path: '/admin',
    component: AdminView,
    children: [
      { path: 'home', component: HomeView },
      {
        path: 'category',
        component: CategoryView,
        children: [
          { path: '', component: CategoryListView },
          { path: 'add', component: CategoryFormView },
          { path: ':categoryId/edit', component: CategoryFormView }
        ]
      },
      {
        path: 'product',
        component: ProductView,
        children: [
          { path: '', component: ProductListView },
          { path: 'add', component: ProductAddtionFormView },
          { path: ':productId/edit', component: ProductEditingFormView },
          { path: ':productId/price', component: PriceListView },
          { path: ':productId/price/list', component: PriceListView }
        ]
      },
      {
        path: 'account',
        component: AccountView,
        redirect: '/admin/account/employee',
        children: [
          {
            path: ':roleName',
            component: AccountListView
          },
          { path: 'employee/add', component: EmployeeAddtionFormView }
        ]
      },
      {
        path: 'order',
        component: OrdertView,
        redirect: '/admin/order/waite',
        children: [{ path: ':orderStatus', component: OrderListView }]
      },
      {
        path: 'statistics',
        component: StatisticsView,
        redirect: '/admin/statistics/order',
        children: [{ path: 'order', component: OrderStatisticsView }]
      }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
