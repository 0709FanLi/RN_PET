import { createAction, NavigationActions, Storage } from '../utils'
import * as API from "../services";

export default {
  namespace: 'Login',
  state: {
    login: false,
    loading: true,
    fetching: false,
  },
  reducers: {
    updateState(state, { payload }) {
      return { ...state, ...payload }
    },
  },
  effects: {
    *login({ payload }, { call, put }) {
      yield put(createAction('updateState')({ fetching: true }))
      const login = yield call(API.login, payload)
      if (login) {
        yield put(NavigationActions.back())
      }
      yield put(createAction('updateState')({ login, fetching: false }))
      Storage.set('login', login)
    },
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'loadStorage' })
    },
  },
}
