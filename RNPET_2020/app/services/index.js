import { Fetch, noTokenfetch,resetPasswordFetch} from '../utils'
import { upLoadFile } from '../utils/myfetch'

export const getHome = async payload => Fetch('match', 'get', payload);

// 用户登录
export const login = async payload =>{
  return noTokenfetch('/Login/userLogin', 'post', payload, 'form')
}

// 上传商户图片
export const uploadMerchantImage = async payload =>{
    return upLoadFile('/UploadImage/uploadMerchantImage', 'post', payload, 'form')
  }