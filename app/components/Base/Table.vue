<script setup lang="ts" generic="T extends Record<string, any>">
export interface TableColumn<T = any> {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
  sortable?: boolean
  format?: (value: any, row: T) => string | number
  class?: string
}

const props = withDefaults(
  defineProps<{
    columns: TableColumn<T>[]
    data: T[]
    keyField?: string
    hover?: boolean
    striped?: boolean
  }>(),
  {
    keyField: 'id',
    hover: true,
    striped: false
  }
)

const getCellValue = (row: T, column: TableColumn<T>) => {
  const value = row[column.key]
  return column.format ? column.format(value, row) : value
}

const getAlignClass = (align?: string) => {
  if (align === 'left') return 'text-left'
  if (align === 'right') return 'text-right'
  return 'text-center'
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full">
      <!-- Header -->
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="column.width ? `width: ${column.width}` : undefined"
            :class="[
              'px-6 py-3 text-xs font-medium text-gray-500 uppercase',
              getAlignClass(column.align)
            ]"
          >
            {{ column.label }}
          </th>
          <!-- Actions Slot -->
          <th
            v-if="$slots.actions"
            class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"
          >
            عملیات
          </th>
        </tr>
      </thead>

      <!-- Body -->
      <tbody class="divide-y divide-gray-200">
        <tr
          v-for="(row, index) in data"
          :key="row[keyField] || index"
          :class="[
            hover ? 'hover:bg-gray-50 transition-colors' : '',
            striped && index % 2 === 1 ? 'bg-gray-50' : ''
          ]"
        >
          <!-- Data Cells -->
          <td
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
              getAlignClass(column.align),
              column.class || ''
            ]"
          >
            <slot
              :name="`cell-${column.key}`"
              :value="getCellValue(row, column)"
              :row="row"
              :column="column"
              :index="index"
            >
              {{ getCellValue(row, column) }}
            </slot>
          </td>

          <!-- Actions Cell -->
          <td
            v-if="$slots.actions"
            class="px-6 py-4 whitespace-nowrap text-sm font-medium"
          >
            <slot name="actions" :row="row" :index="index" />
          </td>
        </tr>

        <!-- Empty State -->
        <tr v-if="data.length === 0">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-6 py-12">
            <slot name="empty">
              <StateEmpty icon="default" message="موردی یافت نشد" />
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
