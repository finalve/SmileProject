import axios from 'axios';
import authHeader from './auth-header';

import { config } from "../config";
const API_URL = `https://${config.base}/api/`;

class UserService {
  getPublicContent() {
    return axios.get(API_URL + 'all');
  }

  getUserBoard() {
    return axios.get(API_URL + 'userdata', { headers: authHeader() });
  }
  myserver() {
    return axios.get(API_URL + 'myserver', { headers: authHeader() });
  }

  allserver() {
    return axios.get(API_URL + 'allserver', { headers: authHeader() });
  }
  userDelete() {
    return axios.post(API_URL + 'delete', {}, { headers: authHeader() });
  }

  userAdd({ apikey, apiserect, invest, server }) {
    return axios.post(API_URL + 'add', { apikey, apiserect, invest, server }, { headers: authHeader() });
  }



  getModeratorBoard() {
    return axios.get(API_URL + 'mod', { headers: authHeader() });
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }

  admin_getAll({ server }) {
    return axios.post(API_URL + 'alluser', { server }, { headers: authHeader() });
  }

  admin_remove({ userlabel, server }) {
    return axios.post(API_URL + 'admindelete', { userlabel, server }, { headers: authHeader() });
  }

  getIPAddress() {
    return axios.get(API_URL + 'getserveraddress');
  }

  getArbitrage({ server }) {
    return axios.post(API_URL + 'arbitrage', { server }, { headers: authHeader() });
  }
}

export default new UserService();