import { OBJ } from '@typen/enum-data-types'
import fs      from 'fs'

export class LogService {
  static localInfo = (theme, content) => {
    if (typeof content === OBJ) content = JSON.stringify(content, null, 4)
    fs.writeFileSync(process.cwd() + '/local/' + theme + '.json', content)
  }
}
