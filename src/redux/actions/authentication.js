import decode from "jwt-decode";
import Cookies from "js-cookie";
import { SET_CURRENT_USER, SET_ERRORS } from "./actionTypes";
//import axios from "axios"
import { fetchChannels } from "./channels";
import { fetchMessages } from "./messages";

import instance from "./instance";

import { resetErrors } from "./errors";

const setAuthToken = (token) => {
  if (token) {
    Cookies.set("token", token);
    instance.defaults.headers.Authorization = `JWT ${token}`;
  } else {
    delete instance.defaults.headers.Authorization;
    Cookies.remove("token");
  }
};

export const login = (userData, history) => {
  return async (dispatch) => {
    try {
      const responce = await instance.post("/login/", userData);
      // const responce = await axios.post('http://127.0.0.1:8000/login/', userData);
      console.log(responce.data);
      const { token } = responce.data;
      dispatch(resetErrors());
      dispatch(setCurrentUser(token));
      history.push("/channels");
    } catch (err) {
      console.error(err);
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data,
      });
    }
  };
};

export const signup = (userData, history) => {
  return async (dispatch) => {
    try {
      const responce = await instance.post("/signup/", userData);
      //const responce = await axios.post("http://127.0.0.1:8000/signup/", userData)
      const { token } = responce.data;
      dispatch(setCurrentUser(token));
      history.push("/channels");
    } catch (error) {
      console.error("wrong signup");
    }
    dispatch(login(userData, history));
  };
};

export const logout = () => setCurrentUser();

const setCurrentUser = (token) => {
  setAuthToken(token);
  const user = token ? decode(token) : null;

  return (dispatch) => {
    dispatch({
      type: SET_CURRENT_USER,
      payload: user,
    });

    dispatch(fetchChannels());
    //dispatch(fetchMessages())
  };
};

export const checkForExpiredToken = () => {
  const token = Cookies.get("token");
  if (token) {
    const currentTimeInSeconds = Date.now() / 1000;
    const user = decode(token);
    if (user.exp >= currentTimeInSeconds) {
      return setCurrentUser(token);
    }
  }
  console.log("im token");
  return setCurrentUser();
};
