<script setup lang="ts">
import type PagenationModel from '@/models/PagenationModel'
import { reactive, ref } from 'vue'
import Breadcrumb from '@/components/admin/Breadcrumb.vue'
import OrderDetail from '../../components/admin/OrderDetail.vue'
import UserDetail from '@/components/admin/UserDetail.vue'
import type BreadcrumbModel from '@/models/NavModel'
import { useRoute } from 'vue-router'
import type QueryModel from '@/models/QueryModel'
import { format } from 'date-fns'
import { useModal } from '@/composables/ModalComposable'
import Modal from '../common/Modal.vue'
import DateSearchtingForm from '@/components/DateSearchtingForm.vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type ChartData
} from 'chart.js'
import type OrderModel from '@/models/OrderModel'
import type APIResponseModel from '@/models/ApiResponseModel'
import stores from '@/stores/Store'
import type { UserModel } from '@/models/AccountInforModel'
import type AccountModel from '@/models/AccountInforModel'
import CodeHelper from '@/helpers/CodeHelper'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const route = useRoute()
const modal = useModal()

let breadcrumb: BreadcrumbModel[] = [
  { title: 'Trang chủ', path: '/admin/home' },
  { title: 'Thống kê đơn hàng', path: '#' }
]

let order = reactive<OrderModel>({
  _id: '',
  customer: '',
  totalAmount: 0,
  status: 0,
  address1: '',
  address2: '',
  createdAt: new Date(),
  orderDetails: []
})

let account = reactive<AccountModel>({
  username: '',
  password: '',
  conformPassword: '',
  user: {
    phoneNumber: '',
    fullName: ''
  }
})

const pagenation = reactive<PagenationModel<OrderModel[]>>({
  startDate: route.query.startDate ? String(route.query.sortOrder) : '',
  endDate: route.query.endDate ? String(route.query.sortOrder) : '',
  data: []
})

const queries = reactive<QueryModel>({
  startDate: pagenation.startDate,
  endDate: pagenation.endDate
})

const chartData = ref<ChartData<'bar'>>({
  labels: [] as string[], // Định nghĩa kiểu string[] cho labels
  datasets: [
    {
      label: 'Doanh số theo ngày',
      backgroundColor: '#f87979',
      data: [] as number[] // Định nghĩa kiểu number[] cho data
    }
  ]
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
})

const formatDate = (value: Date): string => {
  return format(new Date(value), 'dd/MM/yyyy')
}

const fetchData = async () => {
  try {
    const result: APIResponseModel<OrderModel[]> = await stores.dispatch(
      'order/getStatistics',
      queries
    )
    pagenation.data = result.data || []

    // Khởi tạo đối tượng để lưu tổng doanh thu theo ngày
    const dailySales: Record<string, number> = {}

    pagenation.data.forEach((order) => {
      const date = formatDate(order.createdAt)
      if (!dailySales[date]) {
        dailySales[date] = 0
      }
      dailySales[date] += order.totalAmount // Giả sử mỗi đơn hàng có thuộc tính totalAmount
    })

    // Chuyển đổi dailySales thành định dạng mà chartjs yêu cầu
    const labels = Object.keys(dailySales) // Danh sách các ngày
    const data = Object.values(dailySales) // Tổng doanh thu theo ngày

    // Cập nhật chartData
    chartData.value = {
      labels,
      datasets: [
        {
          label: 'Doanh số theo ngày',
          backgroundColor: '#f87979',
          data
        }
      ]
    }
  } catch (error) {
    console.log(error)
  }
}

const selectedAcction = async (action: boolean) => {
  modal.close()
  if (action) {
    // Thực hiện hành động khi chọn
  }
}

const showModal = async (value: OrderModel, action: string) => {
  order = value
  console.log(order)
  if (action == 'showDetail') {
    modal.open('Thông tin đơn hàng', false, undefined, 'orderDetail')
  } else if (action == 'showEmployeList') {
    modal.open('Danh sách nhân viên', false, undefined, 'employeeList')
  } else if (action == 'showEmploye') {
    try {
      const result: APIResponseModel<AccountModel> = await stores.dispatch(
        'account/getAccount',
        (order.assignment!.employee as UserModel)._id!
      )
      if (result.code == CodeHelper.SUCCESS && result.data) {
        account = result.data

        modal.open('Thông tin nhân viên', false, undefined, 'showEmploye')
      }
    } catch (error) {
      console.log(error)
    }
  }
}

const searched = async (value: { startDate: string; endDate: string }) => {
  pagenation.endDate = value.endDate
  pagenation.startDate = value.startDate
  queries.endDate = pagenation.endDate
  queries.startDate = pagenation.startDate
  await fetchData()
}
</script>

<template>
  <Breadcrumb :navs="breadcrumb"></Breadcrumb>
  <div class="content-heading mb-10">
    <h2>Thống kê đơn hàng</h2>
  </div>
  <div class="row-offset-4">
    <div class="col-offset-4 l-12">
      <div class="content-main">
        <div class="content-main-header" style="font-size: 1em">
          <DateSearchtingForm
            :start-date="pagenation.startDate!"
            :end-date="pagenation.endDate!"
            @searched="searched"
          ></DateSearchtingForm>
        </div>
        <div>
          <Bar id="my-chart-id" :options="chartOptions" :data="chartData" />
        </div>
        <div class="content-main-list">
          <div class="container-list">
            <div class="container-heading-list row">
              <div class="l-2">Mã đơn hàng</div>
              <div class="l-5">Địa chỉ</div>
              <div class="l-2">Khách hàng</div>
              <div class="l-1">Tổng tiền</div>
              <div class="l-1">Ngày đặt</div>
              <div class="l-1">Thao tác</div>
            </div>
            <div class="container-content-list" v-for="order in pagenation.data">
              <div class="container-content-item">
                <div class="l-2">{{ order._id }}</div>
                <div class="l-5">{{ order.address1 + ' ' + order.address2 }}</div>
                <div class="l-2">{{ (order.customer as UserModel).fullName }}</div>
                <div class="l-1">{{ order.totalAmount }}</div>
                <div class="l-1">{{ formatDate(order.createdAt) }}</div>
                <div class="l-1">
                  <div class="operation row-offset-4-wrap">
                    <div class="col-offset-4 l-4">
                      <button
                        class="btn-operation btn-infor"
                        title="Thông tin đơn hàng"
                        @click="showModal(order, 'showDetail')"
                      >
                        <font-awesome-icon :icon="['fas', 'info']" />
                      </button>
                    </div>
                    <div class="col-offset-4 l-4">
                      <button
                        class="btn-operation btn-infor"
                        title="Nhân viên giao hàng"
                        @click="showModal(order, 'showEmploye')"
                      >
                        <font-awesome-icon :icon="['fas', 'truck']" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Modal v-bind="modal.data" @selected-acction="selectedAcction">
    <template #content v-if="modal.data.type == 'orderDetail'">
      <OrderDetail :order="order"></OrderDetail>
    </template>
    <template #content v-if="modal.data.type == 'showEmploye'">
      <UserDetail :account="account"></UserDetail>
    </template>
  </Modal>
</template>
