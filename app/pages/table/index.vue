<script setup lang="ts">
import type { VxeTableInstance, VxeTablePropTypes } from 'vxe-table'

definePageMeta({
  layout: 'default',
})

interface RowData {
  id: number
  name: string
  role: string
  age: number
  email: string
  status: 'active' | 'inactive' | 'pending'
  score: number
}

const colorMode = useColorMode()

/* ---------- 1. 基础表格数据 ---------- */
const basicData: RowData[] = [
  { id: 1, name: '张三', role: '前端工程师', age: 28, email: 'zhangsan@example.com', status: 'active', score: 92 },
  { id: 2, name: '李四', role: '后端工程师', age: 32, email: 'lisi@example.com', status: 'active', score: 85 },
  { id: 3, name: '王五', role: '产品经理', age: 26, email: 'wangwu@example.com', status: 'pending', score: 78 },
  { id: 4, name: '赵六', role: '设计师', age: 30, email: 'zhaoliu@example.com', status: 'inactive', score: 88 },
  { id: 5, name: '孙七', role: '测试工程师', age: 29, email: 'sunqi@example.com', status: 'active', score: 95 },
]

/* ---------- 2. 排序 + 分页表格 ---------- */
const pagerData = ref<RowData[]>(generatePagerData(57))

function generatePagerData(count: number): RowData[] {
  const roles = ['前端工程师', '后端工程师', '产品经理', '设计师', '测试工程师']
  const statuses: RowData['status'][] = ['active', 'inactive', 'pending']
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `用户${i + 1}`,
    role: roles[i % roles.length]!,
    age: 22 + (i % 18),
    email: `user${i + 1}@example.com`,
    status: statuses[i % statuses.length]!,
    score: 60 + (i * 7) % 40,
  }))
}

const pagerTableRef = ref<VxeTableInstance<RowData>>()
const pagerCurrentPage = ref(1)
const pagerPageSize = ref(10)

const pagerComputedData = computed(() => {
  const start = (pagerCurrentPage.value - 1) * pagerPageSize.value
  const end = start + pagerPageSize.value
  return pagerData.value.slice(start, end)
})

function handlePagerSort({ field, order }: { field: string, order: 'asc' | 'desc' | '' | null }) {
  if (!order) {
    pagerData.value = generatePagerData(57)
    return
  }
  const key = field as keyof RowData
  pagerData.value = [...pagerData.value].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (typeof av === 'number' && typeof bv === 'number')
      return order === 'asc' ? av - bv : bv - av
    return order === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av))
  })
}

/* ---------- 3. 虚拟滚动大数据 ---------- */
const virtualData = ref<RowData[]>(generateVirtualData(10000))

function generateVirtualData(count: number): RowData[] {
  const roles = ['前端工程师', '后端工程师', '产品经理', '设计师', '测试工程师']
  const statuses: RowData['status'][] = ['active', 'inactive', 'pending']
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `虚拟用户${i + 1}`,
    role: roles[i % roles.length]!,
    age: 20 + (i % 30),
    email: `vuser${i + 1}@example.com`,
    status: statuses[i % statuses.length]!,
    score: 50 + (i % 51),
  }))
}

/* ---------- 4. 可编辑表格 ---------- */
const editData = ref<RowData[]>(
  JSON.parse(JSON.stringify(basicData)),
)

const editRules: VxeTablePropTypes.EditRules<RowData> = {
  name: [
    { required: true, message: '姓名不能为空' },
    { min: 2, max: 20, message: '长度 2-20 个字符' },
  ],
  age: [
    { required: true, message: '年龄不能为空' },
    {
      validator({ cellValue }: { cellValue: unknown }) {
        if (typeof cellValue !== 'number' || cellValue < 18 || cellValue > 65)
          return new Error('年龄须在 18-65 之间')
      },
    },
  ],
  email: [
    { required: true, message: '邮箱不能为空' },
    { pattern: /^[\w.+-]+@[\w-]+\.[\w.-]+$/, message: '邮箱格式不正确' },
  ],
}

const editTableRef = ref<VxeTableInstance<RowData>>()

async function saveEditData() {
  const errMap = await editTableRef.value?.validate()
  if (!errMap) {
    // 校验通过，实际项目这里会提交后端
    console.warn('[vxe-table] 可编辑表格保存成功', editData.value)
  }
}

/* ---------- 5. 工具栏 + 增删行 ---------- */
const crudData = ref<RowData[]>(
  JSON.parse(JSON.stringify(basicData)),
)
let crudSeq = crudData.value.length

function insertCrudRow() {
  crudSeq += 1
  crudData.value.unshift({
    id: crudSeq,
    name: `新成员${crudSeq}`,
    role: '前端工程师',
    age: 25,
    email: `new${crudSeq}@example.com`,
    status: 'pending',
    score: 70,
  })
}

function removeCrudRow(row: RowData) {
  const idx = crudData.value.findIndex(r => r.id === row.id)
  if (idx > -1)
    crudData.value.splice(idx, 1)
}

function exportCrudData() {
  // 简易导出：转 CSV
  const headers = ['ID', '姓名', '角色', '年龄', '邮箱', '状态', '分数']
  const rows = crudData.value.map(r =>
    [r.id, r.name, r.role, r.age, r.email, r.status, r.score].join(','),
  )
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'crud-data.csv'
  a.click()
  URL.revokeObjectURL(url)
}

/* ---------- 状态标签映射 ---------- */
const statusMeta: Record<RowData['status'], { text: string, color: string }> = {
  active: { text: '在职', color: 'text-green-600 dark:text-green-400' },
  inactive: { text: '离职', color: 'text-gray-500' },
  pending: { text: '待定', color: 'text-amber-600 dark:text-amber-400' },
}
</script>

<template>
  <div mx-auto px-4 py-6 max-w-7xl sm:px-6>
    <header mb-8 text-center>
      <h1 text-2xl font-serif sm:text-3xl>
        vxe-table 综合示例
      </h1>
      <p text-sm mt-2 op60>
        基于 vxe-table 4.x + vxe-pc-ui · 支持暗色模式（当前：{{ colorMode.preference }}）·
        <NuxtLink to="/" class="text-teal-600 hover:underline">
          返回首页
        </NuxtLink>
      </p>
    </header>

    <ClientOnly>
      <!-- 1. 基础表格 -->
      <section mb-10>
        <h2 text-xl font-serif mb-3 pl-3 border-l-4 border-teal-600>
          基础表格
        </h2>
        <div rounded-lg w-full shadow-sm overflow-x-auto border="1px solid gray-200 dark:gray-700">
          <vxe-table
            :data="basicData"

            stripe round border
            :row-config="{ isHover: true }"
          >
            <vxe-column type="seq" width="60" title="#" />
            <vxe-column field="name" title="姓名" />
            <vxe-column field="role" title="角色" />
            <vxe-column field="age" title="年龄" width="80" />
            <vxe-column field="email" title="邮箱" min-width="200" />
            <vxe-column field="score" title="分数" width="100" />
            <vxe-column field="status" title="状态" width="100">
              <template #default="{ row }">
                <span :class="statusMeta[row.status as RowData['status']].color">
                  {{ statusMeta[row.status as RowData['status']].text }}
                </span>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </section>

      <!-- 2. 排序 + 分页 -->
      <section mb-10>
        <h2 text-xl font-serif mb-3 pl-3 border-l-4 border-teal-600>
          排序 + 分页
        </h2>
        <div rounded-lg w-full shadow-sm overflow-x-auto border="1px solid gray-200 dark:gray-700">
          <vxe-table
            ref="pagerTableRef"
            :data="pagerComputedData"

            stripe border
            :row-config="{ isHover: true }"
            :sort-config="{ trigger: 'cell', remote: false }"
            @sort-change="handlePagerSort"
          >
            <vxe-column type="seq" width="60" title="#" />
            <vxe-column field="name" title="姓名" sortable />
            <vxe-column field="role" title="角色" sortable />
            <vxe-column field="age" title="年龄" width="100" sortable />
            <vxe-column field="score" title="分数" width="100" sortable />
            <vxe-column field="status" title="状态" width="100">
              <template #default="{ row }">
                <span :class="statusMeta[row.status as RowData['status']].color">
                  {{ statusMeta[row.status as RowData['status']].text }}
                </span>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
        <div mt-3 flex justify-center>
          <vxe-pager
            v-model:current-page="pagerCurrentPage"
            v-model:page-size="pagerPageSize"
            :total="pagerData.length"
            :page-sizes="[10, 20, 50]"
            :layouts="['PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'Sizes', 'FullJump', 'Total']"
          />
        </div>
      </section>

      <!-- 3. 虚拟滚动 -->
      <section mb-10>
        <h2 text-xl font-serif mb-3 pl-3 border-l-4 border-teal-600>
          虚拟滚动（1 万条数据）
        </h2>
        <p text-sm mb-2 op60>
          演示 vxe-table 虚拟滚动渲染能力，1 万行数据下仍保持流畅滚动。
        </p>
        <div rounded-lg w-full shadow-sm overflow-x-auto border="1px solid gray-200 dark:gray-700">
          <vxe-table
            :data="virtualData"

            stripe border
            height="400"
            :row-config="{ isHover: true }"
            :scroll-y="{ enabled: true, gt: 50 }"
          >
            <vxe-column type="seq" width="80" title="#" />
            <vxe-column field="name" title="姓名" min-width="140" />
            <vxe-column field="role" title="角色" min-width="120" />
            <vxe-column field="age" title="年龄" width="80" />
            <vxe-column field="email" title="邮箱" min-width="220" />
            <vxe-column field="score" title="分数" width="100" />
            <vxe-column field="status" title="状态" width="100">
              <template #default="{ row }">
                <span :class="statusMeta[row.status as RowData['status']].color">
                  {{ statusMeta[row.status as RowData['status']].text }}
                </span>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </section>

      <!-- 4. 可编辑单元格 -->
      <section mb-10>
        <h2 text-xl font-serif mb-3 pl-3 border-l-4 border-teal-600>
          可编辑单元格（带校验）
        </h2>
        <div mb-3 flex flex-wrap gap-2>
          <vxe-button status="primary" @click="saveEditData">
            保存（触发校验）
          </vxe-button>
        </div>
        <div rounded-lg w-full shadow-sm overflow-x-auto border="1px solid gray-200 dark:gray-700">
          <vxe-table
            ref="editTableRef"
            :data="editData"

            stripe border
            :row-config="{ isHover: true }"
            :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
            :edit-rules="editRules"
          >
            <vxe-column type="seq" width="60" title="#" />
            <vxe-column field="name" title="姓名" :edit-render="{ name: 'input' }" />
            <vxe-column field="role" title="角色" :edit-render="{ name: 'input' }" />
            <vxe-column field="age" title="年龄" width="100" :edit-render="{ name: 'input' }" />
            <vxe-column field="email" title="邮箱" min-width="220" :edit-render="{ name: 'input' }" />
            <vxe-column field="score" title="分数" width="100" :edit-render="{ name: 'input' }" />
          </vxe-table>
        </div>
      </section>

      <!-- 5. 工具栏 + 增删行 + 导出 -->
      <section mb-10>
        <h2 text-xl font-serif mb-3 pl-3 border-l-4 border-teal-600>
          工具栏 + 增删行 + 导出
        </h2>
        <div mb-3 flex flex-wrap gap-2>
          <vxe-button status="success" @click="insertCrudRow">
            新增一行
          </vxe-button>
          <vxe-button status="info" @click="exportCrudData">
            导出 CSV
          </vxe-button>
        </div>
        <div rounded-lg w-full shadow-sm overflow-x-auto border="1px solid gray-200 dark:gray-700">
          <vxe-table
            :data="crudData"

            stripe border
            :row-config="{ isHover: true }"
          >
            <vxe-column type="seq" width="60" title="#" />
            <vxe-column field="name" title="姓名" />
            <vxe-column field="role" title="角色" />
            <vxe-column field="age" title="年龄" width="80" />
            <vxe-column field="email" title="邮箱" min-width="200" />
            <vxe-column field="score" title="分数" width="100" />
            <vxe-column title="操作" width="120" fixed="right">
              <template #default="{ row }">
                <vxe-button
                  status="danger"
                  size="mini"
                  @click="removeCrudRow(row as RowData)"
                >
                  删除
                </vxe-button>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </section>

      <template #fallback>
        <div py-20 text-center op50 italic>
          <span animate-pulse>正在加载 vxe-table 组件...</span>
        </div>
      </template>
    </ClientOnly>

    <footer text-sm mt-12 text-center op50>
      <NuxtLink to="/" class="text-teal-600 hover:underline">
        ← 返回首页
      </NuxtLink>
    </footer>
  </div>
</template>
