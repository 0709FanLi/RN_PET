import { Alert, ToastAndroid, Platform,Dimensions } from 'react-native'
import moment from 'moment'
import { HOST } from './globalConfig'
const {width, height} = Dimensions.get('window');

let lastTime = null
let lastContent = null

const ToastShort = (content, isAlert) => {
  const thisTime = moment()
  if (
    lastTime != null &&
    lastContent != null &&
    thisTime.diff(lastTime) < 2000 &&
    lastContent === content
  ) {
    return
  }
  if (isAlert || Platform.OS === 'ios') {
    Alert.alert('提示', content.toString())
  } else {
    ToastAndroid.show(content.toString(), ToastAndroid.SHORT)
  }
  lastTime = thisTime
  lastContent = content
}

const isIos = () => Platform.OS === 'ios'


const isIphoneX = () =>
  isIos() && (Number(((height/width)+"").substr(0,4)) * 100) === 216

function decodeURI(uri) {
  if (uri && uri.length > 0) {
    return decodeURIComponent(uri.toString().replace(/\+/g, '%20'))
  }
  return ''
}
export default {
  TOKEN: 'TOKEN',
  ToastShort,
  isIos,
  isIphoneX,
  IMG_URL: `${HOST}page/base/`, //HOST+'page/base/'
  decodeURI,
}
