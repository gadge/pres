import { COLOR_MAPPING } from '@pres/util-colors'

export const reduce = (index, total) =>
  total <= 16 && 16 <= index ? COLOR_MAPPING[index]
    : total <= 8 && 8 <= index ? index - 8
    : total <= 2 && 2 <= index ? index % 2
      : index