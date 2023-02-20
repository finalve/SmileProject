import axios from 'axios';
import authHeader from './auth-header';

import {config} from "../config";
const API_URL = `http://${config.base}/api/`;

class UserService {
  getPublicContent() {
    return axios.get(API_URL + 'all');
  }

  getUserBoard() {
    return axios.get(API_URL + 'userdata', { headers: authHeader() });
  }

  userDelete() {
    return axios.post(API_URL + 'delete', {},{ headers: authHeader() });
  }

  userAdd({apikey,apiserect,invest,server}) {
    return axios.post(API_URL + 'add',{apikey,apiserect,invest,server},{ headers: authHeader() });
  }

  getModeratorBoard() {
    return axios.get(API_URL + 'mod', { headers: authHeader() });
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }

  getIPAddress() {
    return axios.get(API_URL + 'getserveraddress');
  }
}

export default new UserService();