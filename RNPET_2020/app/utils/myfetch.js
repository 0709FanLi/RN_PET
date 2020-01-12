import * as qs from 'querystring'
import Common from './common'
import {  Storage } from '../utils'
import * as GlobalConfig from './globalConfig'
import { DeviceEventEmitter } from 'react-native'

function checkNetStatus(response, url) {
    console.log(
        `%c ${url}`,
        `color:#b${url.length + 5}`,
        `_fetch_response:`,
        response
    );
    if (!response.ok) {
        // 处理了网络错误提示，抛出去为了关闭loading
        // alert(`网络错误,status:${response.status}`)
        const error = new Error(response.statusText, -1);
        error.response = response;
        throw error
    }
    return response.json()
}


function checkResultStatus(result, url) {
    console.log(
        `%c ${url}`,
        `color:#b${url.length + 5}`,
        `_fetch_result:`,
        result
    );

    if (
        result &&
        result.result &&
        (result.result === 101 || result.result === 100)
    ) {
        // 这里已处理了异常，抛出去为了关闭loading
        // if (result.result === 24) {
        //   // 重新登录
        //   Common.toastShort('请登录')
        //   Storage.delete(Common.TOKEN)
        //   // getNavigator().push({
        //   //     name: 'LoginPage'
        //   // });
        // } else {
        //   // 我们服务器的错误提示
        //   Common.toastShort(result.errmsg)
        // }
        DeviceEventEmitter.emit('IsSingleToken');
        Common.ToastShort('用户登陆失效，请重新登陆');
        // const error = new Error(result.errmsg, result.result)
        // error.code = result.result
        // throw error
        return resultErr
    }

    // 1、当登录成功 存储sign和token
    // 2、忘记密码流程设置sign和token
    // 3、其它情况都不存储

    // if()

    // Storage.set('token',result.data.token);
    // Storage.set('sign',result.data.sgin);
    return result
}
const resultErr = {
    result: 1,
    errmsg: '网络出错',
    data: {},
};

export default function easyfetch(
    url,
    method,
    args = {},
    contentType = 'form'
) {
    return new Promise((resolve, reject) => {
        console.log('Promise#', url);
        Storage.get(GlobalConfig.STORE_USER_OBJECT)
            .then(userObj => {
                console.log('userobj-rn', userObj);
                if (userObj != null && userObj) {
                    resolve(executefetch(url, method, args, contentType, userObj))
                } else {
                    const result = {
                        result: '100',
                        errmsg: '用户未登录',
                        data: {},
                    };
                    resolve(result)
                }
            })
            .catch(err => {
                reject(err)
            })
    })
}
//  把数据转为form-data格式
function objectToFormData (obj, form, namespace) {
    const fd = form || new FormData();
    let formKey;

    for(var property in obj) {
        if(obj.hasOwnProperty(property)) {
            let key = Array.isArray(obj) ? '[]' : `[${property}]`;
            if(namespace) {
                formKey = namespace + key;
            } else {
                formKey = property;
            }

            // if the property is an object, but not a File, use recursivity.
            if(typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
                objectToFormData(obj[property], fd, formKey);
            } else {

                // if it's a string or a File object
                fd.append(formKey, obj[property]);
            }

        }
    }
    return fd;
}


export function noTokenfetch(url, method, args = {}, contentType = 'form') {
    const userObj = {};
    return executefetch(url, method, args, contentType, userObj)
}

export function resetPasswordFetch(url, method, args = {}, contentType = 'form', userObj) {
    console.log('Promise#', url);
    // console.log('userobj-rn',userObj.userId)
    // const sendDate = new Date()
    let mheaders = {};
    if(args.sign) mheaders.sign = args.sign;
    delete args.sign;
    if (contentType === 'form') {
        mheaders = {
            ...mheaders,
            Accept: 'application/x-www-form-urlencoded',
        }
    } else if (contentType === 'json') {
        mheaders = {
            ...mheaders,
            Accept: 'application/json;charset=utf-8',
        }
    }

    let furl = '';
    if (url.indexOf('http') === 0) furl = url;
    else furl = `${GlobalConfig.HOST}${url}`;

    console.log(
        `%c ${url}`,
        `color:#b${url.length + 5}`,
        `_fetch_body:`,
        JSON.stringify(args)
    );
    // args = objectToFormData(args);
    console.log('args165',args);
    switch (method.toLowerCase()) {
        case 'post':
        case 'put':
        case 'delete':
            return timeout(
                20000,
                fetch(furl, {
                    method,
                    headers: mheaders,
                    body: args, // JSON.stringify(args),//qs.stringify(args),//new FormData(args),//
                    cache: 'default',
                })
            )
                .then(response => {
                    console.log('response',response);
                    return checkNetStatus(response, url)
                })
                .then(result => {
                    return checkResultStatus(result, url)
                })
                .catch(err => {
                    console.log('----错误输出结果-----', err);
                    return resultErr
                });
        case 'get':
            let argstr = '';
            if (args) {
                argstr = `?${qs.stringify(args)}`
            }
            console.log(`${furl}${argstr}`);

            return timeout(
                20000,
                fetch(`${furl}${argstr}`, {
                    method,
                    headers: mheaders,
                })
            )
                .then(response => checkNetStatus(response, url))
                .then(result => checkResultStatus(result, url))
                .catch(err => {
                    console.log('----错误输出结果-----', err);
                    return resultErr
                });
        default:
    }
}

function executefetch(url, method, args = {}, contentType = 'form', userObj) {
    console.log('Promise#', url);
    // console.log('userobj-rn',userObj.userId)
    // const sendDate = new Date()
    let mheaders = {
        sign:userObj.sign
    };
    if (contentType === 'form') {
        mheaders = {
            ...mheaders,
            Accept: 'application/x-www-form-urlencoded',
        }
    } else if (contentType === 'json') {
        mheaders = {
            ...mheaders,
            Accept: 'application/json;charset=utf-8',
        }
    }

    let furl = '';
    if (url.indexOf('http') === 0) furl = url;
    else furl = `${GlobalConfig.HOST}${url}`;

    console.log(
        `%c ${url}`,
        `color:#b${url.length + 5}`,
        `_fetch_body:`,
        JSON.stringify(args)
    );
    args.token = userObj.token;
    console.log('args',args);
    // args = objectToFormData(args);
    switch (method.toLowerCase()) {
        case 'post':
        case 'put':
        case 'delete':
            return timeout(
                20000,
                fetch(furl, {
                    method,
                    headers: mheaders,
                    body: args, // JSON.stringify(args),//qs.stringify(args),//new FormData(args),//
                    cache: 'default',
                })
            )
                .then(response => {
                    console.log('response',response);
                    return checkNetStatus(response, url)
                })
                .then(result => {
                    return checkResultStatus(result, url)
                })
                .catch(err => {
                    console.log('----错误输出结果-----', err);
                    return resultErr
                });
        case 'get':
            let argstr = '';
            if (args) {
                argstr = `?${qs.stringify(args)}`
            }
            console.log(`${furl}${argstr}`);

            return timeout(
                20000,
                fetch(`${furl}${argstr}`, {
                    method,
                    headers: mheaders,
                })
            )
                .then(response => checkNetStatus(response, url))
                .then(result => checkResultStatus(result, url))
                .catch(err => {
                    console.log('----错误输出结果-----', err);
                    return resultErr
                });
        default:
    }
}

function timeout(ms, promise) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            Common.ToastShort('请求超时');
            reject(new Error('net timeout'))
        }, ms);
        promise
            .then(
                res => {
                    clearTimeout(timeoutId);
                    resolve(res)
                },
                err => {
                    clearTimeout(timeoutId);
                    reject(err)
                }
            )
            .catch(err => {
                console.log('----错误输出结果-----', err);
                reject(resultErr)
            })
    })
}
export function upLoadFile(url, method, args = {}) {
    return new Promise((resolve, reject) => {
        Storage.get('USER_OBJECT')
            .then(userObj => {
                if (userObj != null && userObj) {
                    resolve(upLoadFileFetch(url, method, args))
                } else {
                    const result = {
                        result: '100',
                        errmsg: '用户未登录',
                        data: {},
                    };
                    resolve(result)
                }
            })
            .catch(err => {
                reject(err)
            })
    })
}

function upLoadFileFetch(url, method, args,) {
    const mheaders = {
        'Content-Type': 'multipart/form-data',
        Accept: 'multipart/form-data',
    };
    let furl = '';
    if (url.indexOf('http') === 0) furl = url;
    else furl = `${GlobalConfig.HOST}${url}`;
    console.log('348',args)
    return timeout(
        50000,  
        fetch(furl, {
            method,
            headers: mheaders,
            body: args.formData,
            cache: 'default',
        })
    )
    .then(response => {
        console.log('348',response)
        if (response.ok) {
            return response.json()
        }
    })
    .then(result => checkResultStatus(result, url))
    .catch(err => {
        console.log('----错误输出结果-----', err);
        return resultErr
    })
}
