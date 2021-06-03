export const modeToSign = mode => {
  let tx = ''
  tx += mode & 1 ? 'B' : '-' // bold
  tx += mode & 2 ? 'U' : '-' // underline
  tx += mode & 4 ? 'B' : '-' // blink
  tx += mode & 8 ? 'I' : '-' // inverse
  tx += mode & 16 ? 'H' : '-' // hide
  return tx
}