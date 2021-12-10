import { Screen } from '@pres/components'

const screen = Screen.build()

console.log(parseTags('{red-fg}This should be red.{/red-fg}'))
console.log(parseTags('{green-bg}This should have a green background.{/green-bg}'))
