import type { TypeFnTooltip } from '~/types/global'

export function showTooltip({ id, text,styleTooltip}: TypeFnTooltip) {
    if (document.getElementById('tooltip')) return
    else {
        const el = document.getElementById(id)
        const tooltip = document.createElement('div')
        tooltip.id = 'tooltip'
        tooltip.className = styleTooltip ? `tooltip-box  ${styleTooltip}` : 'tooltip-box' 
        tooltip.innerText = text
       return el?.appendChild(tooltip)
    }
}

export function clostTooltip(id: string) {
    const el = document.getElementById(id)
    const tooltip: any = document.getElementById('tooltip')
    el?.removeChild(tooltip)
}