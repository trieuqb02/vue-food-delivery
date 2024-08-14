import type { UserModel } from './AccountInforModel'
import type AccountModel from './AccountInforModel'
import type OrderModel from './OrderModel'

export default class AssignmentModel {
  _id?: string
  admin?: AccountModel
  employee!: string | UserModel
  order!: string | UserModel
  status?: number
  assignedAt?: Date
}
