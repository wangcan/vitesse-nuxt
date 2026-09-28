import VxeUI from 'vxe-pc-ui'
import VxeUITable from 'vxe-table'
import 'vxe-pc-ui/lib/style.css'
import 'vxe-table/lib/style.css'

// 仅客户端注册 vxe-table + vxe-pc-ui，避免 SSR 阶段访问 window 报错
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VxeUI).use(VxeUITable)
})
